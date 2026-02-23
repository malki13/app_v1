import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../../../config/theme.config';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress, children, variant = 'primary', size = 'md',
  disabled = false, loading = false, fullWidth = false, style, textStyle,
}) => {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress} disabled={isDisabled} activeOpacity={0.7}
      style={[styles.base, styles[variant], styles[`size_${size}` as keyof typeof styles] as ViewStyle, isDisabled && styles.disabled, fullWidth && styles.fullWidth, style]}
    >
      {loading
        ? <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.surface} size="small" />
        : <Text style={[styles.text, styles[`text_${variant}` as keyof typeof styles] as TextStyle, styles[`text_${size}` as keyof typeof styles] as TextStyle, isDisabled && styles.textDisabled, textStyle]}>{children}</Text>
      }
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: SIZES.radiusMd, ...SHADOWS.sm },
  primary: { backgroundColor: COLORS.primary },
  secondary: { backgroundColor: COLORS.secondary },
  outline: { backgroundColor: COLORS.transparent, borderWidth: 2, borderColor: COLORS.primary },
  ghost: { backgroundColor: COLORS.transparent },
  danger: { backgroundColor: COLORS.error },
  size_sm: { paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm, minHeight: SIZES.buttonSm },
  size_md: { paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md, minHeight: SIZES.buttonMd },
  size_lg: { paddingHorizontal: SIZES.xl, paddingVertical: SIZES.lg, minHeight: SIZES.buttonLg },
  disabled: { opacity: 0.5 },
  fullWidth: { width: '100%' },
  text: { fontWeight: TYPOGRAPHY.weightSemibold },
  text_primary: { color: COLORS.surface },
  text_secondary: { color: COLORS.surface },
  text_outline: { color: COLORS.primary },
  text_ghost: { color: COLORS.primary },
  text_danger: { color: COLORS.surface },
  text_sm: { fontSize: SIZES.fontSm },
  text_md: { fontSize: SIZES.fontBase },
  text_lg: { fontSize: SIZES.fontLg },
  textDisabled: { opacity: 0.7 },
});
