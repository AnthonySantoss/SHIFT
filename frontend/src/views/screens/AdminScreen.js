import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Settings, Target, Award, Plus, Trash2, Shield, Save, BookOpen } from 'lucide-react-native';
import ApiService from '../../models/api.model';

export default function AdminScreen({ isDarkMode }) {
  const [activeTab, setActiveTab] = useState('config'); // 'config', 'challenges', 'rewards', 'tips'
  const [loading, setLoading] = useState(true);

  // States for configs
  const [configs, setConfigs] = useState([]);
  const [maxSpeed, setMaxSpeed] = useState('');
  const [brakingThresh, setBrakingThresh] = useState('');
  const [gyroThresh, setGyroThresh] = useState('');

  // States for challenges
  const [challenges, setChallenges] = useState([]);
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cPoints, setCPoints] = useState('');
  const [cRole, setCRole] = useState('driver'); // 'driver', 'passenger', 'all'

  // States for rewards
  const [rewards, setRewards] = useState([]);
  const [rTitle, setRTitle] = useState('');
  const [rDesc, setRDesc] = useState('');
  const [rProgress, setRProgress] = useState('');
  const [rColor, setRColor] = useState('#F59E0B');
  // Structured redemption requirements
  const [rScoreType, setRScoreType] = useState('maior'); // 'maior' or 'menor'
  const [rScoreValue, setRScoreValue] = useState('');
  const [rDuration, setRDuration] = useState('');

  // States for tips (Dicas Rápidas)
  const [tips, setTips] = useState([]);
  const [tTitle, setTTitle] = useState('');
  const [tSubtitle, setTSubtitle] = useState('');
  const [tContent, setTContent] = useState('');
  const [tPoints, setTPoints] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [loadedConfigs, loadedChallenges, loadedRewards, loadedTips] = await Promise.all([
        ApiService.fetchConfigs(),
        ApiService.fetchChallenges(),
        ApiService.fetchRewards(),
        ApiService.fetchTips()
      ]);

      setConfigs(loadedConfigs);

      const speedCfg = loadedConfigs.find(c => c.key === 'MAX_SPEED_LIMIT');
      const brakeCfg = loadedConfigs.find(c => c.key === 'BRAKING_DECELE_THRESHOLD');
      const gyroCfg = loadedConfigs.find(c => c.key === 'GYRO_DISTRACTION_LIMIT');

      if (speedCfg) setMaxSpeed(speedCfg.value);
      if (brakeCfg) setBrakingThresh(brakeCfg.value);
      if (gyroCfg) setGyroThresh(gyroCfg.value);

      setChallenges(loadedChallenges);
      setRewards(loadedRewards);
      setTips(loadedTips);
    } catch (err) {
      console.error('Error refreshing admin data:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Theme colors
  const colors = {
    bg: isDarkMode ? '#0F1015' : '#F1F5F9',
    cardBg: isDarkMode ? '#171923' : '#FFFFFF',
    border: isDarkMode ? '#222530' : '#E2E8F0',
    title: isDarkMode ? '#FFFFFF' : '#0F172A',
    text: isDarkMode ? '#94A3B8' : '#475569',
    inputBg: isDarkMode ? '#0F1015' : '#F8FAFC',
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [loadedConfigs, loadedChallenges, loadedRewards, loadedTips] = await Promise.all([
        ApiService.fetchConfigs(),
        ApiService.fetchChallenges(), // Uses passenger fallback to get all
        ApiService.fetchRewards(),
        ApiService.fetchTips()
      ]);

      setConfigs(loadedConfigs);
      
      // Parse configs
      const speedCfg = loadedConfigs.find(c => c.key === 'MAX_SPEED_LIMIT');
      const brakeCfg = loadedConfigs.find(c => c.key === 'BRAKING_DECELE_THRESHOLD');
      const gyroCfg = loadedConfigs.find(c => c.key === 'GYRO_DISTRACTION_LIMIT');

      if (speedCfg) setMaxSpeed(speedCfg.value);
      if (brakeCfg) setBrakingThresh(brakeCfg.value);
      if (gyroCfg) setGyroThresh(gyroCfg.value);

      // Filter driver challenges since we want to view/manage all challenges
      // Wait, let's load all challenges. To get all, we can just load the raw seeded challenges!
      setChallenges(loadedChallenges);
      setRewards(loadedRewards);
      setTips(loadedTips);
      setLoading(false);
    } catch (err) {
      console.error('Error loading admin data:', err);
      Alert.alert('Erro', 'Não foi possível carregar os dados administrativos.');
      setLoading(false);
    }
  };

  // Update Configs
  const handleSaveConfigs = async () => {
    try {
      await Promise.all([
        ApiService.updateConfig('MAX_SPEED_LIMIT', maxSpeed),
        ApiService.updateConfig('BRAKING_DECELE_THRESHOLD', brakingThresh),
        ApiService.updateConfig('GYRO_DISTRACTION_LIMIT', gyroThresh)
      ]);
      Alert.alert('Sucesso', 'Configurações de telemetria salvas com sucesso!');
      loadAllAdminData();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar parâmetros.');
    }
  };

  // Create Challenge
  const handleCreateChallenge = async () => {
    if (!cTitle || !cDesc || !cPoints) {
      Alert.alert('Erro', 'Preencha todos os campos da missão.');
      return;
    }
    try {
      await ApiService.createChallenge({
        title: cTitle,
        description: cDesc,
        points: parseInt(cPoints),
        role_restriction: cRole
      });
      Alert.alert('Sucesso', 'Missão criada com sucesso!');
      setCTitle('');
      setCDesc('');
      setCPoints('');
      loadAllAdminData();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao registar missão.');
    }
  };

  // Delete Challenge
  const handleDeleteChallenge = async (id) => {
    try {
      await ApiService.deleteChallenge(id);
      Alert.alert('Sucesso', 'Missão excluída com sucesso.');
      loadAllAdminData();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao remover missão.');
    }
  };

  // Create Reward
  const handleCreateReward = async () => {
    if (!rTitle || !rScoreValue || !rDuration || !rProgress) {
      Alert.alert('Erro', 'Preencha todos os campos estruturados da vantagem.');
      return;
    }
    try {
      const compiledDesc = `Mantenha Score ${rScoreType === 'maior' ? '>' : '<'} ${rScoreValue} por ${rDuration} para resgatar.`;
      await ApiService.createReward({
        title: rTitle,
        description: compiledDesc,
        progress: parseInt(rProgress),
        color: rColor
      });
      Alert.alert('Sucesso', 'Vantagem adicionada ao Clube!');
      setRTitle('');
      setRScoreValue('');
      setRDuration('');
      setRProgress('');
      loadAllAdminData();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao registar vantagem.');
    }
  };

  // Delete Reward
  const handleDeleteReward = async (id) => {
    try {
      await ApiService.deleteReward(id);
      Alert.alert('Sucesso', 'Vantagem removida do catálogo.');
      loadAllAdminData();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao remover vantagem.');
    }
  };

  // Create Tip (Dica Rápida)
  const handleCreateTip = async () => {
    if (!tTitle || !tSubtitle || !tContent || !tPoints) {
      Alert.alert('Erro', 'Preencha todos os campos da dica rápida (Título, Subtítulo, Fato e Pontos).');
      return;
    }
    try {
      await ApiService.createTip({
        title: tTitle,
        subtitle: tSubtitle,
        content: tContent,
        points: parseInt(tPoints)
      });
      Alert.alert('Sucesso', 'Dica rápida lançada com sucesso!');
      setTTitle('');
      setTSubtitle('');
      setTContent('');
      setTPoints('');
      loadAllAdminData();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao registar dica rápida.');
    }
  };

  // Delete Tip
  const handleDeleteTip = async (id) => {
    try {
      await ApiService.deleteTip(id);
      Alert.alert('Sucesso', 'Dica rápida removida com sucesso.');
      loadAllAdminData();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao remover dica rápida.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingBox, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="small" color="#F59E0B" />
        <Text style={[styles.loadingText, { color: colors.text }]}>A carregar painel administrador...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />
      }>
      {/* Premium Header */}
      <View style={styles.adminHeaderCard}>
        <Shield size={24} color="#F59E0B" />
        <View style={styles.headerTextCol}>
          <Text style={styles.adminTitle}>Painel Administrativo</Text>
          <Text style={styles.adminSubtitle}>Controle de regras da telemetria, missões e Clube SHIFT</Text>
        </View>
      </View>

      {/* Admin Tab Navigation Menu */}
      <View style={[styles.tabBar, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('config')}
          style={[styles.tabItem, activeTab === 'config' && styles.tabActive]}
        >
          <Settings size={14} color={activeTab === 'config' ? '#F59E0B' : colors.text} />
          <Text style={[styles.tabText, { color: activeTab === 'config' ? '#F59E0B' : colors.text }]}>Telemetria</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('challenges')}
          style={[styles.tabItem, activeTab === 'challenges' && styles.tabActive]}
        >
          <Target size={14} color={activeTab === 'challenges' ? '#F59E0B' : colors.text} />
          <Text style={[styles.tabText, { color: activeTab === 'challenges' ? '#F59E0B' : colors.text }]}>Missões</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('rewards')}
          style={[styles.tabItem, activeTab === 'rewards' && styles.tabActive]}
        >
          <Award size={14} color={activeTab === 'rewards' ? '#F59E0B' : colors.text} />
          <Text style={[styles.tabText, { color: activeTab === 'rewards' ? '#F59E0B' : colors.text }]}>Vantagens</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('tips')}
          style={[styles.tabItem, activeTab === 'tips' && styles.tabActive]}
        >
          <BookOpen size={14} color={activeTab === 'tips' ? '#F59E0B' : colors.text} />
          <Text style={[styles.tabText, { color: activeTab === 'tips' ? '#F59E0B' : colors.text }]}>Dicas</Text>
        </TouchableOpacity>
      </View>

      {/* ⚙️ CONFIGURATION TAB */}
      {activeTab === 'config' && (
        <View style={[styles.adminCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.title }]}>PARÂMETROS DE CONDUÇÃO</Text>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.title }]}>Velocidade Máxima Autoestrada (km/h)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.title }]}
              value={maxSpeed}
              onChangeText={setMaxSpeed}
              keyboardType="numeric"
            />
            <Text style={[styles.tipText, { color: colors.text }]}>Padrão: 90 km/h. Se ultrapassado, deduz 3 pontos do score.</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.title }]}>Desaceleração Travagem Brusca (km/h/s)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.title }]}
              value={brakingThresh}
              onChangeText={setBrakingThresh}
              keyboardType="numeric"
            />
            <Text style={[styles.tipText, { color: colors.text }]}>Padrão: -10 km/h/s. Travagens mais rápidas que isto perdem 8 pontos.</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.title }]}>Sensibilidade Giroscópio (Deteção Celular)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.title }]}
              value={gyroThresh}
              onChangeText={setGyroThresh}
              keyboardType="numeric"
            />
            <Text style={[styles.tipText, { color: colors.text }]}>Padrão: 1.2 rad/s. Sensibilidade angular para uso inercial.</Text>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveConfigs} activeOpacity={0.8}>
            <Save size={16} color="#351603" />
            <Text style={styles.saveBtnText}>Guardar Parâmetros Globais</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 🎯 CHALLENGES TAB */}
      {activeTab === 'challenges' && (
        <View style={styles.columnGap}>
          {/* Create Form */}
          <View style={[styles.adminCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.title }]}>CRIAR NOVA MISSÃO</Text>
            
            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.title }]}>Título do Desafio</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.title }]}
                  placeholder="Ex: Condutor Exemplar"
                  placeholderTextColor={colors.text}
                  value={cTitle}
                  onChangeText={setCTitle}
                />
              </View>
              <View style={{ width: 80 }}>
                <Text style={[styles.label, { color: colors.title }]}>Pontos</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.title }]}
                  placeholder="Ex: 250"
                  placeholderTextColor={colors.text}
                  value={cPoints}
                  onChangeText={setCPoints}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.title }]}>Descrição do Desafio</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.title }]}
                placeholder="Ex: Conclua 3 corridas consecutivas com score > 98."
                placeholderTextColor={colors.text}
                value={cDesc}
                onChangeText={setCDesc}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.title }]}>Restrição de Papel</Text>
              <View style={styles.selectorRow}>
                {['driver', 'passenger', 'all'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.selectorItem,
                      { borderColor: colors.border, backgroundColor: colors.bg },
                      cRole === role && styles.selectorActive
                    ]}
                    onPress={() => setCRole(role)}
                  >
                    <Text style={[styles.selectorText, { color: cRole === role ? '#F59E0B' : colors.text }]}>
                      {role === 'driver' ? 'Motorista' : role === 'passenger' ? 'Passageiro' : 'Todos'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreateChallenge} activeOpacity={0.8}>
              <Plus size={16} color="#351603" />
              <Text style={styles.saveBtnText}>Lançar Missão Ativa</Text>
            </TouchableOpacity>
          </View>

          {/* List of Challenges */}
          <Text style={[styles.sectionHeading, { color: colors.title }]}>MISSÕES LANÇADAS ({challenges.length})</Text>
          <View style={styles.itemsList}>
            {challenges.map((c) => (
              <View key={c.id} style={[styles.itemCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <View style={styles.itemHeader}>
                    <Text style={[styles.itemTitleText, { color: colors.title }]}>{c.title}</Text>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>{c.role_restriction.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={[styles.itemDescText, { color: colors.text }]}>{c.description}</Text>
                  <Text style={styles.itemPtsText}>+{c.points} PTS</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteChallenge(c.id)}
                  activeOpacity={0.7}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 🎁 REWARDS TAB */}
      {activeTab === 'rewards' && (
        <View style={styles.columnGap}>
          {/* Create Form */}
          <View style={[styles.adminCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.title }]}>CRIAR NOVA VANTAGEM</Text>
            
            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.title }]}>Nome da Recompensa</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.title }]}
                  placeholder="Ex: Desconto Gasolina 15%"
                  placeholderTextColor={colors.text}
                  value={rTitle}
                  onChangeText={setRTitle}
                />
              </View>
              <View style={{ width: 80 }}>
                <Text style={[styles.label, { color: colors.title }]}>Meta (%)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.title }]}
                  placeholder="Ex: 80"
                  placeholderTextColor={colors.text}
                  value={rProgress}
                  onChangeText={setRProgress}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.title }]}>Regra de Score para Resgate</Text>
              <View style={styles.selectorRow}>
                {['maior', 'menor'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.selectorItem,
                      { borderColor: colors.border, backgroundColor: colors.bg },
                      rScoreType === type && styles.selectorActive
                    ]}
                    onPress={() => setRScoreType(type)}
                  >
                    <Text style={[styles.selectorText, { color: rScoreType === type ? '#F59E0B' : colors.text }]}>
                      {type === 'maior' ? 'Score Maior (>)' : 'Score Menor (<)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.title }]}>Valor de Score Requerido</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.title }]}
                  placeholder="Ex: 90"
                  placeholderTextColor={colors.text}
                  value={rScoreValue}
                  onChangeText={setRScoreValue}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1.2 }}>
                <Text style={[styles.label, { color: colors.title }]}>Tempo / Duração</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.title }]}
                  placeholder="Ex: 7 dias (ou 5 corridas)"
                  placeholderTextColor={colors.text}
                  value={rDuration}
                  onChangeText={setRDuration}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.title }]}>Cor do Indicador (Tema)</Text>
              <View style={styles.selectorRow}>
                {[
                  { hex: '#F59E0B', label: 'Amarelo' },
                  { hex: '#10B981', label: 'Verde' },
                  { hex: '#6366F1', label: 'Roxo' },
                  { hex: '#EF4444', label: 'Vermelho' }
                ].map((colorObj) => (
                  <TouchableOpacity
                    key={colorObj.hex}
                    style={[
                      styles.selectorItem,
                      { borderColor: colors.border, backgroundColor: colorObj.hex + '1A' },
                      rColor === colorObj.hex && { borderColor: colorObj.hex, borderWidth: 1.5 }
                    ]}
                    onPress={() => setRColor(colorObj.hex)}
                  >
                    <Text style={[styles.selectorText, { color: colorObj.hex, fontWeight: '950' }]}>
                      {colorObj.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreateReward} activeOpacity={0.8}>
              <Plus size={16} color="#351603" />
              <Text style={styles.saveBtnText}>Lançar Vantagem no Clube</Text>
            </TouchableOpacity>
          </View>

          {/* List of Rewards */}
          <Text style={[styles.sectionHeading, { color: colors.title }]}>VANTAGENS NO CATÁLOGO ({rewards.length})</Text>
          <View style={styles.itemsList}>
            {rewards.map((r) => (
              <View key={r.id} style={[styles.itemCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <View style={styles.itemHeader}>
                    <Text style={[styles.itemTitleText, { color: colors.title }]}>{r.title}</Text>
                    <View style={[styles.colorIndicator, { backgroundColor: r.color }]} />
                  </View>
                  <Text style={[styles.itemDescText, { color: colors.text }]}>{r.description}</Text>
                  <Text style={[styles.itemPtsText, { color: r.color }]}>Meta: {r.progress}%</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteReward(r.id)}
                  activeOpacity={0.7}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 📖 TIPS TAB */}
      {activeTab === 'tips' && (
        <View style={styles.columnGap}>
          {/* Create Form */}
          <View style={[styles.adminCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.title }]}>CRIAR NOVA DICA RÁPIDA</Text>
            
            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.title }]}>Título da Dica</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.title }]}
                  placeholder="Ex: Riscos da fadiga ao volante"
                  placeholderTextColor={colors.text}
                  value={tTitle}
                  onChangeText={setTTitle}
                />
              </View>
              <View style={{ width: 140 }}>
                <Text style={[styles.label, { color: colors.title }]}>Subtítulo / Categoria</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.title }]}
                  placeholder="Ex: Fisiologia da Fadiga"
                  placeholderTextColor={colors.text}
                  value={tSubtitle}
                  onChangeText={setTSubtitle}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.title }]}>Fato / Conteúdo Pedagógico</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.title }]}
                  placeholder="Ex: Fato: Conduzir com sono equivale a..."
                  placeholderTextColor={colors.text}
                  value={tContent}
                  onChangeText={setTContent}
                />
              </View>
              <View style={{ width: 85 }}>
                <Text style={[styles.label, { color: colors.title }]}>Pontos</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.title }]}
                  placeholder="Ex: 80"
                  placeholderTextColor={colors.text}
                  value={tPoints}
                  onChangeText={setTPoints}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreateTip} activeOpacity={0.8}>
              <Plus size={16} color="#351603" />
              <Text style={styles.saveBtnText}>Lançar Dica Rápida</Text>
            </TouchableOpacity>
          </View>

          {/* List of Tips */}
          <Text style={[styles.sectionHeading, { color: colors.title }]}>DICAS RÁPIDAS NO CATÁLOGO ({tips.length})</Text>
          <View style={styles.itemsList}>
            {tips.map((t) => (
              <View key={t.id} style={[styles.itemCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <View style={styles.itemHeader}>
                    <Text style={[styles.itemTitleText, { color: colors.title }]}>{t.title}</Text>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>{t.subtitle ? t.subtitle.toUpperCase() : 'GERAL'}</Text>
                    </View>
                  </View>
                  <Text style={[styles.itemDescText, { color: colors.text }]}>{t.content}</Text>
                  <Text style={styles.itemPtsText}>+{t.points} PTS</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteTip(t.id)}
                  activeOpacity={0.7}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
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
    gap: 12,
  },
  loadingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  adminHeaderCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerTextCol: {
    flex: 1,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '950',
    color: '#FFFFFF',
  },
  adminSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  tabText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  adminCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  formGroup: {
    gap: 6,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  tipText: {
    fontSize: 8.5,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#F59E0B',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  saveBtnText: {
    color: '#351603',
    fontSize: 12,
    fontWeight: '900',
  },
  columnGap: {
    gap: 16,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorItem: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorActive: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  selectorText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 8,
    paddingLeft: 4,
  },
  itemsList: {
    gap: 10,
  },
  itemCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemTitleText: {
    fontSize: 12.5,
    fontWeight: '900',
  },
  roleBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#351603',
  },
  colorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  itemDescText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  itemPtsText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#F59E0B',
    marginTop: 6,
  },
  deleteBtn: {
    padding: 8,
  },
});
