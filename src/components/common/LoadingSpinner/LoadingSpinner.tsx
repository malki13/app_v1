import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SIZES } from '../../../config/theme.config';

export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'large', color = COLORS.primary, text, fullScreen = false, style }) => (
  <View style={[fullScreen ? styles.fullScreen : styles.container, style]}>
    <ActivityIndicator size={size} color={color} />
    {text && <Text style={styles.text}>{text}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { padding: SIZES.xl, alignItems: 'center', justifyContent: 'center' },
  fullScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  text: { marginTop: SIZES.md, fontSize: SIZES.fontBase, color: COLORS.textSecondary },
});
