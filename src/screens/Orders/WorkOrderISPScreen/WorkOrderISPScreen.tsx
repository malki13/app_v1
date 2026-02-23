import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';
import { ordersService } from '../../../api/services';
import { Button } from '../../../components/common';
import { COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../../../config/theme.config';
import type { DrawerParamList } from '../../../types';

interface WorkOrderISPScreenProps {
  navigation: DrawerNavigationProp<DrawerParamList, 'WorkOrderISP'>;
  route: RouteProp<DrawerParamList, 'WorkOrderISP'>;
}

const WorkOrderISPScreen: React.FC<WorkOrderISPScreenProps> = ({ navigation, route }) => {
  const {
    orderId,
    orderName,
    isp,
    contract_user,
    contract_passwd,
    wifi_user,
    wifi_passwd,
    contract_mac,
    serie_ont,
  } = route.params;

  const [isEditing, setIsEditing] = useState(false);
  const [config, setConfig] = useState({
    contract_user: contract_user ?? '',
    contract_passwd: contract_passwd ?? '',
    wifi_user: wifi_user ?? '',
    wifi_passwd: wifi_passwd ?? '',
    contract_mac: contract_mac ?? '',
    serie_ont: serie_ont ?? '',
  });

  const handleSave = async () => {
    Alert.alert('Confirmar', '¿Desea guardar los cambios?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Guardar',
        onPress: async () => {
          const result = await ordersService.updateOrder(orderId, config);
          if (result.success) {
            Alert.alert('Éxito', 'Configuración actualizada');
            setIsEditing(false);
          } else {
            Alert.alert('Error', result.error || 'No se pudo actualizar');
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setConfig({
      contract_user: contract_user ?? '',
      contract_passwd: contract_passwd ?? '',
      wifi_user: wifi_user ?? '',
      wifi_passwd: wifi_passwd ?? '',
      contract_mac: contract_mac ?? '',
      serie_ont: serie_ont ?? '',
    });
    setIsEditing(false);
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderRow = (label: string, value: any) => {
    const display =
      value === false || value === null || value === undefined ? 'N/A' : String(value);
    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}:</Text>
        <Text style={styles.infoValue}>{display}</Text>
      </View>
    );
  };

  const renderEditableRow = (
    label: string,
    field: keyof typeof config,
  ) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      {isEditing ? (
        <TextInput
          style={styles.infoInput}
          value={config[field]}
          onChangeText={(text) => setConfig((prev) => ({ ...prev, [field]: text }))}
          autoCapitalize="none"
        />
      ) : (
        <Text style={styles.infoValue}>{config[field] || 'N/A'}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            ISP y Configuración
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {orderName}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* ISP */}
        {renderSection('ISP', <>
          {renderRow('Core', isp?.core?.name)}
          {renderRow('OLT', isp?.olt?.name)}
          {renderRow('Tarjeta', isp?.tarjeta?.name)}
          {renderRow('Puerto', isp?.puerto?.name)}
          {renderRow('NAP', isp?.nap?.name)}
          {renderRow('Puerto NAP', isp?.nap_port?.name)}
          {renderRow('IP', isp?.ip?.name)}
          {renderRow('Tipo ONU', isp?.onu_type_id?.name)}
          {renderRow('Estado', isp?.current_status?.status)}
        </>)}

        {/* Configuración */}
        {renderSection('Configuración', <>
          {renderEditableRow('Usuario Contrato', 'contract_user')}
          {renderEditableRow('Password Contrato', 'contract_passwd')}
          {renderEditableRow('Usuario WiFi', 'wifi_user')}
          {renderEditableRow('Password WiFi', 'wifi_passwd')}
          {renderEditableRow('MAC', 'contract_mac')}
          {renderEditableRow('Serie ONT', 'serie_ont')}
        </>)}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.actionButtonsContainer}>
        {!isEditing ? (
          <Button onPress={() => setIsEditing(true)} fullWidth>
            Editar Configuración
          </Button>
        ) : (
          <View style={styles.editButtonsRow}>
            <Button variant="ghost" onPress={handleCancel} style={{ flex: 1 }}>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: SIZES.sm },
  backIcon: { fontSize: 28, color: COLORS.textPrimary },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
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
  placeholder: { width: 40 },
  scrollView: { flex: 1 },
  section: {
    backgroundColor: COLORS.surface,
    marginTop: SIZES.sm,
    marginHorizontal: SIZES.md,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SIZES.md,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: SIZES.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: SIZES.fontMd,
    fontWeight: TYPOGRAPHY.weightSemibold,
    color: COLORS.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: SIZES.fontMd,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  infoInput: {
    fontSize: SIZES.fontMd,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingVertical: SIZES.xs,
  },
  bottomSpacer: { height: 100 },
  actionButtonsContainer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SIZES.md,
  },
  editButtonsRow: { flexDirection: 'row', gap: SIZES.md },
});

export default WorkOrderISPScreen;