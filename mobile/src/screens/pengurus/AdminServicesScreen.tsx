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
import { ComplaintCard } from '../../components/ComplaintCard';
import { LetterCard } from '../../components/LetterCard';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { colors } from '../../theme/colors';
import { CitizenComplaint, LetterRequest } from '../../types';

export const AdminServicesScreen: React.FC = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'letters' | 'complaints'>('letters');
  const [letters, setLetters] = useState<LetterRequest[]>([]);
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [l, c] = await Promise.all([
        api.getAllLetterRequests(),
        api.getAllComplaints(),
      ]);
      setLetters(l);
      setComplaints(c);
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

  const handleUpdateLetterStatus = async (
    id: number,
    status: 'menunggu_review' | 'diproses' | 'siap_diambil' | 'ditolak',
    admin_note?: string
  ) => {
    await api.updateLetterStatus(id, status, admin_note);
    setLetters((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status, admin_note: admin_note || item.admin_note } : item
      )
    );
  };

  const handleUpdateComplaintStatus = async (
    id: number,
    status: 'baru' | 'diproses' | 'selesai',
    handler_note?: string
  ) => {
    await api.updateComplaintStatus(id, status, handler_note);
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status, handler_note: handler_note || c.handler_note } : c
      )
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat permohonan surat & pengaduan...</Text>
      </View>
    );
  }

  const pendingLettersCount = letters.filter((l) => l.status === 'menunggu_review').length;
  const pendingComplaintsCount = complaints.filter((c) => c.status === 'baru').length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Layanan Surat & Pengaduan</Text>
        <Text style={styles.pageSubtitle}>
          Pusat verifikasi surat pengantar RT/RW dan penanganan keluhan lingkungan warga.
        </Text>
      </View>

      {/* Segment Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.switchBtn, activeTab === 'letters' && styles.switchBtnActive]}
          onPress={() => setActiveTab('letters')}
        >
          <Ionicons
            name="document-text"
            size={16}
            color={activeTab === 'letters' ? colors.accent : colors.textMuted}
          />
          <Text style={[styles.switchBtnText, activeTab === 'letters' && styles.switchBtnTextActive]}>
            Permohonan Surat ({pendingLettersCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchBtn, activeTab === 'complaints' && styles.switchBtnActive]}
          onPress={() => setActiveTab('complaints')}
        >
          <Ionicons
            name="shield-checkmark"
            size={16}
            color={activeTab === 'complaints' ? colors.catMaggot : colors.textMuted}
          />
          <Text
            style={[
              styles.switchBtnText,
              activeTab === 'complaints' && styles.switchBtnTextActive,
            ]}
          >
            Pengaduan Warga ({pendingComplaintsCount})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'letters' ? (
        <View>
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={16} color={colors.accent} />
            <Text style={styles.infoBannerText}>
              Pengurus RT dapat meninjau berkas, memproses tanda tangan, dan menetapkan status 'Siap Diambil' saat surat fisik sudah tersedia di rumah RT.
            </Text>
          </View>

          {letters.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="documents-outline" size={40} color={colors.textLight} />
              <Text style={styles.emptyText}>Belum ada permohonan surat masuk.</Text>
            </View>
          ) : (
            letters.map((l) => (
              <LetterCard
                key={l.id}
                letter={l}
                isStaff={true}
                onUpdateStatus={handleUpdateLetterStatus}
              />
            ))
          )}
        </View>
      ) : (
        <View>
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={16} color={colors.catMaggot} />
            <Text style={styles.infoBannerText}>
              Setiap pengaduan warga diteruskan ke pengurus lingkungan. Cantumkan catatan tindak lanjut agar pelapor dapat memantau penanganan secara transparan.
            </Text>
          </View>

          {complaints.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="shield-outline" size={40} color={colors.textLight} />
              <Text style={styles.emptyText}>Belum ada pengaduan warga.</Text>
            </View>
          ) : (
            complaints.map((c) => (
              <ComplaintCard
                key={c.id}
                complaint={c}
                isStaff={true}
                onUpdateStatus={handleUpdateComplaintStatus}
              />
            ))
          )}
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
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
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
