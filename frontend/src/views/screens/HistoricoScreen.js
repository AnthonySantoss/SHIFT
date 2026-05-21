import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Award, User, Car, Star, ThumbsUp, MessageSquare, AlertTriangle, LogOut } from 'lucide-react-native';

export default function HistoricoScreen({ isDarkMode, profileData, handleLogout }) {
  // Colors
  const colors = {
    bg: isDarkMode ? '#0F1015' : '#F1F5F9',
    cardBg: isDarkMode ? '#171923' : '#FFFFFF',
    border: isDarkMode ? '#222530' : '#E2E8F0',
    title: isDarkMode ? '#FFFFFF' : '#0F172A',
    text: isDarkMode ? '#94A3B8' : '#475569',
  };

  if (!profileData) {
    return (
      <View style={[styles.loadingBox, { backgroundColor: colors.bg }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>A carregar histórico...</Text>
      </View>
    );
  }

  const { name, plate, rating, totalTrips, score, feedbacks, recentTrips } = profileData;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      {/* Premium Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <User size={30} color="#FFFFFF" />
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.profileName}>{name}</Text>
            <View style={styles.plateBadge}>
              <Car size={12} color="#FFFFFF" />
              <Text style={styles.plateText}>{plate}</Text>
            </View>
          </View>
        </View>

        {/* Global Stars and Audits Grid */}
        <View style={styles.divider} />
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>AVALIAÇÃO GERAL</Text>
            <View style={styles.ratingStarsRow}>
              <Text style={styles.ratingNumber}>{rating}</Text>
              <View style={styles.starsWrapper}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={11}
                    color={s <= Math.floor(rating) ? '#F59E0B' : '#475569'}
                    fill={s <= Math.floor(rating) ? '#F59E0B' : 'transparent'}
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

      {/* Badges highlights section */}
      <View style={[styles.badgesCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={styles.badgesHeader}>
          <ThumbsUp size={16} color="#10B981" />
          <Text style={[styles.badgesTitle, { color: colors.title }]}>Destaques dos Passageiros</Text>
        </View>
        <View style={styles.badgesWrapper}>
          {feedbacks.map((item, idx) => (
            <View key={idx} style={[styles.badgeItem, { backgroundColor: colors.bg, borderColor: colors.border }]}>
              <Text style={[styles.badgeCount, { color: colors.title }]}>{item.count}</Text>
              <Text style={[styles.badgeLabel, { color: colors.text }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Feed list of audits */}
      <Text style={[styles.sectionTitle, { color: colors.title }]}>
        {plate === 'Passageiro Cidadão' ? 'ÚLTIMAS AUDITORIAS SUBMETIDAS' : 'ÚLTIMAS AUDITORIAS RECEBIDAS'}
      </Text>
      
      <View style={styles.tripsFeed}>
        {recentTrips.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.text }]}>Ainda não possui registos de auditoria de segurança.</Text>
        ) : (
          recentTrips.map((trip) => (
            <View key={trip.id} style={[styles.tripCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <View style={styles.tripCardHeader}>
                <View>
                  <Text style={[styles.tripDate, { color: colors.title }]}>{trip.date}</Text>
                  
                  {/* Stars list */}
                  <View style={styles.tripStarsWrapper}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={10}
                        color={s <= trip.stars ? '#F59E0B' : '#E2E8F0'}
                        fill={s <= trip.stars ? '#F59E0B' : 'transparent'}
                      />
                    ))}
                    <View style={styles.tripScoreBadge}>
                      <Text style={styles.tripScoreText}>Score: {trip.score}%</Text>
                    </View>
                  </View>
                </View>

                {/* Infraction indicator in feed */}
                {trip.issue && (
                  <View style={styles.issueBadge}>
                    <AlertTriangle size={10} color="#EF4444" />
                    <Text style={styles.issueText}>{trip.issue}</Text>
                  </View>
                )}
              </View>

              {/* Driving context */}
              <View style={styles.contextRow}>
                <Text style={[styles.contextText, { color: colors.text }]}>Contexto: {trip.context}</Text>
              </View>

              {/* Text feedback commentary */}
              {trip.feedback ? (
                <View style={[styles.feedbackBox, { backgroundColor: colors.bg }]}>
                  <MessageSquare size={12} color="#818CF8" style={styles.feedbackIcon} />
                  <Text style={[styles.feedbackTextBody, { color: colors.title }]}>
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
          onPress={handleLogout}
          style={styles.logoutBtn}
          activeOpacity={0.8}
        >
          <LogOut size={16} color="#EF4444" />
          <Text style={styles.logoutBtnText}>Encerrar Sessão</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  profileCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 18,
    gap: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMeta: {
    justifyContent: 'center',
    gap: 4,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  plateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  plateText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statCol: {
    flex: 1,
    gap: 6,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  ratingStarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  ratingNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F59E0B',
    lineHeight: 26,
  },
  starsWrapper: {
    flexDirection: 'row',
    gap: 2.5,
    marginBottom: 3,
  },
  auditsNumber: {
    fontSize: 26,
    fontWeight: '950',
    color: '#FFFFFF',
    lineHeight: 26,
  },
  badgesCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  badgesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgesTitle: {
    fontSize: 12,
    fontWeight: '900',
  },
  badgesWrapper: {
    flexDirection: 'row',
    gap: 8,
  },
  badgeItem: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    gap: 2,
  },
  badgeCount: {
    fontSize: 15,
    fontWeight: '900',
  },
  badgeLabel: {
    fontSize: 7.5,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tripDate: {
    fontSize: 12,
    fontWeight: '800',
  },
  tripStarsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  tripScoreBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginLeft: 6,
  },
  tripScoreText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
  },
  issueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  issueText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#EF4444',
  },
  contextRow: {
    flexDirection: 'row',
  },
  contextText: {
    fontSize: 10,
    fontWeight: '700',
  },
  feedbackBox: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 10,
    gap: 8,
    alignItems: 'flex-start',
    marginTop: 4,
  },
  feedbackIcon: {
    marginTop: 1.5,
  },
  feedbackTextBody: {
    flex: 1,
    fontSize: 10.5,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 14,
  },
  emptyText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 20,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 14,
    gap: 8,
    marginTop: 18,
    marginBottom: 10,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '900',
  },
});
