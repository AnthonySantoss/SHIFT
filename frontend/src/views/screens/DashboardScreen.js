import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, interpolateColor } from 'react-native-reanimated';
import { CloudRain, Sun, Cloud, CloudFog, Snowflake, Play, Square, AlertTriangle, Coffee, Smartphone } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import getTheme from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function DashboardScreen({ isDarkMode, controller }) {
  const theme = getTheme(isDarkMode);
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

  // Reanimated Shared Values
  const scoreSV = useSharedValue(0);

  useEffect(() => {
    scoreSV.value = withTiming(isDriving ? score : 0, { duration: 1000 });
  }, [score, isDriving]);

  // Format time (MM:SS)
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVG Ring values
  const radius = 42;
  const strokeWidth = 8.5;
  const circumference = 2 * Math.PI * radius; 

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (circumference * scoreSV.value) / 100;
    const stroke = interpolateColor(
      scoreSV.value,
      [0, 60, 90, 100],
      [theme.colors.danger, theme.colors.warning, theme.colors.primary, theme.colors.primary]
    );
    return {
      strokeDashoffset,
      stroke
    };
  });

  // Dynamic Weather Visual Data Builder
  const getWeatherCardData = () => {
    const { isWetRoad, description, temperature, icon } = weatherInfo || {
      isWetRoad: false,
      description: 'Tempo Limpo',
      temperature: 20,
      icon: 'sun'
    };

    if (isWetRoad) {
      return {
        bgColor: isDarkMode ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
        borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.3)' : '#FEE2E2',
        title: 'Pista Escorregadia',
        subtitle: `${temperature}°C • ${description}. Aumente a distância de segurança.`,
        icon: <CloudRain size={20} color="#EF4444" />,
        titleColor: '#EF4444',
        subColor: isDarkMode ? '#FCA5A5' : '#991B1B'
      };
    }

    return {
      bgColor: isDarkMode ? 'rgba(245, 158, 11, 0.08)' : '#FFFBEB',
      borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
      title: 'Condição de Pista: Boa',
      subtitle: `${temperature}°C • ${description}. Conduza com atenção.`,
      icon: icon === 'sun' ? <Sun size={20} color="#F59E0B" /> : 
            icon === 'cloud' ? <Cloud size={20} color="#F59E0B" /> :
            icon === 'cloud-fog' ? <CloudFog size={20} color="#F59E0B" /> :
            <Sun size={20} color="#F59E0B" />,
      titleColor: '#B45309',
      subColor: isDarkMode ? '#FCD34D' : '#92400E'
    };
  };

  const weatherCard = getWeatherCardData();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Dynamic Real-time Weather Context Card */}
      <View 
        style={[
          styles.rainAlertCard, 
          { 
            backgroundColor: weatherCard.bgColor, 
            borderColor: weatherCard.borderColor,
            borderWidth: 1
          }
        ]}
        accessibilityLabel={`Informação de clima: ${weatherCard.title}. ${weatherCard.subtitle}`}
        accessibilityRole="summary"
      >
        <View style={[
          styles.rainIconBadge, 
          { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }
        ]} importantForAccessibility="no-hide-descendants">
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
      <View style={[styles.dashboardCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, theme.shadows.medium]}>
        <View style={styles.cardHeader} accessibilityRole="header">
          <View>
            <Text style={[styles.cardTitle, { color: theme.colors.title }]}>Painel de Condução</Text>
            <Text style={[styles.cardSubtitle, { color: theme.colors.text }]}>Telemetria em tempo real</Text>
          </View>
          {isDriving && (
            <View 
              style={[styles.activeTimerBadge, { backgroundColor: theme.colors.secondary }]}
              accessibilityLabel={`Duração da viagem: ${formatTime(tripSeconds)}`}
            >
              <View style={styles.pulseDot} />
              <Text style={[styles.activeTimerText, { color: theme.colors.onSecondary }]}>{formatTime(tripSeconds)}</Text>
            </View>
          )}
        </View>

        {/* Circular Progress Gauge */}
        <View 
          style={styles.gaugeContainer}
          accessibilityLabel={`Score de condução atual: ${isDriving ? score : 'indisponível'} de 100`}
          accessibilityRole="progressbar"
          accessibilityValue={{ now: score, min: 0, max: 100 }}
        >
          <View style={styles.svgWrapper} importantForAccessibility="no-hide-descendants">
            <Svg width="160" height="160" viewBox="0 0 100 100">
              <Circle
                cx="50"
                cy="50"
                r={radius}
                stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
                strokeWidth={strokeWidth - 0.5}
                fill="transparent"
              />
              <AnimatedCircle
                cx="50"
                cy="50"
                r={radius}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                animatedProps={animatedProps}
                strokeLinecap="round"
                transform="rotate(-90 50 50)" 
              />
            </Svg>
            
            <View style={styles.gaugeTextContainer}>
              <Text style={[styles.gaugeLabel, { color: theme.colors.text }]}>SCORE</Text>
              <Text style={[styles.gaugeValue, { color: theme.colors.title }]}>
                {isDriving ? score : '--'}
              </Text>
            </View>
          </View>
        </View>

        {/* Speed and Fatigue indicators */}
        <View style={styles.metricsGrid}>
          <View 
            style={[styles.metricBox, { backgroundColor: theme.colors.bg, borderColor: theme.colors.border }]}
            accessibilityLabel={`Velocidade atual: ${isDriving ? speed : '0'} km/h`}
          >
            <Text style={[styles.metricBoxLabel, { color: theme.colors.text }]}>VELOCIDADE</Text>
            <Text style={[styles.metricBoxValue, { color: theme.colors.title }]}>
              {isDriving ? speed : '0'}
              <Text style={styles.metricBoxUnit}> km/h</Text>
            </Text>
          </View>

          <View 
            style={[styles.metricBox, { backgroundColor: theme.colors.bg, borderColor: theme.colors.border, overflow: 'hidden' }]}
            accessibilityLabel={`Nível de fadiga: ${Math.round(fatigueLevel)}%`}
          >
            <View style={styles.fatigueHeader}>
              <Coffee size={12} color={theme.colors.primary} />
              <Text style={[styles.metricBoxLabel, { color: theme.colors.text }]}> FADIGA</Text>
            </View>
            <Text style={[styles.metricBoxValue, fatigueLevel > 70 ? { color: theme.colors.danger } : { color: theme.colors.title }]}>
              {Math.round(fatigueLevel)}%
            </Text>
            <View style={[styles.fatigueProgressBarBg, { backgroundColor: theme.colors.border }]}>
              <View style={[styles.fatigueProgressBarFill, { width: `${fatigueLevel}%`, backgroundColor: fatigueLevel > 70 ? theme.colors.danger : theme.colors.primary }]} />
            </View>
          </View>
        </View>

        {/* Start / Stop Trigger */}
        <TouchableOpacity
          onPress={() => {
            Haptics.notificationAsync(isDriving ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success);
            toggleTrip();
          }}
          style={[styles.actionBtn, isDriving ? { backgroundColor: theme.colors.secondary } : { backgroundColor: theme.colors.primary }]}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={isDriving ? "Parar viagem" : "Iniciar viagem"}
        >
          {isDriving ? (
            <>
              <Square size={16} color={theme.colors.onSecondary} fill={theme.colors.onSecondary} />
              <Text style={[styles.actionBtnText, { color: theme.colors.onSecondary }]}>Parar Viagem</Text>
            </>
          ) : (
            <>
              <Play size={16} color={theme.colors.onPrimary} fill={theme.colors.onPrimary} />
              <Text style={[styles.actionBtnText, { color: theme.colors.onPrimary }]}>Iniciar Viagem</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Simulation Triggers */}
        {isDriving && (
          <View style={styles.simulationContainer}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                handleSuddenBrake(-25);
              }}
              style={[styles.simButton, { borderColor: theme.colors.border }]}
              activeOpacity={0.7}
            >
              <AlertTriangle size={14} color={theme.colors.danger} />
              <Text style={[styles.simButtonText, { color: theme.colors.title }]}>Simular Travagem</Text>
            </TouchableOpacity>

            <View style={styles.distractionRow}>
              <View style={styles.distractionLabelContainer}>
                <Smartphone size={14} color={phoneDistracted ? theme.colors.danger : theme.colors.text} />
                <Text style={[styles.distractionText, { color: theme.colors.title }]}>Telemóvel</Text>
              </View>
              <Switch
                value={phoneDistracted}
                onValueChange={(val) => {
                  if (val) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  setPhoneDistracted(val);
                }}
                trackColor={{ false: theme.colors.border, true: `${theme.colors.danger}66` }}
                thumbColor={phoneDistracted ? theme.colors.danger : '#f4f3f4'}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    gap: 12,
  },
  rainIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rainTextContainer: {
    flex: 1,
  },
  rainTitle: {
    fontSize: 13,
    fontWeight: '900',
  },
  rainSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    lineHeight: 13,
  },
  dashboardCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    gap: 20,
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
    fontWeight: '700',
  },
  activeTimerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  activeTimerText: {
    fontSize: 11,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
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
  },
  gaugeLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  gaugeValue: {
    fontSize: 48,
    fontWeight: '950',
    marginTop: -4,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricBox: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  metricBoxLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  metricBoxValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  metricBoxUnit: {
    fontSize: 10,
    fontWeight: '700',
    opacity: 0.5,
  },
  fatigueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fatigueProgressBarBg: {
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  fatigueProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 16,
    gap: 10,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '900',
  },
  simulationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  simButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  simButtonText: {
    fontSize: 10,
    fontWeight: '800',
  },
  distractionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
