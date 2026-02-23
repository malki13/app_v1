import { WorkOrderDetail } from "./models.types";

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

// export type DrawerParamList = {
//   Home: undefined;
//   UserInfo: undefined;
//   MyWarehouse: undefined;
//   WorkOrders: { guideId: number; guideName: string };
//   WorkOrderDetail: { orderId: number; orderName: string };
//   WorkOrderISP: {
//     orderId: number;
//     orderName: string;
//     isp: WorkOrderDetail['isp'];
//     contract_user?: string;
//     contract_passwd?: string;
//     wifi_user?: string;
//     wifi_passwd?: string;
//     contract_mac?: string;
//     serie_ont?: string;
//   };
// };

// ✅ Nuevo: stack de órdenes con su propio historial
export type OrdersStackParamList = {
  WorkOrders: { guideId: number; guideName: string };
  WorkOrderDetail: { orderId: number; orderName: string };
  WorkOrderISP: {
    orderId: number;
    orderName: string;
    isp: WorkOrderDetail['isp'];
    contract_user?: string;
    contract_passwd?: string;
    wifi_user?: string;
    wifi_passwd?: string;
    contract_mac?: string;
    serie_ont?: string;
  };
  WorkOrderMaterials: {
    orderId: number;
    orderName: string;
  };
};

// ✅ DrawerParamList ya no necesita las rutas de órdenes individuales
export type DrawerParamList = {
  Home: undefined;
  UserInfo: undefined;
  MyWarehouse: undefined;
  OrdersStack: { guideId: number; guideName: string }; // entrada al stack
};