import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SIZES, TYPOGRAPHY } from '../../config/theme.config';

const menuItems = [
  { screen: 'Home' as const, icon: '🏠', label: 'Inicio' },
  { screen: 'UserInfo' as const, icon: '👤', label: 'Mi Perfil' },
  { screen: 'MyWarehouse' as const, icon: '📦', label: 'Mi Bodega' },
];

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: async () => { await logout(); } },
    ]);
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.name ?? 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.username ?? ''}</Text>
        </View>

        <View style={styles.menuItems}>
          {menuItems.map(item => (
            <TouchableOpacity key={item.screen} style={styles.menuItem} onPress={() => navigation.navigate(item.screen)}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.spacer} />
        <View style={styles.divider} />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  content: { flex: 1 },
  userInfo: { padding: SIZES.lg, alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.md },
  avatarText: { fontSize: SIZES.font2xl, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.surface },
  userName: { fontSize: SIZES.fontLg, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.textPrimary, marginBottom: SIZES.xs },
  userEmail: { fontSize: SIZES.fontSm, color: COLORS.textSecondary },
  menuItems: { paddingTop: SIZES.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SIZES.md, paddingHorizontal: SIZES.lg },
  menuIcon: { fontSize: SIZES.fontLg, marginRight: SIZES.md },
  menuText: { fontSize: SIZES.fontBase, color: COLORS.textPrimary, flex: 1 },
  spacer: { flex: 1 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SIZES.sm },
  logoutButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: SIZES.md, paddingHorizontal: SIZES.lg },
  logoutIcon: { fontSize: SIZES.fontLg, marginRight: SIZES.md },
  logoutText: { fontSize: SIZES.fontBase, color: COLORS.error, fontWeight: TYPOGRAPHY.weightSemibold },
});

export default CustomDrawerContent;
