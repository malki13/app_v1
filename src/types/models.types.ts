export interface User {
  uid: number;
  name: string;
  username: string;
  partner_id: number;
  company_id: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type GuideState = 'open' | 'closed' | 'draft' | 'done';

export interface WorkGuide {
  id: number;
  name: string;
  state: GuideState;
  date: string;
  team_id: [number, string];
}

export interface GuideFilters {
  date?: Date;
  state?: GuideState;
  searchQuery?: string;
}

export type OrderState = 'progress' | 'done' | 'cancel';

export interface WorkOrder {
  id: number;
  name: string;
  state: OrderState;
  type_id: [number, string];
  subscription_id: [number, string];
}

export interface Partner {
  name: string;
  cedula: string;
  telefono: string;
  celular: string;
}

export interface ISPInfo {
  core: { name: string };
  olt: { name: string };
  tarjeta: { name: string };
  puerto: { name: string };
  nap: { name: string };
  nap_port: { name: string };
  ip: { name: string };
  onu_type_id: { name: string };
  current_status: { status: string };
  total_hours_spent: { time: string };
  technical_end_date: { date: string | null };
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface WorkOrderDetail {
  id: number;
  name: string;
  origin: string;
  date: string;
  technical: string;
  plan: string;
  state: OrderState;
  code: string;
  partner: Partner;
  isp: ISPInfo;
  contract_user: string;
  contract_passwd: string;
  wifi_user: string;
  wifi_passwd: string;
  contract_mac: string;
  serie_ont: string;
  is_ipv6: boolean;
  ubicacion: Location;
  note: string;
}

export interface OrderFilters {
  date?: Date;
  state?: OrderState;
  searchQuery?: string;
}

export interface SerialNumber {
  lot_id: number;
  serial_number: string;
  quantity: number;
}

export interface StockItem {
  product_id: number;
  product_name: string;
  total_quantity: number;
  serials: SerialNumber[];
}

export interface WarehouseData {
  location_id: number;
  location_name: string;
  stocks: StockItem[];
}

export interface WarehouseFilters {
  searchQuery?: string;
  hasSerials?: boolean;
  minQuantity?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;


