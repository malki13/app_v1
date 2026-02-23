import httpClient from '../client/httpClient';
import { API_ENDPOINTS } from '../../config/api.config';
import authService from './authService';
import type { OdooJsonRpcRequest, OdooJsonRpcResponse, GetWarehouseParams, WarehouseResponse } from '../../types/api.types';
import type { WarehouseData, StockItem } from '../../types/models.types';

class WarehouseService {
  async getWarehouse(): Promise<WarehouseResponse> {
    try {
      const userId = await authService.getCurrentUserId();
      if (!userId) throw new Error('No hay sesión activa');
      const requestBody: OdooJsonRpcRequest<GetWarehouseParams> = {
        jsonrpc: '2.0', method: 'call',
        params: { model: 'ek.contract.work.guide.service', method: 'get_detailed_store', args: [], kwargs: {} },
        id: userId,
      };
      const response = await httpClient.post<OdooJsonRpcResponse<WarehouseData>>(API_ENDPOINTS.WAREHOUSE.GET_DETAILED, requestBody);
      if (response.result) return { success: true, warehouse: response.result };
      return { success: false, error: 'No se pudo obtener la bodega' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al obtener la bodega' };
    }
  }

  searchProducts(stocks: StockItem[], query: string): StockItem[] {
    if (!query.trim()) return stocks;
    return stocks.filter(item => item.product_name.toLowerCase().includes(query.toLowerCase()));
  }

  filterWithSerials(stocks: StockItem[]): StockItem[] {
    return stocks.filter(item => item.serials && item.serials.length > 0);
  }

  getStatistics(stocks: StockItem[]) {
    return {
      totalProducts: stocks.length,
      totalQuantity: stocks.reduce((sum, item) => sum + item.total_quantity, 0),
      withSerials: stocks.filter(item => item.serials.length > 0).length,
    };
  }
}

export default new WarehouseService();
