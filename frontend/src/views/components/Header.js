import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ShieldCheck, Sun, Moon, Volume2, VolumeX } from 'lucide-react-native';
import getTheme from '../../theme';

export default function Header({ isDarkMode, setIsDarkMode, soundEnabled, setSoundEnabled }) {
  const theme = getTheme(isDarkMode);

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
      <View style={styles.brandContainer}>
        {/* Shield Icon in Gradient-like styling */}
        <View style={[styles.logoBadge, { backgroundColor: theme.colors.primary }, theme.shadows.soft]}>
          <ShieldCheck size={20} color={theme.colors.black} strokeWidth={2.5} />
        </View>
        <View style={styles.brandTextContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.logoText, { color: theme.colors.title }]}>SHIFT</Text>
            <View style={[styles.proBadge, { backgroundColor: `${theme.colors.primary}26` }]}>
              <Text style={[styles.proText, { color: theme.colors.primary }]}>PRO</Text>
            </View>
          </View>
          <Text style={[styles.subtitleText, { color: theme.colors.muted }]}>MOBILIDADE INTELIGENTE</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        {/* Theme Switcher Button */}
        <TouchableOpacity
          onPress={() => setIsDarkMode(!isDarkMode)}
          style={[styles.actionButton, { backgroundColor: theme.colors.input, borderColor: theme.colors.border }]}
          activeOpacity={0.7}
        >
          {isDarkMode ? (
            <Sun size={18} color={theme.colors.primary} />
          ) : (
            <Moon size={18} color={theme.colors.text} />
          )}
        </TouchableOpacity>

        {/* Sound Switcher Button */}
        <TouchableOpacity
          onPress={() => setSoundEnabled(!soundEnabled)}
          style={[styles.actionButton, { backgroundColor: theme.colors.input, borderColor: theme.colors.border }]}
          activeOpacity={0.7}
        >
          {soundEnabled ? (
            <Volume2 size={18} color={isDarkMode ? theme.colors.primary : theme.colors.primary} />
          ) : (
            <VolumeX size={18} color={theme.colors.muted} />
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
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  proText: {
    fontSize: 8,
    fontWeight: '900',
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
