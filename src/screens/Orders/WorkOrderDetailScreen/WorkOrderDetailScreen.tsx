// import React, { useState } from 'react';
// import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { DrawerNavigationProp } from '@react-navigation/drawer';
// import { RouteProp } from '@react-navigation/native';
// import { useAsync } from '../../../hooks';
// import { ordersService } from '../../../api/services';
// import { LoadingSpinner, Button, Badge, getBadgeVariantFromStatus } from '../../../components/common';
// import { formatDate } from '../../../utils/dateUtils';
// import { COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../../../config/theme.config';
// import type { WorkOrderDetail, DrawerParamList } from '../../../types';

// interface WorkOrderDetailScreenProps {
//   navigation: DrawerNavigationProp<DrawerParamList, 'WorkOrderDetail'>;
//   route: RouteProp<DrawerParamList, 'WorkOrderDetail'>;
// }

// const STATUS_LABELS: Record<string, string> = { progress: 'En Progreso', done: 'Completada', cancel: 'Cancelada' };

// const WorkOrderDetailScreen: React.FC<WorkOrderDetailScreenProps> = ({ navigation, route }) => {
//   const { orderId, orderName } = route.params;
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedOrder, setEditedOrder] = useState<WorkOrderDetail | null>(null);

//   const { data: order, isLoading, execute: loadOrder } = useAsync(async () => {
//     const result = await ordersService.getOrderDetail(orderId);
//     if (result.success && result.order) { setEditedOrder(result.order); return result.order; }
//     throw new Error(result.error || 'No se pudo cargar la orden');
//   }, true);

//   const handleSave = async () => {
//     if (!editedOrder) return;
//     Alert.alert('Confirmar', '¿Desea guardar los cambios?', [
//       { text: 'Cancelar', style: 'cancel' },
//       { text: 'Guardar', onPress: async () => {
//         const result = await ordersService.updateOrder(orderId, editedOrder);
//         if (result.success) { Alert.alert('Éxito', 'Orden actualizada'); setIsEditing(false); loadOrder(); }
//         else Alert.alert('Error', result.error || 'No se pudo actualizar');
//       }},
//     ]);
//   };

//   const renderSection = (title: string, children: React.ReactNode) => (
//     <View style={styles.section}>
//       <Text style={styles.sectionTitle}>{title}</Text>
//       {children}
//     </View>
//   );

//   const renderRow = (label: string, value: any, editable = false, field?: keyof WorkOrderDetail) => {
//     const display = value === false || value === null || value === undefined ? 'N/A' : String(value);
//     return (
//       <View style={styles.infoRow}>
//         <Text style={styles.infoLabel}>{label}:</Text>
//         {isEditing && editable && editedOrder && field
//           ? <TextInput style={styles.infoInput} value={String(editedOrder[field] ?? '')} onChangeText={text => setEditedOrder({ ...editedOrder, [field]: text })} />
//           : <Text style={styles.infoValue}>{display}</Text>
//         }
//       </View>
//     );
//   };

//   if (isLoading) return <LoadingSpinner fullScreen />;

//   if (!order) return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
//         <View style={styles.headerTitleContainer}><Text style={styles.headerTitle}>Detalle</Text></View>
//         <View style={styles.placeholder} />
//       </View>
//       <Text style={styles.errorText}>No se pudo cargar la orden</Text>
//     </SafeAreaView>
//   );

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={styles.headerTitle} numberOfLines={1}>{order.name}</Text>
//           <Badge variant={getBadgeVariantFromStatus(order.state)} size="sm">{STATUS_LABELS[order.state] || order.state}</Badge>
//         </View>
//         <View style={styles.placeholder} />
//       </View>

//       <ScrollView style={styles.scrollView}>
//         {renderSection('Información General', <>
//           {renderRow('Origen', order.origin)}
//           {renderRow('Fecha', formatDate(order.date))}
//           {renderRow('Técnico', order.technical)}
//           {renderRow('Plan', order.plan)}
//           {renderRow('Código', order.code)}
//         </>)}

