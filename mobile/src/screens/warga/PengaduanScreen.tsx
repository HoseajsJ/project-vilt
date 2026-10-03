import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ComplaintCard } from '../../components/ComplaintCard';
import { api } from '../../services/api';
import { colors } from '../../theme/colors';
import { CitizenComplaint } from '../../types';

export const PengaduanScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [category, setCategory] = useState<'keamanan' | 'lingkungan' | 'infrastruktur' | 'sosial'>('lingkungan');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [myComplaints, setMyComplaints] = useState<CitizenComplaint[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await api.getMyComplaints();
      setMyComplaints(data);
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

  const handleSubmit = async () => {
    if (!description.trim() || !location.trim()) {
      Alert.alert('Perhatian', 'Mohon lengkapi lokasi dan isi pengaduan.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.submitComplaint({
        category,
        location: location.trim(),
        description: description.trim(),
      });
      setMyComplaints([created, ...myComplaints]);
      setLocation('');
      setDescription('');
      setActiveTab('history');
      Alert.alert(
        'Laporan Terkirim',
        'Pengaduan Anda telah tercatat dan dinotifikasikan ke Pengurus RT & tim lingkungan untuk ditindaklanjuti.'
      );
    } catch {
      Alert.alert('Gagal', 'Terjadi kendala saat mengirim pengaduan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat pusat pengaduan warga...</Text>
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
        <Text style={styles.pageTitle}>Layanan Pengaduan Warga</Text>
        <Text style={styles.pageSubtitle}>
          Sampaikan keluhan fasilitas publik, keamanan lingkungan, tumpukan sampah, atau masalah sosial di RW 05.
        </Text>
      </View>

      {/* Switcher Tab */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.switchBtn, activeTab === 'create' && styles.switchBtnActive]}
          onPress={() => setActiveTab('create')}
        >
          <Ionicons
            name="megaphone-outline"
            size={16}
            color={activeTab === 'create' ? colors.danger : colors.textMuted}
          />
          <Text
            style={[
              styles.switchBtnText,
              activeTab === 'create' && styles.switchBtnTextActive,
            ]}
          >
            Lapor Masalah
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchBtn, activeTab === 'history' && styles.switchBtnActive]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={activeTab === 'history' ? colors.danger : colors.textMuted}
          />
          <Text
            style={[
              styles.switchBtnText,
              activeTab === 'history' && styles.switchBtnTextActive,
            ]}
          >
            Riwayat Laporan ({myComplaints.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'create' ? (
        <View style={styles.formCard}>
          <Text style={styles.sectionHeading}>Pilih Kategori Pengaduan:</Text>
          <View style={styles.catGrid}>
            {[
              { key: 'lingkungan', label: 'Lingkungan & Sampah', icon: 'leaf' as const },
              { key: 'infrastruktur', label: 'Lampu & Saluran Air', icon: 'construct' as const },
              { key: 'keamanan', label: 'Keamanan / Ronda', icon: 'shield-checkmark' as const },
              { key: 'sosial', label: 'Sosial & Ketertiban', icon: 'people' as const },
            ].map((c) => (
              <TouchableOpacity
                key={c.key}
                style={[
                  styles.catChip,
                  category === c.key && styles.catChipActive,
                ]}
                onPress={() => setCategory(c.key as any)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={c.icon}
                  size={16}
                  color={category === c.key ? '#FFF' : colors.textMuted}
                />
                <Text
                  style={[
                    styles.catChipText,
                    category === c.key && styles.catChipTextActive,
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionHeading, { marginTop: 14 }]}>
            Lokasi Kejadian / Titik Masalah *
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Depan Pos Ronda RT 03 / Jembatan Blok B..."
            placeholderTextColor={colors.textLight}
            value={location}
            onChangeText={setLocation}
          />

          <Text style={[styles.sectionHeading, { marginTop: 14 }]}>
            Deskripsi Pengaduan *
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Jelaskan kendala secara singkat dan jelas..."
            placeholderTextColor={colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color={colors.catMaggot} />
            <Text style={styles.infoBoxText}>
              Laporan Anda akan langsung masuk ke ponsel Pengurus RT. Anda dapat memantau status 'Diproses' dan 'Selesai' beserta catatan tindak lanjut petugas di tab riwayat.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Kirim Pengaduan Warga</Text>
                <Ionicons name="send" size={16} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {myComplaints.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>Belum Ada Pengaduan</Text>
              <Text style={styles.emptySub}>
                Laporan masalah lingkungan atau keamanan yang Anda kirim akan dipantau penyelesaiannya di sini.
              </Text>
            </View>
          ) : (
            myComplaints.map((c) => (
              <ComplaintCard key={c.id} complaint={c} isStaff={false} />
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
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  catChipTextActive: {
    color: '#FFF',
    fontWeight: '800',
  },
  input: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 13,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
    marginBottom: 14,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 18,
  },
});
