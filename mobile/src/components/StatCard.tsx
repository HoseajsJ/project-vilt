import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = colors.primary,
  subtext,
}) => {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
        {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  content: {
    gap: 2,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  subtext: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
});
