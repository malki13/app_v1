import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { COLORS, SIZES, TYPOGRAPHY } from '../../../config/theme.config';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }
    setIsLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (!result.success) Alert.alert('Error', result.error || 'Error al iniciar sesión');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🔧</Text>
            <Text style={styles.title}>Odoo Work Guides</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input} value={email} onChangeText={setEmail}
              placeholder="tu@email.com" placeholderTextColor={COLORS.textTertiary}
              keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
            />
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input} value={password} onChangeText={setPassword}
              placeholder="••••••••" placeholderTextColor={COLORS.textTertiary}
              secureTextEntry autoCapitalize="none"
            />
            <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleLogin} disabled={isLoading} activeOpacity={0.8}>
              {isLoading
                ? <ActivityIndicator color={COLORS.surface} />
                : <Text style={styles.buttonText}>Iniciar Sesión</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: SIZES.xl },
  logoContainer: { alignItems: 'center', marginBottom: SIZES.xxl },
  logoIcon: { fontSize: 64, marginBottom: SIZES.md },
  title: { fontSize: SIZES.font3xl, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.textPrimary, marginBottom: SIZES.sm },
  subtitle: { fontSize: SIZES.fontBase, color: COLORS.textSecondary },
  form: { gap: SIZES.sm },
  label: { fontSize: SIZES.fontMd, fontWeight: TYPOGRAPHY.weightMedium, color: COLORS.textPrimary },
  input: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md, fontSize: SIZES.fontBase, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, marginBottom: SIZES.sm },
  button: { backgroundColor: COLORS.primary, borderRadius: SIZES.radiusMd, paddingVertical: SIZES.md, alignItems: 'center', marginTop: SIZES.md, minHeight: SIZES.buttonMd },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: COLORS.surface, fontSize: SIZES.fontBase, fontWeight: TYPOGRAPHY.weightBold },
});
