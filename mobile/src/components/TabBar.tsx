import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

export interface TabItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onSelectTab: (key: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onSelectTab }) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, isActive && styles.activeIconWrap]}>
              <Ionicons
                name={isActive ? tab.icon : (`${tab.icon}-outline` as any)}
                size={22}
                color={isActive ? colors.primary : colors.textMuted}
              />
            </View>
            <Text
              style={[styles.label, isActive && styles.activeLabel]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrap: {
    width: 36,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  activeIconWrap: {
    backgroundColor: colors.primaryLight,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },
  activeLabel: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
});
