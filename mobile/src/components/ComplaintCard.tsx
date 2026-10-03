import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { CitizenComplaint } from '../types';

interface ComplaintCardProps {
  complaint: CitizenComplaint;
  isStaff?: boolean;
  onUpdateStatus?: (id: number, status: 'baru' | 'diproses' | 'selesai', note?: string) => void;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  isStaff = false,
  onUpdateStatus,
}) => {
  const [showActionBox, setShowActionBox] = useState(false);
  const [handlerNote, setHandlerNote] = useState('');

  const getStatusMeta = () => {
    switch (complaint.status) {
      case 'baru':
        return { label: 'Laporan Baru', bg: colors.dangerLight, color: colors.danger };
      case 'diproses':
        return { label: 'Sedang Ditangani', bg: colors.warningLight, color: colors.warning };
      case 'selesai':
        return { label: 'Selesai', bg: colors.successLight, color: colors.success };
      default:
        return { label: complaint.status, bg: colors.surfaceSubtle, color: colors.textMuted };
    }
  };

  const getCategoryMeta = () => {
    switch (complaint.category) {
      case 'keamanan':
        return { icon: 'shield-checkmark' as const, label: 'Keamanan' };
      case 'infrastruktur':
        return { icon: 'construct' as const, label: 'Infrastruktur' };
      case 'lingkungan':
        return { icon: 'leaf' as const, label: 'Lingkungan' };
      case 'sosial':
        return { icon: 'people' as const, label: 'Sosial' };
      default:
        return { icon: 'alert-circle' as const, label: 'Umum' };
    }
  };

  const statusMeta = getStatusMeta();
  const catMeta = getCategoryMeta();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.catRow}>
          <Ionicons name={catMeta.icon} size={16} color={colors.primary} />
          <Text style={styles.catText}>{catMeta.label}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
          <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
        </View>
      </View>

      <Text style={styles.description}>{complaint.description}</Text>

      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={13} color={colors.textLight} />
        <Text style={styles.locationText}>{complaint.location}</Text>
      </View>

      {complaint.reporter?.name && isStaff && (
        <Text style={styles.reporterText}>Pelapor: {complaint.reporter.name}</Text>
      )}

      {/* Handler note box */}
      {complaint.handler_note ? (
        <View style={styles.noteBox}>
          <View style={styles.noteHeader}>
            <Ionicons name="chatbubble-ellipses-outline" size={13} color={colors.secondary} />
            <Text style={styles.noteTitle}>Tindak Lanjut Petugas / RT:</Text>
          </View>
          <Text style={styles.noteContent}>{complaint.handler_note}</Text>
        </View>
      ) : null}

      {/* Staff Actions (Pengurus / Pak RT) */}
      {isStaff && onUpdateStatus && (
        <View style={styles.staffActionSection}>
          <TouchableOpacity
            style={styles.toggleActionBtn}
            onPress={() => setShowActionBox(!showActionBox)}
          >
            <Ionicons name="hammer-outline" size={14} color={colors.primary} />
            <Text style={styles.toggleActionText}>
              {showActionBox ? 'Tutup Aksi Penanganan' : 'Tindak Lanjut / Ubah Status'}
            </Text>
          </TouchableOpacity>

          {showActionBox && (
            <View style={styles.actionForm}>
              <TextInput
                style={styles.input}
                placeholder="Catatan tindak lanjut untuk warga..."
                placeholderTextColor={colors.textLight}
                value={handlerNote}
                onChangeText={setHandlerNote}
                multiline
              />
              <View style={styles.btnRow}>
                {complaint.status !== 'diproses' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.warning }]}
                    onPress={() => {
                      onUpdateStatus(complaint.id, 'diproses', handlerNote);
                      setShowActionBox(false);
                    }}
                  >
                    <Text style={styles.actionBtnText}>Set Diproses</Text>
                  </TouchableOpacity>
                )}
                {complaint.status !== 'selesai' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.success }]}
                    onPress={() => {
                      onUpdateStatus(complaint.id, 'selesai', handlerNote);
                      setShowActionBox(false);
                    }}
                  >
                    <Text style={styles.actionBtnText}>Set Selesai</Text>
                  </TouchableOpacity>
                )}
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
    alignItems: 'center',
    marginBottom: 8,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
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
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  reporterText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
    fontStyle: 'italic',
  },
  noteBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  noteTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
  },
  noteContent: {
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
    color: colors.primary,
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
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
