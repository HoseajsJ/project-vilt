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
import { LetterCard } from '../../components/LetterCard';
import { api } from '../../services/api';
import { colors } from '../../theme/colors';
import { LetterRequest, LetterType } from '../../types';

export const LayananSuratScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [types, setTypes] = useState<LetterType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [myLetters, setMyLetters] = useState<LetterRequest[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [tList, reqList] = await Promise.all([
        api.getLetterTypes(),
        api.getMyLetterRequests(),
      ]);
      setTypes(tList);
      if (tList.length > 0 && selectedTypeId === null) {
        setSelectedTypeId(tList[0].id);
      }
      setMyLetters(reqList);
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
    if (!selectedTypeId) {
      Alert.alert('Perhatian', 'Silakan pilih jenis surat pengantar.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitLetterRequest(selectedTypeId, notes.trim());
      setMyLetters([res, ...myLetters]);
      setNotes('');
      setActiveTab('history');
      Alert.alert(
        'Berhasil Diajukan',
        'Permohonan surat pengantar Anda telah diteruskan ke Pengurus RT untuk diverifikasi.'
      );
    } catch {
      Alert.alert('Gagal', 'Terjadi kendala saat mengajukan permohonan surat.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat layanan administrasi surat...</Text>
      </View>
    );
  }

  const selectedType = types.find((t) => t.id === selectedTypeId);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Layanan Surat Pengantar RT/RW</Text>
        <Text style={styles.pageSubtitle}>
          Ajukan permohonan surat secara online tanpa antre. Pantau proses review & tanda tangan langsung dari ponsel.
        </Text>
      </View>

      {/* Switcher Tab */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.switchBtn, activeTab === 'create' && styles.switchBtnActive]}
          onPress={() => setActiveTab('create')}
        >
          <Ionicons
            name="create-outline"
            size={16}
            color={activeTab === 'create' ? colors.accent : colors.textMuted}
          />
          <Text
            style={[
              styles.switchBtnText,
              activeTab === 'create' && styles.switchBtnTextActive,
            ]}
          >
            Ajukan Surat Baru
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchBtn, activeTab === 'history' && styles.switchBtnActive]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={activeTab === 'history' ? colors.accent : colors.textMuted}
          />
          <Text
            style={[
              styles.switchBtnText,
              activeTab === 'history' && styles.switchBtnTextActive,
            ]}
          >
            Riwayat Surat ({myLetters.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'create' ? (
        <View style={styles.formCard}>
          <Text style={styles.sectionHeading}>Pilih Jenis Surat Pengantar:</Text>
          <View style={styles.typesGrid}>
            {types.map((type) => {
              const isSelected = selectedTypeId === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.typeTile, isSelected && styles.typeTileActive]}
                  onPress={() => setSelectedTypeId(type.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.typeRadio,
                      isSelected && { borderColor: colors.accent, backgroundColor: colors.accent },
                    ]}
                  >
                    {isSelected && <Ionicons name="checkmark" size={12} color="#FFF" />}
                  </View>
                  <View style={styles.typeTextWrap}>
                    <Text style={[styles.typeName, isSelected && styles.typeNameActive]}>
                      {type.name}
                    </Text>
                    {type.description ? (
                      <Text style={styles.typeDesc}>{type.description}</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionHeading, { marginTop: 14 }]}>
            Keperluan Permohonan (Opsional):
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Contoh: Untuk persyaratan pendaftaran sekolah / perubahan data e-KTP..."
            placeholderTextColor={colors.textLight}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />

          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent} />
            <Text style={styles.infoBoxText}>
              Setelah disetujui, Anda akan menerima pemberitahuan saat surat pengantar fisik telah ditandatangani dan siap diambil di rumah Pak RT.
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
                <Text style={styles.submitBtnText}>Kirim Permohonan Surat</Text>
                <Ionicons name="paper-plane-outline" size={16} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {myLetters.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="document-text-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>Belum Ada Surat Diajukan</Text>
              <Text style={styles.emptySub}>
                Permohonan surat pengantar Anda ke RT/RW akan tercatat dan dapat dipantau di sini.
              </Text>
            </View>
          ) : (
            myLetters.map((letter) => (
              <LetterCard key={letter.id} letter={letter} isStaff={false} />
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
  typesGrid: {
    gap: 8,
  },
  typeTile: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeTileActive: {
    backgroundColor: colors.accentLight,
    borderColor: colors.accent,
  },
  typeRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  typeTextWrap: {
    flex: 1,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  typeNameActive: {
    color: colors.accent,
  },
  typeDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
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
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
    marginBottom: 14,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 16,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
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
