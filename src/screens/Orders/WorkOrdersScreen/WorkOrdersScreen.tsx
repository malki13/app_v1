// import React, { useState } from 'react';
// import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { DrawerNavigationProp } from '@react-navigation/drawer';
// import { RouteProp } from '@react-navigation/native';
// import { useAsync, useDebounce, useRefresh } from '../../../hooks';
// import { ordersService } from '../../../api/services';
// import { LoadingSpinner, EmptyState, SearchBar, Badge, getBadgeVariantFromStatus } from '../../../components/common';
// import { COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../../../config/theme.config';
// import type { WorkOrder, DrawerParamList } from '../../../types';

// interface WorkOrdersScreenProps {
//   navigation: DrawerNavigationProp<DrawerParamList, 'WorkOrders'>;
//   route: RouteProp<DrawerParamList, 'WorkOrders'>;
// }

// const STATUS_LABELS: Record<string, string> = {
//   progress: 'En Progreso', done: 'Completada', cancel: 'Cancelada',
// };

// const WorkOrdersScreen: React.FC<WorkOrdersScreenProps> = ({ navigation, route }) => {
//   const { guideId, guideName } = route.params;
//   const [searchQuery, setSearchQuery] = useState('');
//   const debouncedQuery = useDebounce(searchQuery, 300);
//   const { refreshing, onRefresh } = useRefresh();

//   const { data: orders = [], isLoading, execute: loadOrders } = useAsync(async () => {
//     const result = await ordersService.getOrdersByGuide(guideId);
//     return result.orders || [];
//   }, true);

//   // Recargar al entrar a esta pantalla
//   React.useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', () => { loadOrders(); });
//     return unsubscribe;
//   }, [navigation,loadOrders]);

//   const filteredOrders = React.useMemo(() => {
//     if (!debouncedQuery) return orders ?? [];
//     return ordersService.searchOrders(orders, debouncedQuery) ?? [];
//   }, [orders, debouncedQuery]);

//   if (isLoading && !refreshing) return <LoadingSpinner fullScreen />;

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Text style={styles.backIcon}>←</Text>
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={styles.headerTitle}>Órdenes de Trabajo</Text>
//           <Text style={styles.headerSubtitle} numberOfLines={1}>{guideName}</Text>
//         </View>
//         <View style={styles.placeholder} />
//       </View>
//       <View style={styles.searchContainer}>
//         <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Buscar órdenes..." />
//       </View>
//       <View style={styles.countContainer}>
//         <Text style={styles.countText}>
//           {filteredOrders.length} orden{filteredOrders.length !== 1 ? 'es' : ''} encontrada{filteredOrders.length !== 1 ? 's' : ''}
//         </Text>
//       </View>
//       <FlatList
//         data={filteredOrders}
//         renderItem={({ item }) => (
//           <TouchableOpacity style={styles.orderCard} onPress={() => navigation.navigate('WorkOrderDetail', { orderId: item.id, orderName: item.name })} activeOpacity={0.7}>
//             <View style={styles.orderHeader}>
//               <Text style={styles.orderName}>{item.name}</Text>
//               <Badge variant={getBadgeVariantFromStatus(item.state)}>{STATUS_LABELS[item.state] || item.state}</Badge>
//             </View>
//             <Text style={styles.orderInfo}>Tipo: {item.type_id?.[1] ?? '-'}</Text>
//             <Text style={styles.orderInfo} numberOfLines={2}>Cliente: {item.subscription_id?.[1] ?? '-'}</Text>
//           </TouchableOpacity>
//         )}
//         keyExtractor={item => item.id.toString()}
//         contentContainerStyle={styles.listContainer}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => onRefresh(loadOrders)} />}
//         ListEmptyComponent={<EmptyState icon="📋" title="No hay órdenes" message="No se encontraron órdenes para esta guía" />}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.background },
//   header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.md, paddingVertical: SIZES.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
//   backButton: { padding: SIZES.sm },
//   backIcon: { fontSize: 28, color: COLORS.textPrimary },
//   headerTitleContainer: { flex: 1, alignItems: 'center' },
//   headerTitle: { fontSize: SIZES.fontLg, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.textPrimary },
//   headerSubtitle: { fontSize: SIZES.fontMd, color: COLORS.textSecondary, marginTop: 2 },
//   placeholder: { width: 40 },
//   searchContainer: { padding: SIZES.md },
//   countContainer: { paddingHorizontal: SIZES.md, paddingBottom: SIZES.sm },
//   countText: { fontSize: SIZES.fontMd, color: COLORS.textSecondary, textAlign: 'center' },
//   listContainer: { padding: SIZES.md },
//   orderCard: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, padding: SIZES.md, marginBottom: SIZES.md, borderLeftWidth: SIZES.borderThick, borderLeftColor: COLORS.primary, ...SHADOWS.md },
//   orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
//   orderName: { flex: 1, fontSize: SIZES.fontLg, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.textPrimary, marginRight: SIZES.sm },
//   orderInfo: { fontSize: SIZES.fontMd, color: COLORS.textSecondary, marginBottom: SIZES.xs },
// });

