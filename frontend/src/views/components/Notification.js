import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { AlertTriangle, CheckCircle, Sparkles, Info } from 'lucide-react-native';
import getTheme from '../../theme';

export default function Notification({ notification, setNotification, isDarkMode }) {
  const theme = getTheme(isDarkMode);
  const slideAnim = React.useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    if (notification) {
      // Slide Down animation with Spring for premium feel
      Animated.spring(slideAnim, {
        toValue: Platform.OS === 'ios' ? 50 : 20,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }).start();

      // Dismiss automatically after 4.5 seconds
      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -150,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setNotification(null));
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!notification) return null;

  const type = notification.type || 'info';

  const getNotificationStyle = () => {
    switch (type) {
      case 'danger':
        return { 
          bg: theme.colors.danger, 
          text: '#FFFFFF',
          icon: <AlertTriangle size={20} color="#FFFFFF" />
        };
      case 'warning':
        return { 
          bg: theme.colors.warning, 
          text: '#FFFFFF',
          icon: <AlertTriangle size={20} color="#FFFFFF" />
        };
      case 'success':
        return { 
          bg: theme.colors.success, 
          text: '#FFFFFF',
          icon: <CheckCircle size={20} color="#FFFFFF" />
        };
      default:
        return { 
          bg: theme.colors.secondary, 
          text: theme.colors.onSecondary,
          icon: <Info size={20} color={theme.colors.onSecondary} />
        };
    }
  };

  const style = getNotificationStyle();

  return (
    <Animated.View style={[
      styles.container,
      {
        backgroundColor: style.bg,
        transform: [{ translateY: slideAnim }]
      },
      theme.shadows.hard
    ]}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          {style.icon}
        </View>
        <View style={styles.textWrapper}>
          <Text style={[styles.title, { color: style.text }]}>{notification.title}</Text>
          <Text style={[styles.message, { color: style.text, opacity: 0.9 }]}>{notification.message}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 10000,
    borderRadius: 16,
    padding: 14,
    // Elevation for Android / Shadow for iOS via theme.shadows.hard
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '950',
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 11.5,
    fontWeight: '700',
    lineHeight: 15,
    marginTop: 1,
  },
});
