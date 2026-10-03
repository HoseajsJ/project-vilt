import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  unreadCount?: number;
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  unreadCount = 0,
  onOpenNotifications,
  onOpenSettings,
}) => {
  const { user, role } = useAuth();

  const getRoleLabel = () => {
    switch (role) {
      case 'pengurus':
      case 'pengurus_karta':
        return 'Pengurus Karta';
      case 'pengurus_rt':
        return 'Pengurus RT 03';
      case 'warga':
        return 'Warga RW 05';
      default:
        return 'Pengguna';
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'pengurus_rt':
        return '#0284C7'; // Blue
      case 'pengurus':
      case 'pengurus_karta':
        return '#059669'; // Emerald
      default:
        return '#D97706'; // Amber
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: getRoleColor() }]}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <View style={styles.titles}>
          <View style={styles.roleRow}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor() + '20' }]}>
              <Text style={[styles.roleBadgeText, { color: getRoleColor() }]}>{getRoleLabel()}</Text>
            </View>
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {title || user?.name || 'Desa Pintar'}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.actions}>
        {onOpenNotifications ? (
          <TouchableOpacity style={styles.iconButton} onPress={onOpenNotifications}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : null}

        {onOpenSettings ? (
          <TouchableOpacity style={styles.iconButton} onPress={onOpenSettings}>
            <Ionicons name="settings-outline" size={21} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  titles: {
    flex: 1,
  },
  roleRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
