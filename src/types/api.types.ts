import type {
  User, WorkGuide, WorkOrder, WorkOrderDetail, WarehouseData,
} from './models.types';

export interface OdooJsonRpcRequest<T = any> {
  jsonrpc: '2.0';
  method: 'call';
  params: T;
  id?: number | null;
}

export interface OdooJsonRpcResponse<T = any> {
  jsonrpc: '2.0';
  id: number | null;
  result?: T;
  error?: OdooError;
}

export interface OdooError {
  code: number;
  message: string;
  data: { name: string; debug: string; message: string; arguments: any[]; context: Record<string, any> };
}

export interface OdooLoginParams { db: string; login: string; password: string; }

export interface OdooLoginResult {
  uid: number; is_system: boolean; is_admin: boolean;
  user_context: { lang: string; tz: string; uid: number };
  db: string; server_version: string; name: string; username: string;
  partner_id: number; company_id: number; [key: string]: any;
}

export interface LoginResponse { success: boolean; user?: User; error?: string; }
export interface LogoutResponse { success: boolean; error?: string; }
export interface ApiResponse<T> { success: boolean; data?: T; error?: string; message?: string; }

export interface GetAllGuidesParams {
  model: 'ek.contract.work.guide.service'; method: 'get_all_guides'; args: []; kwargs: Record<string, never>;
}
export interface GuidesResponse { success: boolean; guides?: WorkGuide[]; error?: string; }

export interface GetOrdersByGuideParams {
  model: 'ek.contract.work.guide.service'; method: 'get_orders_by_guide'; args: [number]; kwargs: Record<string, never>;
}
export interface GetOrderParams {
  model: 'ek.contract.work.guide.service'; method: 'get_order'; args: [number]; kwargs: Record<string, never>;
}
export interface UpdateOrderParams {
  model: 'ek.contract.work.guide.service'; method: 'update_order'; args: [number, Partial<WorkOrderDetail>]; kwargs: Record<string, never>;
}
export interface OrdersResponse { success: boolean; orders?: WorkOrder[]; error?: string; }
export interface OrderDetailResponse { success: boolean; order?: WorkOrderDetail; error?: string; }
export interface UpdateOrderResponse { success: boolean; error?: string; }

export interface GetWarehouseParams {
  model: 'ek.contract.work.guide.service'; method: 'get_detailed_store'; args: []; kwargs: Record<string, never>;
}
export interface WarehouseResponse { success: boolean; warehouse?: WarehouseData; error?: string; }

export interface RequestConfig {
  headers?: Record<string, string>; timeout?: number; params?: Record<string, any>;
}
