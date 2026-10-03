import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { AppNotification } from '../types';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
}) => {
  const getCatIcon = (category: string) => {
    switch (category) {
      case 'alert':
        return { icon: 'warning' as const, color: colors.danger, bg: colors.dangerLight };
      case 'activity':
        return { icon: 'calendar' as const, color: colors.primary, bg: colors.primaryLight };
      case 'report':
        return { icon: 'document-text' as const, color: colors.accent, bg: colors.accentLight };
      default:
        return { icon: 'notifications' as const, color: colors.textMuted, bg: colors.surfaceSubtle };
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="notifications" size={20} color={colors.primary} />
              <Text style={styles.headerTitle}>Pemberitahuan Warga & Desa</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {notifications.length > 0 ? (
            <View style={styles.subHeader}>
              <Text style={styles.subTitle}>
                {notifications.filter((n) => !n.is_read).length} belum dibaca
              </Text>
              <TouchableOpacity onPress={onMarkAllRead}>
                <Text style={styles.markAllText}>Tandai Semua Dibaca</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={40} color={colors.textLight} />
                <Text style={styles.emptyText}>Belum ada pemberitahuan baru.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const meta = getCatIcon(item.category);
              return (
                <TouchableOpacity
                  style={[styles.itemCard, !item.is_read && styles.itemCardUnread]}
                  onPress={() => onMarkRead(item.id)}
                >
                  <View style={[styles.itemIcon, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon} size={18} color={meta.color} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={[styles.itemTitle, !item.is_read && styles.itemTitleUnread]}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemBody}>{item.body}</Text>
                    <Text style={styles.itemDate}>{item.created_at}</Text>
                  </View>
                  {!item.is_read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              );
            }}
          />
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
    paddingTop: 20,
    paddingHorizontal: 16,
    maxHeight: '80%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
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
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  subTitle: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  markAllText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  list: {
    paddingBottom: 30,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 8,
  },
  itemCardUnread: {
    backgroundColor: colors.primaryUltralight,
    borderColor: colors.primaryLight,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  itemTitleUnread: {
    fontWeight: '800',
    color: colors.primaryDark,
  },
  itemBody: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  itemDate: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
