import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../common/Card/Card';
import { Badge, getBadgeVariantFromStatus } from '../../common/Badge/Badge';
import { COLORS, SIZES, TYPOGRAPHY } from '../../../config/theme.config';
import { formatDate } from '../../../utils/dateUtils';
import type { WorkGuide } from '../../../types/models.types';

export interface GuideCardProps {
  guide: WorkGuide;
  onPress?: (guide: WorkGuide) => void;
}

export const GuideCard: React.FC<GuideCardProps> = ({ guide, onPress }) => {
  const statusLabels: Record<WorkGuide['state'], string> = {
    open: 'Abierta', closed: 'Cerrada', draft: 'Borrador', done: 'Completada',
  };
  return (
    <Card onPress={() => onPress?.(guide)} variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>{guide.name}</Text>
        <Badge variant={getBadgeVariantFromStatus(guide.state)} size="sm">
          {statusLabels[guide.state]}
        </Badge>
      </View>
      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Text style={styles.icon}>📅</Text>
          <Text style={styles.infoLabel}>Fecha:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>{formatDate(guide.date)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.icon}>👥</Text>
          <Text style={styles.infoLabel}>Equipo:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>{guide.team_id?.[1] ?? '-'}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: SIZES.md, borderLeftWidth: SIZES.borderThick, borderLeftColor: COLORS.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SIZES.md, gap: SIZES.sm },
  title: { flex: 1, fontSize: SIZES.fontLg, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.textPrimary },
  content: { gap: SIZES.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  icon: { fontSize: SIZES.fontLg },
  infoLabel: { fontSize: SIZES.fontMd, fontWeight: TYPOGRAPHY.weightMedium, color: COLORS.textSecondary },
  infoValue: { flex: 1, fontSize: SIZES.fontMd, color: COLORS.textPrimary },
});
