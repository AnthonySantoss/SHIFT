import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import {
  HeartPulse,
  Car,
  Users,
  Award,
  ShieldCheck,
  MapPin,
  User,
} from "lucide-react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Import Views
import Header from "./src/views/components/Header";
import Notification from "./src/views/components/Notification";
import AuthScreen from "./src/views/screens/AuthScreen";
import MaioAmareloScreen from "./src/views/screens/MaioAmareloScreen";
import DashboardScreen from "./src/views/screens/DashboardScreen";
import AuditoriaScreen from "./src/views/screens/AuditoriaScreen";
import HUDScreen from "./src/views/screens/HUDScreen";
import VantagensScreen from "./src/views/screens/VantagensScreen";
import HistoricoScreen from "./src/views/screens/HistoricoScreen";
import AdminScreen from "./src/views/screens/AdminScreen";

// Import Controllers & Models
import { useTripController } from "./src/controllers/trip.controller";
import { useAuditController } from "./src/controllers/audit.controller";
import { useAuthController } from "./src/controllers/auth.controller";
import ApiService from "./src/models/api.model";
import getTheme from "./src/theme";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = getTheme(isDarkMode);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notification, setNotification] = useState(null);
  const [profileData, setProfileData] = useState(null);

  const refreshProfile = async () => {
    try {
      const data = await ApiService.fetchSelfProfile();
      setProfileData(data?.profile ?? null);
    } catch (error) {
      setProfileData(null);
    }
  };

  const authController = useAuthController(setNotification, refreshProfile);
  const tripController = useTripController(
    soundEnabled,
    setNotification,
    refreshProfile,
    authController.isAuthenticated,
  );
  const auditController = useAuditController(
    soundEnabled,
    setNotification,
    refreshProfile,
  );

  const [activeTab, setActiveTab] = useState("maioAmarelo");

  useEffect(() => {
    if (authController.isAuthenticated && authController.user) {
      if (authController.user.role === "passenger") {
        setActiveTab("passenger");
      } else if (authController.user.role === "admin") {
        setActiveTab("admin");
      } else {
        setActiveTab("maioAmarelo");
      }
    }
  }, [authController.isAuthenticated]);

  if (authController.isLoading) {
    return (
      <SafeAreaProvider>
        <View
          style={[styles.splashContainer, { backgroundColor: theme.colors.bg }]}
        >
          <View
            style={[
              styles.splashBadge,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <ShieldCheck
              size={50}
              color={theme.colors.onPrimary}
              strokeWidth={2.5}
            />
          </View>
          <Text style={[styles.splashText, { color: theme.colors.title }]}>
            A carregar SHIFT...
          </Text>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ marginTop: 12 }}
          />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!authController.isAuthenticated) {
    return (
      <SafeAreaProvider>
        <SafeAreaView
          style={[styles.safeArea, { backgroundColor: theme.colors.bg }]}
        >
          <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
          <Notification
            notification={notification}
            setNotification={setNotification}
            isDarkMode={isDarkMode}
          />
          <AuthScreen isDarkMode={isDarkMode} controller={authController} />
          <Modal
            visible={!!tripController.showPermissionModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => tripController.setShowPermissionModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalContainer,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${theme.colors.primary}1A` },
                  ]}
                >
                  <MapPin size={30} color={theme.colors.primary} />
                </View>
                <Text
                  style={[styles.modalTitle, { color: theme.colors.title }]}
                >
                  Localização
                </Text>
                <Text
                  style={[
                    styles.modalDescription,
                    { color: theme.colors.text },
                  ]}
                >
                  O SHIFT necessita de aceder à sua localização para monitorizar
                  a velocidade e detetar zonas de risco.
                </Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.cancelBtn,
                      { borderColor: theme.colors.border },
                    ]}
                    onPress={() => tripController.setShowPermissionModal(false)}
                  >
                    <Text
                      style={[
                        styles.cancelBtnText,
                        { color: theme.colors.muted },
                      ]}
                    >
                      Agora Não
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.confirmBtn,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={tripController.requestLocationPermission}
                  >
                    <Text
                      style={[
                        styles.confirmBtnText,
                        { color: theme.colors.onPrimary },
                      ]}
                    >
                      Permitir
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const isDriver = authController.user && authController.user.role === "driver";
  const isAdmin = authController.user && authController.user.role === "admin";

  const NavItem = ({ id, icon: Icon, label }) => {
    const isActive = activeTab === id;
    const color = isActive ? theme.colors.primary : theme.colors.muted;
    return (
      <TouchableOpacity onPress={() => setActiveTab(id)} style={styles.navItem}>
        <Icon
          size={isActive ? 22 : 18}
          color={color}
          strokeWidth={isActive ? 2.5 : 2}
        />
        <Text
          style={[
            styles.navText,
            { color, fontWeight: isActive ? "900" : "700" },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.colors.bg }]}
      >
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <View
          style={[
            styles.campaignBanner,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <HeartPulse size={12} color={theme.colors.onPrimary} />
          <Text
            style={[styles.campaignText, { color: theme.colors.onPrimary }]}
          >
            MAIO AMARELO: CONDUZA COM RESPONSABILIDADE
          </Text>
        </View>
        <Notification
          notification={notification}
          setNotification={setNotification}
          isDarkMode={isDarkMode}
        />
        <Header
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />
        <View
          style={[styles.mainContent, { backgroundColor: theme.colors.bg }]}
        >
          {activeTab === "maioAmarelo" && (
            <MaioAmareloScreen
              isDarkMode={isDarkMode}
              setActiveTab={setActiveTab}
              refreshProfile={refreshProfile}
            />
          )}
          {activeTab === "dashboard" && isDriver && (
            <DashboardScreen
              isDarkMode={isDarkMode}
              controller={tripController}
            />
          )}
          {activeTab === "passenger" && (
            <AuditoriaScreen
              isDarkMode={isDarkMode}
              controller={auditController}
            />
          )}
          {activeTab === "hud" && isDriver && (
            <HUDScreen
              isDriving={tripController.isDriving}
              speed={tripController.speed}
              score={tripController.score}
              distance={tripController.distance}
            />
          )}
          {activeTab === "challenges" && (
            <VantagensScreen
              isDarkMode={isDarkMode}
              score={tripController.score}
              profileData={profileData}
            />
          )}
          {activeTab === "history" && (
            <HistoricoScreen
              isDarkMode={isDarkMode}
              profileData={profileData}
              refreshProfile={refreshProfile}
              handleLogout={authController.handleLogout}
            />
          )}
          {activeTab === "admin" && isAdmin && (
            <AdminScreen isDarkMode={isDarkMode} />
          )}
        </View>
        <View
          style={[
            styles.tabBar,
            {
              backgroundColor: theme.colors.card,
              borderTopColor: theme.colors.border,
            },
          ]}
        >
          {isAdmin ? (
            <>
              <NavItem id="admin" icon={ShieldCheck} label="Gestão" />
              <NavItem id="history" icon={User} label="Perfil" />
            </>
          ) : (
            <>
              <NavItem id="maioAmarelo" icon={HeartPulse} label="Missões" />
              {isDriver && (
                <NavItem id="dashboard" icon={Car} label="Volante" />
              )}
              {isDriver && tripController.isDriving && (
                <NavItem id="hud" icon={Car} label="HUD" />
              )}
              <NavItem id="passenger" icon={Users} label="Auditar" />
              <NavItem id="challenges" icon={Award} label="Clube" />
              <NavItem id="history" icon={User} label="Perfil" />
            </>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  mainContent: { flex: 1 },
  splashContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  splashBadge: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
  },
  splashText: { fontSize: 18, fontWeight: "900", letterSpacing: 1 },
  campaignBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 8,
    height: 28,
  },
  campaignText: { fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  tabBar: {
    flexDirection: "row",
    height: 65,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    paddingTop: 10,
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  navText: { fontSize: 9, letterSpacing: 0.2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "900", textAlign: "center" },
  modalDescription: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { fontSize: 14, fontWeight: "800" },
  confirmBtn: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: { fontSize: 14, fontWeight: "900" },
});
