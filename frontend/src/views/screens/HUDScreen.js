import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function HUDScreen({ isDriving, speed, score, distance }) {
  const [hudMirrored, setHudMirrored] = useState(false);

  // Mirrors horizontally and vertically for a perfect windshield reflection
  const mirrorStyle = hudMirrored 
    ? { transform: [{ scaleX: -1 }, { scaleY: -1 }] } 
    : {};

  return (
    <View style={styles.container}>
      {/* Floating Mirror Switcher */}
      <TouchableOpacity
        onPress={() => setHudMirrored(!hudMirrored)}
        style={styles.mirrorBtn}
        activeOpacity={0.7}
      >
        <Text style={styles.mirrorBtnText}>
          {hudMirrored ? 'Normal' : 'Espelho (Windshield)'}
        </Text>
      </TouchableOpacity>

      {/* Main HUD Body */}
      <View style={[styles.hudBody, mirrorStyle]}>
        {/* Large Speed Indicator */}
        <Text style={styles.speedText}>
          {isDriving ? speed : '0'}
        </Text>
        <Text style={styles.unitText}>KM/H</Text>

        {/* Sub-Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{score}%</Text>
            <Text style={styles.metricLabel}>SCORE</Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricValueBlue}>
              {isDriving ? distance.toFixed(1) : '0.0'}
            </Text>
            <Text style={styles.metricLabelBlue}>KMS</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 24,
    margin: 16,
    borderWidth: 4,
    borderColor: '#1E293B',
    position: 'relative',
    overflow: 'hidden',
  },
  mirrorBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
  },
  mirrorBtnText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  hudBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    fontSize: 88,
    fontWeight: '900',
    color: '#F59E0B',
    lineHeight: 88,
    letterSpacing: -3,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '900',
    color: 'rgba(245, 158, 11, 0.4)',
    letterSpacing: 6,
    marginTop: 4,
    paddingLeft: 6, // Centers the tracking spacing
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 40,
    marginTop: 36,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10B981',
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(16, 185, 129, 0.4)',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  metricValueBlue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#3B82F6',
  },
  metricLabelBlue: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(59, 130, 246, 0.4)',
    letterSpacing: 1.5,
    marginTop: 2,
  },
});
