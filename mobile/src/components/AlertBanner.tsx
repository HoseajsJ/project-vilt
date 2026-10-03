import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { AlertItem } from '../types';

interface AlertBannerProps {
  alerts: AlertItem[];
  onAcknowledge?: (id: number) => void;
  onResolve?: (id: number) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onAcknowledge, onResolve }) => {
  const activeAlerts = alerts.filter((a) => a.status !== 'resolved');

  if (activeAlerts.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Ionicons name="warning" size={18} color={colors.danger} />
        <Text style={styles.title}>Peringatan Sensor IoT ({activeAlerts.length})</Text>
      </View>

      {activeAlerts.map((alert) => (
        <View key={alert.id} style={styles.alertItem}>
          <View style={styles.alertContent}>
            <Text style={styles.alertUnit}>{alert.unit?.name || 'Unit Budidaya'}</Text>
            <Text style={styles.alertMsg}>{alert.message}</Text>
          </View>

          <View style={styles.btnRow}>
            {alert.status === 'open' && onAcknowledge && (
              <TouchableOpacity
                style={styles.ackBtn}
                onPress={() => onAcknowledge(alert.id)}
              >
                <Text style={styles.ackText}>Tandai Dibaca</Text>
              </TouchableOpacity>
            )}

            {onResolve && (
              <TouchableOpacity
                style={styles.resBtn}
                onPress={() => onResolve(alert.id)}
              >
                <Text style={styles.resText}>Selesaikan</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dangerLight,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.danger,
  },
  alertItem: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  alertContent: {
    marginBottom: 6,
  },
  alertUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  alertMsg: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  ackBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: colors.surfaceSubtle,
  },
  ackText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  resBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  resText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
});
