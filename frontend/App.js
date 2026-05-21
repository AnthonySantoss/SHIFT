import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform, ActivityIndicator } from 'react-native';
import { HeartPulse, Car, Users, Award, History, ShieldCheck } from 'lucide-react-native';

// Import Views
import Header from './src/views/components/Header';
import Notification from './src/views/components/Notification';
import AuthScreen from './src/views/screens/AuthScreen';
import MaioAmareloScreen from './src/views/screens/MaioAmareloScreen';
import DashboardScreen from './src/views/screens/DashboardScreen';
import AuditoriaScreen from './src/views/screens/AuditoriaScreen';
import HUDScreen from './src/views/screens/HUDScreen';
import VantagensScreen from './src/views/screens/VantagensScreen';
import HistoricoScreen from './src/views/screens/HistoricoScreen';
import AdminScreen from './src/views/screens/AdminScreen';

// Import Controllers & Models
import { useTripController } from './src/controllers/trip.controller';
import { useAuditController } from './src/controllers/audit.controller';
import { useAuthController } from './src/controllers/auth.controller';
import ApiService from './src/models/api.model';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notification, setNotification] = useState(null);
  
  // Real user profile state
  const [profileData, setProfileData] = useState(null);

  // Sync profile metrics from secure backend API
  const refreshProfile = async () => {
    try {
      const data = await ApiService.fetchSelfProfile();
      setProfileData(data.profile);
    } catch (error) {
      console.warn('Silent profile fetch failed:', error);
      // Suppress or handle offline state gracefully
    }
  };

  // 1. Initialize Authentication controller
  const authController = useAuthController(setNotification, refreshProfile);

  // 2. Initialize secondary trip & audit controllers
  const tripController = useTripController(soundEnabled, setNotification, refreshProfile);
  const auditController = useAuditController(soundEnabled, setNotification, refreshProfile);

  // 3. Tab State & Auto Tab filter depending on logged-in user role
  const [activeTab, setActiveTab] = useState('maioAmarelo');

  useEffect(() => {
    if (authController.isAuthenticated && authController.user) {
      // Direct passengers away from driver-only driving tabs
      if (authController.user.role === 'passenger') {
        setActiveTab('passenger');
      } else if (authController.user.role === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('maioAmarelo');
      }
    }
  }, [authController.isAuthenticated]);

  // Loading Splash Screen while checking JWT persistence
  if (authController.isLoading) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: isDarkMode ? '#0F1015' : '#F1F5F9' }]}>
        <View style={styles.splashBadge}>
          <ShieldCheck size={50} color="#000000" strokeWidth={2.5} />
        </View>
        <Text style={[styles.splashText, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}>
          A carregar SHIFT...
        </Text>
        <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 12 }} />
      </View>
    );
  }

  // -------------------------------------------------------------
  // GATED AUTHENTICATION WALL (IF NOT LOGGED IN)
  // -------------------------------------------------------------
  if (!authController.isAuthenticated) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#0F1015' : '#F1F5F9' }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        {/* Floating alerts inside Login page */}
        <Notification notification={notification} setNotification={setNotification} />
        
        <AuthScreen isDarkMode={isDarkMode} controller={authController} />
      </SafeAreaView>
    );
  }

  // Colors based on theme
  const colors = {
    bg: isDarkMode ? '#0F1015' : '#F1F5F9',
    tabBarBg: isDarkMode ? '#0F1015' : '#FFFFFF',
    border: isDarkMode ? '#222530' : '#E2E8F0',
    navTextActive: isDarkMode ? '#F59E0B' : '#6366F1',
    navTextInactive: isDarkMode ? '#475569' : '#94A3B8',
  };

  // Dynamic Navigation filters based on driver vs passenger roles
  const isDriver = authController.user && authController.user.role === 'driver';
  const isAdmin = authController.user && authController.user.role === 'admin';

  const NavItem = ({ id, icon: Icon, label }) => {
    const isActive = activeTab === id;
    const color = isActive ? colors.navTextActive : colors.navTextInactive;

    return (
      <TouchableOpacity
        onPress={() => setActiveTab(id)}
        style={styles.navItem}
        activeOpacity={0.7}
      >
        <Icon size={18} color={color} />
        <Text style={[styles.navText, { color }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#0F1015' : '#FFFFFF' }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Maio Amarelo Campaign Top Banner */}
      <View style={styles.campaignBanner}>
        <HeartPulse size={12} color="#451A03" />
        <Text style={styles.campaignText}>MAIO AMARELO: A PAZ NO TRÂNSITO COMEÇA EM SI</Text>
      </View>

      {/* Floating Notifications Banner */}
      <Notification notification={notification} setNotification={setNotification} />

      {/* Premium Settings Header */}
      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Tab View Switcher */}
      <View style={[styles.mainContent, { backgroundColor: colors.bg }]}>
        {activeTab === 'maioAmarelo' && (
          <MaioAmareloScreen isDarkMode={isDarkMode} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'dashboard' && isDriver && (
          <DashboardScreen isDarkMode={isDarkMode} controller={tripController} />
        )}
        {activeTab === 'passenger' && (
          <AuditoriaScreen isDarkMode={isDarkMode} controller={auditController} />
        )}
        {activeTab === 'hud' && isDriver && (
          <HUDScreen
            isDriving={tripController.isDriving}
            speed={tripController.speed}
            score={tripController.score}
            distance={tripController.distance}
          />
        )}
        {activeTab === 'challenges' && (
          <VantagensScreen isDarkMode={isDarkMode} score={tripController.score} profileData={profileData} />
        )}
        {activeTab === 'history' && (
          <HistoricoScreen 
            isDarkMode={isDarkMode} 
            profileData={profileData} 
            handleLogout={authController.handleLogout} // Injecting logout action into Profile
          />
        )}
        {activeTab === 'admin' && isAdmin && (
          <AdminScreen isDarkMode={isDarkMode} />
        )}
      </View>

      {/* Floating Dynamic Bottom Tab Bar Menu */}
      <View style={[styles.tabBar, { backgroundColor: colors.tabBarBg, borderTopColor: colors.border }]}>
        {isAdmin ? (
          <>
            <NavItem id="admin" icon={ShieldCheck} label="Administrar" />
            <NavItem id="history" icon={History} label="Histórico" />
          </>
        ) : (
          <>
            <NavItem id="maioAmarelo" icon={HeartPulse} label="Campanha" />
            
            {/* Driver-Specific Tabs */}
            {isDriver && <NavItem id="dashboard" icon={Car} label="Conduzir" />}
            {isDriver && tripController.isDriving && <NavItem id="hud" icon={Car} label="Modo HUD" />}
            
            {/* Passenger-Specific/General Tabs */}
            <NavItem id="passenger" icon={Users} label="Auditoria" />
            <NavItem id="challenges" icon={Award} label="Vantagens" />
            <NavItem id="history" icon={History} label="Histórico" />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  splashBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  splashText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  campaignBanner: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 6,
    zIndex: 10,
  },
  campaignText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#351603',
    letterSpacing: 0.5,
  },
  mainContent: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 56,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: '100%',
  },
  navText: {
    fontSize: 8,
    fontWeight: '800',
  },
});
