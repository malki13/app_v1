import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Button } from '../Button/Button';
import { COLORS, SIZES, TYPOGRAPHY } from '../../../config/theme.config';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📭', title, message, actionLabel, onAction, style }) => (
  <View style={[styles.container, style]}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.title}>{title}</Text>
    {message && <Text style={styles.message}>{message}</Text>}
    {actionLabel && onAction && <Button onPress={onAction} style={styles.button}>{actionLabel}</Button>}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.xl },
  icon: { fontSize: 64, marginBottom: SIZES.lg },
  title: { fontSize: SIZES.fontXl, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.textPrimary, textAlign: 'center', marginBottom: SIZES.sm },
  message: { fontSize: SIZES.fontBase, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SIZES.lg },
  button: { marginTop: SIZES.md },
});