// export default WorkOrdersScreen;


import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';
import { useAsync, useDebounce, useRefresh } from '../../../hooks';
import { ordersService } from '../../../api/services';
import { LoadingSpinner, EmptyState, SearchBar, Badge, getBadgeVariantFromStatus } from '../../../components/common';
import { COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../../../config/theme.config';
import type { WorkOrder, DrawerParamList } from '../../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OrdersStackParamList } from '../../../types';

interface WorkOrdersScreenProps {
  // navigation: DrawerNavigationProp<DrawerParamList>;
  // route: RouteProp<DrawerParamList, 'WorkOrders'>;
  navigation: NativeStackNavigationProp<OrdersStackParamList, 'WorkOrders'>;
  route: RouteProp<OrdersStackParamList, 'WorkOrders'>;
}

const STATUS_LABELS: Record<string, string> = {
  progress: 'En Progreso',
  done: 'Completada',
  cancel: 'Cancelada',
};

const WorkOrdersScreen: React.FC<WorkOrdersScreenProps> = ({ navigation, route }) => {
  const { guideId, guideName } = route.params ?? {};
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { refreshing, onRefresh } = useRefresh();

  // ✅ useCallback para estabilizar la función y evitar re-renders infinitos
  const fetchOrders = useCallback(async () => {
    const result = await ordersService.getOrdersByGuide(guideId);
    return result.orders || [];
  }, [guideId]);

  const {
    data: orders = [],
    isLoading,
    execute: loadOrders,
  } = useAsync(fetchOrders, true);

  // ✅ loadOrders incluido en dependencias
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadOrders();
    });
    return unsubscribe;
  }, [navigation, loadOrders]);

  const filteredOrders = React.useMemo(() => {
    if (!debouncedQuery) return orders ?? [];
    return ordersService.searchOrders(orders, debouncedQuery) ?? [];
  }, [orders, debouncedQuery]);

  if (isLoading && !refreshing) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Órdenes de Trabajo</Text>
          <Text style={styles.headerSubtitle}>{guideName}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar órdenes..."
        />
      </View>

      {/* Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredOrders.length} orden{filteredOrders.length !== 1 ? 'es' : ''} encontrada
          {filteredOrders.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={filteredOrders}
        renderItem={({ item }: { item: WorkOrder }) => (
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() =>
              navigation.navigate('WorkOrderDetail', {
                orderId: item.id,
                orderName: item.name,
              })
            }
            activeOpacity={0.7}
          >
            <View style={styles.orderHeader}>
              <Text style={styles.orderName}>{item.name}</Text>
              <Badge
                label={STATUS_LABELS[item.state] || item.state}
                variant={getBadgeVariantFromStatus(item.state)}
              />
            </View>
            <Text style={styles.orderInfo}>Tipo: {item.type_id?.[1] ?? '-'}</Text>
            <Text style={styles.orderInfo}>Cliente: {item.subscription_id?.[1] ?? '-'}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => onRefresh(loadOrders)}
          />
        }
        ListEmptyComponent={<EmptyState message="No hay órdenes disponibles" />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SIZES.sm,
  },
  backIcon: {
    fontSize: 28,
    color: COLORS.textPrimary,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    padding: SIZES.md,
  },
  countContainer: {
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.sm,
  },
  countText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  listContainer: {
    padding: SIZES.md,
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    borderLeftWidth: SIZES.borderThick,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  orderName: {
    flex: 1,
    fontSize: SIZES.fontLg,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textPrimary,
    marginRight: SIZES.sm,
  },
  orderInfo: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
});

export default WorkOrdersScreen;