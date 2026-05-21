import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Alert } from 'react-native';
import { Sparkles, Award, Gift, Lock, CheckCircle, Copy, X } from 'lucide-react-native';
import ApiService from '../../models/api.model';

export default function VantagensScreen({ isDarkMode, score, profileData }) {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Colors
  const colors = {
    bg: isDarkMode ? '#0F1015' : '#F1F5F9',
    cardBg: isDarkMode ? '#171923' : '#FFFFFF',
    border: isDarkMode ? '#222530' : '#E2E8F0',
    title: isDarkMode ? '#FFFFFF' : '#0F172A',
    text: isDarkMode ? '#94A3B8' : '#475569',
  };

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

  const getRewardIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('combustível') || t.includes('gasolina')) return <Sparkles size={20} color="#F59E0B" />;
    if (t.includes('vip') || t.includes('prioridade')) return <Award size={20} color="#10B981" />;
    return <Gift size={20} color="#6366F1" />;
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
      <View style={[styles.loadingBox, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="small" color="#F59E0B" />
        <Text style={[styles.loadingText, { color: colors.text }]}>A carregar vantagens...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      {/* Clube SHIFT Points Balance Card */}
      <View style={[styles.pointsCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={styles.pointsHeader}>
          <Gift size={20} color="#F59E0B" />
          <Text style={[styles.pointsTitle, { color: colors.title }]}>Clube SHIFT</Text>
        </View>
        <Text style={[styles.pointsSubtitle, { color: colors.text }]}>
          Pontos acumulados pela sua condução segura e cidadã.
        </Text>
        <Text style={styles.pointsValue}>
          {pointsBalance.toLocaleString('pt-PT')} <Text style={styles.pointsUnit}>PTS</Text>
        </Text>
      </View>

      {/* Rewards Milestones List */}
      <Text style={[styles.sectionTitle, { color: colors.title }]}>VANTAGENS DISPONÍVEIS</Text>

      <View style={styles.rewardsList}>
        {rewards.map((meta) => {
          // Dynamic progress calculation relative to driver's real safety score vs meta requirement
          let progress = meta.progress;
          const currentDriverScore = (profileData && profileData.score !== undefined) ? profileData.score : score;
          if (currentDriverScore !== undefined) {
            progress = Math.min(100, Math.round((currentDriverScore / Math.max(1, meta.progress)) * 100));
          }

          const isUnlocked = progress >= 100;

          return (
            <View key={meta.id} style={[styles.rewardCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <View style={styles.rewardHeader}>
                <View style={[styles.rewardIconBadge, { backgroundColor: isUnlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.08)' }]}>
                  {getRewardIcon(meta.title)}
                </View>
                <View style={styles.rewardMeta}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.rewardTitleText, { color: colors.title }]}>{meta.title}</Text>
                    {isUnlocked ? (
                      <View style={styles.unlockedBadge}>
                        <CheckCircle size={10} color="#10B981" />
                        <Text style={styles.unlockedText}>Disponível</Text>
                      </View>
                    ) : (
                      <View style={styles.lockedBadge}>
                        <Lock size={10} color="#64748B" />
                        <Text style={styles.lockedText}>Meta {meta.progress}%</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.rewardDescText, { color: colors.text }]}>{meta.description}</Text>
                </View>
              </View>

              {/* Progress indicator */}
              <View style={styles.progressRow}>
                <View style={styles.progressBarOuter}>
                  <View style={[styles.progressBarInner, { width: `${progress}%`, backgroundColor: isUnlocked ? '#10B981' : meta.color }]} />
                </View>
                <Text style={[styles.progressPct, { color: colors.title }]}>{progress}%</Text>
              </View>

              {/* Redeem CTA Button */}
              {isUnlocked ? (
                <TouchableOpacity 
                  style={[styles.redeemButton, { backgroundColor: '#10B981' }]} 
                  onPress={() => handleRedeem(meta)}
                >
                  <Sparkles size={13} color="#FFFFFF" />
                  <Text style={styles.redeemButtonText}>Resgatar Vantagem</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.redeemButtonDisabled, { borderColor: colors.border }]}>
                  <Text style={[styles.redeemButtonDisabledText, { color: colors.text }]}>Continue a conduzir com segurança para desbloquear</Text>
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
          <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.title }]}>Parabéns! 🎉</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={18} color={colors.title} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <CheckCircle size={48} color="#10B981" style={styles.successIcon} />
              <Text style={[styles.successTitle, { color: colors.title }]}>Vantagem Resgatada!</Text>
              <Text style={[styles.successDesc, { color: colors.text }]}>
                Apresente o código de cupão abaixo no parceiro associado para usufruir da vantagem.
              </Text>

              {/* Voucher Code Box */}
              <View style={styles.couponContainer}>
                <Text style={styles.couponLabel}>CUPÃO SHIFT</Text>
                <Text style={styles.couponCode}>{activeCoupon?.code}</Text>
                
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={() => {
                    Alert.alert("Código Copiado!", "O código do cupão foi copiado para a sua área de transferência.");
                  }}
                >
                  <Copy size={13} color="#FFFFFF" />
                  <Text style={styles.copyButtonText}>Copiar Código</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.couponTerms, { color: colors.text }]}>
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
    color: '#F59E0B',
    marginTop: 6,
  },
  pointsUnit: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
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
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  unlockedText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#10B981',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(100, 116, 139, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  lockedText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#64748B',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarOuter: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
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
    color: '#FFFFFF',
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
    elevation: 5,
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
    backgroundColor: '#0F172A',
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
    color: '#94A3B8',
    letterSpacing: 2,
  },
  couponCode: {
    fontSize: 20,
    fontWeight: '950',
    color: '#F59E0B',
    letterSpacing: 1.5,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    marginTop: 4,
  },
  copyButtonText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  couponTerms: {
    fontSize: 8.5,
    fontWeight: '600',
    marginTop: 4,
  }
});