//         {renderSection('Cliente', <>
//           {renderRow('Nombre', order.partner?.name)}
//           {renderRow('Cédula', order.partner?.cedula)}
//           {renderRow('Teléfono', order.partner?.telefono)}
//           {renderRow('Celular', order.partner?.celular)}
//         </>)}

//         {renderSection('ISP', <>
//           {renderRow('Core', order.isp?.core?.name)}
//           {renderRow('OLT', order.isp?.olt?.name)}
//           {renderRow('Tarjeta', order.isp?.tarjeta?.name)}
//           {renderRow('Puerto', order.isp?.puerto?.name)}
//           {renderRow('NAP', order.isp?.nap?.name)}
//           {renderRow('Puerto NAP', order.isp?.nap_port?.name)}
//           {renderRow('IP', order.isp?.ip?.name)}
//           {renderRow('Tipo ONU', order.isp?.onu_type_id?.name)}
//           {renderRow('Estado', order.isp?.current_status?.status)}
//         </>)}

//         {renderSection('Configuración', <>
//           {renderRow('Usuario Contrato', order.contract_user, true, 'contract_user')}
//           {renderRow('Password Contrato', order.contract_passwd, true, 'contract_passwd')}
//           {renderRow('Usuario WiFi', order.wifi_user, true, 'wifi_user')}
//           {renderRow('Password WiFi', order.wifi_passwd, true, 'wifi_passwd')}
//           {renderRow('MAC', order.contract_mac, true, 'contract_mac')}
//           {renderRow('Serie ONT', order.serie_ont, true, 'serie_ont')}
//         </>)}

//         {renderSection('Notas', (
//           isEditing
//             ? <TextInput style={styles.notesInput} value={editedOrder?.note || ''} onChangeText={text => setEditedOrder(prev => prev ? { ...prev, note: text } : null)} multiline numberOfLines={6} textAlignVertical="top" />
//             : <Text style={styles.notesText}>{order.note || 'Sin notas'}</Text>
//         ))}

//         <View style={styles.bottomSpacer} />
//       </ScrollView>

//       <View style={styles.actionButtonsContainer}>
//         {!isEditing
//           ? <Button onPress={() => setIsEditing(true)} fullWidth>Editar</Button>
//           : <View style={styles.editButtonsRow}>
//               <Button variant="ghost" onPress={() => { setEditedOrder(order); setIsEditing(false); }} style={{ flex: 1 }}>Cancelar</Button>
//               <Button variant="primary" onPress={handleSave} style={{ flex: 1 }}>Guardar</Button>
//             </View>
//         }
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.background },
//   header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.md, paddingVertical: SIZES.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
//   backButton: { padding: SIZES.sm },
//   backIcon: { fontSize: 28, color: COLORS.textPrimary },
//   headerTitleContainer: { flex: 1, alignItems: 'center', gap: SIZES.xs },
//   headerTitle: { fontSize: SIZES.fontLg, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.textPrimary },
//   placeholder: { width: 40 },
//   scrollView: { flex: 1 },
//   section: { backgroundColor: COLORS.surface, marginTop: SIZES.sm, marginHorizontal: SIZES.md, borderRadius: SIZES.radiusMd, padding: SIZES.md, ...SHADOWS.sm },
//   sectionTitle: { fontSize: SIZES.fontLg, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.textPrimary, marginBottom: SIZES.md, borderBottomWidth: 2, borderBottomColor: COLORS.primary, paddingBottom: SIZES.sm },
//   infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SIZES.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
//   infoLabel: { fontSize: SIZES.fontMd, fontWeight: TYPOGRAPHY.weightSemibold, color: COLORS.textSecondary, flex: 1 },
//   infoValue: { fontSize: SIZES.fontMd, color: COLORS.textPrimary, flex: 1, textAlign: 'right' },
//   infoInput: { fontSize: SIZES.fontMd, color: COLORS.textPrimary, flex: 1, textAlign: 'right', borderBottomWidth: 1, borderBottomColor: COLORS.primary, paddingVertical: SIZES.xs },
//   notesText: { fontSize: SIZES.fontMd, color: COLORS.textPrimary, lineHeight: 20 },
//   notesInput: { fontSize: SIZES.fontMd, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.primary, borderRadius: SIZES.radiusSm, padding: SIZES.md, minHeight: 120 },
//   bottomSpacer: { height: 100 },
//   actionButtonsContainer: { backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, padding: SIZES.md },
//   editButtonsRow: { flexDirection: 'row', gap: SIZES.md },
//   errorText: { fontSize: SIZES.fontBase, color: COLORS.error, textAlign: 'center', marginTop: SIZES.xl },
// });

