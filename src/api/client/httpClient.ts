import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../config/api.config';
import type { RequestConfig } from '../../types/api.types';

class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultHeaders = { ...API_CONFIG.DEFAULT_HEADERS };
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private async getHeaders(customHeaders?: Record<string, string>): Promise<Record<string, string>> {
    const sessionCookie = await AsyncStorage.getItem('sessionCookie');
    const headers = { ...this.defaultHeaders, ...customHeaders };
    if (sessionCookie) headers['Cookie'] = sessionCookie;
    return headers;
  }

  private handleError(error: any): never {
    throw new Error(error.message || 'Error desconocido');
  }

  private async fetchWithTimeout(url: string, options: RequestInit, timeout = this.timeout): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error: any) {
      clearTimeout(id);
      if (error.name === 'AbortError') throw new Error('Tiempo de espera agotado');
      throw error;
    }
  }

  private async fetchWithRetry<T>(url: string, options: RequestInit, retries = API_CONFIG.MAX_RETRIES): Promise<T> {
    let lastError: Error = new Error('Unknown error');
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await this.fetchWithTimeout(url, options);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP Error: ${response.status}`);
        }
        return await response.json();
      } catch (error: any) {
        lastError = error;
        if (error.message.includes('401') || error.message.includes('403') || error.message.includes('404')) throw error;
        if (i < retries) await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * (i + 1)));
      }
    }
    throw lastError;
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    try {
      const headers = await this.getHeaders(config?.headers);
      return await this.fetchWithRetry<T>(`${this.baseURL}${endpoint}`, { method: 'GET', headers });
    } catch (error) { return this.handleError(error); }
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    try {
      const headers = await this.getHeaders(config?.headers);
      return await this.fetchWithRetry<T>(`${this.baseURL}${endpoint}`, {
        method: 'POST', headers, body: data ? JSON.stringify(data) : undefined,
      });
    } catch (error) { return this.handleError(error); }
  }

  async saveSessionCookie(cookie: string): Promise<void> {
    await AsyncStorage.setItem('sessionCookie', cookie);
  }

  async clearSessionCookie(): Promise<void> {
    await AsyncStorage.removeItem('sessionCookie');
  }
}

export default new HttpClient();
