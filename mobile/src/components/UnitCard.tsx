import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { Unit } from '../types';

interface UnitCardProps {
  unit: Unit;
  showTechnicalSensors?: boolean;
}

export const UnitCard: React.FC<UnitCardProps> = ({ unit, showTechnicalSensors = true }) => {
  const getTypeMeta = () => {
    switch (unit.type) {
      case 'lele':
        return {
          icon: 'water' as const,
          color: colors.catLele,
          bg: '#E0F2FE',
          tag: 'Budidaya Lele Bioflok',
        };
      case 'hidroponik':
        return {
          icon: 'leaf' as const,
          color: colors.catHidro,
          bg: '#DCFCE7',
          tag: 'Hidroponik NFT Tanaman',
        };
      case 'maggot':
        return {
          icon: 'bug' as const,
          color: colors.catMaggot,
          bg: '#FEF3C7',
          tag: 'Biopond Maggot BSF',
        };
      default:
        return {
          icon: 'cloud-outline' as const,
          color: colors.catLingkungan,
          bg: '#ECFDF5',
          tag: 'Kualitas Lingkungan',
        };
    }
  };

  const meta = getTypeMeta();

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={[styles.typeIcon, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={20} color={meta.color} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.unitName}>{unit.name}</Text>
          <View style={styles.tagRow}>
            <View style={[styles.badge, { backgroundColor: meta.bg }]}>
              <Text style={[styles.badgeText, { color: meta.color }]}>{meta.tag}</Text>
            </View>
            <View style={styles.statusDotRow}>
              <View style={[styles.statusDot, { backgroundColor: unit.status === 1 ? colors.success : colors.danger }]} />
              <Text style={styles.statusText}>{unit.status === 1 ? 'Aktif' : 'Non-aktif'}</Text>
            </View>
          </View>
        </View>
      </View>

      {unit.location ? (
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={colors.textLight} />
          <Text style={styles.locationText}>{unit.location}</Text>
        </View>
      ) : null}

      {/* Production Cycle Batch Info */}
      {unit.active_cycle ? (
        <View style={styles.cycleBox}>
          <View style={styles.cycleHeader}>
            <Ionicons name="repeat-outline" size={14} color={colors.secondary} />
            <Text style={styles.cycleTitle}>{unit.active_cycle.name}</Text>
          </View>
          {unit.active_cycle.initial_qty ? (
            <Text style={styles.cycleSub}>Kapasitas: {unit.active_cycle.initial_qty}</Text>
          ) : null}
        </View>
      ) : null}

      {/* Live Sensor Readings */}
      {showTechnicalSensors && unit.latest_readings && unit.latest_readings.length > 0 ? (
        <View style={styles.sensorsSection}>
          <Text style={styles.sensorsTitle}>Sensor Terkini (Real-time IoT):</Text>
          <View style={styles.sensorGrid}>
            {unit.latest_readings.map((reading, idx) => (
              <View key={idx} style={styles.sensorItem}>
                <Text style={styles.sensorName}>{reading.name}</Text>
                <View style={styles.sensorValueRow}>
                  <Text style={styles.sensorValue}>{reading.value}</Text>
                  <Text style={styles.sensorUnit}>{reading.unit}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : (
        !showTechnicalSensors && (
          <View style={styles.wargaNoteBox}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
            <Text style={styles.wargaNoteText}>Sistem sensor otomatis berjalan stabil & aman.</Text>
          </View>
        )
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
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  unitName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingLeft: 2,
  },
  locationText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  cycleBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  cycleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cycleTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  cycleSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    marginLeft: 20,
  },
  sensorsSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
  },
  sensorsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sensorItem: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  sensorName: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
  },
  sensorValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginTop: 2,
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  sensorUnit: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  wargaNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryUltralight,
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  wargaNoteText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '500',
  },
});
