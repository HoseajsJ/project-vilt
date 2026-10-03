import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { Activity } from '../types';

interface ActivityCardProps {
  activity: Activity;
  isPengurus?: boolean;
  onPublish?: (id: number) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  isPengurus = false,
  onPublish,
}) => {
  const getCategoryMeta = () => {
    switch (activity.category) {
      case 'budidaya':
        return { color: colors.catHidro, bg: '#DCFCE7', label: 'Budidaya IoT' };
      case 'lingkungan':
        return { color: colors.catLingkungan, bg: '#ECFDF5', label: 'Lingkungan RW' };
      case 'sosial':
        return { color: colors.accent, bg: '#DBEAFE', label: 'Sosial & Warga' };
      case 'rapat':
        return { color: '#7C3AED', bg: '#EDE9FE', label: 'Rapat Organisasi' };
      default:
        return { color: colors.textMuted, bg: colors.surfaceSubtle, label: 'Umum' };
    }
  };

  const meta = getCategoryMeta();

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
        </View>

        {isPengurus && (
          <View
            style={[
              styles.statusPill,
              { backgroundColor: activity.status === 'published' ? colors.successLight : colors.warningLight },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: activity.status === 'published' ? colors.success : colors.warning },
              ]}
            >
              {activity.status === 'published' ? 'Terbit' : 'Draft'}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{activity.title}</Text>

      {activity.description ? (
        <Text style={styles.description} numberOfLines={3}>
          {activity.description}
        </Text>
      ) : null}

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
          <Text style={styles.metaText}>{formatDate(activity.activity_date)}</Text>
        </View>

        {activity.location ? (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>
              {activity.location}
            </Text>
          </View>
        ) : null}
      </View>

      {isPengurus && activity.status === 'draft' && onPublish && (
        <TouchableOpacity style={styles.publishBtn} onPress={() => onPublish(activity.id)}>
          <Ionicons name="megaphone-outline" size={15} color="#FFF" />
          <Text style={styles.publishBtnText}>Publikasikan ke Warga</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 12,
  },
  publishBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
