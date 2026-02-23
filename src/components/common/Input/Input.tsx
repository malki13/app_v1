import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { COLORS, SIZES, TYPOGRAPHY } from '../../../config/theme.config';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({ label, error, containerStyle, style, ...props }) => (
  <View style={[styles.container, containerStyle]}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput style={[styles.input, error && styles.inputError, style]} placeholderTextColor={COLORS.textTertiary} {...props} />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: SIZES.md },
  label: { fontSize: SIZES.fontMd, fontWeight: TYPOGRAPHY.weightMedium, color: COLORS.textPrimary, marginBottom: SIZES.sm },
  input: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md, fontSize: SIZES.fontBase, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  inputError: { borderColor: COLORS.error },
  errorText: { fontSize: SIZES.fontSm, color: COLORS.error, marginTop: SIZES.xs },
});