// export default WorkOrderDetailScreen;


// import React, { useState } from 'react';
// import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { DrawerNavigationProp } from '@react-navigation/drawer';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import type { OrdersStackParamList } from '../../../types';
// import { RouteProp } from '@react-navigation/native';
// import { useAsync } from '../../../hooks';
// import { ordersService } from '../../../api/services';
// import { LoadingSpinner, Button, Badge, getBadgeVariantFromStatus } from '../../../components/common';
// import { formatDate } from '../../../utils/dateUtils';
// import { COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../../../config/theme.config';
// import type { WorkOrderDetail, DrawerParamList } from '../../../types';

// interface WorkOrderDetailScreenProps {
//   navigation: NativeStackNavigationProp<OrdersStackParamList, 'WorkOrderDetail'>;
//   route: RouteProp<OrdersStackParamList, 'WorkOrderDetail'>;
// }

// const STATUS_LABELS: Record<string, string> = {
//   progress: 'En Progreso',
//   done: 'Completada',
//   cancel: 'Cancelada',
// };

// const WorkOrderDetailScreen: React.FC<WorkOrderDetailScreenProps> = ({ navigation, route }) => {
//   const { orderId, orderName } = route.params;
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedOrder, setEditedOrder] = useState<WorkOrderDetail | null>(null);

//   const { data: order, isLoading, execute: loadOrder } = useAsync(async () => {
//     const result = await ordersService.getOrderDetail(orderId);
//     if (result.success && result.order) {
//       setEditedOrder(result.order);
//       return result.order;
//     }
//     throw new Error(result.error || 'No se pudo cargar la orden');
//   }, true);

//   const handleSave = async () => {
//     if (!editedOrder) return;
//     Alert.alert('Confirmar', '¿Desea guardar los cambios?', [
//       { text: 'Cancelar', style: 'cancel' },
//       {
//         text: 'Guardar',
//         onPress: async () => {
//           const result = await ordersService.updateOrder(orderId, editedOrder);
//           if (result.success) {
//             Alert.alert('Éxito', 'Orden actualizada');
//             setIsEditing(false);
//             loadOrder();
//           } else {
//             Alert.alert('Error', result.error || 'No se pudo actualizar');
//           }
//         },
//       },
//     ]);
//   };

//   const renderSection = (title: string, children: React.ReactNode) => (
//     <View style={styles.section}>
//       <Text style={styles.sectionTitle}>{title}</Text>
//       {children}
//     </View>
//   );

//   const renderRow = (
//     label: string,
//     value: any,
//     editable = false,
//     field?: keyof WorkOrderDetail,
//   ) => {
//     const display =
//       value === false || value === null || value === undefined ? 'N/A' : String(value);
//     return (
//       <View style={styles.infoRow}>
//         <Text style={styles.infoLabel}>{label}:</Text>
//         {isEditing && editable && editedOrder && field ? (
//           <TextInput
//             style={styles.infoInput}
//             value={String(editedOrder[field] ?? '')}
//             onChangeText={(text) => setEditedOrder({ ...editedOrder, [field]: text })}
//           />
//         ) : (
//           <Text style={styles.infoValue}>{display}</Text>
//         )}
//       </View>
//     );
//   };

//   if (isLoading) return <LoadingSpinner fullScreen />;

