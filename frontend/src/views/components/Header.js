import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ShieldCheck, Sun, Moon, Volume2, VolumeX } from 'lucide-react-native';

export default function Header({ isDarkMode, setIsDarkMode, soundEnabled, setSoundEnabled }) {
  // Theme-specific colors
  const colors = {
    bg: isDarkMode ? '#0F1015' : '#FFFFFF',
    border: isDarkMode ? '#222530' : '#E2E8F0',
    title: isDarkMode ? '#FFFFFF' : '#0F172A',
    subtitle: isDarkMode ? '#94A3B8' : '#64748B',
    btnBg: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
    btnBorder: isDarkMode ? '#222530' : '#E2E8F0',
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
      <View style={styles.brandContainer}>
        {/* Shield Icon in Gradient-like styling */}
        <View style={styles.logoBadge}>
          <ShieldCheck size={20} color="#000000" strokeWidth={2.5} />
        </View>
        <View style={styles.brandTextContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.logoText, { color: colors.title }]}>SHIFT</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proText}>PRO</Text>
            </View>
          </View>
          <Text style={[styles.subtitleText, { color: colors.subtitle }]}>MOBILIDADE INTELIGENTE</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        {/* Theme Switcher Button */}
        <TouchableOpacity
          onPress={() => setIsDarkMode(!isDarkMode)}
          style={[styles.actionButton, { backgroundColor: colors.btnBg, borderColor: colors.btnBorder }]}
          activeOpacity={0.7}
        >
          {isDarkMode ? (
            <Sun size={18} color="#F59E0B" />
          ) : (
            <Moon size={18} color="#475569" />
          )}
        </TouchableOpacity>

        {/* Sound Switcher Button */}
        <TouchableOpacity
          onPress={() => setSoundEnabled(!soundEnabled)}
          style={[styles.actionButton, { backgroundColor: colors.btnBg, borderColor: colors.btnBorder }]}
          activeOpacity={0.7}
        >
          {soundEnabled ? (
            <Volume2 size={18} color={isDarkMode ? '#F59E0B' : '#6366F1'} />
          ) : (
            <VolumeX size={18} color={isDarkMode ? '#475569' : '#94A3B8'} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    height: 64,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  brandTextContainer: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  proBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  proText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#D97706',
  },
  subtitleText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
