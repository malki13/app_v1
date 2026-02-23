import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useAsync, useDebounce, useRefresh } from '../../../hooks';
import { warehouseService } from '../../../api/services';
import { LoadingSpinner, EmptyState } from '../../../components/common';
import { COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../../../config/theme.config';
import type { StockItem, DrawerParamList } from '../../../types';

interface MyWarehouseScreenProps {
  navigation: DrawerNavigationProp<DrawerParamList, 'MyWarehouse'>;
}

const MyWarehouseScreen: React.FC<MyWarehouseScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
  const [showSerials, setShowSerials] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { refreshing, onRefresh } = useRefresh();

  const { data: warehouse, isLoading, execute: loadWarehouse } = useAsync(async () => {
    const result = await warehouseService.getWarehouse();
    if (result.success && result.warehouse) return result.warehouse;
    throw new Error(result.error || 'No se pudo cargar la bodega');
  }, true);

  const filteredStocks = React.useMemo(() => {
    if (!warehouse?.stocks) return [];
    if (!debouncedQuery) return warehouse.stocks;
    return warehouseService.searchProducts(warehouse.stocks, debouncedQuery);
  }, [warehouse, debouncedQuery]);

  const stats = React.useMemo(() => {
    if (!filteredStocks.length) return { totalProducts: 0, totalQuantity: 0, withSerials: 0 };
    return warehouseService.getStatistics(filteredStocks);
  }, [filteredStocks]);

  if (isLoading && !refreshing) return <LoadingSpinner fullScreen text="Cargando bodega..." />;

  if (!warehouse && !isLoading) return (
    <SafeAreaView style={styles.container}>
      <EmptyState icon="⚠️" title="Error" message="No se pudo cargar la bodega" actionLabel="Reintentar" onAction={loadWarehouse} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Mi Bodega</Text>
          {warehouse && <Text style={styles.headerSubtitle}>{warehouse.location_name}</Text>}
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Buscar producto..." placeholderTextColor={COLORS.textTertiary} value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}><Text style={styles.statValue}>{stats.totalProducts}</Text><Text style={styles.statLabel}>Productos</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>{stats.totalQuantity.toFixed(0)}</Text><Text style={styles.statLabel}>Total</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>{stats.withSerials}</Text><Text style={styles.statLabel}>Con Serie</Text></View>
      </View>

      <FlatList
        data={filteredStocks}
        renderItem={({ item }) => {
          const hasSerials = item.serials && item.serials.length > 0;
          return (
            <TouchableOpacity style={styles.stockCard} onPress={() => { if (hasSerials) { setSelectedProduct(item); setShowSerials(true); } }} disabled={!hasSerials} activeOpacity={hasSerials ? 0.7 : 1}>
              <View style={styles.stockHeader}>
                <Text style={styles.productName} numberOfLines={2}>{item.product_name}</Text>
                <View style={styles.quantityBadge}><Text style={styles.quantityText}>{item.total_quantity}</Text></View>
              </View>
              {hasSerials && <Text style={styles.tapToView}>👆 {item.serials.length} número(s) de serie</Text>}
            </TouchableOpacity>
          );
        }}
        keyExtractor={item => item.product_id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => onRefresh(loadWarehouse)} />}
        ListEmptyComponent={<EmptyState icon="📦" title="Sin productos" message={searchQuery ? 'No se encontraron productos' : 'La bodega está vacía'} />}
      />

      <Modal visible={showSerials} animationType="slide" transparent onRequestClose={() => setShowSerials(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>{selectedProduct?.product_name}</Text>
              <TouchableOpacity onPress={() => setShowSerials(false)}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView>
              {selectedProduct?.serials.map((serial, idx) => (
                <View key={idx} style={styles.serialItem}>
                  <Text style={styles.serialNumber}>{serial.serial_number}</Text>
                  <Text style={styles.serialQty}>Cant: {serial.quantity}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.md, paddingVertical: SIZES.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuButton: { padding: SIZES.sm },
  menuIcon: { fontSize: 24, color: COLORS.textPrimary },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: SIZES.fontXl, fontWeight: 'bold', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: SIZES.fontSm, color: COLORS.textSecondary },
  placeholder: { width: 40 },
  searchContainer: { padding: SIZES.md },
  searchInput: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md, fontSize: SIZES.fontBase, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  statsContainer: { flexDirection: 'row', paddingHorizontal: SIZES.md, marginBottom: SIZES.sm, gap: SIZES.sm },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, padding: SIZES.md, alignItems: 'center', ...SHADOWS.sm },
  statValue: { fontSize: SIZES.fontXl, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.primary },
  statLabel: { fontSize: SIZES.fontXs, color: COLORS.textSecondary, marginTop: 2 },
  listContainer: { padding: SIZES.md },
  stockCard: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, padding: SIZES.md, marginBottom: SIZES.md, ...SHADOWS.sm },
  stockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productName: { flex: 1, fontSize: SIZES.fontBase, fontWeight: TYPOGRAPHY.weightSemibold, color: COLORS.textPrimary, marginRight: SIZES.sm },
  quantityBadge: { backgroundColor: COLORS.primary + '20', borderRadius: SIZES.radiusFull, paddingHorizontal: SIZES.md, paddingVertical: SIZES.xs },
  quantityText: { fontSize: SIZES.fontMd, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.primary },
  tapToView: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, marginTop: SIZES.xs },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: SIZES.radiusLg, borderTopRightRadius: SIZES.radiusLg, padding: SIZES.lg, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  modalTitle: { flex: 1, fontSize: SIZES.fontLg, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.textPrimary, marginRight: SIZES.sm },
  closeBtn: { fontSize: SIZES.fontXl, color: COLORS.textSecondary, padding: SIZES.xs },
  serialItem: { backgroundColor: COLORS.background, borderRadius: SIZES.radiusSm, padding: SIZES.md, marginBottom: SIZES.sm, flexDirection: 'row', justifyContent: 'space-between' },
  serialNumber: { fontSize: SIZES.fontBase, fontWeight: TYPOGRAPHY.weightMedium, color: COLORS.primary, fontFamily: 'monospace' },
  serialQty: { fontSize: SIZES.fontSm, color: COLORS.textSecondary },
});

export default MyWarehouseScreen;
