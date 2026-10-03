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
import { LetterCard } from '../../components/LetterCard';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { colors } from '../../theme/colors';
import { Activity, LetterRequest } from '../../types';

interface BerandaScreenProps {
  onNavigateTab: (tabKey: string) => void;
}

export const BerandaScreen: React.FC<BerandaScreenProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [letters, setLetters] = useState<LetterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [actData, letData] = await Promise.all([
        api.getPublicActivities(),
        api.getMyLetterRequests(),
      ]);
      setActivities(actData);
      setLetters(letData);
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

  const activeLetter = letters.find((l) => l.status === 'siap_diambil' || l.status === 'diproses' || l.status === 'menunggu_review');

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Menyiapkan portal warga...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Welcome Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerInfo}>
          <Text style={styles.greeting}>Halo, {user?.name || 'Warga RW 05'}! 👋</Text>
          <Text style={styles.subGreeting}>
            Layanan administrasi surat RT/RW & pengaduan lingkungan terpadu.
          </Text>
        </View>
        <View style={styles.bannerIconWrap}>
          <Ionicons name="home" size={26} color={colors.primary} />
        </View>
      </View>

      {/* Active Letter Alert Widget if ready */}
      {activeLetter?.status === 'siap_diambil' && (
        <TouchableOpacity
          style={styles.readyAlertBox}
          onPress={() => onNavigateTab('surat')}
          activeOpacity={0.8}
        >
          <View style={styles.readyAlertIcon}>
            <Ionicons name="checkmark-done" size={22} color="#FFF" />
          </View>
          <View style={styles.readyAlertText}>
            <Text style={styles.readyAlertTitle}>Surat Fisik Siap Diambil!</Text>
            <Text style={styles.readyAlertSub}>
              {activeLetter.letter_type?.name} Anda sudah selesai ditandatangani Pak RT. Klik untuk info detail.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.success} />
        </TouchableOpacity>
      )}

      {/* Quick Services Grid */}
      <Text style={styles.sectionTitle}>Layanan Terpadu Warga</Text>
      <View style={styles.serviceGrid}>
        <TouchableOpacity
          style={styles.serviceTile}
          onPress={() => onNavigateTab('surat')}
          activeOpacity={0.7}
        >
          <View style={[styles.serviceIconWrap, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="document-text" size={24} color={colors.accent} />
          </View>
          <Text style={styles.serviceTitle}>Layanan Surat</Text>
          <Text style={styles.serviceDesc}>Pengantar KTP, KK, Domisili, SKU</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.serviceTile}
          onPress={() => onNavigateTab('pengaduan')}
          activeOpacity={0.7}
        >
          <View style={[styles.serviceIconWrap, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="megaphone" size={24} color={colors.danger} />
          </View>
          <Text style={styles.serviceTitle}>Pengaduan Warga</Text>
          <Text style={styles.serviceDesc}>Keamanan, Jalan, Kebersihan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.serviceTile}
          onPress={() => onNavigateTab('budidaya')}
          activeOpacity={0.7}
        >
          <View style={[styles.serviceIconWrap, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="leaf" size={24} color={colors.primary} />
          </View>
          <Text style={styles.serviceTitle}>IoT Budidaya</Text>
          <Text style={styles.serviceDesc}>Hasil Lele, Hidroponik, Maggot</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.serviceTile}
          onPress={() => onNavigateTab('budidaya')}
          activeOpacity={0.7}
        >
          <View style={[styles.serviceIconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="calendar" size={24} color={colors.catMaggot} />
          </View>
          <Text style={styles.serviceTitle}>Agenda Warga</Text>
          <Text style={styles.serviceDesc}>Kerja Bakti, Sosialisasi RW</Text>
        </TouchableOpacity>
      </View>

      {/* My Recent Letter Status */}
      {activeLetter && (
        <View style={styles.recentSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Permohonan Surat Aktif</Text>
            <TouchableOpacity onPress={() => onNavigateTab('surat')}>
              <Text style={styles.linkText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          <LetterCard letter={activeLetter} isStaff={false} />
        </View>
      )}

      {/* Village Activities Feed */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Agenda Kegiatan Lingkungan ({activities.length})</Text>
          <TouchableOpacity onPress={() => onNavigateTab('budidaya')}>
            <Text style={styles.linkText}>Semua Info</Text>
          </TouchableOpacity>
        </View>

        {activities.slice(0, 3).map((act) => (
          <ActivityCard key={act.id} activity={act} isPengurus={false} />
        ))}
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
    marginBottom: 14,
  },
  bannerInfo: {
    flex: 1,
    marginRight: 10,
  },
  greeting: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  subGreeting: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 17,
  },
  bannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 10,
  },
  readyAlertIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyAlertText: {
    flex: 1,
  },
  readyAlertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  readyAlertSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  serviceTile: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  serviceIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  serviceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
  },
  serviceDesc: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
  },
  recentSection: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
