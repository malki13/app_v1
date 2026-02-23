import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../../config/theme.config';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof SIZES;
  borderColor?: string;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, variant = 'default', padding = 'md', borderColor }) => {
  const cardStyles: ViewStyle[] = [styles.base, styles[variant], { padding: SIZES[padding] as number }, borderColor ? { borderColor } : {}, style ?? {}];
  if (onPress) return <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={cardStyles}>{children}</TouchableOpacity>;
  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  base: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd },
  default: { ...SHADOWS.sm },
  elevated: { ...SHADOWS.md },
  outlined: { borderWidth: SIZES.borderThin, borderColor: COLORS.border },
});
