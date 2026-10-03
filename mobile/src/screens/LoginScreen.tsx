import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ConfigModal } from '../components/ConfigModal';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export const LoginScreen: React.FC = () => {
  const { login, isLoading, backendUrl } = useAuth();
  const [username, setUsername] = useState('budi');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  const handleLogin = async () => {
    setErrorMessage('');
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Harap masukkan username dan password');
      return;
    }

    const res = await login(username.trim(), password.trim());
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const handlePreset = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Top Bar Config */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.configBtn} onPress={() => setShowConfig(true)}>
            <Ionicons name="server-outline" size={16} color={colors.primary} />
            <Text style={styles.configBtnText} numberOfLines={1}>
              {backendUrl.replace('http://', '').replace('/api', '')}
            </Text>
            <Ionicons name="chevron-down" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Branding & Logo */}
        <View style={styles.brandSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="leaf" size={40} color="#FFF" />
          </View>
          <Text style={styles.brandTitle}>my23 Desa Pintar</Text>
          <Text style={styles.brandSubtitle}>
            Sistem Terpadu IoT Budidaya, Layanan Surat RT/RW & Pengaduan Warga
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Masuk ke Akun</Text>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Masukkan username"
                placeholderTextColor={colors.textLight}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Masukkan password"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>Masuk Sekarang</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Quick Preset Buttons */}
          <View style={styles.presetSection}>
            <Text style={styles.presetHeading}>Pilih Akun Demo Cepat:</Text>
            <View style={styles.presetButtons}>
              <TouchableOpacity
                style={[styles.presetCard, username === 'budi' && styles.presetCardActive]}
                onPress={() => handlePreset('budi', 'password123')}
              >
                <View style={[styles.presetIconWrap, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="leaf" size={16} color={colors.catLingkungan} />
                </View>
                <View style={styles.presetTextCol}>
                  <Text style={styles.presetName}>Budi Santoso</Text>
                  <Text style={styles.presetRole}>Pengurus Karang Taruna</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetCard, username === 'siti' && styles.presetCardActive]}
                onPress={() => handlePreset('siti', 'password123')}
              >
                <View style={[styles.presetIconWrap, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="person" size={16} color={colors.catMaggot} />
                </View>
                <View style={styles.presetTextCol}>
                  <Text style={styles.presetName}>Siti Aminah</Text>
                  <Text style={styles.presetRole}>Warga RW 05</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetCard, username === 'pakrt' && styles.presetCardActive]}
                onPress={() => handlePreset('pakrt', 'password123')}
              >
                <View style={[styles.presetIconWrap, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="shield-checkmark" size={16} color={colors.accent} />
                </View>
                <View style={styles.presetTextCol}>
                  <Text style={styles.presetName}>Pak Bambang</Text>
                  <Text style={styles.presetRole}>Ketua RT 03</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.footerText}>
          Aplikasi Desa Pintar RW & Karang Taruna • Versi 1.0
        </Text>
      </ScrollView>

      <ConfigModal visible={showConfig} onClose={() => setShowConfig(false)} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  configBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryUltralight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  configBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
    maxWidth: 160,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.dangerLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  eyeBtn: {
    padding: 6,
  },
  loginBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  presetSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 16,
  },
  presetHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 10,
  },
  presetButtons: {
    gap: 8,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  presetCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryUltralight,
  },
  presetIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  presetTextCol: {
    flex: 1,
  },
  presetName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  presetRole: {
    fontSize: 11,
    color: colors.textMuted,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textLight,
    marginTop: 24,
  },
});
