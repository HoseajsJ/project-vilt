import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { LetterRequest } from '../types';

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
  const [adminNote, setAdminNote] = useState('');

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
  );
};

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
});
