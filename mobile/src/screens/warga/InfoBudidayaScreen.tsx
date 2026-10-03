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
import { ActivityCard } from '../../components/ActivityCard';
import { UnitCard } from '../../components/UnitCard';
import { api } from '../../services/api';
import { colors } from '../../theme/colors';
import { Activity, Unit } from '../../types';

export const InfoBudidayaScreen: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<'kegiatan' | 'budidaya'>('kegiatan');
  const [units, setUnits] = useState<Unit[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [u, a] = await Promise.all([api.getPublicUnits(), api.getPublicActivities()]);
      setUnits(u);
      setActivities(a);
    } catch {
      // handled
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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat info lingkungan & kegiatan...</Text>
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
        <Text style={styles.pageTitle}>Info Budidaya & Kegiatan</Text>
        <Text style={styles.pageSubtitle}>
          Transparansi program ketahanan pangan Karang Taruna RW 05 dan agenda kemasyarakatan.
        </Text>
      </View>

      {/* Switcher Tab */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.switchBtn, activeSegment === 'kegiatan' && styles.switchBtnActive]}
          onPress={() => setActiveSegment('kegiatan')}
        >
          <Ionicons
            name="calendar"
            size={16}
            color={activeSegment === 'kegiatan' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.switchBtnText,
              activeSegment === 'kegiatan' && styles.switchBtnTextActive,
            ]}
          >
            Agenda Kegiatan ({activities.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchBtn, activeSegment === 'budidaya' && styles.switchBtnActive]}
          onPress={() => setActiveSegment('budidaya')}
        >
          <Ionicons
            name="leaf"
            size={16}
            color={activeSegment === 'budidaya' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.switchBtnText,
              activeSegment === 'budidaya' && styles.switchBtnTextActive,
            ]}
          >
            Unit Budidaya IoT ({units.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeSegment === 'kegiatan' ? (
        <View>
          <View style={styles.infoBanner}>
            <Ionicons name="megaphone-outline" size={18} color={colors.primary} />
            <Text style={styles.infoBannerText}>
              Kegiatan yang dipublikasikan terbuka untuk partisipasi seluruh warga RW 05. Hubungi pengurus RT bila ingin menjadi relawan.
            </Text>
          </View>

          {activities.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-outline" size={44} color={colors.textLight} />
              <Text style={styles.emptyText}>Belum ada agenda kegiatan baru.</Text>
            </View>
          ) : (
            activities.map((act) => (
              <ActivityCard key={act.id} activity={act} isPengurus={false} />
            ))
          )}
        </View>
      ) : (
        <View>
          <View style={[styles.infoBanner, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
            <Ionicons name="leaf" size={18} color={colors.primary} />
            <Text style={[styles.infoBannerText, { color: colors.primaryDark }]}>
              Program ketahanan pangan Karang Taruna memanfaatkan sensor IoT cerdas untuk memelihara bibit lele bioflok, sayur hidroponik bebas pestisida, dan daur ulang sampah organik warga.
            </Text>
          </View>

          {units.map((unit) => (
            <UnitCard key={unit.id} unit={unit} showTechnicalSensors={false} />
          ))}
        </View>
      )}
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
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  switchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  switchBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  switchBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  switchBtnTextActive: {
    fontWeight: '800',
    color: colors.text,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 14,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