//   if (!order) return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Text style={styles.backIcon}>←</Text>
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={styles.headerTitle}>Detalle</Text>
//         </View>
//         <View style={styles.placeholder} />
//       </View>
//       <Text style={styles.errorText}>No se pudo cargar la orden</Text>
//     </SafeAreaView>
//   );

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Text style={styles.backIcon}>←</Text>
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={styles.headerTitle} numberOfLines={1}>{order.name}</Text>
//           <Badge variant={getBadgeVariantFromStatus(order.state)} size="sm">
//             {STATUS_LABELS[order.state] || order.state}
//           </Badge>
//         </View>
//         <View style={styles.placeholder} />
//       </View>

//       <ScrollView style={styles.scrollView}>
//         {/* Información General */}
//         {renderSection('Información General', <>
//           {renderRow('Origen', order.origin)}
//           {renderRow('Fecha', formatDate(order.date))}
//           {renderRow('Técnico', order.technical)}
//           {renderRow('Plan', order.plan)}
//           {renderRow('Código', order.code)}
//         </>)}

//         {/* Cliente */}
//         {renderSection('Cliente', <>
//           {renderRow('Nombre', order.partner?.name)}
//           {renderRow('Cédula', order.partner?.cedula)}
//           {renderRow('Teléfono', order.partner?.telefono)}
//           {renderRow('Celular', order.partner?.celular)}
//         </>)}

//         {/* Notas */}
//         {renderSection('Notas',
//           isEditing ? (
//             <TextInput
//               style={styles.notesInput}
//               value={editedOrder?.note || ''}
//               onChangeText={(text) =>
//                 setEditedOrder((prev) => (prev ? { ...prev, note: text } : null))
//               }
//               multiline
//               numberOfLines={6}
//               textAlignVertical="top"
//             />
//           ) : (
//             <Text style={styles.notesText}>{order.note || 'Sin notas'}</Text>
//           ),
//         )}

//         {/* Botón ISP y Configuración */}
//         <TouchableOpacity
//           style={styles.ispButton}
//           onPress={() =>
//             navigation.navigate('WorkOrderISP', {
//               orderId: order.id,
//               orderName: order.name,
//               isp: order.isp,
//               contract_user: order.contract_user,
//               contract_passwd: order.contract_passwd,
//               wifi_user: order.wifi_user,
//               wifi_passwd: order.wifi_passwd,
//               contract_mac: order.contract_mac,
//               serie_ont: order.serie_ont,
//             })
//           }
//           activeOpacity={0.8}
//         >
//           <View style={styles.ispButtonContent}>
//             <View>
//               <Text style={styles.ispButtonTitle}>ISP y Configuración</Text>
//               <Text style={styles.ispButtonSubtitle}>Ver red, puertos y credenciales</Text>
//             </View>
//             <Text style={styles.ispButtonArrow}>→</Text>
//           </View>
//         </TouchableOpacity>

//         <View style={styles.bottomSpacer} />
//       </ScrollView>

