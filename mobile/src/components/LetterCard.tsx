import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { LetterRequest } from '../types';
import { api } from '../services/api';

interface LetterCardProps {
  letter: LetterRequest;
  isStaff?: boolean;
  onUpdateStatus?: (
    id: number,
    status: 'menunggu_review' | 'diproses' | 'siap_diambil' | 'ditolak',
    admin_note?: string
  ) => void;
}

export const LetterCard: React.FC<LetterCardProps> = ({
  letter,
  isStaff = false,
  onUpdateStatus,
}) => {
  const [showActionBox, setShowActionBox] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  const resolveAttachmentUrl = (url?: string) => {
    if (!url) return null;
    const base = api.getBaseUrl().replace(/\/api\/?$/, '');
    if (url.startsWith('/')) return `${base}${url}`;
    if (/^https?:\/\//i.test(url)) {
      return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.1\.6)(:\d+)?/i, base);
    }
    return `${base}/${url.replace(/^\//, '')}`;
  };

  const attachmentUrl = resolveAttachmentUrl(letter.attachment_url);
  const attachmentIsImage = !!attachmentUrl && /\.(jpe?g|png|webp)(\?.*)?$/i.test(attachmentUrl);

  const getStatusMeta = () => {
    switch (letter.status) {
      case 'menunggu_review':
        return { label: 'Menunggu Review', bg: colors.warningLight, color: colors.warning };
      case 'diproses':
        return { label: 'Sedang Diproses RT', bg: colors.infoLight, color: colors.accent };
      case 'siap_diambil':
        return { label: 'Siap Diambil di RT', bg: colors.successLight, color: colors.success };
      case 'ditolak':
        return { label: 'Permohonan Ditolak', bg: colors.dangerLight, color: colors.danger };
      default:
        return { label: letter.status, bg: colors.surfaceSubtle, color: colors.textMuted };
    }
  };

  const statusMeta = getStatusMeta();

  return (
    <>
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconTitleRow}>
          <View style={styles.docIcon}>
            <Ionicons name="document-text" size={18} color={colors.accent} />
          </View>
          <View style={styles.headerTitles}>
            <Text style={styles.letterName}>
              {letter.letter_type?.name || 'Surat Pengantar RT/RW'}
            </Text>
            {letter.user?.name && isStaff && (
              <Text style={styles.userName}>Pemohon: {letter.user.name}</Text>
            )}
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
          <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
        </View>
      </View>

      {letter.notes ? (
        <View style={styles.notesBox}>
          <Text style={styles.notesLabel}>Keperluan:</Text>
          <Text style={styles.notesText}>{letter.notes}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.detailButton} onPress={() => setShowDetails(true)}>
        <Ionicons name="eye-outline" size={16} color={colors.accent} />
        <Text style={styles.detailButtonText}>Lihat Detail</Text>
      </TouchableOpacity>

      {/* Admin Note / Pengambilan */}
      {letter.admin_note ? (
        <View
          style={[
            styles.adminNoteBox,
            letter.status === 'siap_diambil' && styles.readyNoteBox,
          ]}
        >
          <View style={styles.adminNoteHeader}>
            <Ionicons
              name={
                letter.status === 'siap_diambil'
                  ? 'checkmark-done-circle'
                  : 'information-circle-outline'
              }
              size={15}
              color={letter.status === 'siap_diambil' ? colors.success : colors.accent}
            />
            <Text
              style={[
                styles.adminNoteTitle,
                letter.status === 'siap_diambil' && { color: colors.success },
              ]}
            >
              {letter.status === 'siap_diambil'
                ? 'Informasi Pengambilan Surat Fisik:'
                : 'Catatan Pengurus RT:'}
            </Text>
          </View>
          <Text style={styles.adminNoteContent}>{letter.admin_note}</Text>
        </View>
      ) : null}

      {/* Staff Actions (Pak RT) */}
      {isStaff && onUpdateStatus && (
        <View style={styles.staffActionSection}>
          <TouchableOpacity
            style={styles.toggleActionBtn}
            onPress={() => setShowActionBox(!showActionBox)}
          >
            <Ionicons name="create-outline" size={14} color={colors.accent} />
            <Text style={styles.toggleActionText}>
              {showActionBox ? 'Tutup Pemrosesan' : 'Proses Permohonan Surat'}
            </Text>
          </TouchableOpacity>

          {showActionBox && (
            <View style={styles.actionForm}>
              <TextInput
                style={styles.input}
                placeholder="Catatan untuk warga (misal: jam pengambilan)..."
                placeholderTextColor={colors.textLight}
                value={adminNote}
                onChangeText={setAdminNote}
                multiline
              />
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.accent }]}
                  onPress={() => {
                    onUpdateStatus(letter.id, 'diproses', adminNote);
                    setShowActionBox(false);
                  }}
                >
                  <Text style={styles.actionBtnText}>Set Diproses</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.success }]}
                  onPress={() => {
                    onUpdateStatus(
                      letter.id,
                      'siap_diambil',
                      adminNote || 'Surat sudah ditandatangani. Silakan ambil di rumah Pak RT.'
                    );
                    setShowActionBox(false);
                  }}
                >
                  <Text style={styles.actionBtnText}>Siap Diambil</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.danger }]}
                  onPress={() => {
                    onUpdateStatus(letter.id, 'ditolak', adminNote || 'Dokumen belum lengkap');
                    setShowActionBox(false);
                  }}
                >
                  <Text style={styles.actionBtnText}>Tolak</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
    <Modal visible={showDetails} animationType="slide" transparent onRequestClose={() => setShowDetails(false)}>
      <View style={styles.detailOverlay}>
        <View style={styles.detailModal}>
          <View style={styles.detailHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailTitle}>Detail Permohonan Surat</Text>
              <Text style={styles.detailSubtitle}>{letter.letter_type?.name || 'Surat Pengantar RT/RW'}</Text>
            </View>
            <TouchableOpacity onPress={() => setShowDetails(false)} accessibilityLabel="Tutup detail">
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.detailContent}>
            <DetailRow label="Pemohon" value={letter.user?.name || `ID warga ${letter.user_id}`} />
            <DetailRow label="Status" value={statusMeta.label} />
            <DetailRow label="Tanggal pengajuan" value={new Date(letter.created_at).toLocaleString('id-ID')} />
            <DetailRow label="Keperluan" value={letter.notes || 'Tidak ada keterangan'} />
            <DetailRow label="Catatan pengurus" value={letter.admin_note || 'Belum ada catatan'} />
            {attachmentUrl ? (
              <View style={styles.attachmentSection}>
                <Text style={styles.detailLabel}>Lampiran</Text>
                {attachmentIsImage ? <Image source={{ uri: attachmentUrl }} style={styles.detailImage} resizeMode="contain" /> : null}
                <TouchableOpacity
                  style={styles.attachmentButton}
                  onPress={() => Linking.openURL(attachmentUrl).catch(() => Alert.alert('Lampiran tidak dapat dibuka', 'Periksa alamat file dan koneksi server.'))}
                >
                  <Ionicons name="open-outline" size={16} color={colors.accent} />
                  <Text style={styles.attachmentButtonText}>{attachmentIsImage ? 'Buka lampiran' : 'Buka / unduh lampiran'}</Text>
                </TouchableOpacity>
              </View>
            ) : <DetailRow label="Lampiran" value="Tidak ada lampiran" />}
          </ScrollView>
        </View>
      </View>
    </Modal>
    </>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  docIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitles: {
    flex: 1,
  },
  letterName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  userName: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  notesBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 2,
  },
  notesText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  adminNoteBox: {
    backgroundColor: colors.infoLight,
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  readyNoteBox: {
    backgroundColor: colors.successLight,
    borderLeftColor: colors.success,
  },
  adminNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  adminNoteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  adminNoteContent: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 17,
  },
  staffActionSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
  },
  toggleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  toggleActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  actionForm: {
    marginTop: 10,
  },
  input: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    color: colors.text,
    minHeight: 50,
    marginBottom: 8,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  detailButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: colors.accent, borderRadius: 8, paddingVertical: 9, marginTop: 4 },
  detailButtonText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  detailOverlay: { flex: 1, justifyContent: 'center', padding: 18, backgroundColor: 'rgba(15,23,42,0.55)' },
  detailModal: { maxHeight: '85%', backgroundColor: colors.surface, borderRadius: 16, padding: 16 },
  detailHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  detailTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  detailSubtitle: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  detailContent: { paddingTop: 10, paddingBottom: 12 },
  detailRow: { marginBottom: 12 },
  detailLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 3 },
  detailValue: { color: colors.text, fontSize: 13, lineHeight: 19 },
  attachmentSection: { marginTop: 2 },
  detailImage: { width: '100%', height: 250, marginTop: 8, borderRadius: 10, backgroundColor: colors.surfaceSubtle },
  attachmentButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 },
  attachmentButtonText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
});
