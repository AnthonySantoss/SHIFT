import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { CloudRain, Sun, Cloud, CloudFog, Snowflake, Play, Square, AlertTriangle, Coffee, Smartphone } from 'lucide-react-native';

export default function DashboardScreen({ isDarkMode, controller }) {
  const {
    isDriving,
    score,
    speed,
    brakingAlert,
    speedingAlert,
    distractionAlert,
    phoneDistracted,
    setPhoneDistracted,
    tripSeconds,
    distance,
    fatigueLevel,
    weatherInfo,
    toggleTrip,
    handleSuddenBrake,
  } = controller;

  // Format time (MM:SS)
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Theme styling
  const colors = {
    bg: isDarkMode ? '#0F1015' : '#F1F5F9',
    cardBg: isDarkMode ? '#171923' : '#FFFFFF',
    border: isDarkMode ? '#222530' : '#E2E8F0',
    title: isDarkMode ? '#FFFFFF' : '#0F172A',
    text: isDarkMode ? '#94A3B8' : '#475569',
    hudCircleBg: isDarkMode ? '#222530' : '#E2E8F0',
  };

  // SVG Ring values
  const radius = 42;
  const strokeWidth = 8.5;
  const circumference = 2 * Math.PI * radius; // ~263.89
  const strokeDashoffset = circumference - (circumference * (isDriving ? score : 0)) / 100;

  // Dynamic Ring color depending on score safety range
  const getRingColor = () => {
    if (score > 80) return isDarkMode ? '#F59E0B' : '#10B981'; // Amber/Emerald
    if (score > 60) return '#F97316'; // Orange
    return '#EF4444'; // Red danger
  };

  // Dynamic Weather Visual Data Builder
  const getWeatherCardData = () => {
    const { isWetRoad, description, temperature, icon } = weatherInfo || {
      isWetRoad: false,
      description: 'Tempo Limpo',
      temperature: 20,
      icon: 'sun'
    };

    if (icon === 'cloud-rain') {
      return {
        title: `${description} (${temperature}°C)`,
        subtitle: 'Pista escorregadia. A distância de travagem aumenta. Reduza a velocidade.',
        bgColor: isDarkMode ? 'rgba(59, 130, 246, 0.12)' : '#E0F2FE',
        borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.25)' : '#BAE6FD',
        titleColor: '#0284C7',
        subColor: '#0369A1',
        icon: <CloudRain size={20} color="#0284C7" />
      };
    }
    if (icon === 'snowflake') {
      return {
        title: `${description} (${temperature}°C)`,
        subtitle: 'Pista com acumulação de neve/gelo. Aderência extremamente reduzida. Cuidado máximo.',
        bgColor: isDarkMode ? 'rgba(6, 182, 212, 0.12)' : '#ECFEFF',
        borderColor: isDarkMode ? 'rgba(6, 182, 212, 0.25)' : '#CFFAFE',
        titleColor: '#0891B2',
        subColor: '#0E7490',
        icon: <Snowflake size={20} color="#0891B2" />
      };
    }
    if (icon === 'cloud-fog') {
      return {
        title: `${description} (${temperature}°C)`,
        subtitle: 'Visibilidade muito reduzida devido a nevoeiro intenso. Utilize faróis médios.',
        bgColor: isDarkMode ? 'rgba(100, 116, 139, 0.12)' : '#F1F5F9',
        borderColor: isDarkMode ? 'rgba(100, 116, 139, 0.25)' : '#E2E8F0',
        titleColor: '#475569',
        subColor: '#334155',
        icon: <CloudFog size={20} color="#475569" />
      };
    }
    if (icon === 'cloud') {
      return {
        title: `${description} (${temperature}°C)`,
        subtitle: 'Tempo nublado com pista seca. Conduza com a atenção habitual.',
        bgColor: isDarkMode ? 'rgba(148, 163, 184, 0.08)' : '#F8FAFC',
        borderColor: isDarkMode ? 'rgba(148, 163, 184, 0.15)' : '#F1F5F9',
        titleColor: isDarkMode ? '#94A3B8' : '#475569',
        subColor: isDarkMode ? '#64748B' : '#64748B',
        icon: <Cloud size={20} color={isDarkMode ? '#94A3B8' : '#475569'} />
      };
    }
    
    // Default Sun / Clear
    return {
      title: `${description} (${temperature}°C)`,
      subtitle: 'Pista totalmente seca. Condições ideais para conduzir. Boa viagem!',
      bgColor: isDarkMode ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5',
      borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5',
      titleColor: '#059669',
      subColor: '#047857',
      icon: <Sun size={20} color="#10B981" />
    };
  };

  const weatherCard = getWeatherCardData();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Dynamic Real-time Weather Context Card */}
      <View style={[
        styles.rainAlertCard, 
        { 
          backgroundColor: weatherCard.bgColor, 
          borderColor: weatherCard.borderColor,
          borderWidth: 1
        }
      ]}>
        <View style={[
          styles.rainIconBadge, 
          { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }
        ]}>
          {weatherCard.icon}
        </View>
        <View style={styles.rainTextContainer}>
          <Text style={[styles.rainTitle, { color: weatherCard.titleColor }]}>
            {weatherCard.title}
          </Text>
          <Text style={[styles.rainSubtitle, { color: weatherCard.subColor }]}>
            {weatherCard.subtitle}
          </Text>
        </View>
      </View>

      {/* Main Driving Dashboard Card */}
      <View style={[styles.dashboardCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.title }]}>Condução</Text>
            <Text style={[styles.cardSubtitle, { color: colors.text }]}>Análise de sensores em tempo real</Text>
          </View>
          {isDriving && (
            <View style={styles.activeTimerBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.activeTimerText}>{formatTime(tripSeconds)}</Text>
            </View>
          )}
        </View>

        {/* Circular Progress Gauge */}
        <View style={styles.gaugeContainer}>
          <View style={styles.svgWrapper}>
            <Svg width="160" height="160" viewBox="0 0 100 100">
              {/* Secondary background circle track */}
              <Circle
                cx="50"
                cy="50"
                r={radius}
                stroke={colors.hudCircleBg}
                strokeWidth={strokeWidth - 0.5}
                fill="transparent"
              />
              {/* Dynamic primary circle indicator */}
              <Circle
                cx="50"
                cy="50"
                r={radius}
                stroke={getRingColor()}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)" // Rotate to start from top
              />
            </Svg>
            
            {/* Absolute positioning inside SVG */}
            <View style={styles.gaugeTextContainer}>
              <Text style={[styles.gaugeLabel, { color: colors.text }]}>SCORE</Text>
              <Text style={[styles.gaugeValue, { color: colors.title }]}>
                {isDriving ? score : '--'}
              </Text>
            </View>
          </View>
        </View>

        {/* Speed and Fatigue indicators */}
        <View style={styles.metricsGrid}>
          {/* Speed Indicator */}
          <View style={[styles.metricBox, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Text style={[styles.metricBoxLabel, { color: colors.text }]}>VELOCIDADE</Text>
            <Text style={[styles.metricBoxValue, { color: colors.title }]}>
              {isDriving ? speed : '0'}
              <Text style={styles.metricBoxUnit}> km/h</Text>
            </Text>
          </View>

          {/* Fatigue Level Indicator */}
          <View style={[styles.metricBox, { backgroundColor: colors.bg, borderColor: colors.border, overflow: 'hidden' }]}>
            <View style={styles.fatigueHeader}>
              <Coffee size={12} color="#F59E0B" />
              <Text style={[styles.metricBoxLabel, { color: colors.text }]}> FADIGA</Text>
            </View>
            <Text style={[styles.metricBoxValue, fatigueLevel > 70 ? styles.fatigueDanger : { color: colors.title }]}>
              {Math.round(fatigueLevel)}%
            </Text>
            
            {/* Bottom Fatigue Progress Bar */}
            <View style={styles.fatigueProgressBarBg}>
              <View style={[styles.fatigueProgressBarFill, { width: `${fatigueLevel}%` }]} />
            </View>
          </View>
        </View>

        {/* Start / Stop Trigger */}
        <TouchableOpacity
          onPress={toggleTrip}
          style={[styles.actionBtn, isDriving ? styles.stopBtn : styles.startBtn]}
          activeOpacity={0.8}
        >
          {isDriving ? (
            <>
              <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.actionBtnText}>Parar Viagem</Text>
            </>
          ) : (
            <>
              <Play size={16} color="#000000" fill="#000000" />
              <Text style={[styles.actionBtnText, { color: '#000000' }]}>Iniciar Viagem</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Simulation Triggers (Sudden Braking) */}
        {isDriving && (
          <View style={styles.simulationContainer}>
            <TouchableOpacity
              onPress={handleSuddenBrake}
              style={[styles.simButton, { borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <AlertTriangle size={14} color="#EF4444" />
              <Text style={[styles.simButtonText, { color: colors.title }]}>Simular Travagem Brusca</Text>
            </TouchableOpacity>

            {/* Distraction Sim Switch */}
            <View style={styles.distractionRow}>
              <View style={styles.distractionLabelContainer}>
                <Smartphone size={14} color={phoneDistracted ? '#EF4444' : colors.text} />
                <Text style={[styles.distractionText, { color: colors.title }]}>Uso de Telemóvel</Text>
              </View>
              <Switch
                value={phoneDistracted}
                onValueChange={setPhoneDistracted}
                trackColor={{ false: '#767577', true: '#FEE2E2' }}
                thumbColor={phoneDistracted ? '#EF4444' : '#f4f3f4'}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  rainAlertCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  rainIconBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    padding: 8,
    borderRadius: 10,
  },
  rainTextContainer: {
    flex: 1,
  },
  rainTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  rainSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 2,
  },
  dashboardCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
    maxHeight: 520,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  activeTimerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activeTimerText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#047857',
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  svgWrapper: {
    position: 'relative',
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  gaugeValue: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    position: 'relative',
  },
  metricBoxLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  metricBoxValue: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  metricBoxUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  fatigueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fatigueDanger: {
    color: '#EF4444',
  },
  fatigueProgressBarBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  fatigueProgressBarFill: {
    height: '100%',
    backgroundColor: '#EF4444',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
    marginTop: 12,
  },
  startBtn: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
  },
  stopBtn: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  simulationContainer: {
    marginTop: 12,
    gap: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
    paddingTop: 12,
  },
  simButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 10,
    gap: 6,
  },
  simButtonText: {
    fontSize: 10,
    fontWeight: '800',
  },
  distractionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 2,
  },
  distractionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distractionText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