//       {/* Botones de acción */}
//       <View style={styles.actionButtonsContainer}>
//         {!isEditing ? (
//           <Button onPress={() => setIsEditing(true)} fullWidth>
//             Editar
//           </Button>
//         ) : (
//           <View style={styles.editButtonsRow}>
//             <Button
//               variant="ghost"
//               onPress={() => { setEditedOrder(order); setIsEditing(false); }}
//               style={{ flex: 1 }}
//             >
//               Cancelar
//             </Button>
//             <Button variant="primary" onPress={handleSave} style={{ flex: 1 }}>
//               Guardar
//             </Button>
//           </View>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.background },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: SIZES.md,
//     paddingVertical: SIZES.md,
//     backgroundColor: COLORS.surface,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },
//   backButton: { padding: SIZES.sm },
//   backIcon: { fontSize: 28, color: COLORS.textPrimary },
//   headerTitleContainer: { flex: 1, alignItems: 'center', gap: SIZES.xs },
//   headerTitle: {
//     fontSize: SIZES.fontLg,
//     fontWeight: TYPOGRAPHY.weightBold,
//     color: COLORS.textPrimary,
//   },
//   placeholder: { width: 40 },
//   scrollView: { flex: 1 },
//   section: {
//     backgroundColor: COLORS.surface,
//     marginTop: SIZES.sm,
//     marginHorizontal: SIZES.md,
//     borderRadius: SIZES.radiusMd,
//     padding: SIZES.md,
//     ...SHADOWS.sm,
//   },
//   sectionTitle: {
//     fontSize: SIZES.fontLg,
//     fontWeight: TYPOGRAPHY.weightBold,
//     color: COLORS.textPrimary,
//     marginBottom: SIZES.md,
//     borderBottomWidth: 2,
//     borderBottomColor: COLORS.primary,
//     paddingBottom: SIZES.sm,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: SIZES.sm,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },
//   infoLabel: {
//     fontSize: SIZES.fontMd,
//     fontWeight: TYPOGRAPHY.weightSemibold,
//     color: COLORS.textSecondary,
//     flex: 1,
//   },
//   infoValue: {
//     fontSize: SIZES.fontMd,
//     color: COLORS.textPrimary,
//     flex: 1,
//     textAlign: 'right',
//   },
//   infoInput: {
//     fontSize: SIZES.fontMd,
//     color: COLORS.textPrimary,
//     flex: 1,
//     textAlign: 'right',
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.primary,
//     paddingVertical: SIZES.xs,
//   },
//   notesText: {
//     fontSize: SIZES.fontMd,
//     color: COLORS.textPrimary,
//     lineHeight: 20,
//   },
//   notesInput: {
//     fontSize: SIZES.fontMd,
//     color: COLORS.textPrimary,
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//     borderRadius: SIZES.radiusSm,
//     padding: SIZES.md,
//     minHeight: 120,
//   },
//   // Botón ISP
//   ispButton: {
//     backgroundColor: COLORS.surface,
//     marginTop: SIZES.sm,
//     marginHorizontal: SIZES.md,
//     borderRadius: SIZES.radiusMd,
//     padding: SIZES.md,
//     borderLeftWidth: SIZES.borderThick,
//     borderLeftColor: COLORS.primary,
//     ...SHADOWS.sm,
//   },
//   ispButtonContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   ispButtonTitle: {
//     fontSize: SIZES.fontLg,
//     fontWeight: TYPOGRAPHY.weightBold,
//     color: COLORS.textPrimary,
//   },
//   ispButtonSubtitle: {
//     fontSize: SIZES.fontMd,
//     color: COLORS.textSecondary,
//     marginTop: 2,
//   },
//   ispButtonArrow: {
//     fontSize: 24,
//     color: COLORS.primary,
//     fontWeight: TYPOGRAPHY.weightBold,
//   },
//   bottomSpacer: { height: 100 },
//   actionButtonsContainer: {
//     backgroundColor: COLORS.surface,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//     padding: SIZES.md,
//   },
//   editButtonsRow: { flexDirection: 'row', gap: SIZES.md },
//   errorText: {
//     fontSize: SIZES.fontBase,
//     color: COLORS.error,
//     textAlign: 'center',
//     marginTop: SIZES.xl,
//   },
// });

// export default WorkOrderDetailScreen;


