import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { HeartPulse, Target, Users, Smartphone, CheckCircle, BookOpen } from 'lucide-react-native';
import ApiService from '../../models/api.model';

export default function MaioAmareloScreen({ isDarkMode, setActiveTab }) {
  const [challenges, setChallenges] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTip, setSelectedTip] = useState(null);

  // Theme colors
  const colors = {
    bg: isDarkMode ? '#0F1015' : '#F1F5F9',
    cardBg: isDarkMode ? '#171923' : '#FFFFFF',
    border: isDarkMode ? '#222530' : '#E2E8F0',
    title: isDarkMode ? '#FFFFFF' : '#0F172A',
    text: isDarkMode ? '#94A3B8' : '#475569',
  };

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [loadedChallenges, loadedTips] = await Promise.all([
          ApiService.fetchChallenges(),
          ApiService.fetchTips()
        ]);
        if (active) {
          setChallenges(loadedChallenges);
          setTips(loadedTips);
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

  const getChallengeIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('auditor') || t.includes('cidadão')) return <Users size={20} color="#6366F1" />;
    if (t.includes('foco') || t.includes('celular') || t.includes('telemóvel')) return <Smartphone size={20} color="#3B82F6" />;
    return <Target size={20} color="#F59E0B" />;
  };

  const getTipContent = (title) => {
    const t = title.toLowerCase();
    if (t.includes('cinto') || t.includes('trás')) {
      return {
        subtitle: 'Mito vs Fato',
        content: 'Fato: O cinto no banco de trás é obrigatório e vital. Em caso de colisão a 50 km/h, um passageiro sem cinto no banco de trás é projetado para a frente com um impacto equivalente ao peso de um elefante de 3 toneladas, esmagando o condutor.',
        iconColor: '#F59E0B'
      };
    }
    if (t.includes('fadiga') || t.includes('volante')) {
      return {
        subtitle: 'Fisiologia da Fadiga',
        content: 'Fato: Conduzir com sono ou fadiga severa equivale a conduzir sob o efeito do álcool. Após 19 horas sem dormir, os tempos de reação e reflexos equivalem a uma taxa de alcoolemia de 0,5 g/l. Faça pausas a cada 2 horas.',
        iconColor: '#EF4444'
      };
    }
    if (t.includes('distância') || t.includes('pistas') || t.includes('chuva')) {
      return {
        subtitle: 'Física da Reação',
        content: 'Fato: Em pistas molhadas, a distância de travagem do carro duplica em comparação ao asfalto seco devido à redução dramática do atrito dos pneus. Aumente a distância de segurança para pelo menos 4 segundos.',
        iconColor: '#3B82F6'
      };
    }
    return {
      subtitle: 'Condução Defensiva',
      content: 'Atenção aos cruzamentos, visibilidade reduzida e peões. Reduza a velocidade em áreas residenciais e mantenha sempre as mãos no volante e o foco total na via.',
      iconColor: '#10B981'
    };
  };

  if (loading) {
    return (
      <View style={[styles.loadingBox, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="small" color="#F59E0B" />
        <Text style={[styles.loadingText, { color: colors.text }]}>A carregar desafios de segurança...</Text>
      </View>
    );
  }

  // Calculate global completed challenges ratio
  const completedCount = challenges.filter(c => c.is_completed === 1).length;
  const totalCount = challenges.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
        {/* Premium Maio Amarelo Campaign Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerBackdrop}>
            <HeartPulse size={140} color="rgba(0, 0, 0, 0.08)" style={styles.bannerIconBg} />
          </View>
          <View style={styles.bannerContent}>
            <View style={styles.badgeContainer}>
              <Target size={12} color="#F59E0B" />
              <Text style={styles.badgeText}>DESAFIO MENSAL</Text>
            </View>
            <Text style={styles.bannerTitle}>Maio Amarelo</Text>
            <Text style={styles.bannerSubtitle}>
              Cumpra missões diárias de segurança no trânsito para ganhar pontos no Clube SHIFT.
            </Text>
            
            <View style={styles.progressSection}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>Progresso Global</Text>
                <Text style={styles.progressValue}>{completedCount}/{totalCount} <Text style={styles.progressValueSmall}>Missões</Text></Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Daily Missions */}
        <Text style={[styles.sectionTitle, { color: colors.title }]}>MISSÕES ATIVAS DE HOJE</Text>
        
        <View style={styles.missionsList}>
          {challenges.map((c) => (
            <View 
              key={c.id} 
              style={[
                styles.missionCard, 
                c.is_completed === 1 && styles.completedCard,
                { backgroundColor: colors.cardBg, borderColor: colors.border }
              ]}
            >
              <View style={[styles.missionIconContainer, c.is_completed === 1 && styles.completedIconContainer]}>
                {getChallengeIcon(c.title)}
              </View>
              <View style={styles.missionDetails}>
                <Text 
                  style={[
                    styles.missionName, 
                    c.is_completed === 1 && styles.completedText, 
                    { color: colors.title }
                  ]}
                >
                  {c.title}
                </Text>
                <Text style={[styles.missionDesc, { color: c.is_completed === 1 ? '#94A3B8' : colors.text }]}>
                  {c.description} <Text style={{ color: '#F59E0B', fontWeight: '800' }}>(+{c.points} PTS)</Text>
                </Text>
              </View>
              {c.is_completed === 1 ? (
                <CheckCircle size={22} color="#10B981" />
              ) : (
                <TouchableOpacity
                  style={styles.goButton}
                  onPress={() => setActiveTab(c.role_restriction === 'passenger' ? 'passenger' : 'dashboard')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.goButtonText}>Ir</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Quick Education Tips */}
        <View style={[styles.educationCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.eduHeader}>
            <BookOpen size={18} color="#F59E0B" />
            <Text style={[styles.eduTitle, { color: colors.title }]}>Dicas Rápidas</Text>
          </View>
          
          <View style={styles.tipsList}>
            {tips.map((t) => (
              <TouchableOpacity 
                key={t.id} 
                style={[styles.tipItem, { backgroundColor: colors.bg }]} 
                activeOpacity={0.7}
                onPress={() => setSelectedTip(t)}
              >
                <Text style={[styles.tipTitle, { color: colors.title }]}>{t.title}</Text>
                <View style={styles.ptsBadge}>
                  <Text style={styles.ptsText}>+{t.points} PTS</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Interactive Education Modal */}
      {selectedTip && (
        <View style={StyleSheet.absoluteFillObject}>
          <TouchableOpacity 
            style={[styles.modalBackdrop, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.85)' : 'rgba(15,23,42,0.6)' }]}
            onPress={() => setSelectedTip(null)}
            activeOpacity={1}
          />
          <View style={styles.modalCenteredView}>
            <View style={[styles.modalCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <View style={[styles.modalIconBadge, { backgroundColor: getTipContent(selectedTip.title).iconColor + '1C' }]}>
                <BookOpen size={24} color={getTipContent(selectedTip.title).iconColor} />
              </View>
              <Text style={styles.modalSub}>{getTipContent(selectedTip.title).subtitle.toUpperCase()}</Text>
              <Text style={[styles.modalTitle, { color: colors.title }]}>{selectedTip.title}</Text>
              <Text style={[styles.modalBody, { color: colors.text }]}>{getTipContent(selectedTip.title).content}</Text>
              
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setSelectedTip(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseBtnText}>Concluir Leitura (+{selectedTip.points} PTS)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
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
  banner: {
    backgroundColor: '#F59E0B',
    borderRadius: 24,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
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
    backgroundColor: '#351603',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#351603',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B2206',
    lineHeight: 16,
    opacity: 0.9,
    marginBottom: 16,
  },
  progressSection: {
    backgroundColor: 'rgba(53, 22, 3, 0.08)',
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
    color: '#351603',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#351603',
  },
  progressValueSmall: {
    fontSize: 9,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(53, 22, 3, 0.15)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#351603',
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
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedIconContainer: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
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
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  goButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ptsText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#D97706',
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
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
    color: '#F59E0B',
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
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#351603',
    fontSize: 12,
    fontWeight: '900',
  },
});
