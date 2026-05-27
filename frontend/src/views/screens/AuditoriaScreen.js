import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ShieldCheck, Car, Play, Square, ThumbsUp, ThumbsDown, Smartphone, Siren, AlertTriangle, Zap, Star, Award, History, MessageSquare, AlertOctagon, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import getTheme from '../../theme';

export default function AuditoriaScreen({ isDarkMode, controller }) {
  const theme = getTheme(isDarkMode);
  const {
    searchPlate,
    setSearchPlate,
    searchedDriver,
    isMonitoringRide,
    showReview,
    rideRating,
    setRideRating,
    roadContext,
    setRoadContext,
    weatherContext,
    setWeatherContext,
    score,
    positiveActions,
    infractions,
    feedbackText,
    setFeedbackText,
    isLoading,
    handlePlateSearch,
    handleStartAudit,
    handlePositiveReport,
    handleInfractionReport,
    handleStopAudit,
    submitAudit
  } = controller;

  // -------------------------------------------------------------
  // STATE 1: SEARCH & START AUDIT (OFFLINE/ONLINE LOOKUP)
  // -------------------------------------------------------------
  if (!isMonitoringRide && !showReview) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.bg }]} contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, theme.shadows.soft]}>
          <View style={styles.badgeRow}>
            <View style={[styles.crowdBade, { backgroundColor: `${theme.colors.primary}26` }]}>
              <Text style={[styles.crowdBadgeText, { color: theme.colors.primary }]}>CROWDSOURCING</Text>
            </View>
          </View>
          
          <Text style={[styles.cardTitle, { color: theme.colors.title }]}>Relatório de Segurança</Text>
          <Text style={[styles.cardSubtitle, { color: theme.colors.text }]}>
            Sua avaliação ajuda a construir um trânsito mais seguro. Identifique comportamentos e colabore com a comunidade.
          </Text>

          {/* New: Nearby Risk Zones Alert */}
          {searchedDriver && !searchedDriver.found && (
            <View style={[styles.nearbyAlert, { backgroundColor: `${theme.colors.warning}1A`, borderColor: `${theme.colors.warning}33` }]}>
              <AlertTriangle size={14} color={theme.colors.warning} />
              <Text style={[styles.nearbyAlertText, { color: theme.colors.warning }]}>
                Nesta região, 40% das auditorias relataram excesso de velocidade.
              </Text>
            </View>
          )}

          {/* Search Inputs */}
          <View style={styles.searchForm}>
            {/* Plate Input with Search Trigger */}
            <View style={styles.inputWrapper}>
              <Car size={18} color={theme.colors.text} style={styles.inputIcon} />
              <TextInput
                value={searchPlate}
                onChangeText={(text) => setSearchPlate(text.toUpperCase())}
                placeholder="Placa do Veículo (Ex: ABC1D23)"
                placeholderTextColor={theme.colors.muted}
                style={[styles.input, { color: theme.colors.title, backgroundColor: theme.colors.input, borderColor: theme.colors.border }]}
                maxLength={8}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  handlePlateSearch();
                }}
                style={[styles.searchBtn, { backgroundColor: theme.colors.secondary }]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <Text style={[styles.searchBtnText, { color: theme.colors.white }]}>Verificar</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Context Inputs */}
            <View style={styles.contextGrid}>
              <View style={styles.contextBox}>
                <Text style={[styles.contextLabel, { color: theme.colors.muted }]}>AMBIENTE</Text>
                <View style={[styles.selectBox, { backgroundColor: theme.colors.input, borderColor: theme.colors.border }]}>
                  <TouchableOpacity 
                    onPress={() => {
                      Haptics.selectionAsync();
                      setRoadContext('urbana');
                    }} 
                    style={[styles.selectOption, roadContext === 'urbana' && { backgroundColor: theme.colors.secondary }]}
                  >
                    <Text style={[styles.selectOptionText, { color: theme.colors.muted }, roadContext === 'urbana' && { color: theme.colors.white, fontWeight: '900' }]}>Cidade</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      Haptics.selectionAsync();
                      setRoadContext('rodovia');
                    }} 
                    style={[styles.selectOption, roadContext === 'rodovia' && { backgroundColor: theme.colors.secondary }]}
                  >
                    <Text style={[styles.selectOptionText, { color: theme.colors.muted }, roadContext === 'rodovia' && { color: theme.colors.white, fontWeight: '900' }]}>Estrada</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.contextBox}>
                <Text style={[styles.contextLabel, { color: theme.colors.muted }]}>VISIBILIDADE</Text>
                <View style={[styles.selectBox, { backgroundColor: theme.colors.input, borderColor: theme.colors.border }]}>
                  <TouchableOpacity 
                    onPress={() => {
                      Haptics.selectionAsync();
                      setWeatherContext('limpo');
                    }} 
                    style={[styles.selectOption, weatherContext === 'limpo' && { backgroundColor: theme.colors.secondary }]}
                  >
                    <Text style={[styles.selectOptionText, { color: theme.colors.muted }, weatherContext === 'limpo' && { color: theme.colors.white, fontWeight: '900' }]}>Dia</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      Haptics.selectionAsync();
                      setWeatherContext('chuva');
                    }} 
                    style={[styles.selectOption, weatherContext === 'chuva' && { backgroundColor: theme.colors.secondary }]}
                  >
                    <Text style={[styles.selectOptionText, { color: theme.colors.muted }, weatherContext === 'chuva' && { color: theme.colors.white, fontWeight: '900' }]}>Chuva</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      Haptics.selectionAsync();
                      setWeatherContext('noite');
                    }} 
                    style={[styles.selectOption, weatherContext === 'noite' && { backgroundColor: theme.colors.secondary }]}
                  >
                    <Text style={[styles.selectOptionText, { color: theme.colors.muted }, weatherContext === 'noite' && { color: theme.colors.white, fontWeight: '900' }]}>Noite</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Start Button */}
            <TouchableOpacity
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                handleStartAudit();
              }}
              style={[styles.startBtn, { backgroundColor: theme.colors.secondary }]}
              activeOpacity={0.8}
            >
              <Play size={16} color={theme.colors.white} fill={theme.colors.white} />
              <Text style={[styles.startBtnText, { color: theme.colors.white }]}>Começar Monitoramento</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Searched Driver Profile Details Card */}
        {searchedDriver && (
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, marginTop: 4 }, theme.shadows.soft]}>
            {searchedDriver.driver.status === 'danger' && (
              <View style={[styles.riskWarningBox, { backgroundColor: `${theme.colors.danger}1A`, borderColor: `${theme.colors.danger}33` }]}>
                <AlertOctagon size={18} color={theme.colors.danger} />
                <Text style={[styles.riskWarningText, { color: theme.colors.danger }]}>
                  Atenção: Este veículo possui múltiplos alertas de direção perigosa recentemente.
                </Text>
              </View>
            )}

            <View style={styles.driverProfileHeader}>
              <View style={[styles.driverAvatar, { backgroundColor: `${theme.colors.secondary}1A` }]}>
                <ShieldCheck size={24} color={theme.colors.secondary} />
              </View>
              <View style={styles.driverMainDetails}>
                <Text style={[styles.driverName, { color: theme.colors.title }]}>{searchedDriver.driver.name}</Text>
                <View style={styles.plateRow}>
                  <Car size={12} color={theme.colors.muted} />
                  <Text style={[styles.driverPlate, { color: theme.colors.muted }]}>{searchedDriver.driver.plate}</Text>
                </View>
              </View>
            </View>

            <View style={styles.driverStatsGrid}>
              <View style={[styles.driverStatBox, { backgroundColor: theme.colors.bg }]}>
                <Text style={[styles.driverStatLabel, { color: theme.colors.muted }]}>SCORE DE SEGURANÇA</Text>
                <Text style={[styles.driverStatValue, { color: searchedDriver.driver.status === 'danger' ? theme.colors.danger : theme.colors.success }]}>
                  {searchedDriver.driver.score}%
                </Text>
              </View>
              <View style={[styles.driverStatBox, { backgroundColor: theme.colors.bg }]}>
                <Text style={[styles.driverStatLabel, { color: theme.colors.muted }]}>TOTAL DE AVALIAÇÕES</Text>
                <Text style={[styles.driverStatValue, { color: theme.colors.title }]}>{searchedDriver.driver.trips}</Text>
              </View>
            </View>

            {searchedDriver.history && searchedDriver.history.length > 0 && (
              <View style={styles.historySection}>
                <View style={styles.historyHeader}>
                  <History size={14} color={theme.colors.text} />
                  <Text style={[styles.historyTitle, { color: theme.colors.text }]}>ÚLTIMOS RELATOS</Text>
                </View>
                {searchedDriver.history.map((hist, idx) => (
                  <View key={idx} style={[styles.historyRow, { borderBottomColor: theme.colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.histDate, { color: theme.colors.title }]}>{hist.date}</Text>
                      {hist.issue && <Text style={[styles.histIssue, { color: theme.colors.danger }]}>⚠️ {hist.issue}</Text>}
                    </View>
                    <View style={styles.histScoreCol}>
                      <Text style={[styles.histScore, { color: hist.status === 'danger' ? theme.colors.danger : theme.colors.success }]}>
                        {hist.score}%
                      </Text>
                      <Text style={[styles.histDuration, { color: theme.colors.text }]}>{hist.duration}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    );
  }

  // -------------------------------------------------------------
  // STATE 2: ACTIVE LIVE MONITORING
  // -------------------------------------------------------------
  if (isMonitoringRide) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.bg }]} contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, theme.shadows.medium]}>
          <View style={styles.monitoringHeader}>
            <View>
              <View style={[styles.monitoringPlateBadge, { backgroundColor: `${theme.colors.secondary}26` }]}>
                <Text style={[styles.monitoringPlateText, { color: theme.colors.secondary }]}>{searchPlate.toUpperCase()}</Text>
              </View>
              <Text style={[styles.monitoringContextText, { color: theme.colors.muted }]}>
                Contexto: {roadContext === 'urbana' ? 'Cidade' : 'Estrada'} • {weatherContext === 'limpo' ? 'Dia' : weatherContext === 'chuva' ? 'Chuva' : 'Noite'}
              </Text>
            </View>
            <View style={styles.liveScoreBadge}>
              <Text style={[styles.liveScoreLabel, { color: theme.colors.muted }]}>SCORE AO VIVO</Text>
              <Text style={[styles.liveScoreVal, { color: score > 80 ? theme.colors.success : score > 60 ? theme.colors.warning : theme.colors.danger }]}>
                {score}%
              </Text>
            </View>
          </View>

          {/* POSITIVE ACTIONS GRID */}
          <View style={styles.evaluationBlock}>
            <View style={styles.evaluationBlockTitleRow}>
              <ThumbsUp size={14} color={theme.colors.success} />
              <Text style={[styles.evaluationBlockTitleSuccess, { color: theme.colors.success }]}>PONTOS POSITIVOS</Text>
            </View>
            <View style={styles.buttonsGrid}>
              {[
                { label: 'Suavidade', id: 'Direção Suave' },
                { label: 'Exigiu Cinto', id: 'Uso do Cinto' },
                { label: 'Velocidade Ideal', id: 'Velocidade Adequada' },
                { label: 'Muito Focado', id: 'Muito Focado' }
              ].map(btn => (
                <TouchableOpacity
                  key={btn.id}
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    handlePositiveReport(btn.id);
                  }}
                  style={[
                    styles.evalGridBtn, 
                    { backgroundColor: theme.colors.bg, borderColor: theme.colors.border },
                    positiveActions.includes(btn.id) && { backgroundColor: `${theme.colors.success}26`, borderColor: theme.colors.success }
                  ]}
                >
                  <Text style={[styles.evalGridBtnText, { color: theme.colors.title }, positiveActions.includes(btn.id) && { color: theme.colors.success }]}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* INFRACTIONS GRID */}
          <View style={styles.evaluationBlock}>
            <View style={styles.evaluationBlockTitleRow}>
              <ThumbsDown size={14} color={theme.colors.danger} />
              <Text style={[styles.evaluationBlockTitleDanger, { color: theme.colors.danger }]}>INFRAÇÕES (DESCONTA SCORE)</Text>
            </View>
            <View style={styles.buttonsGrid}>
              {[
                { label: 'Celular', id: 'Uso de Telemóvel', icon: Smartphone },
                { label: 'Sinal Fechado', id: 'Avanço de Sinal', icon: Siren },
                { label: 'Brusco', id: 'Travagem Brusca', icon: AlertTriangle },
                { label: 'Corre Demais', id: 'Excesso de Velocidade', icon: Zap }
              ].map(btn => (
                <TouchableOpacity
                  key={btn.id}
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    handleInfractionReport(btn.id);
                  }}
                  style={[
                    styles.evalGridBtn, 
                    { backgroundColor: theme.colors.bg, borderColor: theme.colors.border },
                    infractions.includes(btn.id) && { backgroundColor: `${theme.colors.danger}26`, borderColor: theme.colors.danger }
                  ]}
                >
                  <btn.icon size={12} color={infractions.includes(btn.id) ? theme.colors.danger : theme.colors.danger} />
                  <Text style={[styles.evalGridBtnText, { color: theme.colors.title }, infractions.includes(btn.id) && { color: theme.colors.danger }]}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stop Audit Button */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              handleStopAudit();
            }}
            style={[styles.stopMonitoringBtn, { backgroundColor: theme.colors.black }]}
            activeOpacity={0.8}
          >
            <Square size={16} color={theme.colors.white} fill={theme.colors.white} />
            <Text style={[styles.stopMonitoringBtnText, { color: theme.colors.white }]}>Encerrar Viagem</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // -------------------------------------------------------------
  // STATE 3: FINAL STAR REVIEW AND COMMENTS
  // -------------------------------------------------------------
  if (showReview) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.bg }]} contentContainerStyle={styles.content}>
        <View style={[styles.reviewCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, theme.shadows.medium]}>
          <View style={[styles.reviewAvatarBox, { backgroundColor: `${theme.colors.secondary}1A` }]}>
            <ShieldCheck size={28} color={theme.colors.secondary} />
          </View>

          <Text style={[styles.reviewTitle, { color: theme.colors.title }]}>Auditoria Concluída</Text>
          <Text style={[styles.reviewSubtitle, { color: theme.colors.muted }]}>Qual o nível de segurança e responsabilidade deste condutor?</Text>

          {/* Star Selector */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setRideRating(star);
                }}
                activeOpacity={0.7}
              >
                <Star
                  size={36}
                  color={star <= rideRating ? theme.colors.primary : theme.colors.border}
                  fill={star <= rideRating ? theme.colors.primary : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Calculated Score Box */}
          <View style={[styles.reviewScoreBox, { backgroundColor: theme.colors.bg }]}>
            <Text style={[styles.reviewScoreLabel, { color: theme.colors.text }]}>SCORE FINAL CALCULADO</Text>
            <Text style={[styles.reviewScoreVal, { color: score > 80 ? theme.colors.success : score > 60 ? theme.colors.warning : theme.colors.danger }]}>
              {score}%
            </Text>
          </View>

          {/* Feedback Commentary Input */}
          <View style={styles.commentContainer}>
            <MessageSquare size={14} color={theme.colors.muted} style={styles.commentIcon} />
            <TextInput
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="Adicione observações ou feedbacks extras sobre a viagem..."
              placeholderTextColor={theme.colors.muted}
              style={[styles.commentInput, { color: theme.colors.title, backgroundColor: theme.colors.bg, borderColor: theme.colors.border }]}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              submitAudit();
            }}
            style={[styles.submitReviewBtn, { backgroundColor: theme.colors.secondary }]}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <>
                <Text style={[styles.submitReviewBtnText, { color: theme.colors.white }]}>Enviar Relatório</Text>
                <Award size={16} color={theme.colors.white} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return null;
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
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  crowdBade: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  crowdBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  nearbyAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  nearbyAlertText: {
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
  },
  searchForm: {
    marginTop: 6,
    gap: 12,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 38,
    paddingRight: 90,
    fontSize: 12,
    fontWeight: '800',
  },
  searchBtn: {
    position: 'absolute',
    right: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchBtnText: {
    fontSize: 10,
    fontWeight: '900',
  },
  contextGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  contextBox: {
    flex: 1,
    gap: 6,
  },
  contextLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  selectBox: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    height: 38,
  },
  selectOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectOptionText: {
    fontSize: 9,
    fontWeight: '700',
  },
  startBtn: {
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  startBtnText: {
    fontSize: 13,
    fontWeight: '900',
  },
  riskWarningBox: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 12,
    gap: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  riskWarningText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
  },
  driverProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
    paddingBottom: 12,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverMainDetails: {
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 15,
    fontWeight: '900',
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  driverPlate: {
    fontSize: 10,
    fontWeight: '800',
  },
  driverStatsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 4,
  },
  driverStatBox: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
  },
  driverStatLabel: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  driverStatValue: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  historySection: {
    marginTop: 6,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  histDate: {
    fontSize: 11,
    fontWeight: '800',
  },
  histIssue: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  histScoreCol: {
    alignItems: 'flex-end',
  },
  histScore: {
    fontSize: 11,
    fontWeight: '900',
  },
  histDuration: {
    fontSize: 8.5,
    fontWeight: '600',
    marginTop: 2,
  },

  // -------------------------------------------------------------
  // ACTIVE MONITORING STYLING
  // -------------------------------------------------------------
  monitoringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
    paddingBottom: 12,
  },
  monitoringPlateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  monitoringPlateText: {
    fontSize: 13,
    fontWeight: '900',
  },
  monitoringContextText: {
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 6,
  },
  liveScoreBadge: {
    alignItems: 'flex-end',
  },
  liveScoreLabel: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  liveScoreVal: {
    fontSize: 22,
    fontWeight: '900',
  },
  evaluationBlock: {
    gap: 8,
    marginTop: 6,
  },
  evaluationBlockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  evaluationBlockTitleSuccess: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  evaluationBlockTitleDanger: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  evalGridBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 6,
    minWidth: '47%',
    flex: 1,
  },
  evalGridBtnText: {
    fontSize: 10,
    fontWeight: '800',
  },
  stopMonitoringBtn: {
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  stopMonitoringBtnText: {
    fontSize: 12,
    fontWeight: '900',
  },

  // -------------------------------------------------------------
  // REVIEW STYLING
  // -------------------------------------------------------------
  reviewCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  reviewAvatarBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  reviewSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  reviewScoreBox: {
    borderRadius: 14,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  reviewScoreLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  reviewScoreVal: {
    fontSize: 26,
    fontWeight: '900',
  },
  commentContainer: {
    width: '100%',
    position: 'relative',
    marginTop: 6,
  },
  commentIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  commentInput: {
    width: '100%',
    height: 80,
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 36,
    paddingRight: 12,
    paddingTop: 10,
    fontSize: 11.5,
    fontWeight: '700',
    textAlignVertical: 'top',
  },
  submitReviewBtn: {
    borderRadius: 12,
    height: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  submitReviewBtnText: {
    fontSize: 13,
    fontWeight: '900',
  },
});
