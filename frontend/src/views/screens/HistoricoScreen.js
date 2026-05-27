import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  Award,
  User,
  Car,
  Star,
  ThumbsUp,
  MessageSquare,
  AlertTriangle,
  LogOut,
  Shield,
  ChevronRight,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import getTheme from "../../theme";

export default function HistoricoScreen({
  isDarkMode,
  profileData,
  refreshProfile,
  handleLogout,
}) {
  const theme = getTheme(isDarkMode);
  const [isLoadingProfile, setIsLoadingProfile] = useState(!profileData);
  const [loadError, setLoadError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Reanimated Shared Values
  const levelProgressSV = useSharedValue(0);

  useEffect(() => {
    if (profileData && profileData.level) {
      const { totalTrips, level } = profileData;
      const progress =
        level.next === "Max" ? 100 : (totalTrips / level.next) * 100;
      levelProgressSV.value = withTiming(Math.min(100, progress), {
        duration: 1500,
      });
    }
  }, [profileData]);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (profileData) {
        setLoadError(null);
        setIsLoadingProfile(false);
        return;
      }

      if (!refreshProfile) {
        setIsLoadingProfile(false);
        setLoadError("Não foi possível carregar o perfil.");
        return;
      }

      setIsLoadingProfile(true);
      setLoadError(null);

      try {
        await refreshProfile();
      } catch (error) {
        if (active) setLoadError("Não foi possível carregar o perfil.");
      } finally {
        if (active) setIsLoadingProfile(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [profileData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfile]);

  const animatedLevelStyle = useAnimatedStyle(() => {
    return {
      width: `${levelProgressSV.value}%`,
    };
  });

  if (isLoadingProfile) {
    return (
      <View style={[styles.loadingBox, { backgroundColor: theme.colors.bg }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          A carregar histórico...
        </Text>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={[styles.loadingBox, { backgroundColor: theme.colors.bg }]}>
        <Text
          style={[
            styles.loadingText,
            { color: theme.colors.text, textAlign: "center" },
          ]}
        >
          {loadError || "Sem dados de perfil disponíveis."}
        </Text>
        {refreshProfile && (
          <TouchableOpacity
            onPress={async () => {
              setLoadError(null);
              setIsLoadingProfile(true);
              try {
                await refreshProfile();
              } catch (error) {
                setLoadError("Não foi possível carregar o perfil.");
              } finally {
                setIsLoadingProfile(false);
              }
            }}
            style={[styles.retryBtn, { borderColor: theme.colors.primary }]}
            activeOpacity={0.85}
          >
            <Text
              style={[styles.retryBtnText, { color: theme.colors.primary }]}
            >
              Tentar novamente
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const {
    name,
    plate,
    rating,
    totalTrips,
    score,
    feedbacks,
    recentTrips,
    level,
    badges,
  } = profileData;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.bg }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
      }>
      {/* Premium Profile Header Card */}
      <View
        style={[
          styles.profileCard,
          { backgroundColor: theme.colors.secondary },
          theme.shadows.medium,
        ]}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <User size={30} color={theme.colors.white} />
            {level && (
              <View
                style={[
                  styles.levelBadge,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Shield size={10} color={theme.colors.black} />
              </View>
            )}
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.profileName}>{name}</Text>
            <View style={styles.plateBadge}>
              <Car size={12} color={theme.colors.white} />
              <Text style={styles.plateText}>{plate}</Text>
            </View>
          </View>
        </View>

        {/* New: Level Progress Bar */}
        {level && (
          <View style={styles.levelProgressContainer}>
            <View style={styles.levelInfoRow}>
              <Text style={styles.levelName}>{level.name}</Text>
              <Text style={styles.levelNext}>
                Próximo nível: {level.next} viagens
              </Text>
            </View>
            <View style={styles.levelBarBg}>
              <Animated.View
                style={[
                  styles.levelBarFill,
                  animatedLevelStyle,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
            </View>
          </View>
        )}

        {/* Global Stars and Audits Grid */}
        <View style={styles.divider} />
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>AVALIAÇÃO GERAL</Text>
            <View style={styles.ratingStarsRow}>
              <Text
                style={[styles.ratingNumber, { color: theme.colors.primary }]}
              >
                {rating}
              </Text>
              <View style={styles.starsWrapper}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={11}
                    color={
                      s <= Math.floor(rating)
                        ? theme.colors.primary
                        : "rgba(255,255,255,0.3)"
                    }
                    fill={
                      s <= Math.floor(rating)
                        ? theme.colors.primary
                        : "transparent"
                    }
                  />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.statCol}>
            <Text style={styles.statLabel}>CORRIDAS AUDITADAS</Text>
            <Text style={styles.auditsNumber}>{totalTrips}</Text>
          </View>
        </View>
      </View>

      {/* Real Badges Section */}
      {badges && badges.length > 0 && (
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
            theme.shadows.soft,
          ]}
        >
          <View style={styles.cardHeader}>
            <Award size={16} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.title }]}>
              Suas Conquistas
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.badgesHorizontal}
          >
            {badges.map((b, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                }
                style={[
                  styles.badgeMedal,
                  { backgroundColor: `${theme.colors.primary}1A` },
                ]}
              >
                <Award size={20} color={theme.colors.primary} />
                <Text
                  style={[
                    styles.badgeMedalText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {b}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Passenger Feedbacks */}
      <View
        style={[
          styles.badgesCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
          theme.shadows.soft,
        ]}
      >
        <View style={styles.badgesHeader}>
          <ThumbsUp size={16} color={theme.colors.success} />
          <Text style={[styles.badgesTitle, { color: theme.colors.title }]}>
            Destaques da Comunidade
          </Text>
        </View>
        <View style={styles.badgesWrapper}>
          {feedbacks.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.badgeItem,
                {
                  backgroundColor: theme.colors.bg,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.badgeCount, { color: theme.colors.title }]}>
                {item.count}
              </Text>
              <Text style={[styles.badgeLabel, { color: theme.colors.text }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Feed list of audits */}
      <Text style={[styles.sectionTitle, { color: theme.colors.title }]}>
        {plate === "Passageiro Cidadão"
          ? "ÚLTIMAS AUDITORIAS SUBMETIDAS"
          : "ÚLTIMAS AUDITORIAS RECEBIDAS"}
      </Text>

      <View style={styles.tripsFeed}>
        {recentTrips.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            Ainda não possui registos de auditoria.
          </Text>
        ) : (
          recentTrips.map((trip) => (
            <View
              key={trip.id}
              style={[
                styles.tripCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
                theme.shadows.soft,
              ]}
            >
              <View style={styles.tripCardHeader}>
                <View>
                  <Text
                    style={[styles.tripDate, { color: theme.colors.title }]}
                  >
                    {trip.date}
                  </Text>
                  <View style={styles.tripStarsWrapper}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={10}
                        color={
                          s <= trip.stars
                            ? theme.colors.primary
                            : theme.colors.border
                        }
                        fill={
                          s <= trip.stars ? theme.colors.primary : "transparent"
                        }
                      />
                    ))}
                    <View
                      style={[
                        styles.tripScoreBadge,
                        { backgroundColor: `${theme.colors.success}1A` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tripScoreText,
                          { color: theme.colors.success },
                        ]}
                      >
                        Score: {trip.score}%
                      </Text>
                    </View>
                  </View>
                </View>

                {trip.issue && (
                  <View
                    style={[
                      styles.issueBadge,
                      { backgroundColor: `${theme.colors.danger}1A` },
                    ]}
                  >
                    <AlertTriangle size={10} color={theme.colors.danger} />
                    <Text
                      style={[styles.issueText, { color: theme.colors.danger }]}
                    >
                      {trip.issue}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.contextRow}>
                <Text
                  style={[styles.contextText, { color: theme.colors.text }]}
                >
                  Contexto: {trip.context}
                </Text>
              </View>

              {trip.feedback ? (
                <View
                  style={[
                    styles.feedbackBox,
                    { backgroundColor: theme.colors.bg },
                  ]}
                >
                  <MessageSquare
                    size={12}
                    color={theme.colors.secondary}
                    style={styles.feedbackIcon}
                  />
                  <Text
                    style={[
                      styles.feedbackTextBody,
                      { color: theme.colors.title },
                    ]}
                  >
                    "{trip.feedback}"
                  </Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </View>

      {/* Logout button */}
      {handleLogout && (
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            Alert.alert(
              "Encerrar Sessão",
              "Tem a certeza que deseja sair do SHIFT?",
              [
                { text: "Cancelar", style: "cancel" },
                { text: "Sair", style: "destructive", onPress: handleLogout },
              ],
            );
          }}
          style={[styles.logoutBtn, { borderColor: theme.colors.danger }]}
          activeOpacity={0.8}
        >
          <LogOut size={16} color={theme.colors.danger} />
          <Text style={[styles.logoutBtnText, { color: theme.colors.danger }]}>
            Encerrar Sessão
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 16,
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: "700",
  },
  retryBtn: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: "800",
  },
  profileCard: {
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  levelBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#0F172A",
  },
  profileMeta: {
    justifyContent: "center",
    gap: 4,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  plateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  plateText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  levelProgressContainer: {
    marginTop: 4,
  },
  levelInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  levelName: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  levelNext: {
    fontSize: 8.5,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.5)",
  },
  levelBarBg: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 99,
    overflow: "hidden",
  },
  levelBarFill: {
    height: "100%",
    borderRadius: 99,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  statsRow: {
    flexDirection: "row",
  },
  statCol: {
    flex: 1,
    gap: 6,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: "900",
    color: "rgba(255, 255, 255, 0.5)",
    letterSpacing: 0.5,
  },
  ratingStarsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  ratingNumber: {
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 26,
  },
  starsWrapper: {
    flexDirection: "row",
    gap: 2.5,
    marginBottom: 3,
  },
  auditsNumber: {
    fontSize: 26,
    fontWeight: "950",
    color: "#FFFFFF",
    lineHeight: 26,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "900",
  },
  badgesHorizontal: {
    flexDirection: "row",
    marginTop: 4,
  },
  badgeMedal: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  badgeMedalText: {
    fontSize: 9,
    fontWeight: "900",
    textAlign: "center",
  },
  badgesCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  badgesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badgesTitle: {
    fontSize: 12,
    fontWeight: "900",
  },
  badgesWrapper: {
    flexDirection: "row",
    gap: 8,
  },
  badgeItem: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    alignItems: "center",
    gap: 2,
  },
  badgeCount: {
    fontSize: 15,
    fontWeight: "900",
  },
  badgeLabel: {
    fontSize: 7.5,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginTop: 8,
    paddingLeft: 4,
  },
  tripsFeed: {
    gap: 12,
  },
  tripCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  tripCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  tripDate: {
    fontSize: 12,
    fontWeight: "800",
  },
  tripStarsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 4,
  },
  tripScoreBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginLeft: 6,
  },
  tripScoreText: {
    fontSize: 8,
    fontWeight: "900",
  },
  issueBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  issueText: {
    fontSize: 8,
    fontWeight: "900",
  },
  contextRow: {
    flexDirection: "row",
  },
  contextText: {
    fontSize: 10,
    fontWeight: "700",
  },
  feedbackBox: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 10,
    gap: 8,
    alignItems: "flex-start",
    marginTop: 4,
  },
  feedbackIcon: {
    marginTop: 1.5,
  },
  feedbackTextBody: {
    flex: 1,
    fontSize: 10.5,
    fontWeight: "600",
    fontStyle: "italic",
    lineHeight: 14,
  },
  emptyText: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 20,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderWidth: 1.5,
    borderRadius: 14,
    gap: 8,
    marginTop: 18,
    marginBottom: 10,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: "900",
  },
});
