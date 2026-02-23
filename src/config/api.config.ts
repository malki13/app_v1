export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://192.168.100.140:8079'
    : 'https://api.produccion.com',
  DB_NAME: 'odoo_db',
  TIMEOUT: 10000,
  MAX_RETRIES: 0,
  RETRY_DELAY: 1000,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/web/session/authenticate',
    LOGOUT: '/web/session/destroy',
    CHECK_SESSION: '/web/session/check',
  },
  GUIDES: {
    GET_ALL: '/web/dataset/call_kw/ek.contract.work.guide.service/get_all_guides',
    GET_BY_ID: '/web/dataset/call_kw/ek.contract.work.guide.service/get_guide',
  },
  ORDERS: {
    GET_BY_GUIDE: '/web/dataset/call_kw/ek.contract.work.guide.service/get_orders_by_guide',
    GET_DETAIL: '/web/dataset/call_kw/ek.contract.work.guide.service/get_order',
    UPDATE: '/web/dataset/call_kw/ek.contract.work.guide.service/update_order',
  },
  WAREHOUSE: {
    GET_DETAILED: '/web/dataset/call_kw/ek.contract.work.guide.service/get_detailed_store',
  },
} as const;

export type ApiEndpoint = typeof API_ENDPOINTS;
