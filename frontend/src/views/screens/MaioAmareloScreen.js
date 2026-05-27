import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HeartPulse, Target, Users, Smartphone, CheckCircle, BookOpen, ChevronRight, Trophy, Star, Shield } from 'lucide-react-native';
import ApiService from '../../models/api.model';
import getTheme from '../../theme';
import Skeleton from '../components/Skeleton';

export default function MaioAmareloScreen({ isDarkMode, setActiveTab, refreshProfile }) {
  const theme = getTheme(isDarkMode);
  const [activeSubTab, setActiveSubTab] = useState('missions'); // 'missions' or 'ranking'
  const [challenges, setChallenges] = useState([]);
  const [tips, setTips] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTip, setSelectedTip] = useState(null);
  const [readTipIds, setReadTipIds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [loadedChallenges, loadedTips, loadedRanking, storedReadTips] = await Promise.all([
          ApiService.fetchChallenges(),
          ApiService.fetchTips(),
          ApiService.fetchLeaderboard(),
          AsyncStorage.getItem('@shift_read_tip_ids')
        ]);
        if (active) {
          setChallenges(loadedChallenges);
          setTips(loadedTips);
          setLeaderboard(loadedRanking.leaderboard || []);
          if (storedReadTips) {
            setReadTipIds(JSON.parse(storedReadTips));
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading Maio Amarelo campaign data:', err);
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => { active = false; };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [loadedChallenges, loadedTips, loadedRanking, storedReadTips] = await Promise.all([
        ApiService.fetchChallenges(),
        ApiService.fetchTips(),
        ApiService.fetchLeaderboard(),
        AsyncStorage.getItem('@shift_read_tip_ids')
      ]);
      setChallenges(loadedChallenges);
      setTips(loadedTips);
      setLeaderboard(loadedRanking.leaderboard || []);
      if (storedReadTips) {
        setReadTipIds(JSON.parse(storedReadTips));
      }
    } catch (err) {
      console.error('Error refreshing Maio Amarelo campaign data:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getChallengeIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('auditor') || t.includes('cidadão')) return <Users size={20} color={theme.colors.secondary} />;
    if (t.includes('foco') || t.includes('celular') || t.includes('telemóvel')) return <Smartphone size={20} color={theme.colors.info} />;
    return <Target size={20} color={theme.colors.primary} />;
  };

  const getTipIconColor = (subtitle) => {
    const s = subtitle ? subtitle.toLowerCase() : '';
    if (s.includes('mito') || s.includes('fato')) return theme.colors.primary;
    if (s.includes('fadiga') || s.includes('sono')) return theme.colors.danger;
    if (s.includes('física') || s.includes('reação') || s.includes('pista')) return theme.colors.info;
    return theme.colors.success;
  };

  const handleCompleteTip = async (tip) => {
    try {
      if (tip && tip.points) {
        await ApiService.addBonusPoints(tip.points);
        if (refreshProfile) await refreshProfile();
        const updatedReadIds = [...readTipIds, tip.id];
        setReadTipIds(updatedReadIds);
        await AsyncStorage.setItem('@shift_read_tip_ids', JSON.stringify(updatedReadIds));
      }
    } catch (err) {
      console.error('Error completing tip reading:', err);
    } finally {
      setSelectedTip(null);
    }
  };

  if (loading) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.bg }]} contentContainerStyle={styles.content}>
        <Skeleton height={180} borderRadius={24} isDarkMode={isDarkMode} />
        <Skeleton width="50%" height={14} style={{ marginTop: 20, marginBottom: 10 }} isDarkMode={isDarkMode} />
        <View style={{ gap: 12 }}>
          <Skeleton height={80} borderRadius={16} isDarkMode={isDarkMode} />
          <Skeleton height={80} borderRadius={16} isDarkMode={isDarkMode} />
          <Skeleton height={80} borderRadius={16} isDarkMode={isDarkMode} />
        </View>
      </ScrollView>
    );
  }

  const completedCount = challenges.filter(c => c.is_completed === 1).length;
  const totalCount = challenges.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* Sub-Tab Navigation */}
      <View style={[styles.subTabNav, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity 
          style={[styles.subTab, activeSubTab === 'missions' && { borderBottomColor: theme.colors.primary }]}
          onPress={() => setActiveSubTab('missions')}
        >
          <HeartPulse size={16} color={activeSubTab === 'missions' ? theme.colors.primary : theme.colors.muted} />
          <Text style={[styles.subTabText, { color: activeSubTab === 'missions' ? theme.colors.title : theme.colors.muted }]}>Missões</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.subTab, activeSubTab === 'ranking' && { borderBottomColor: theme.colors.primary }]}
          onPress={() => setActiveSubTab('ranking')}
        >
          <Trophy size={16} color={activeSubTab === 'ranking' ? theme.colors.primary : theme.colors.muted} />
          <Text style={[styles.subTabText, { color: activeSubTab === 'ranking' ? theme.colors.title : theme.colors.muted }]}>Ranking</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }>
        {activeSubTab === 'missions' ? (
          <>
            {/* Premium Maio Amarelo Campaign Banner */}
            <View style={[styles.banner, { backgroundColor: theme.colors.primary }, theme.shadows.medium]}>
              <View style={styles.bannerBackdrop}>
                <HeartPulse size={140} color="rgba(0, 0, 0, 0.08)" style={styles.bannerIconBg} />
              </View>
              <View style={styles.bannerContent}>
                <View style={[styles.badgeContainer, { backgroundColor: theme.colors.secondary }]}>
                  <Target size={12} color={theme.colors.primary} />
                  <Text style={[styles.badgeText, { color: theme.colors.primary }]}>DESAFIO MENSAL</Text>
                </View>
                <Text style={[styles.bannerTitle, { color: theme.colors.onPrimary }]}>Maio Amarelo</Text>
                <Text style={[styles.bannerSubtitle, { color: theme.colors.onPrimary + 'E6' }]}>
                  Cumpra missões diárias de segurança no trânsito para ganhar pontos no Clube SHIFT.
                </Text>
                
                <View style={[styles.progressSection, { backgroundColor: 'rgba(0, 0, 0, 0.08)' }]}>
                  <View style={styles.progressInfo}>
                    <Text style={[styles.progressLabel, { color: theme.colors.onPrimary }]}>Progresso Global</Text>
                    <Text style={[styles.progressValue, { color: theme.colors.onPrimary }]}>{completedCount}/{totalCount} <Text style={styles.progressValueSmall}>Missões</Text></Text>
                  </View>
                  <View style={[styles.progressBarBg, { backgroundColor: 'rgba(0, 0, 0, 0.15)' }]}>
                    <View style={[styles.progressBarFill, { width: `${progressPct}%`, backgroundColor: theme.colors.onPrimary }]} />
                  </View>
                </View>
              </View>
            </View>

            {/* Daily Missions */}
            <Text style={[styles.sectionTitle, { color: theme.colors.title }]}>MISSÕES ATIVAS DE HOJE</Text>
            
            <View style={styles.missionsList}>
              {challenges.map((c) => (
                <View 
                  key={c.id} 
                  style={[
                    styles.missionCard, 
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                    c.is_completed === 1 && styles.completedCard,
                    theme.shadows.soft
                  ]}
                >
                  <View style={[
                    styles.missionIconContainer, 
                    { backgroundColor: `${theme.colors.primary}1A` },
                    c.is_completed === 1 && { backgroundColor: theme.colors.border }
                  ]}>
                    {getChallengeIcon(c.title)}
                  </View>
                  <View style={styles.missionDetails}>
                    <Text 
                      style={[
                        styles.missionName, 
                        { color: theme.colors.title },
                        c.is_completed === 1 && styles.completedText
                      ]}
                    >
                      {c.title}
                    </Text>
                    <Text style={[styles.missionDesc, { color: c.is_completed === 1 ? theme.colors.muted : theme.colors.text }]}>
                      {c.description} <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>(+{c.points} PTS)</Text>
                    </Text>
                  </View>
                  {c.is_completed === 1 ? (
                    <CheckCircle size={22} color={theme.colors.success} />
                  ) : (
                    <TouchableOpacity
                      style={[styles.goButton, { backgroundColor: theme.colors.secondary }]}
                      onPress={() => setActiveTab(c.role_restriction === 'passenger' ? 'passenger' : 'dashboard')}
                      activeOpacity={0.7}
                    >
                      <ChevronRight size={18} color={theme.colors.onSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* Quick Education Tips */}
            <View style={[styles.educationCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, theme.shadows.soft]}>
              <View style={styles.eduHeader}>
                <BookOpen size={18} color={theme.colors.primary} />
                <Text style={[styles.eduTitle, { color: theme.colors.title }]}>Dicas Rápidas</Text>
              </View>
              
              <View style={styles.tipsList}>
                {tips.filter(t => !readTipIds.includes(t.id)).length === 0 ? (
                  <View style={[styles.allReadContainer, { backgroundColor: `${theme.colors.success}14`, borderColor: `${theme.colors.success}26` }]}>
                    <CheckCircle size={20} color={theme.colors.success} />
                    <Text style={[styles.allReadText, { color: theme.colors.title }]}>
                      Parabéns! Já leu todas as dicas rápidas de hoje. 🎉
                    </Text>
                  </View>
                ) : (
                  tips
                    .filter(t => !readTipIds.includes(t.id))
                    .map((t) => (
                      <TouchableOpacity 
                        key={t.id} 
                        style={[styles.tipItem, { backgroundColor: theme.colors.bg }]} 
                        activeOpacity={0.7}
                        onPress={() => setSelectedTip(t)}
                      >
                        <Text style={[styles.tipTitle, { color: theme.colors.title }]}>{t.title}</Text>
                        <View style={[styles.ptsBadge, { backgroundColor: `${theme.colors.primary}26` }]}>
                          <Text style={[styles.ptsText, { color: theme.colors.primary }]}>+{t.points} PTS</Text>
                        </View>
                      </TouchableOpacity>
                    ))
                )}
              </View>
            </View>
          </>
        ) : (
          /* RANKING SECTION */
          <View style={styles.rankingContainer}>
            <View style={[styles.rankingHeaderCard, { backgroundColor: theme.colors.secondary }, theme.shadows.medium]}>
              <Trophy size={40} color={theme.colors.primary} style={styles.rankingIcon} />
              <Text style={[styles.rankingTitle, { color: theme.colors.onSecondary }]}>Ranking de Elite</Text>
              <Text style={[styles.rankingSubtitle, { color: theme.colors.onSecondary + 'B3' }]}>Os motoristas mais seguros da semana</Text>
            </View>

            <View style={styles.leaderboardList}>
              {leaderboard.map((driver, index) => (
                <View key={driver.id} style={[styles.rankItem, { borderBottomColor: theme.colors.border }]}>
                  <View style={styles.rankPosContainer}>
                    {index < 3 ? (
                      <Trophy size={20} color={index === 0 ? '#F59E0B' : index === 1 ? '#94A3B8' : '#B45309'} />
                    ) : (
                      <Text style={[styles.rankPosText, { color: theme.colors.muted }]}>{index + 1}</Text>
                    )}
                  </View>
                  <View style={styles.rankDriverInfo}>
                    <Text style={[styles.rankDriverName, { color: theme.colors.title }]}>{driver.name}</Text>
                    <View style={styles.rankDriverBadges}>
                      {driver.badges && driver.badges.slice(0, 2).map((b, i) => (
                        <View key={i} style={[styles.rankBadgeMini, { backgroundColor: `${theme.colors.primary}1A` }]}>
                          <Text style={[styles.rankBadgeMiniText, { color: theme.colors.primary }]}>{b}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.rankStats}>
                    <View style={styles.rankScoreRow}>
                      <Star size={10} color={theme.colors.primary} fill={theme.colors.primary} />
                      <Text style={[styles.rankScoreVal, { color: theme.colors.primary }]}>{driver.score}%</Text>
                    </View>
                    <Text style={[styles.rankTripsText, { color: theme.colors.muted }]}>{driver.trips} viagens</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Education Modal */}
      {selectedTip && (
        <View style={StyleSheet.absoluteFillObject}>
          <TouchableOpacity 
            style={[styles.modalBackdrop, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.85)' : 'rgba(15,23,42,0.6)' }]}
            onPress={() => setSelectedTip(null)}
            activeOpacity={1}
          />
          <View style={styles.modalCenteredView}>
            <View style={[styles.modalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, theme.shadows.hard]}>
              <View style={[styles.modalIconBadge, { backgroundColor: getTipIconColor(selectedTip.subtitle) + '1C' }]}>
                <BookOpen size={24} color={getTipIconColor(selectedTip.subtitle)} />
              </View>
              <Text style={[styles.modalSub, { color: theme.colors.primary }]}>{selectedTip.subtitle ? selectedTip.subtitle.toUpperCase() : ''}</Text>
              <Text style={[styles.modalTitle, { color: theme.colors.title }]}>{selectedTip.title}</Text>
              <Text style={[styles.modalBody, { color: theme.colors.text }]}>{selectedTip.content}</Text>
              <TouchableOpacity 
                style={[styles.modalCloseBtn, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleCompleteTip(selectedTip)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalCloseBtnText, { color: theme.colors.onPrimary }]}>Concluir Leitura (+{selectedTip.points} PTS)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  subTabNav: {
    flexDirection: 'row',
    height: 48,
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  subTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '850',
  },
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  banner: {
    borderRadius: 24,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerBackdrop: {
    position: 'absolute',
    right: -10,
    bottom: -15,
  },
  bannerIconBg: {
    transform: [{ rotate: '-15deg' }],
  },
  bannerContent: {
    zIndex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    opacity: 0.9,
    marginBottom: 16,
  },
  progressSection: {
    borderRadius: 12,
    padding: 10,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '800',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  progressValueSmall: {
    fontSize: 9,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 99,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 8,
    paddingLeft: 4,
  },
  missionsList: {
    gap: 10,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  completedCard: {
    opacity: 0.6,
  },
  missionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionDetails: {
    flex: 1,
  },
  missionName: {
    fontSize: 13,
    fontWeight: '800',
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  missionDesc: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 12,
  },
  goButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  educationCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  eduHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  eduTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
  },
  tipTitle: {
    fontSize: 11,
    fontWeight: '800',
    flex: 1,
    paddingRight: 10,
  },
  ptsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ptsText: {
    fontSize: 9,
    fontWeight: '900',
  },
  rankingContainer: {
    gap: 16,
  },
  rankingHeaderCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  rankingIcon: {
    marginBottom: 4,
  },
  rankingTitle: {
    fontSize: 20,
    fontWeight: '950',
  },
  rankingSubtitle: {
    fontSize: 11,
    fontWeight: '600',
  },
  leaderboardList: {
    gap: 2,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  rankPosContainer: {
    width: 36,
    alignItems: 'center',
  },
  rankPosText: {
    fontSize: 14,
    fontWeight: '900',
  },
  rankDriverInfo: {
    flex: 1,
    gap: 4,
  },
  rankDriverName: {
    fontSize: 14,
    fontWeight: '900',
  },
  rankDriverBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  rankBadgeMini: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rankBadgeMiniText: {
    fontSize: 8,
    fontWeight: '850',
    textTransform: 'uppercase',
  },
  rankStats: {
    alignItems: 'flex-end',
    gap: 2,
  },
  rankScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankScoreVal: {
    fontSize: 16,
    fontWeight: '950',
  },
  rankTripsText: {
    fontSize: 9,
    fontWeight: '700',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
  },
  modalCenteredView: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '25%',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  modalIconBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
    marginVertical: 6,
  },
  modalCloseBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 12,
    fontWeight: '900',
  },
  allReadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 2,
  },
  allReadText: {
    fontSize: 10,
    fontWeight: '800',
    flex: 1,
    lineHeight: 14,
  },
});
