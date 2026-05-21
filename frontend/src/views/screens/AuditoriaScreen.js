import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ShieldCheck, Car, Play, Square, ThumbsUp, ThumbsDown, Smartphone, Siren, AlertTriangle, Zap, Star, Award, History, MessageSquare, AlertOctagon } from 'lucide-react-native';

export default function AuditoriaScreen({ isDarkMode, controller }) {
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

  // Colors
  const colors = {
    bg: isDarkMode ? '#0F1015' : '#F1F5F9',
    cardBg: isDarkMode ? '#171923' : '#FFFFFF',
    border: isDarkMode ? '#222530' : '#E2E8F0',
    title: isDarkMode ? '#FFFFFF' : '#0F172A',
    text: isDarkMode ? '#94A3B8' : '#475569',
    inputBg: isDarkMode ? '#0B0C10' : '#F8FAFC',
    successBg: isDarkMode ? 'rgba(16,185,129,0.1)' : '#ECFDF5',
    dangerBg: isDarkMode ? 'rgba(239,68,68,0.1)' : '#FFF5F5',
  };

  // -------------------------------------------------------------
  // STATE 1: SEARCH & START AUDIT (OFFLINE/ONLINE LOOKUP)
  // -------------------------------------------------------------
  if (!isMonitoringRide && !showReview) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.badgeRow}>
            <View style={styles.crowdBade}>
              <Text style={styles.crowdBadgeText}>CROWDSOURCING</Text>
            </View>
          </View>
          
          <Text style={[styles.cardTitle, { color: colors.title }]}>Auditoria Cidadã</Text>
          <Text style={[styles.cardSubtitle, { color: colors.text }]}>
            Avalie anonimamente a segurança do trajeto e ajude a prevenir acidentes no trânsito.
          </Text>

          {/* Search Inputs */}
          <View style={styles.searchForm}>
            {/* Plate Input with Search Trigger */}
            <View style={styles.inputWrapper}>
              <Car size={16} color={colors.text} style={styles.inputIcon} />
              <TextInput
                value={searchPlate}
                onChangeText={(text) => setSearchPlate(text.toUpperCase())}
                placeholder="Matrícula do Veículo (Ex: ABC-1234)"
                placeholderTextColor={isDarkMode ? '#475569' : '#94A3B8'}
                style={[styles.input, { color: colors.title, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                maxLength={8}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                onPress={handlePlateSearch}
                style={styles.searchBtn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.searchBtnText}>Pesquisar</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Context Inputs */}
            <View style={styles.contextGrid}>
              <View style={styles.contextBox}>
                <Text style={styles.contextLabel}>TIPO DE VIA</Text>
                <View style={[styles.selectBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  {/* Custom selection links */}
                  <TouchableOpacity 
                    onPress={() => setRoadContext('urbana')} 
                    style={[styles.selectOption, roadContext === 'urbana' && styles.selectOptionActive]}
                  >
                    <Text style={[styles.selectOptionText, roadContext === 'urbana' && styles.selectOptionTextActive]}>Urbana</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setRoadContext('rodovia')} 
                    style={[styles.selectOption, roadContext === 'rodovia' && styles.selectOptionActive]}
                  >
                    <Text style={[styles.selectOptionText, roadContext === 'rodovia' && styles.selectOptionTextActive]}>Autoestrada</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.contextBox}>
                <Text style={styles.contextLabel}>CONDIÇÕES</Text>
                <View style={[styles.selectBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <TouchableOpacity 
                    onPress={() => setWeatherContext('limpo')} 
                    style={[styles.selectOption, weatherContext === 'limpo' && styles.selectOptionActive]}
                  >
                    <Text style={[styles.selectOptionText, weatherContext === 'limpo' && styles.selectOptionTextActive]}>Limpo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setWeatherContext('chuva')} 
                    style={[styles.selectOption, weatherContext === 'chuva' && styles.selectOptionActive]}
                  >
                    <Text style={[styles.selectOptionText, weatherContext === 'chuva' && styles.selectOptionTextActive]}>Chuva</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setWeatherContext('noite')} 
                    style={[styles.selectOption, weatherContext === 'noite' && styles.selectOptionActive]}
                  >
                    <Text style={[styles.selectOptionText, weatherContext === 'noite' && styles.selectOptionTextActive]}>Noite</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Start Button */}
            <TouchableOpacity
              onPress={handleStartAudit}
              style={styles.startBtn}
              activeOpacity={0.8}
            >
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.startBtnText}>Iniciar Avaliação</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Searched Driver Profile Details Card */}
        {searchedDriver && (
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, marginTop: 4 }]}>
            {searchedDriver.driver.status === 'danger' && (
              <View style={[styles.riskWarningBox, { backgroundColor: colors.dangerBg }]}>
                <AlertOctagon size={18} color="#EF4444" />
                <Text style={styles.riskWarningText}>
                  Histórico de Condução Perigosa: Vários relatos de condução agressiva esta semana.
                </Text>
              </View>
            )}

            <View style={styles.driverProfileHeader}>
              <View style={styles.driverAvatar}>
                <ShieldCheck size={24} color="#6366F1" />
              </View>
              <View style={styles.driverMainDetails}>
                <Text style={[styles.driverName, { color: colors.title }]}>{searchedDriver.driver.name}</Text>
                <View style={styles.plateRow}>
                  <Car size={12} color="#94A3B8" />
                  <Text style={styles.driverPlate}>{searchedDriver.driver.plate}</Text>
                </View>
              </View>
            </View>

            <View style={styles.driverStatsGrid}>
              <View style={[styles.driverStatBox, { backgroundColor: colors.bg }]}>
                <Text style={styles.driverStatLabel}>SCORE COMUNIDADE</Text>
                <Text style={[styles.driverStatValue, searchedDriver.driver.status === 'danger' ? styles.dangerText : styles.successText]}>
                  {searchedDriver.driver.score}%
                </Text>
              </View>
              <View style={[styles.driverStatBox, { backgroundColor: colors.bg }]}>
                <Text style={styles.driverStatLabel}>CORRIDAS AUDITADAS</Text>
                <Text style={[styles.driverStatValue, { color: colors.title }]}>{searchedDriver.driver.trips}</Text>
              </View>
            </View>

            {searchedDriver.history && searchedDriver.history.length > 0 && (
              <View style={styles.historySection}>
                <View style={styles.historyHeader}>
                  <History size={14} color={colors.text} />
                  <Text style={[styles.historyTitle, { color: colors.text }]}>REGISTOS RECENTES</Text>
                </View>
                {searchedDriver.history.map((hist, idx) => (
                  <View key={idx} style={[styles.historyRow, { borderBottomColor: colors.border }]}>
                    <View>
                      <Text style={[styles.histDate, { color: colors.title }]}>{hist.date}</Text>
                      {hist.issue && <Text style={styles.histIssue}>⚠️ {hist.issue}</Text>}
                    </View>
                    <View style={styles.histScoreCol}>
                      <Text style={[styles.histScore, hist.status === 'danger' ? styles.dangerText : styles.successText]}>
                        Score: {hist.score}%
                      </Text>
                      <Text style={[styles.histDuration, { color: colors.text }]}>{hist.duration}</Text>
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
      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.monitoringHeader}>
            <View>
              <View style={styles.monitoringPlateBadge}>
                <Text style={styles.monitoringPlateText}>{searchPlate.toUpperCase()}</Text>
              </View>
              <Text style={styles.monitoringContextText}>
                Contexto: {roadContext === 'urbana' ? 'Urbana' : 'Autoestrada'} • {weatherContext === 'limpo' ? 'Tempo Limpo' : weatherContext === 'chuva' ? 'Chuva' : 'Noite'}
              </Text>
            </View>
            <View style={styles.liveScoreBadge}>
              <Text style={styles.liveScoreLabel}>SCORE LIVE</Text>
              <Text style={[styles.liveScoreVal, score > 80 ? styles.successText : score > 60 ? styles.warningText : styles.dangerText]}>
                {score}%
              </Text>
            </View>
          </View>

          {/* POSITIVE ACTIONS GRID */}
          <View style={styles.evaluationBlock}>
            <View style={styles.evaluationBlockTitleRow}>
              <ThumbsUp size={14} color="#10B981" />
              <Text style={styles.evaluationBlockTitleSuccess}>PONTOS POSITIVOS</Text>
            </View>
            <View style={styles.buttonsGrid}>
              <TouchableOpacity
                onPress={() => handlePositiveReport('Direção Suave')}
                style={[styles.evalGridBtn, positiveActions.includes('Direção Suave') && styles.successBtnActive, { backgroundColor: colors.bg, borderColor: colors.border }]}
              >
                <Text style={[styles.evalGridBtnText, { color: colors.title }]}>Suavidade</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePositiveReport('Uso do Cinto')}
                style={[styles.evalGridBtn, positiveActions.includes('Uso do Cinto') && styles.successBtnActive, { backgroundColor: colors.bg, borderColor: colors.border }]}
              >
                <Text style={[styles.evalGridBtnText, { color: colors.title }]}>Exigiu Cinto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePositiveReport('Velocidade Adequada')}
                style={[styles.evalGridBtn, positiveActions.includes('Velocidade Adequada') && styles.successBtnActive, { backgroundColor: colors.bg, borderColor: colors.border }]}
              >
                <Text style={[styles.evalGridBtnText, { color: colors.title }]}>Velocidade Ideal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePositiveReport('Muito Focado')}
                style={[styles.evalGridBtn, positiveActions.includes('Muito Focado') && styles.successBtnActive, { backgroundColor: colors.bg, borderColor: colors.border }]}
              >
                <Text style={[styles.evalGridBtnText, { color: colors.title }]}>Muito Focado</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* INFRACTIONS GRID */}
          <View style={styles.evaluationBlock}>
            <View style={styles.evaluationBlockTitleRow}>
              <ThumbsDown size={14} color="#EF4444" />
              <Text style={styles.evaluationBlockTitleDanger}>INFRAÇÕES (DESCONTA SCORE)</Text>
            </View>
            <View style={styles.buttonsGrid}>
              <TouchableOpacity
                onPress={() => handleInfractionReport('Uso de Telemóvel')}
                style={[styles.evalGridBtn, infractions.includes('Uso de Telemóvel') && styles.dangerBtnActive, { backgroundColor: colors.bg, borderColor: colors.border }]}
              >
                <Smartphone size={12} color="#EF4444" />
                <Text style={[styles.evalGridBtnText, { color: colors.title }]}>Celular</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleInfractionReport('Avanço de Sinal')}
                style={[styles.evalGridBtn, infractions.includes('Avanço de Sinal') && styles.dangerBtnActive, { backgroundColor: colors.bg, borderColor: colors.border }]}
              >
                <Siren size={12} color="#EF4444" />
                <Text style={[styles.evalGridBtnText, { color: colors.title }]}>Sinal Fechado</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleInfractionReport('Travagem Brusca')}
                style={[styles.evalGridBtn, infractions.includes('Travagem Brusca') && styles.dangerBtnActive, { backgroundColor: colors.bg, borderColor: colors.border }]}
              >
                <AlertTriangle size={12} color="#EF4444" />
                <Text style={[styles.evalGridBtnText, { color: colors.title }]}>Brusco</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleInfractionReport('Excesso de Velocidade')}
                style={[styles.evalGridBtn, infractions.includes('Excesso de Velocidade') && styles.dangerBtnActive, { backgroundColor: colors.bg, borderColor: colors.border }]}
              >
                <Zap size={12} color="#EF4444" />
                <Text style={[styles.evalGridBtnText, { color: colors.title }]}>Corre Demais</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stop Audit Button */}
          <TouchableOpacity
            onPress={handleStopAudit}
            style={styles.stopMonitoringBtn}
            activeOpacity={0.8}
          >
            <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.stopMonitoringBtnText}>Encerrar Viagem</Text>
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
      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
        <View style={[styles.reviewCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.reviewAvatarBox}>
            <ShieldCheck size={28} color="#6366F1" />
          </View>

          <Text style={[styles.reviewTitle, { color: colors.title }]}>Auditoria Concluída</Text>
          <Text style={styles.reviewSubtitle}>Qual o nível de segurança e responsabilidade deste condutor?</Text>

          {/* Star Selector */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRideRating(star)}
                activeOpacity={0.7}
              >
                <Star
                  size={36}
                  color={star <= rideRating ? '#F59E0B' : isDarkMode ? '#334155' : '#E2E8F0'}
                  fill={star <= rideRating ? '#F59E0B' : 'transparent'}
                  style={styles.starIcon}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Calculated Score Box */}
          <View style={[styles.reviewScoreBox, { backgroundColor: colors.bg }]}>
            <Text style={[styles.reviewScoreLabel, { color: colors.text }]}>SCORE FINAL CALCULADO</Text>
            <Text style={[styles.reviewScoreVal, score > 80 ? styles.successText : score > 60 ? styles.warningText : styles.dangerText]}>
              {score}%
            </Text>
          </View>

          {/* Feedback Commentary Input */}
          <View style={styles.commentContainer}>
            <MessageSquare size={14} color={colors.text} style={styles.commentIcon} />
            <TextInput
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="Adicione observações ou feedbacks extras sobre a viagem..."
              placeholderTextColor={isDarkMode ? '#475569' : '#94A3B8'}
              style={[styles.commentInput, { color: colors.title, backgroundColor: colors.bg, borderColor: colors.border }]}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={submitAudit}
            style={styles.submitReviewBtn}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitReviewBtnText}>Enviar Relatório</Text>
                <Award size={16} color="#FFFFFF" />
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
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  crowdBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#6366F1',
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
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchBtnText: {
    color: '#FFFFFF',
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
    color: '#94A3B8',
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
  selectOptionActive: {
    backgroundColor: '#6366F1',
  },
  selectOptionText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
  selectOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  startBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 4,
  },
  startBtnText: {
    color: '#FFFFFF',
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
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  riskWarningText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
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
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
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
    color: '#94A3B8',
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
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  driverStatValue: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  successText: {
    color: '#10B981',
  },
  warningText: {
    color: '#F97316',
  },
  dangerText: {
    color: '#EF4444',
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
    color: '#EF4444',
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
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  monitoringPlateText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#6366F1',
  },
  monitoringContextText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 6,
  },
  liveScoreBadge: {
    alignItems: 'flex-end',
  },
  liveScoreLabel: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#94A3B8',
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
    color: '#10B981',
    letterSpacing: 0.5,
  },
  evaluationBlockTitleDanger: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#EF4444',
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
  successBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  dangerBtnActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  evalGridBtnText: {
    fontSize: 10,
    fontWeight: '800',
  },
  stopMonitoringBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  stopMonitoringBtnText: {
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
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
    color: '#94A3B8',
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
  starIcon: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    backgroundColor: '#6366F1',
    borderRadius: 12,
    height: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 8,
  },
  submitReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
