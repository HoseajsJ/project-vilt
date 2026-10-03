import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_BASE_URL } from '../services/api';
import { colors } from '../theme/colors';

interface ConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ visible, onClose }) => {
  const { backendUrl, updateBackendUrl, switchDemoRole, logout, user } = useAuth();
  const [urlInput, setUrlInput] = useState(backendUrl);

  const presets = [
    { label: 'LAN IP (192.168.1.6)', url: 'http://192.168.1.6:8000/api' },
    { label: 'Android Emulator (10.0.2.2)', url: 'http://10.0.2.2:8000/api' },
    { label: 'Localhost Web (127.0.0.1)', url: 'http://127.0.0.1:8000/api' },
  ];

  const handleSave = async () => {
    if (urlInput.trim()) {
      await updateBackendUrl(urlInput.trim());
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="settings" size={20} color={colors.primary} />
              <Text style={styles.headerTitle}>Pengaturan Koneksi API</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Alamat Backend Laravel:</Text>
          <TextInput
            style={styles.input}
            value={urlInput}
            onChangeText={setUrlInput}
            placeholder="http://192.168.1.6:8000/api"
            placeholderTextColor={colors.textLight}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.presetLabel}>Preset Cepat:</Text>
          <View style={styles.presetGrid}>
            {presets.map((p, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.presetChip,
                  urlInput === p.url && styles.presetChipActive,
                ]}
                onPress={() => setUrlInput(p.url)}
              >
                <Text
                  style={[
                    styles.presetText,
                    urlInput === p.url && styles.presetTextActive,
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.roleSwitchSection}>
            <Text style={styles.sectionTitle}>Beralih Akun Cepat (Testing):</Text>
            <View style={styles.roleBtnRow}>
              <TouchableOpacity
                style={[styles.roleBtn, { backgroundColor: colors.catLingkungan }]}
                onPress={() => {
                  switchDemoRole('pengurus_karta');
                  onClose();
                }}
              >
                <Text style={styles.roleBtnText}>Budi (Karta)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleBtn, { backgroundColor: colors.accent }]}
                onPress={() => {
                  switchDemoRole('pengurus_rt');
                  onClose();
                }}
              >
                <Text style={styles.roleBtnText}>Pak RT (RT 03)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleBtn, { backgroundColor: colors.catMaggot }]}
                onPress={() => {
                  switchDemoRole('warga');
                  onClose();
                }}
              >
                <Text style={styles.roleBtnText}>Siti (Warga)</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actions}>
            {user && (
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={async () => {
                  await logout();
                  onClose();
                }}
              >
                <Ionicons name="log-out-outline" size={16} color={colors.danger} />
                <Text style={styles.logoutBtnText}>Keluar Akun</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Simpan Pengaturan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 13,
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
  presetLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipActive: {
    backgroundColor: colors.primaryUltralight,
    borderColor: colors.primary,
  },
  presetText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  presetTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  roleSwitchSection: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 12,
    marginBottom: 16,
  },
  roleBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 14,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.dangerLight,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
