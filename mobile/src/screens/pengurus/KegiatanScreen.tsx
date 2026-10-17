import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  ActivityIndicator,
  Alert,
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
import { Activity, AttendanceMember } from '../../types';
import { useAuth } from '../../context/AuthContext';

const isValidCalendarDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day;
};

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const KegiatanScreen: React.FC = () => {
  const { role, user } = useAuth();
  const isKarta = role === 'pengurus_karta' || role === 'ketua_karta';
  const canManageMeetings = role === 'ketua_karta';
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New activity form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'budidaya' | 'lingkungan' | 'sosial' | 'rapat'>('lingkungan');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [meetingDate, setMeetingDate] = useState(formatLocalDate(new Date(Date.now() + 86400000 * 3)));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [meetingTime, setMeetingTime] = useState('19:00');
  const [selectedMeeting, setSelectedMeeting] = useState<Activity | null>(null);
  const [attendanceMembers, setAttendanceMembers] = useState<AttendanceMember[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [saving, setSaving] = useState(false);

  const validMeetingDate = isValidCalendarDate(meetingDate);
  const validMeetingTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(meetingTime);

  const loadData = async () => {
    try {
      const data = await api.getActivities();
      setActivities(data.filter((item) => isKarta || item.category !== 'rapat'));
    } catch {
      // handled
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isKarta]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handlePublish = async (id: number) => {
    try {
      await api.publishActivity(id);
      setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'published' } : a)));
      Alert.alert('Berhasil', 'Kegiatan dipublikasikan dan notifikasi dikirim kepada penerima.');
    } catch (error) {
      Alert.alert('Gagal memublikasikan', error instanceof Error ? error.message : 'Periksa koneksi API.');
    }
  };

  const openAttendance = async (meeting: Activity) => {
    setSelectedMeeting(meeting);
    setAttendanceLoading(true);
    try {
      setAttendanceMembers(await api.getKartaMeetingAttendance(meeting.id));
    } catch {
      Alert.alert('Gagal memuat absensi', 'Periksa koneksi dan coba lagi.');
      setSelectedMeeting(null);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const saveAttendance = async (status: AttendanceMember['status']) => {
    if (!selectedMeeting || !status || role !== 'pengurus_karta') return;
    setSavingAttendance(true);
    try {
      await api.updateKartaAttendance(selectedMeeting.id, status);
      setAttendanceMembers((prev) => prev.map((member) => member.id === user?.id ? { ...member, status } : member));
    } catch {
      Alert.alert('Gagal menyimpan', 'Status absensi belum tersimpan. Coba lagi.');
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleCreateActivity = async () => {
    if (!title.trim()) return;
    if (!validMeetingDate || (category === 'rapat' && !validMeetingTime)) return;
    setSaving(true);
    try {
      const created = await api.createActivity({
        title: title.trim(),
        category,
        location: location.trim() || 'Balai RW 05',
        description: description.trim(),
        activity_date: new Date(`${meetingDate}T${category === 'rapat' ? meetingTime : '09:00'}:00`).toISOString(),
        status: 'draft',
      });
      setActivities([created, ...activities]);
      setShowAddModal(false);
      setTitle('');
      setLocation('');
      setDescription('');
      setMeetingDate(formatLocalDate(new Date(Date.now() + 86400000 * 3)));
      setMeetingTime('19:00');
    } catch (error) {
      Alert.alert(
        'Gagal menyimpan kegiatan',
        error instanceof Error ? error.message : 'Periksa koneksi API lalu coba lagi.',
      );
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
          <Text style={styles.pageTitle}>{isKarta ? 'Agenda Karang Taruna' : 'Kegiatan RW'}</Text>
          <Text style={styles.pageSubtitle}>
            {canManageMeetings ? 'Buat agenda dan jadwal rapat Karta.' : isKarta ? 'Lihat jadwal rapat dan isi absensi sebagai anggota Karta.' : 'Kelola agenda kegiatan lingkungan dan warga RW.'}
          </Text>
        </View>

        {/* Create Activity Banner Button */}
        {(!isKarta || canManageMeetings) && <TouchableOpacity style={styles.createBanner} onPress={() => setShowAddModal(true)}>
          <View style={styles.createBannerIcon}>
            <Ionicons name="add" size={24} color="#FFF" />
          </View>
          <View style={styles.createBannerText}>
            <Text style={styles.createBannerTitle}>Buat Kegiatan Baru</Text>
            <Text style={styles.createBannerSub}>
              {isKarta ? 'Buat kegiatan atau jadwalkan rapat internal Karta' : 'Publikasikan informasi kegiatan untuk warga RW'}
            </Text>
          </View>
        </TouchableOpacity>}

        {/* List */}
        <Text style={styles.listHeading}>Semua Agenda ({activities.length})</Text>
        {activities.map((item, index) => (
          <ActivityCard
            key={`${item.id}-${item.activity_date}-${index}`}
            activity={item}
            isPengurus={item.category === 'rapat' ? canManageMeetings : true}
            onPublish={handlePublish}
            onManageAttendance={isKarta && item.category === 'rapat' ? openAttendance : undefined}
          />
        ))}
      </ScrollView>

      {/* Modal Add Activity */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
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
                  ...(canManageMeetings ? [{ key: 'rapat', label: 'Rapat Karta' }] : []),
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

              <Text style={styles.label}>{category === 'rapat' ? 'Tanggal rapat *' : 'Tanggal kegiatan *'}</Text>
              <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text style={styles.datePickerText}>{meetingDate}</Text>
                <Text style={styles.datePickerHint}>Pilih tanggal</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={isValidCalendarDate(meetingDate) ? new Date(`${meetingDate}T12:00:00`) : new Date()}
                  mode="date"
                  display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
                  minimumDate={new Date()}
                  onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
                    setShowDatePicker(false);
                    if (selectedDate) setMeetingDate(formatLocalDate(selectedDate));
                  }}
                />
              )}

              {category === 'rapat' && (
                <>
                  <Text style={styles.label}>Waktu rapat (24 jam) *</Text>
                  <TextInput style={styles.input} placeholder="19:00" value={meetingTime} onChangeText={setMeetingTime} />
                  <Text style={styles.meetingHint}>Jadwal ini hanya terlihat oleh pengurus Karta.</Text>
                </>
              )}

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
                style={[styles.submitBtn, (saving || !title.trim() || !validMeetingDate || (category === 'rapat' && !validMeetingTime)) && styles.submitBtnDisabled]}
                onPress={handleCreateActivity}
                disabled={saving || !title.trim() || !validMeetingDate || (category === 'rapat' && !validMeetingTime)}
              >
                {saving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>{category === 'rapat' ? 'Simpan Jadwal Rapat' : 'Simpan sebagai Draft'}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedMeeting} animationType="slide" transparent onRequestClose={() => setSelectedMeeting(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.modalTitle}>Absensi Rapat</Text>
                <Text style={styles.meetingModalSubtitle} numberOfLines={2}>{selectedMeeting?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedMeeting(null)}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {attendanceLoading ? <ActivityIndicator color={colors.primary} /> : (
              <ScrollView contentContainerStyle={styles.modalForm}>
                {attendanceMembers.length === 0 ? <Text style={styles.meetingHint}>Belum ada anggota Karta aktif untuk dicatat.</Text> : null}
                {attendanceMembers.map((member) => (
                  <View key={member.id} style={styles.memberAttendanceCard}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    {member.id === user?.id && role === 'pengurus_karta' ? (
                      <View style={styles.attendanceOptions}>
                        {([
                          ['hadir', 'Hadir'],
                          ['izin', 'Izin'],
                          ['tidak_hadir', 'Absen'],
                        ] as const).map(([status, label]) => (
                          <TouchableOpacity
                            key={status}
                            disabled={savingAttendance}
                            style={[styles.attendanceOption, member.status === status && styles.attendanceOptionActive]}
                            onPress={() => saveAttendance(status)}
                          >
                            <Text style={[styles.attendanceOptionText, member.status === status && styles.attendanceOptionTextActive]}>{label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : <Text style={styles.currentAttendance}>Status: {member.status || 'belum mengisi'}</Text>}
                  </View>
                ))}
                <Text style={styles.meetingHint}>Absensi diisi oleh masing-masing anggota Karta. Riwayat kehadiran akan digunakan di fitur analisis terpisah.</Text>
              </ScrollView>
            )}
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
  meetingModalSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  memberAttendanceCard: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, marginBottom: 10, backgroundColor: colors.surface },
  memberName: { color: colors.text, fontSize: 14, fontWeight: '800' },
  currentAttendance: { color: colors.textMuted, fontSize: 12, marginTop: 8 },
  attendanceOptions: { flexDirection: 'row', gap: 6, marginTop: 10 },
  attendanceOption: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8, backgroundColor: colors.surfaceSubtle },
  attendanceOptionActive: { backgroundColor: colors.primary },
  attendanceOptionText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  attendanceOptionTextActive: { color: '#FFF' },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  meetingHint: { color: colors.textMuted, fontSize: 12, marginTop: 6, marginBottom: 12 },
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
  datePickerButton: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surfaceSubtle, borderRadius: 8, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 12 },
  datePickerText: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '700' },
  datePickerHint: { color: colors.primary, fontSize: 12, fontWeight: '700' },
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
