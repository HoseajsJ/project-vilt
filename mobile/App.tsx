import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConfigModal } from './src/components/ConfigModal';
import { Header } from './src/components/Header';
import { NotificationModal } from './src/components/NotificationModal';
import { TabBar, TabItem } from './src/components/TabBar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { AdminServicesScreen } from './src/screens/pengurus/AdminServicesScreen';
import { DashboardScreen } from './src/screens/pengurus/DashboardScreen';
import { IoTMonitoringScreen } from './src/screens/pengurus/IoTMonitoringScreen';
import { KegiatanScreen } from './src/screens/pengurus/KegiatanScreen';
import { BerandaScreen } from './src/screens/warga/BerandaScreen';
import { InfoBudidayaScreen } from './src/screens/warga/InfoBudidayaScreen';
import { LayananSuratScreen } from './src/screens/warga/LayananSuratScreen';
import { PengaduanScreen } from './src/screens/warga/PengaduanScreen';
import { api } from './src/services/api';
import { colors } from './src/theme/colors';
import { AppNotification } from './src/types';

function MainApp() {
  const { user, role, isLoading, isRtOrPengurus } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Set default tab on role switch
  useEffect(() => {
    if (isRtOrPengurus) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('beranda');
    }
  }, [role, isRtOrPengurus]);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const [list, count] = await Promise.all([
        api.getNotifications(),
        api.getUnreadCount(),
      ]);
      setNotifications(list);
      setUnreadCount(count);
    } catch {
      // handled
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleMarkNotificationRead = async (id: number) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('./assets/splash-logo.png')}
          style={styles.splashLogo}
          resizeMode="contain"
        />
        <View style={styles.splashBrand}>
          <Text style={styles.splashTitle}>my23 Desa Pintar</Text>
          <Text style={styles.splashSubtitle}>Terhubung, Tumbuh, Berdaya</Text>
        </View>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // Pengurus Tabs
  const pengurusTabs: TabItem[] = [
    { key: 'dashboard', label: 'Ringkasan', icon: 'speedometer' },
    { key: 'iot', label: 'IoT Budidaya', icon: 'leaf' },
    { key: 'services', label: 'Surat & Aduan', icon: 'shield-checkmark' },
    { key: 'kegiatan', label: 'Kegiatan', icon: 'calendar' },
  ];

  // Warga Tabs
  const wargaTabs: TabItem[] = [
    { key: 'beranda', label: 'Beranda', icon: 'home' },
    { key: 'surat', label: 'Surat RT/RW', icon: 'document-text' },
    { key: 'pengaduan', label: 'Lapor Aduan', icon: 'megaphone' },
    { key: 'budidaya', label: 'Info Karta', icon: 'leaf' },
  ];

  const currentTabs = isRtOrPengurus ? pengurusTabs : wargaTabs;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <Header
        unreadCount={unreadCount}
        onOpenNotifications={() => {
          loadNotifications();
          setShowNotifications(true);
        }}
        onOpenSettings={() => setShowConfig(true)}
      />

      <View style={styles.screenContainer}>
        {isRtOrPengurus ? (
          <>
            {activeTab === 'dashboard' && <DashboardScreen onNavigateTab={setActiveTab} />}
            {activeTab === 'iot' && <IoTMonitoringScreen />}
            {activeTab === 'services' && <AdminServicesScreen />}
            {activeTab === 'kegiatan' && <KegiatanScreen />}
          </>
        ) : (
          <>
            {activeTab === 'beranda' && <BerandaScreen onNavigateTab={setActiveTab} />}
            {activeTab === 'surat' && <LayananSuratScreen />}
            {activeTab === 'pengaduan' && <PengaduanScreen />}
            {activeTab === 'budidaya' && <InfoBudidayaScreen />}
          </>
        )}
      </View>

      <TabBar
        tabs={currentTabs}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllRead}
      />

      <ConfigModal
        visible={showConfig}
        onClose={() => setShowConfig(false)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  splashLogo: {
    width: 208,
    height: 208,
    marginBottom: 24,
  },
  splashBrand: {
    alignItems: 'center',
    marginBottom: 42,
  },
  splashTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  splashSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1FAE5',
    marginTop: 6,
  },
});
