import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityCard } from '../../components/ActivityCard';
import { api } from '../../services/api';
import { colors } from '../../theme/colors';
import { Activity } from '../../types';

export const KegiatanScreen: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New activity form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'budidaya' | 'lingkungan' | 'sosial' | 'rapat'>('lingkungan');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const data = await api.getActivities();
      setActivities(data);
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

  const handlePublish = async (id: number) => {
    await api.publishActivity(id);
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'published' } : a))
    );
  };

  const handleCreateActivity = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const created = await api.createActivity({
        title: title.trim(),
        category,
        location: location.trim() || 'Balai RW 05',
        description: description.trim(),
        activity_date: new Date(Date.now() + 86400000 * 3).toISOString(),
        status: 'draft',
      });
      setActivities([created, ...activities]);
      setShowAddModal(false);
      setTitle('');
      setLocation('');
      setDescription('');
    } catch {
      // handled
    } finally {
      setSaving(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat daftar kegiatan...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Kegiatan Karang Taruna & RW</Text>
          <Text style={styles.pageSubtitle}>
            Kelola agenda kerja bakti, sosialisasi budidaya, rapat koordinasi, dan publikasi ke feed warga.
          </Text>
        </View>

        {/* Create Activity Banner Button */}
        <TouchableOpacity style={styles.createBanner} onPress={() => setShowAddModal(true)}>
          <View style={styles.createBannerIcon}>
            <Ionicons name="add" size={24} color="#FFF" />
          </View>
          <View style={styles.createBannerText}>
            <Text style={styles.createBannerTitle}>Buat Kegiatan Baru</Text>
            <Text style={styles.createBannerSub}>
              Publikasikan info & kirim notifikasi otomatis ke seluruh warga RW
            </Text>
          </View>
        </TouchableOpacity>

        {/* List */}
        <Text style={styles.listHeading}>Semua Agenda ({activities.length})</Text>
        {activities.map((item) => (
          <ActivityCard
            key={item.id}
            activity={item}
            isPengurus={true}
            onPublish={handlePublish}
          />
        ))}
      </ScrollView>

      {/* Modal Add Activity */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Kegiatan Baru</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.label}>Judul Kegiatan *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Kerja Bakti Bersih Selokan RW 05"
                placeholderTextColor={colors.textLight}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>Kategori Kegiatan</Text>
              <View style={styles.catGrid}>
                {[
                  { key: 'lingkungan', label: 'Lingkungan' },
                  { key: 'budidaya', label: 'Budidaya IoT' },
                  { key: 'sosial', label: 'Sosial & Warga' },
                  { key: 'rapat', label: 'Rapat Organisasi' },
                ].map((c) => (
                  <TouchableOpacity
                    key={c.key}
                    style={[
                      styles.catChip,
                      category === c.key && styles.catChipActive,
                    ]}
                    onPress={() => setCategory(c.key as any)}
                  >
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

              <Text style={styles.label}>Lokasi Pelaksanaan</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Balai RW 05 / Rumah Kompos"
                placeholderTextColor={colors.textLight}
                value={location}
                onChangeText={setLocation}
              />

              <Text style={styles.label}>Deskripsi & Keterangan</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tuliskan petunjuk, peralatan yang perlu dibawa, dll..."
                placeholderTextColor={colors.textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
                onPress={handleCreateActivity}
                disabled={saving || !title.trim()}
              >
                {saving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Simpan sebagai Draft</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
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
  createBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  createBannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  createBannerText: {
    flex: 1,
  },
  createBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
  createBannerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    lineHeight: 15,
  },
  listHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  modalForm: {
    paddingBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.text,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  catChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: {
    backgroundColor: colors.primaryUltralight,
    borderColor: colors.primary,
  },
  catChipText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  catChipTextActive: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
