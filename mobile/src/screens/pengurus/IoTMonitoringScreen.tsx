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
import { UnitCard } from '../../components/UnitCard';
import { api } from '../../services/api';
import { colors } from '../../theme/colors';
import { AlertItem, Unit } from '../../types';

export const IoTMonitoringScreen: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'lele' | 'hidroponik' | 'maggot' | 'lingkungan'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [u, a] = await Promise.all([api.getUnits(), api.getAlerts()]);
      setUnits(u);
      setAlerts(a);
    } catch {
      // handled inside api
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

  const filteredUnits = selectedFilter === 'all'
    ? units
    : units.filter((u) => u.type === selectedFilter);

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
        <Text style={styles.loadingText}>Memuat data sensor IoT...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Monitoring Sensor IoT & Budidaya</Text>
        <Text style={styles.pageSubtitle}>
          Telemetri otomatis kolam lele, tanaman hidroponik NFT, pengomposan maggot BSF, dan pos pantau.
        </Text>
      </View>

      {/* Active Alerts */}
      <AlertBanner
        alerts={alerts}
        onAcknowledge={handleAcknowledgeAlert}
        onResolve={handleResolveAlert}
      />

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
            Semua ({units.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'lele' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('lele')}
        >
          <Ionicons name="water" size={14} color={selectedFilter === 'lele' ? colors.primary : colors.textMuted} />
          <Text style={[styles.filterText, selectedFilter === 'lele' && styles.filterTextActive]}>
            Kolam Lele
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'hidroponik' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('hidroponik')}
        >
          <Ionicons name="leaf" size={14} color={selectedFilter === 'hidroponik' ? colors.primary : colors.textMuted} />
          <Text style={[styles.filterText, selectedFilter === 'hidroponik' && styles.filterTextActive]}>
            Hidroponik NFT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'maggot' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('maggot')}
        >
          <Ionicons name="bug" size={14} color={selectedFilter === 'maggot' ? colors.primary : colors.textMuted} />
          <Text style={[styles.filterText, selectedFilter === 'maggot' && styles.filterTextActive]}>
            Biopond Maggot
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'lingkungan' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('lingkungan')}
        >
          <Ionicons name="cloud-outline" size={14} color={selectedFilter === 'lingkungan' ? colors.primary : colors.textMuted} />
          <Text style={[styles.filterText, selectedFilter === 'lingkungan' && styles.filterTextActive]}>
            Lingkungan
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Threshold Guide Box */}
      <View style={styles.guideBox}>
        <View style={styles.guideHeader}>
          <Ionicons name="information-circle" size={16} color={colors.secondary} />
          <Text style={styles.guideTitle}>Batas Aman Parameter Sensor:</Text>
        </View>
        <Text style={styles.guideItem}>• Kolam Lele: pH 6.5 - 8.5 • Suhu 25 - 32°C • DO min 3.0 mg/L</Text>
        <Text style={styles.guideItem}>• Hidroponik: pH 5.5 - 6.5 • EC 1.2 - 2.5 mS/cm</Text>
        <Text style={styles.guideItem}>• Maggot BSF: Suhu 25 - 35°C • Kelembapan 60 - 80%</Text>
      </View>

      {/* Units List */}
      <Text style={styles.listHeading}>Daftar Unit Terpasang Perangkat</Text>
      {filteredUnits.map((u) => (
        <UnitCard key={u.id} unit={u} showTechnicalSensors={true} />
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
  titleSection: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  pageSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 17,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primaryUltralight,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  guideBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  guideTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
  guideItem: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 17,
  },
  listHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
});
