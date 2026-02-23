import React, { useState, useMemo, useEffect } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    TextInput, Alert, Modal, ScrollView, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useAsync, useDebounce, useRefresh } from '../../../hooks';
import { warehouseService } from '../../../api/services';
import { LoadingSpinner, EmptyState, Button } from '../../../components/common';
import { COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../../../config/theme.config';
import { useMaterials } from '../../../context/MaterialsContext';
import type { StockItem, OrdersStackParamList } from '../../../types';

interface WorkOrderMaterialsScreenProps {
    navigation: NativeStackNavigationProp<OrdersStackParamList, 'WorkOrderMaterials'>;
    route: RouteProp<OrdersStackParamList, 'WorkOrderMaterials'>;
}

export interface SelectedMaterial {
    product_id: number;
    product_name: string;
    quantity: number;
    available: number;
    serial_number?: string;
    has_serials: boolean;
}

const WorkOrderMaterialsScreen: React.FC<WorkOrderMaterialsScreenProps> = ({ navigation, route }) => {
    const { orderId, orderName } = route.params;
    const { state, setMaterials, clearMaterials, isFromDifferentOrder } = useMaterials();

    const [searchQuery, setSearchQuery] = useState('');
    const [serialSearch, setSerialSearch] = useState('');
    const debouncedQuery = useDebounce(searchQuery, 300);
    const debouncedSerial = useDebounce(serialSearch, 300);
    const { refreshing, onRefresh } = useRefresh();

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
    const [quantityInput, setQuantityInput] = useState('1');
    const [selectedSerial, setSelectedSerial] = useState<string | null>(null);

    // ✅ Materiales vienen del contexto global
    // const [materials, setLocalMaterials] = useState<SelectedMaterial[]>(() =>
    //     state.orderId === orderId ? state.materials : [],
    // );
    const [materials, setLocalMaterials] = useState<SelectedMaterial[]>([]);

    const isMounted = React.useRef(false);

    // ✅ Al entrar, verificar si hay materiales de otra orden
    // useEffect(() => {
    //     if (isFromDifferentOrder(orderId)) {
    //         Alert.alert(
    //             '⚠️ Materiales pendientes',
    //             `Tienes materiales sin guardar de la orden "${state.orderName}". Debes guardarlos o descartarlos antes de continuar.`,
    //             [
    //                 {
    //                     text: 'Descartar y continuar',
    //                     style: 'destructive',
    //                     onPress: () => {
    //                         clearMaterials();
    //                         setLocalMaterials([]);
    //                     },
    //                 },
    //                 {
    //                     text: 'Volver a guardar',
    //                     onPress: () => navigation.goBack(),
    //                 },
    //             ],
    //         );
    //     }
    // }, []);

    useEffect(() => {
        if (state.orderId === orderId && state.materials.length > 0) {
            setLocalMaterials(state.materials);
        }
    }, []);

    useEffect(() => {
        if (isFromDifferentOrder(orderId)) {
            Alert.alert(
                '⚠️ Materiales pendientes',
                `Tienes ${state.materials.length} material(es) sin confirmar de la orden "${state.orderName}". ¿Qué deseas hacer?`,
                [
                    {
                        text: 'Descartar y continuar',
                        style: 'destructive',
                        onPress: () => {
                            // Elimina los materiales de la otra orden y abre esta
                            clearMaterials();
                            setLocalMaterials([]);
                        },
                    },
                    {
                        text: 'Ir a confirmar',
                        onPress: () => {
                            // Cierra esta pantalla y abre los materiales de la otra orden
                            navigation.replace('WorkOrderMaterials', {
                                orderId: state.orderId!,
                                orderName: state.orderName,
                            });
                        },
                    },
                ],
            );
        }
    }, []);

    // ✅ Sincroniza al contexto cada vez que cambian los materiales
    // useEffect(() => {
    //     setMaterials(orderId, orderName, materials);
    // }, [materials]);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return; // ← Salta la primera ejecución
        }
        setMaterials(orderId, orderName, materials);
    }, [materials]);

    const { data: warehouse, isLoading, execute: loadWarehouse } = useAsync(async () => {
        const result = await warehouseService.getWarehouse();
        if (result.success && result.warehouse) return result.warehouse;
        throw new Error(result.error || 'No se pudo cargar la bodega');
    }, true);

    const filteredStocks = useMemo(() => {
        if (!warehouse?.stocks) return [];
        return debouncedQuery
            ? warehouseService.searchProducts(warehouse.stocks, debouncedQuery)
            : warehouse.stocks;
    }, [warehouse, debouncedQuery]);

    const filteredSerials = useMemo(() => {
        if (!selectedItem?.serials) return [];
        if (!debouncedSerial) return selectedItem.serials;
        return selectedItem.serials.filter(s =>
            s.serial_number.toLowerCase().includes(debouncedSerial.toLowerCase()),
        );
    }, [selectedItem, debouncedSerial]);

    const getAlreadyAdded = (productId: number) =>
        materials.filter(m => m.product_id === productId).reduce((sum, m) => sum + m.quantity, 0);

    const getAvailableForProduct = (item: StockItem) =>
        item.total_quantity - getAlreadyAdded(item.product_id);

    const openAddModal = (item: StockItem) => {
        const available = getAvailableForProduct(item);
        if (available <= 0) {
            Alert.alert('Sin stock', 'Ya agregaste toda la cantidad disponible de este producto.');
            return;
        }
        setSelectedItem(item);
        setQuantityInput('1');
        setSelectedSerial(null);
        setSerialSearch('');
        setShowAddModal(true);
    };

    const handleAddMaterial = () => {
        if (!selectedItem) return;
        const qty = parseInt(quantityInput, 10);
        const available = getAvailableForProduct(selectedItem);
        const hasSerials = selectedItem.serials && selectedItem.serials.length > 0;

        if (isNaN(qty) || qty <= 0) {
            Alert.alert('Cantidad inválida', 'Ingresa una cantidad mayor a 0.');
            return;
        }
        if (qty > available) {
            Alert.alert('Stock insuficiente', `Solo puedes agregar hasta ${available} unidad(es).`);
            return;
        }
        if (hasSerials && !selectedSerial) {
            Alert.alert('Serie requerida', 'Selecciona un número de serie.');
            return;
        }
        if (hasSerials && selectedSerial) {
            if (materials.some(m => m.serial_number === selectedSerial)) {
                Alert.alert('Serie duplicada', 'Este número de serie ya fue agregado.');
                return;
            }
            setLocalMaterials(prev => [...prev, {
                product_id: selectedItem.product_id,
                product_name: selectedItem.product_name,
                quantity: 1,
                available: selectedItem.total_quantity,
                serial_number: selectedSerial,
                has_serials: true,
            }]);
        } else {
            const existing = materials.findIndex(
                m => m.product_id === selectedItem.product_id && !m.serial_number,
            );
            if (existing >= 0) {
                const updated = [...materials];
                updated[existing].quantity += qty;
                setLocalMaterials(updated);
            } else {
                setLocalMaterials(prev => [...prev, {
                    product_id: selectedItem.product_id,
                    product_name: selectedItem.product_name,
                    quantity: qty,
                    available: selectedItem.total_quantity,
                    has_serials: false,
                }]);
            }
        }
        setShowAddModal(false);
    };

    const handleRemoveMaterial = (index: number) => {
        Alert.alert('Eliminar', '¿Quitar este material?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Quitar', style: 'destructive',
                onPress: () => setLocalMaterials(prev => prev.filter((_, i) => i !== index)),
            },
        ]);
    };

    const handleConfirm = () => {
        if (materials.length === 0) {
            Alert.alert('Sin materiales', 'Agrega al menos un material antes de confirmar.');
            return;
        }
        Alert.alert(
            'Confirmar materiales',
            `¿Registrar ${materials.length} material(es) para la orden ${orderName}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        // TODO: await ordersService.addMaterials(orderId, materials);
                        clearMaterials(); // ✅ Limpiar contexto al confirmar
                        Alert.alert('Éxito', 'Materiales registrados correctamente.');
                        navigation.goBack();
                    },
                },
            ],
        );
    };

    if (isLoading && !refreshing) return <LoadingSpinner fullScreen />;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Materiales</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>{orderName}</Text>
                </View>
                <View style={styles.placeholder} />
            </View>

            {/* Materiales seleccionados */}
            {materials.length > 0 && (
                <View style={styles.selectedContainer}>
                    <Text style={styles.selectedTitle}>
                        📦 {materials.length} material(es) seleccionado(s)
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {materials.map((m, idx) => (
                            <View key={idx} style={styles.selectedChip}>
                                <View style={styles.selectedChipInfo}>
                                    <Text style={styles.selectedChipName} numberOfLines={1}>{m.product_name}</Text>
                                    {m.serial_number
                                        ? <Text style={styles.selectedChipDetail}>Serie: {m.serial_number}</Text>
                                        : <Text style={styles.selectedChipDetail}>Cant: {m.quantity}</Text>
                                    }
                                </View>
                                <TouchableOpacity onPress={() => handleRemoveMaterial(idx)}>
                                    <Text style={styles.selectedChipRemove}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Búsqueda */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar producto..."
                    placeholderTextColor={COLORS.textTertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Lista */}
            <FlatList
                data={filteredStocks}
                keyExtractor={item => item.product_id.toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => onRefresh(loadWarehouse)} />
                }
                renderItem={({ item }) => {
                    const available = getAvailableForProduct(item);
                    const hasSerials = item.serials && item.serials.length > 0;
                    const isExhausted = available <= 0;
                    return (
                        <TouchableOpacity
                            style={[styles.stockCard, isExhausted && styles.stockCardDisabled]}
                            onPress={() => openAddModal(item)}
                            disabled={isExhausted}
                            activeOpacity={0.7}
                        >
                            <View style={styles.stockHeader}>
                                <Text
                                    style={[styles.productName, isExhausted && styles.productNameDisabled]}
                                    numberOfLines={2}
                                >
                                    {item.product_name}
                                </Text>
                                <View style={[styles.qtyBadge, isExhausted && styles.qtyBadgeDisabled]}>
                                    <Text style={[styles.qtyText, isExhausted && styles.qtyTextDisabled]}>
                                        {available}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.stockFooter}>
                                {hasSerials && (
                                    <Text style={styles.serialHint}>🔢 {item.serials.length} serie(s)</Text>
                                )}
                                {isExhausted
                                    ? <Text style={styles.exhaustedText}>✓ Cantidad completa</Text>
                                    : <Text style={styles.tapHint}>+ Agregar</Text>
                                }
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <EmptyState icon="📦" title="Sin productos" message="No se encontraron productos en la bodega" />
                }
            />

            {/* Confirmar */}
            {materials.length > 0 && (
                <View style={styles.confirmContainer}>
                    <Button variant="primary" onPress={handleConfirm} fullWidth>
                        Confirmar {materials.length} material(es)
                    </Button>
                </View>
            )}

            {/* Modal agregar */}
            <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle} numberOfLines={2}>{selectedItem?.product_name}</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Text style={styles.closeBtn}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalAvailable}>
                            Disponible: {selectedItem ? getAvailableForProduct(selectedItem) : 0} unidad(es)
                        </Text>

                        {selectedItem?.serials && selectedItem.serials.length > 0 ? (
                            <>
                                <Text style={styles.modalSectionLabel}>Selecciona un número de serie:</Text>
                                <TextInput
                                    style={styles.serialSearchInput}
                                    placeholder="Buscar serie..."
                                    placeholderTextColor={COLORS.textTertiary}
                                    value={serialSearch}
                                    onChangeText={setSerialSearch}
                                />
                                <ScrollView style={styles.serialList}>
                                    {filteredSerials.map((s, idx) => {
                                        const alreadyUsed = materials.some(m => m.serial_number === s.serial_number);
                                        return (
                                            <TouchableOpacity
                                                key={idx}
                                                style={[
                                                    styles.serialItem,
                                                    selectedSerial === s.serial_number && styles.serialItemSelected,
                                                    alreadyUsed && styles.serialItemUsed,
                                                ]}
                                                onPress={() => !alreadyUsed && setSelectedSerial(s.serial_number)}
                                                disabled={alreadyUsed}
                                            >
                                                <Text style={[
                                                    styles.serialNumber,
                                                    selectedSerial === s.serial_number && styles.serialNumberSelected,
                                                    alreadyUsed && styles.serialNumberUsed,
                                                ]}>
                                                    {s.serial_number}
                                                </Text>
                                                {alreadyUsed && <Text style={styles.serialUsedBadge}>Ya agregado</Text>}
                                                {selectedSerial === s.serial_number && !alreadyUsed && (
                                                    <Text style={styles.serialSelectedBadge}>✓</Text>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                    {filteredSerials.length === 0 && (
                                        <Text style={styles.noSerials}>No se encontraron series</Text>
                                    )}
                                </ScrollView>
                            </>
                        ) : (
                            <>
                                <Text style={styles.modalSectionLabel}>Cantidad a agregar:</Text>
                                <View style={styles.quantityContainer}>
                                    <TouchableOpacity
                                        style={styles.qtyBtn}
                                        onPress={() => setQuantityInput(
                                            String(Math.max(1, parseInt(quantityInput || '1', 10) - 1))
                                        )}
                                    >
                                        <Text style={styles.qtyBtnText}>−</Text>
                                    </TouchableOpacity>
                                    <TextInput
                                        style={styles.quantityInput}
                                        value={quantityInput}
                                        onChangeText={t => setQuantityInput(t.replace(/[^0-9]/g, ''))}
                                        keyboardType="numeric"
                                        textAlign="center"
                                    />
                                    <TouchableOpacity
                                        style={styles.qtyBtn}
                                        onPress={() => {
                                            const available = selectedItem ? getAvailableForProduct(selectedItem) : 1;
                                            setQuantityInput(String(Math.min(available, parseInt(quantityInput || '1', 10) + 1)));
                                        }}
                                    >
                                        <Text style={styles.qtyBtnText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        <View style={styles.modalButtons}>
                            <Button variant="ghost" onPress={() => setShowAddModal(false)} style={{ flex: 1 }}>
                                Cancelar
                            </Button>
                            <Button variant="primary" onPress={handleAddMaterial} style={{ flex: 1 }}>
                                Agregar
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SIZES.md, paddingVertical: SIZES.md,
        backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    backButton: { padding: SIZES.sm },
    backIcon: { fontSize: 28, color: COLORS.textPrimary },
    headerTitleContainer: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: SIZES.fontLg, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.textPrimary },
    headerSubtitle: { fontSize: SIZES.fontMd, color: COLORS.textSecondary, marginTop: 2 },
    placeholder: { width: 40 },
    selectedContainer: {
        backgroundColor: COLORS.surface, borderBottomWidth: 1,
        borderBottomColor: COLORS.border, padding: SIZES.md,
    },
    selectedTitle: {
        fontSize: SIZES.fontMd, fontWeight: TYPOGRAPHY.weightSemibold,
        color: COLORS.textPrimary, marginBottom: SIZES.sm,
    },
    selectedChip: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.primary + '15', borderRadius: SIZES.radiusMd,
        paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm,
        marginRight: SIZES.sm, borderWidth: 1,
        borderColor: COLORS.primary + '40', maxWidth: 180,
    },
    selectedChipInfo: { flex: 1, marginRight: SIZES.xs },
    selectedChipName: { fontSize: SIZES.fontSm, fontWeight: TYPOGRAPHY.weightSemibold, color: COLORS.textPrimary },
    selectedChipDetail: { fontSize: SIZES.fontXs, color: COLORS.textSecondary },
    selectedChipRemove: { fontSize: SIZES.fontMd, color: COLORS.error, paddingLeft: SIZES.xs },
    searchContainer: { padding: SIZES.md },
    searchInput: {
        backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd,
        paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md,
        fontSize: SIZES.fontBase, color: COLORS.textPrimary,
        borderWidth: 1, borderColor: COLORS.border,
    },
    listContainer: { padding: SIZES.md },
    stockCard: {
        backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd,
        padding: SIZES.md, marginBottom: SIZES.md,
        borderLeftWidth: SIZES.borderThick, borderLeftColor: COLORS.primary, ...SHADOWS.sm,
    },
    stockCardDisabled: { borderLeftColor: COLORS.border, opacity: 0.6 },
    stockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    productName: {
        flex: 1, fontSize: SIZES.fontBase,
        fontWeight: TYPOGRAPHY.weightSemibold, color: COLORS.textPrimary, marginRight: SIZES.sm,
    },
    productNameDisabled: { color: COLORS.textSecondary },
    qtyBadge: {
        backgroundColor: COLORS.primary + '20', borderRadius: SIZES.radiusFull,
        paddingHorizontal: SIZES.md, paddingVertical: SIZES.xs,
    },
    qtyBadgeDisabled: { backgroundColor: COLORS.border },
    qtyText: { fontSize: SIZES.fontMd, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.primary },
    qtyTextDisabled: { color: COLORS.textSecondary },
    stockFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SIZES.xs },
    serialHint: { fontSize: SIZES.fontSm, color: COLORS.textSecondary },
    tapHint: { fontSize: SIZES.fontSm, color: COLORS.primary, fontWeight: TYPOGRAPHY.weightSemibold },
    exhaustedText: { fontSize: SIZES.fontSm, color: '#22c55e' },
    confirmContainer: {
        backgroundColor: COLORS.surface, borderTopWidth: 1,
        borderTopColor: COLORS.border, padding: SIZES.md,
    },
    modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: COLORS.surface, borderTopLeftRadius: SIZES.radiusLg,
        borderTopRightRadius: SIZES.radiusLg, padding: SIZES.lg, maxHeight: '75%',
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: SIZES.sm,
    },
    modalTitle: {
        flex: 1, fontSize: SIZES.fontLg, fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textPrimary, marginRight: SIZES.sm,
    },
    closeBtn: { fontSize: SIZES.fontXl, color: COLORS.textSecondary, padding: SIZES.xs },
    modalAvailable: {
        fontSize: SIZES.fontMd, color: COLORS.textSecondary, marginBottom: SIZES.md,
        paddingBottom: SIZES.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    modalSectionLabel: {
        fontSize: SIZES.fontMd, fontWeight: TYPOGRAPHY.weightSemibold,
        color: COLORS.textPrimary, marginBottom: SIZES.sm,
    },
    serialSearchInput: {
        backgroundColor: COLORS.background, borderRadius: SIZES.radiusMd,
        paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm,
        fontSize: SIZES.fontBase, color: COLORS.textPrimary,
        borderWidth: 1, borderColor: COLORS.border, marginBottom: SIZES.sm,
    },
    serialList: { maxHeight: 220, marginBottom: SIZES.md },
    serialItem: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: COLORS.background, borderRadius: SIZES.radiusSm,
        padding: SIZES.md, marginBottom: SIZES.sm,
        borderWidth: 1, borderColor: COLORS.border,
    },
    serialItemSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
    serialItemUsed: { opacity: 0.4 },
    serialNumber: { fontSize: SIZES.fontBase, color: COLORS.textPrimary, fontFamily: 'monospace' },
    serialNumberSelected: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weightBold },
    serialNumberUsed: { color: COLORS.textSecondary },
    serialUsedBadge: { fontSize: SIZES.fontXs, color: COLORS.textSecondary },
    serialSelectedBadge: { fontSize: SIZES.fontMd, color: COLORS.primary, fontWeight: TYPOGRAPHY.weightBold },
    noSerials: { fontSize: SIZES.fontMd, color: COLORS.textSecondary, textAlign: 'center', padding: SIZES.md },
    quantityContainer: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', marginBottom: SIZES.lg, gap: SIZES.md,
    },
    qtyBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    },
    qtyBtnText: { fontSize: 24, color: '#fff', fontWeight: TYPOGRAPHY.weightBold },
    quantityInput: {
        width: 80, fontSize: SIZES.fontXl, fontWeight: TYPOGRAPHY.weightBold,
        color: COLORS.textPrimary, borderBottomWidth: 2,
        borderBottomColor: COLORS.primary, paddingVertical: SIZES.xs,
    },
    modalButtons: { flexDirection: 'row', gap: SIZES.md, marginTop: SIZES.sm },
});

export default WorkOrderMaterialsScreen;