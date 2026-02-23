import AsyncStorage from '@react-native-async-storage/async-storage';
import httpClient from '../client/httpClient';
import { API_CONFIG, API_ENDPOINTS } from '../../config/api.config';
import type { OdooJsonRpcRequest, OdooJsonRpcResponse, OdooLoginParams, OdooLoginResult, LoginResponse, LogoutResponse } from '../../types/api.types';
import type { User } from '../../types/models.types';

const STORAGE_KEYS = {
  USER_DATA: 'userData',
  USER_ID: 'userId',
  SESSION_COOKIE: 'sessionCookie',
} as const;

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const requestBody: OdooJsonRpcRequest<OdooLoginParams> = {
        jsonrpc: '2.0', method: 'call',
        params: { db: API_CONFIG.DB_NAME, login: email, password },
      };
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: { ...API_CONFIG.DEFAULT_HEADERS },
        body: JSON.stringify(requestBody),
      });
      const data: OdooJsonRpcResponse<OdooLoginResult> = await response.json();
      if (data.result && data.result.uid) {
        const cookies = response.headers.get('set-cookie');
        if (cookies) await httpClient.saveSessionCookie(cookies);
        const userData: User = {
          uid: data.result.uid, name: data.result.name, username: data.result.username,
          partner_id: data.result.partner_id, company_id: data.result.company_id,
        };
        await this.saveUserData(userData);
        return { success: true, user: userData };
      }
      return { success: false, error: 'Credenciales inválidas' };
    } catch (error: any) {
      console.error('Error en login:', error);
      return { success: false, error: error.message || 'Error de conexión. Verifica tu servidor Odoo.' };
    }
  }

  async logout(): Promise<LogoutResponse> {
    try {
      await this.clearUserData();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Error al cerrar sesión' };
    }
  }

  async checkSession(): Promise<boolean> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData !== null;
    } catch { return false; }
  }

  async getUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch { return null; }
  }

  private async saveUserData(user: User): Promise<void> {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
      [STORAGE_KEYS.USER_ID, user.uid.toString()],
    ]);
  }

  private async clearUserData(): Promise<void> {
    await AsyncStorage.multiRemove([STORAGE_KEYS.USER_DATA, STORAGE_KEYS.USER_ID, STORAGE_KEYS.SESSION_COOKIE]);
  }

  async getCurrentUserId(): Promise<number | null> {
    try {
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      return userId ? parseInt(userId, 10) : null;
    } catch { return null; }
  }
}

export default new AuthService();
