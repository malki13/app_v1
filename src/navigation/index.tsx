import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import UserInfoScreen from '../screens/Profile/UserInfoScreen';
import MyWarehouseScreen from '../screens/Warehouse/MyWarehouseScreen';
import WorkOrdersScreen from '../screens/Orders/WorkOrdersScreen';
import WorkOrderDetailScreen from '../screens/Orders/WorkOrderDetailScreen';
import WorkOrderISPScreen from '../screens/Orders/WorkOrderISPScreen';
import CustomDrawerContent from '../components/layout/CustomDrawerContent';
import type { RootStackParamList, DrawerParamList, OrdersStackParamList } from '../types';
import WorkOrderMaterialsScreen from '../screens/Orders/WorkOrderMaterialsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

// ✅ Stack propio para el flujo de órdenes
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();

const OrdersNavigator: React.FC = () => (
  <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
    <OrdersStack.Screen name="WorkOrders" component={WorkOrdersScreen} />
    <OrdersStack.Screen name="WorkOrderDetail" component={WorkOrderDetailScreen} />
    <OrdersStack.Screen name="WorkOrderISP" component={WorkOrderISPScreen} />
    <OrdersStack.Screen name="WorkOrderMaterials" component={WorkOrderMaterialsScreen} />
  </OrdersStack.Navigator>
);

const DrawerNavigator: React.FC = () => (
  <Drawer.Navigator
    drawerContent={props => <CustomDrawerContent {...props} />}
    screenOptions={{ headerShown: false, drawerType: 'slide' }}
  >
    <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
    <Drawer.Screen name="UserInfo" component={UserInfoScreen} options={{ title: 'Mi Perfil' }} />
    <Drawer.Screen name="MyWarehouse" component={MyWarehouseScreen} options={{ title: 'Mi Bodega' }} />
    {/* ✅ Toda la navegación de órdenes dentro de su propio stack */}
    <Drawer.Screen
      name="OrdersStack"
      component={OrdersNavigator}
      options={{ title: 'Órdenes de Trabajo' }}
    />
  </Drawer.Navigator>
);

const Navigation: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user
          ? <Stack.Screen name="Main" component={DrawerNavigator} />
          : <Stack.Screen name="Login" component={LoginScreen} />
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;