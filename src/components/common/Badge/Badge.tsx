import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SIZES, TYPOGRAPHY } from '../../../config/theme.config';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'md', style, textStyle }) => (
  <View style={[styles.base, styles[variant], styles[`size_${size}` as keyof typeof styles] as ViewStyle, style]}>
    <Text style={[styles.text, styles[`text_${size}` as keyof typeof styles] as TextStyle, textStyle]}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  base: { alignSelf: 'flex-start', borderRadius: SIZES.radiusFull, paddingHorizontal: SIZES.md, paddingVertical: SIZES.xs },
  success: { backgroundColor: COLORS.success + '30' },
  warning: { backgroundColor: COLORS.warning + '30' },
  error: { backgroundColor: COLORS.error + '30' },
  info: { backgroundColor: COLORS.info + '30' },
  default: { backgroundColor: COLORS.border },
  size_sm: { paddingHorizontal: SIZES.sm, paddingVertical: 2 },
  size_md: { paddingHorizontal: SIZES.md, paddingVertical: SIZES.xs },
  size_lg: { paddingHorizontal: SIZES.lg, paddingVertical: SIZES.sm },
  text: { fontWeight: TYPOGRAPHY.weightSemibold, color: COLORS.textPrimary },
  text_sm: { fontSize: SIZES.fontXs },
  text_md: { fontSize: SIZES.fontSm },
  text_lg: { fontSize: SIZES.fontMd },
});

export const getBadgeVariantFromStatus = (status: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    open: 'success', closed: 'error', progress: 'warning', done: 'info', cancel: 'error', draft: 'default',
  };
  return map[status?.toLowerCase()] || 'default';
};