import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAsync } from '../../../hooks';
import { ordersService } from '../../../api/services';
import { LoadingSpinner, Button, Badge, getBadgeVariantFromStatus } from '../../../components/common';
import { formatDate } from '../../../utils/dateUtils';
import { COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../../../config/theme.config';
import type { WorkOrderDetail, OrdersStackParamList } from '../../../types';

interface WorkOrderDetailScreenProps {
  navigation: NativeStackNavigationProp<OrdersStackParamList, 'WorkOrderDetail'>;
  route: RouteProp<OrdersStackParamList, 'WorkOrderDetail'>;
}

const STATUS_LABELS: Record<string, string> = {
  progress: 'En Progreso',
  done: 'Completada',
  cancel: 'Cancelada',
};

const WorkOrderDetailScreen: React.FC<WorkOrderDetailScreenProps> = ({ navigation, route }) => {
  const { orderId, orderName } = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState<WorkOrderDetail | null>(null);

  const { data: order, isLoading, execute: loadOrder } = useAsync(async () => {
    const result = await ordersService.getOrderDetail(orderId);
    if (result.success && result.order) {
      setEditedOrder(result.order);
      return result.order;
    }
    throw new Error(result.error || 'No se pudo cargar la orden');
  }, true);

  const handleSave = async () => {
    if (!editedOrder) return;
    Alert.alert('Confirmar', '¿Desea guardar los cambios?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Guardar',
        onPress: async () => {
          const result = await ordersService.updateOrder(orderId, editedOrder);
          if (result.success) {
            Alert.alert('Éxito', 'Orden actualizada');
            setIsEditing(false);
            loadOrder();
          } else {
            Alert.alert('Error', result.error || 'No se pudo actualizar');
          }
        },
      },
    ]);
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderRow = (
    label: string,
    value: any,
    editable = false,
    field?: keyof WorkOrderDetail,
  ) => {
    const display =
      value === false || value === null || value === undefined ? 'N/A' : String(value);
    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}:</Text>
        {isEditing && editable && editedOrder && field ? (
          <TextInput
            style={styles.infoInput}
            value={String(editedOrder[field] ?? '')}
            onChangeText={(text) => setEditedOrder({ ...editedOrder, [field]: text })}
          />
        ) : (
          <Text style={styles.infoValue}>{display}</Text>
        )}
      </View>
    );
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (!order) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Detalle</Text>
        </View>
        <View style={styles.placeholder} />
      </View>
      <Text style={styles.errorText}>No se pudo cargar la orden</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{order.name}</Text>
          <Badge variant={getBadgeVariantFromStatus(order.state)} size="sm">
            {STATUS_LABELS[order.state] || order.state}
          </Badge>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {renderSection('Información General', <>
          {renderRow('Origen', order.origin)}
          {renderRow('Fecha', formatDate(order.date))}
          {renderRow('Técnico', order.technical)}
          {renderRow('Plan', order.plan)}
          {renderRow('Código', order.code)}
        </>)}

        {renderSection('Cliente', <>
          {renderRow('Nombre', order.partner?.name)}
          {renderRow('Cédula', order.partner?.cedula)}
          {renderRow('Teléfono', order.partner?.telefono)}
          {renderRow('Celular', order.partner?.celular)}
        </>)}

        {renderSection('Ubicacion', <>
          {renderRow('Latitud', order.ubicacion?.latitude)}
          {renderRow('Longitud', order.ubicacion?.longitude)}
        </>)}

        {renderSection('Notas',
          isEditing ? (
            <TextInput
              style={styles.notesInput}
              value={editedOrder?.note || ''}
              onChangeText={(text) =>
                setEditedOrder((prev) => (prev ? { ...prev, note: text } : null))
              }
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          ) : (
            <Text style={styles.notesText}>{order.note || 'Sin notas'}</Text>
          ),
        )}

        {/* Botón ISP y Configuración */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() =>
            navigation.navigate('WorkOrderISP', {
              orderId: order.id,
              orderName: order.name,
              isp: order.isp,
              contract_user: order.contract_user,
              contract_passwd: order.contract_passwd,
              wifi_user: order.wifi_user,
              wifi_passwd: order.wifi_passwd,
              contract_mac: order.contract_mac,
              serie_ont: order.serie_ont,
            })
          }
          activeOpacity={0.8}
        >
          <View style={styles.navButtonContent}>
            <View>
              <Text style={styles.navButtonTitle}>ISP y Configuración</Text>
              <Text style={styles.navButtonSubtitle}>Ver red, puertos y credenciales</Text>
            </View>
            <Text style={styles.navButtonArrow}>→</Text>
          </View>
        </TouchableOpacity>

        {/* Botón Materiales */}
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonGreen]}
          onPress={() =>
            navigation.navigate('WorkOrderMaterials', {
              orderId: order.id,
              orderName: order.name,
            })
          }
          activeOpacity={0.8}
        >
          <View style={styles.navButtonContent}>
            <View>
              <Text style={styles.navButtonTitle}>Materiales</Text>
              <Text style={styles.navButtonSubtitle}>Agregar materiales a la orden</Text>
            </View>
            <Text style={styles.navButtonArrow}>→</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.actionButtonsContainer}>
        {!isEditing ? (
          <Button onPress={() => setIsEditing(true)} fullWidth>
            Editar
          </Button>
        ) : (
          <View style={styles.editButtonsRow}>
            <Button
              variant="ghost"
              onPress={() => { setEditedOrder(order); setIsEditing(false); }}
              style={{ flex: 1 }}
            >
              Cancelar
            </Button>
            <Button variant="primary" onPress={handleSave} style={{ flex: 1 }}>
              Guardar
            </Button>
          </View>
        )}
      </View>
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
  headerTitleContainer: { flex: 1, alignItems: 'center', gap: SIZES.xs },
  headerTitle: { fontSize: SIZES.fontLg, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.textPrimary },
  placeholder: { width: 40 },
  scrollView: { flex: 1 },
  section: {
    backgroundColor: COLORS.surface, marginTop: SIZES.sm,
    marginHorizontal: SIZES.md, borderRadius: SIZES.radiusMd,
    padding: SIZES.md, ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: SIZES.fontLg, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.textPrimary,
    marginBottom: SIZES.md, borderBottomWidth: 2, borderBottomColor: COLORS.primary,
    paddingBottom: SIZES.sm,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SIZES.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  infoLabel: { fontSize: SIZES.fontMd, fontWeight: TYPOGRAPHY.weightSemibold, color: COLORS.textSecondary, flex: 1 },
  infoValue: { fontSize: SIZES.fontMd, color: COLORS.textPrimary, flex: 1, textAlign: 'right' },
  infoInput: {
    fontSize: SIZES.fontMd, color: COLORS.textPrimary, flex: 1, textAlign: 'right',
    borderBottomWidth: 1, borderBottomColor: COLORS.primary, paddingVertical: SIZES.xs,
  },
  notesText: { fontSize: SIZES.fontMd, color: COLORS.textPrimary, lineHeight: 20 },
  notesInput: {
    fontSize: SIZES.fontMd, color: COLORS.textPrimary, borderWidth: 1,
    borderColor: COLORS.primary, borderRadius: SIZES.radiusSm,
    padding: SIZES.md, minHeight: 120,
  },
  // Botones de navegación
  navButton: {
    backgroundColor: COLORS.surface, marginTop: SIZES.sm, marginHorizontal: SIZES.md,
    borderRadius: SIZES.radiusMd, padding: SIZES.md,
    borderLeftWidth: SIZES.borderThick, borderLeftColor: COLORS.primary, ...SHADOWS.sm,
  },
  navButtonGreen: {
    borderLeftColor: COLORS.success ?? '#22c55e',
  },
  navButtonContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navButtonTitle: { fontSize: SIZES.fontLg, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.textPrimary },
  navButtonSubtitle: { fontSize: SIZES.fontMd, color: COLORS.textSecondary, marginTop: 2 },
  navButtonArrow: { fontSize: 24, color: COLORS.primary, fontWeight: TYPOGRAPHY.weightBold },
  bottomSpacer: { height: 100 },
  actionButtonsContainer: {
    backgroundColor: COLORS.surface, borderTopWidth: 1,
    borderTopColor: COLORS.border, padding: SIZES.md,
  },
  editButtonsRow: { flexDirection: 'row', gap: SIZES.md },
  errorText: { fontSize: SIZES.fontBase, color: COLORS.error, textAlign: 'center', marginTop: SIZES.xl },
});

export default WorkOrderDetailScreen;