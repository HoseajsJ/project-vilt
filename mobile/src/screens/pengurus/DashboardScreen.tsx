import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AlertBanner } from '../../components/AlertBanner';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { colors } from '../../theme/colors';
import { AlertItem, Unit } from '../../types';

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [dashData, alertsData, unitsData] = await Promise.all([
        api.getPengurusDashboard(),
        api.getAlerts(),
        api.getUnits(),
      ]);
      setStats(dashData?.stats || {});
      setAlerts(alertsData);
      setUnits(unitsData);
    } catch {
      // handled inside api service
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAcknowledgeAlert = async (id: number) => {
    await api.acknowledgeAlert(id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'acknowledged' } : a))
    );
  };

  const handleResolveAlert = async (id: number) => {
    await api.resolveAlert(id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'resolved' } : a))
    );
  };

  const metrics = [
    { label: 'Surat menunggu', value: Number(stats?.pending_letters ?? 0), color: colors.accent },
    { label: 'Aduan baru', value: Number(stats?.pending_complaints ?? 0), color: colors.catMaggot },
    { label: 'Peringatan IoT', value: Number(stats?.open_alerts_count ?? 0), color: colors.danger },
  ];
  const maxMetric = Math.max(1, ...metrics.map((metric) => metric.value));
  const sensorReadings = units.flatMap((unit) =>
    (unit.latest_readings || []).slice(0, 1).map((reading) => ({ unit, reading }))
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat data dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Alert Banner if any IoT alert is active */}
      <AlertBanner
        alerts={alerts}
        onAcknowledge={handleAcknowledgeAlert}
        onResolve={handleResolveAlert}
      />

      {/* Greeting */}
      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerGreeting}>
            Ringkasan, {user?.name ? user.name.split(' ')[0] : 'Pengurus'}
          </Text>
          <Text style={styles.bannerSubtitle}>
            Kondisi layanan warga dan unit IoT saat ini.
          </Text>
        </View>
        <Ionicons name="pulse" size={32} color={colors.primary} />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Layanan yang perlu ditindaklanjuti</Text>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.metricRow}>
            <View style={styles.metricLabelRow}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricValue}>{metric.value}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.bar, { width: `${metric.value === 0 ? 0 : Math.max(8, (metric.value / maxMetric) * 100)}%`, backgroundColor: metric.color }]} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.chartCard}>
        <View style={styles.sensorHeading}>
          <View>
            <Text style={styles.cardTitle}>Ringkasan sensor IoT</Text>
            <Text style={styles.sensorSub}>{units.filter((unit) => unit.status === 1).length} dari {units.length} unit aktif</Text>
          </View>
          <Ionicons name="pulse-outline" size={22} color={colors.primary} />
        </View>
        {sensorReadings.length > 0 ? sensorReadings.slice(0, 4).map(({ unit, reading }) => (
          <View key={`${unit.id}-${reading.code}`} style={styles.sensorRow}>
            <View style={styles.sensorDot} />
            <Text style={styles.sensorName} numberOfLines={1}>{unit.name}</Text>
            <Text style={styles.sensorReading}>{reading.value} {reading.unit}</Text>
          </View>
        )) : <Text style={styles.emptyText}>Belum ada data pembacaan sensor.</Text>}
        <Text style={styles.insightNote}>Ringkasan berdasarkan data sensor terbaru. Analisis prediksi ML belum tersedia.</Text>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  bannerContent: {
    flex: 1,
    marginRight: 10,
  },
  bannerGreeting: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 17,
  },
  chartCard: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  metricRow: { marginTop: 15 },
  metricLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  metricLabel: { fontSize: 12, color: colors.textMuted },
  metricValue: { fontSize: 12, fontWeight: '800', color: colors.text },
  track: { height: 8, borderRadius: 5, backgroundColor: colors.surfaceSubtle, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 5 },
  sensorHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sensorSub: { fontSize: 11, color: colors.textMuted, marginTop: 3 },
  sensorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9, borderTopWidth: 1, borderTopColor: colors.borderLight },
  sensorDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
  sensorName: { flex: 1, fontSize: 12, color: colors.textMuted },
  sensorReading: { fontSize: 12, fontWeight: '700', color: colors.text },
  emptyText: { color: colors.textMuted, fontSize: 12, paddingVertical: 8 },
  insightNote: { fontSize: 10, color: colors.textLight, lineHeight: 14, marginTop: 8 },
});
