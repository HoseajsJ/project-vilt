import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AlertBanner } from '../../components/AlertBanner';
import { StatCard } from '../../components/StatCard';
import { UnitCard } from '../../components/UnitCard';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { colors } from '../../theme/colors';
import { AlertItem, Unit } from '../../types';

interface DashboardScreenProps {
  onNavigateTab: (tabKey: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateTab }) => {
  const { user, isRtOrPengurus } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [dashData, unitsData, alertsData] = await Promise.all([
        api.getPengurusDashboard(),
        api.getUnits(),
        api.getAlerts(),
      ]);
      setStats(dashData?.stats || {});
      setUnits(unitsData);
      setAlerts(alertsData);
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

      {/* Greeting Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerGreeting}>
            Selamat datang, {user?.name ? user.name.split(' ')[0] : 'Pengurus'}! 👋
          </Text>
          <Text style={styles.bannerSubtitle}>
            Pantau operasional IoT budidaya & layanan warga lingkungan RW 05 hari ini.
          </Text>
        </View>
        <Ionicons name="pulse" size={32} color={colors.primary} />
      </View>

      {/* Stat Grid */}
      <Text style={styles.sectionTitle}>Ringkasan Statistik</Text>
      <View style={styles.statGrid}>
        <StatCard
          label="Unit Budidaya Aktif"
          value={stats?.units_count ?? units.length}
          icon="hardware-chip-outline"
          color={colors.catLingkungan}
          subtext="Lele, Hidro, Maggot"
        />
        <StatCard
          label="Peringatan Terbuka"
          value={stats?.open_alerts_count ?? 0}
          icon="warning-outline"
          color={stats?.open_alerts_count > 0 ? colors.danger : colors.success}
          subtext={stats?.open_alerts_count > 0 ? 'Perlu tindakan' : 'Semua aman'}
        />
        <StatCard
          label="Permohonan Surat"
          value={stats?.pending_letters ?? 0}
          icon="document-text-outline"
          color={colors.accent}
          subtext="Menunggu review RT"
        />
        <StatCard
          label="Pengaduan Warga"
          value={stats?.pending_complaints ?? 0}
          icon="alert-circle-outline"
          color={colors.catMaggot}
          subtext="Perlu tindak lanjut"
        />
      </View>

      {/* Quick Action Buttons */}
      <Text style={styles.sectionTitle}>Aksi Cepat Pengurus</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => onNavigateTab('iot')}
        >
          <Ionicons name="leaf-outline" size={18} color="#FFF" />
          <Text style={styles.actionBtnText}>Cek Sensor IoT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.accent }]}
          onPress={() => onNavigateTab('services')}
        >
          <Ionicons name="shield-checkmark-outline" size={18} color="#FFF" />
          <Text style={styles.actionBtnText}>Layanan & Aduan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#7C3AED' }]}
          onPress={() => onNavigateTab('kegiatan')}
        >
          <Ionicons name="add-circle-outline" size={18} color="#FFF" />
          <Text style={styles.actionBtnText}>Buat Kegiatan</Text>
        </TouchableOpacity>
      </View>

      {/* Unit Monitoring Section */}
      <View style={styles.unitHeaderRow}>
        <Text style={styles.sectionTitle}>Status Sensor & Unit IoT ({units.length})</Text>
        <TouchableOpacity onPress={() => onNavigateTab('iot')}>
          <Text style={styles.seeAllText}>Lihat Detail →</Text>
        </TouchableOpacity>
      </View>

      {units.map((unit) => (
        <UnitCard key={unit.id} unit={unit} showTechnicalSensors={true} />
      ))}
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
    marginTop: 6,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  unitHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
