import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { AlertTriangle, CheckCircle, Sparkles, HeartPulse } from 'lucide-react-native';

export default function Notification({ notification, setNotification }) {
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (notification) {
      // Slide Down animation
      Animated.spring(slideAnim, {
        toValue: 12,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();

      // Dismiss automatically after 4 seconds
      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -150,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setNotification(null));
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!notification) return null;

  const isAlert = notification.type === 'danger' || notification.type === 'warning';
  const isSuccess = notification.type === 'success';

  // Semantic styles for various notification categories
  const containerStyle = [
    styles.container,
    isAlert
      ? styles.dangerContainer
      : isSuccess
      ? styles.successContainer
      : styles.infoContainer,
  ];

  const titleStyle = [
    styles.title,
    isAlert
      ? styles.dangerTitle
      : isSuccess
      ? styles.successTitle
      : styles.infoTitle,
  ];

  const descStyle = [
    styles.description,
    isAlert
      ? styles.dangerDesc
      : isSuccess
      ? styles.successDesc
      : styles.infoDesc,
  ];

  return (
    <Animated.View style={[containerStyle, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.iconContainer}>
        {isAlert ? (
          <AlertTriangle size={20} color={notification.type === 'danger' ? '#EF4444' : '#F59E0B'} />
        ) : isSuccess ? (
          <CheckCircle size={20} color="#10B981" />
        ) : (
          <Sparkles size={20} color="#6366F1" />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={titleStyle}>{notification.title}</Text>
        <Text style={descStyle}>{notification.message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Sits beautifully right below the header
    left: 16,
    right: 16,
    zIndex: 9999,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  textContainer: {
    flex: 1,
  },
  iconContainer: {
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
    marginTop: 2,
  },

  // Danger & Warning styling
  dangerContainer: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FEE2E2',
  },
  dangerTitle: {
    color: '#991B1B',
  },
  dangerDesc: {
    color: '#7F1D1D',
  },

  // Success styling
  successContainer: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5',
  },
  successTitle: {
    color: '#065F46',
  },
  successDesc: {
    color: '#047857',
  },

  // Info / Tips styling
  infoContainer: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  infoTitle: {
    color: '#1E293B',
  },
  infoDesc: {
    color: '#475569',
  },
});
