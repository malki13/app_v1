import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useAuth } from '../../../context/AuthContext';
import { COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../../../config/theme.config';
import type { DrawerParamList } from '../../../types';

interface UserInfoScreenProps {
  navigation: DrawerNavigationProp<DrawerParamList, 'UserInfo'>;
}

const UserInfoScreen: React.FC<UserInfoScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.name ?? 'Usuario'}</Text>
          <Text style={styles.userRole}>Técnico</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información de Cuenta</Text>
          <View style={styles.row}><Text style={styles.rowLabel}>Email</Text><Text style={styles.rowValue}>{user?.username ?? '-'}</Text></View>
          <View style={styles.row}><Text style={styles.rowLabel}>ID Usuario</Text><Text style={styles.rowValue}>{user?.uid ?? '-'}</Text></View>
          <View style={styles.row}><Text style={styles.rowLabel}>Empresa ID</Text><Text style={styles.rowValue}>{user?.company_id ?? '-'}</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.md, paddingVertical: SIZES.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuButton: { padding: SIZES.sm },
  menuIcon: { fontSize: 24, color: COLORS.textPrimary },
  headerTitle: { fontSize: SIZES.fontXl, fontWeight: 'bold', color: COLORS.textPrimary },
  placeholder: { width: 40 },
  content: { padding: SIZES.md },
  avatarContainer: { alignItems: 'center', paddingVertical: SIZES.xl },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.md },
  avatarText: { fontSize: SIZES.font2xl, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.surface },
  userName: { fontSize: SIZES.font2xl, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.textPrimary, marginBottom: SIZES.xs },
  userRole: { fontSize: SIZES.fontBase, color: COLORS.textSecondary },
  card: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, padding: SIZES.md, ...SHADOWS.sm },
  cardTitle: { fontSize: SIZES.fontLg, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.textPrimary, marginBottom: SIZES.md, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: SIZES.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SIZES.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowLabel: { fontSize: SIZES.fontMd, color: COLORS.textSecondary },
  rowValue: { fontSize: SIZES.fontMd, color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.weightMedium },
});

export default UserInfoScreen;
