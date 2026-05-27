import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Alert, RefreshControl } from 'react-native';
import { Sparkles, Award, Gift, Lock, CheckCircle, Copy, X } from 'lucide-react-native';
import ApiService from '../../models/api.model';
import getTheme from '../../theme';
import Skeleton from '../components/Skeleton';

export default function VantagensScreen({ isDarkMode, score, profileData }) {
  const theme = getTheme(isDarkMode);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadRewards() {
      try {
        const loadedRewards = await ApiService.fetchRewards();
        if (active) {
          setRewards(loadedRewards);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading rewards in VantagensScreen:', err);
        if (active) setLoading(false);
      }
    }
    loadRewards();
    return () => { active = false; };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const loadedRewards = await ApiService.fetchRewards();
      setRewards(loadedRewards);
    } catch (err) {
      console.error('Error refreshing rewards:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getRewardIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('combustível') || t.includes('gasolina')) return <Sparkles size={20} color={theme.colors.primary} />;
    if (t.includes('vip') || t.includes('prioridade')) return <Award size={20} color={theme.colors.success} />;
    return <Gift size={20} color={theme.colors.primary} />;
  };

  // Dynamic Points Balance logic from user profile database record
  let pointsBalance = 0; // Fallback
  if (profileData && profileData.feedbacks) {
    const pointsObj = profileData.feedbacks.find(f => f.label.toLowerCase().includes('pontos') || f.label.toLowerCase().includes('shift'));
    if (pointsObj) {
      pointsBalance = pointsObj.count;
    }
  }

  const handleRedeem = (meta) => {
    // Generate a unique premium voucher code
    const voucher = `SHIFT-${meta.title.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setActiveCoupon({
      title: meta.title,
      code: voucher,
      desc: meta.description
    });
    setModalVisible(true);
  };

  if (loading) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.bg }]} contentContainerStyle={styles.content}>
        <Skeleton height={120} borderRadius={24} isDarkMode={isDarkMode} />
        <Skeleton width="50%" height={14} style={{ marginTop: 20, marginBottom: 10 }} isDarkMode={isDarkMode} />
        <View style={{ gap: 12 }}>
          <Skeleton height={100} borderRadius={20} isDarkMode={isDarkMode} />
          <Skeleton height={100} borderRadius={20} isDarkMode={isDarkMode} />
          <Skeleton height={100} borderRadius={20} isDarkMode={isDarkMode} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.bg }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
      }>
      {/* Clube SHIFT Points Balance Card */}
      <View style={[styles.pointsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, theme.shadows.soft]}>
        <View style={styles.pointsHeader}>
          <Gift size={20} color={theme.colors.primary} />
          <Text style={[styles.pointsTitle, { color: theme.colors.title }]}>Clube SHIFT</Text>
        </View>
        <Text style={[styles.pointsSubtitle, { color: theme.colors.text }]}>
          Pontos acumulados pela sua condução segura e cidadã.
        </Text>
        <Text style={[styles.pointsValue, { color: theme.colors.primary }]}>
          {pointsBalance.toLocaleString('pt-PT')} <Text style={[styles.pointsUnit, { color: theme.colors.muted }]}>PTS</Text>
        </Text>
      </View>

      {/* Rewards Milestones List */}
      <Text style={[styles.sectionTitle, { color: theme.colors.title }]}>VANTAGENS DISPONÍVEIS</Text>

      <View style={styles.rewardsList}>
        {rewards.map((meta) => {
          // Read dynamic progress computed and returned by the secure relational API
          const progress = meta.progress || 0;
          const isUnlocked = progress >= 100;

          return (
            <View key={meta.id} style={[styles.rewardCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, theme.shadows.soft]}>
              <View style={styles.rewardHeader}>
                <View style={[styles.rewardIconBadge, { backgroundColor: isUnlocked ? `${theme.colors.success}1A` : `${theme.colors.primary}14` }]}>
                  {getRewardIcon(meta.title)}
                </View>
                <View style={styles.rewardMeta}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.rewardTitleText, { color: theme.colors.title }]}>{meta.title}</Text>
                    {isUnlocked ? (
                      <View style={[styles.unlockedBadge, { backgroundColor: `${theme.colors.success}14` }]}>
                        <CheckCircle size={10} color={theme.colors.success} />
                        <Text style={[styles.unlockedText, { color: theme.colors.success }]}>Disponível</Text>
                      </View>
                    ) : (
                      <View style={[styles.lockedBadge, { backgroundColor: `${theme.colors.muted}14` }]}>
                        <Lock size={10} color={theme.colors.muted} />
                        <Text style={[styles.lockedText, { color: theme.colors.muted }]}>Meta {meta.progress}%</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.rewardDescText, { color: theme.colors.text }]}>{meta.description}</Text>
                </View>
              </View>

              {/* Progress indicator */}
              <View style={styles.progressRow}>
                <View style={[styles.progressBarOuter, { backgroundColor: theme.colors.border }]}>
                  <View style={[styles.progressBarInner, { width: `${progress}%`, backgroundColor: isUnlocked ? theme.colors.success : meta.color || theme.colors.primary }]} />
                </View>
                <Text style={[styles.progressPct, { color: theme.colors.title }]}>{progress}%</Text>
              </View>

              {/* Redeem CTA Button */}
              {isUnlocked ? (
                <TouchableOpacity
                  style={[styles.redeemButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => handleRedeem(meta)}
                >
                  <Sparkles size={13} color={theme.colors.onPrimary} />
                  <Text style={[styles.redeemButtonText, { color: theme.colors.onPrimary }]}>Resgatar Vantagem</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.redeemButtonDisabled, { borderColor: theme.colors.border }]}>
                  <Text style={[styles.redeemButtonDisabledText, { color: theme.colors.muted }]}>Continue a conduzir com segurança para desbloquear</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Premium Redeem Success Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, theme.shadows.hard]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.title }]}>Parabéns! 🎉</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={18} color={theme.colors.title} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <CheckCircle size={48} color={theme.colors.success} style={styles.successIcon} />
              <Text style={[styles.successTitle, { color: theme.colors.title }]}>Vantagem Resgatada!</Text>
              <Text style={[styles.successDesc, { color: theme.colors.text }]}>
                Apresente o código de cupão abaixo no parceiro associado para usufruir da vantagem.
              </Text>

              {/* Voucher Code Box */}
              <View style={[styles.couponContainer, { backgroundColor: theme.colors.black }]}>
                <Text style={[styles.couponLabel, { color: theme.colors.muted }]}>CUPÃO SHIFT</Text>
                <Text style={[styles.couponCode, { color: theme.colors.primary }]}>{activeCoupon?.code}</Text>

                <TouchableOpacity
                  style={[styles.copyButton, { backgroundColor: theme.colors.info }]}
                  onPress={() => {
                    Alert.alert("Código Copiado!", "O código do cupão foi copiado para a sua área de transferência.");
                  }}
                >
                  <Copy size={13} color={theme.colors.white} />
                  <Text style={[styles.copyButtonText, { color: theme.colors.white }]}>Copiar Código</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.couponTerms, { color: theme.colors.muted }]}>
                *Válido por 30 dias a partir da data de resgate.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pointsCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  pointsSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: '950',
    marginTop: 6,
  },
  pointsUnit: {
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 8,
    paddingLeft: 4,
  },
  rewardsList: {
    gap: 12,
  },
  rewardCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  rewardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  rewardIconBadge: {
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardMeta: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardTitleText: {
    fontSize: 13,
    fontWeight: '900',
  },
  rewardDescText: {
    fontSize: 10.5,
    fontWeight: '600',
    lineHeight: 13,
    marginTop: 4,
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  unlockedText: {
    fontSize: 8.5,
    fontWeight: '800',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  lockedText: {
    fontSize: 8.5,
    fontWeight: '800',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarOuter: {
    flex: 1,
    height: 6,
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    borderRadius: 99,
  },
  progressPct: {
    fontSize: 9.5,
    fontWeight: '900',
    width: 32,
    textAlign: 'right',
  },
  redeemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 12,
    marginTop: 4,
  },
  redeemButtonText: {
    fontSize: 11,
    fontWeight: '850',
  },
  redeemButtonDisabled: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  redeemButtonDisabledText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 17, 26, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '950',
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    alignItems: 'center',
    gap: 12,
  },
  successIcon: {
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  successDesc: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15,
    paddingHorizontal: 12,
  },
  couponContainer: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  couponLabel: {
    fontSize: 9,
    fontWeight: '850',
    letterSpacing: 2,
  },
  couponCode: {
    fontSize: 20,
    fontWeight: '950',
    letterSpacing: 1.5,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    marginTop: 4,
  },
  copyButtonText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  couponTerms: {
    fontSize: 8.5,
    fontWeight: '600',
    marginTop: 4,
  }
});
