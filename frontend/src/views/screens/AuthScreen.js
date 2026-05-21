import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { ShieldCheck, Mail, Lock, User, Car, ArrowRight } from 'lucide-react-native';

export default function AuthScreen({ isDarkMode, controller }) {
  const { handleLogin, handleRegister, isLoading, authError, setAuthError } = controller;

  // Active form state
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [role, setRole] = useState('driver'); // 'driver' or 'passenger'

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plate, setPlate] = useState('');

  // Colors
  const colors = {
    bg: isDarkMode ? '#0F1015' : '#F1F5F9',
    cardBg: isDarkMode ? '#171923' : '#FFFFFF',
    border: isDarkMode ? '#222530' : '#E2E8F0',
    title: isDarkMode ? '#FFFFFF' : '#0F172A',
    text: isDarkMode ? '#94A3B8' : '#475569',
    inputBg: isDarkMode ? '#0B0C10' : '#F8FAFC',
    yellow: '#F59E0B',
    yellowDark: '#D97706',
  };

  const validateEmail = (val) => {
    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return reg.test(val);
  };

  const handleSubmit = async () => {
    setAuthError(null);

    if (!email || !password) {
      setAuthError('E-mail e senha são obrigatórios.');
      return;
    }

    if (!validateEmail(email)) {
      setAuthError('Por favor, introduza um e-mail válido.');
      return;
    }

    if (password.length < 6) {
      setAuthError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (isLoginTab) {
      await handleLogin(email, password);
    } else {
      if (!name) {
        setAuthError('O nome é obrigatório.');
        return;
      }
      if (role === 'driver' && !plate) {
        setAuthError('A matrícula do veículo é obrigatória para condutores.');
        return;
      }
      await handleRegister({ name, email, password, role, plate });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.bg }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* LOGO SHIELD DECORATION */}
        <View style={styles.logoSection}>
          <View style={styles.logoBadge}>
            <ShieldCheck size={40} color="#000000" strokeWidth={2.5} />
          </View>
          <Text style={[styles.logoText, { color: colors.title }]}>
            SHIFT<Text style={{ color: colors.yellow }}> PRO</Text>
          </Text>
          <Text style={[styles.tagline, { color: colors.text }]}>
            A Paz no Trânsito Começa Conosco
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          {/* ACTOR SELECTOR */}
          <View style={[styles.actorTabContainer, { backgroundColor: colors.bg }]}>
            <TouchableOpacity
              onPress={() => {
                setRole('driver');
                setAuthError(null);
              }}
              style={[styles.actorTab, role === 'driver' && styles.actorTabActive]}
            >
              <Text style={[styles.actorTabText, role === 'driver' && styles.actorTabTextActive]}>
                MOTORISTA
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setRole('passenger');
                setAuthError(null);
              }}
              style={[styles.actorTab, role === 'passenger' && styles.actorTabActive]}
            >
              <Text style={[styles.actorTabText, role === 'passenger' && styles.actorTabTextActive]}>
                PASSAGEIRO
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB SWITCHER (LOGIN / SIGNUP) */}
          <View style={styles.authTabContainer}>
            <TouchableOpacity
              onPress={() => {
                setIsLoginTab(true);
                setAuthError(null);
              }}
              style={[styles.authTab, isLoginTab && [styles.authTabActive, { borderBottomColor: colors.yellow }]]}
            >
              <Text style={[styles.authTabText, isLoginTab && { color: colors.title }]}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsLoginTab(false);
                setAuthError(null);
              }}
              style={[styles.authTab, !isLoginTab && [styles.authTabActive, { borderBottomColor: colors.yellow }]]}
            >
              <Text style={[styles.authTabText, !isLoginTab && { color: colors.title }]}>Criar Conta</Text>
            </TouchableOpacity>
          </View>

          {/* ERRORS BANNER */}
          {authError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          )}

          {/* FORM FIELDS */}
          <View style={styles.form}>
            {/* NAME FIELD (REGISTER ONLY) */}
            {!isLoginTab && (
              <View style={styles.inputWrapper}>
                <User size={16} color={colors.text} style={styles.inputIcon} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Nome Completo"
                  placeholderTextColor={isDarkMode ? '#475569' : '#94A3B8'}
                  style={[styles.input, { color: colors.title, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                />
              </View>
            )}

            {/* EMAIL FIELD */}
            <View style={styles.inputWrapper}>
              <Mail size={16} color={colors.text} style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="E-mail"
                placeholderTextColor={isDarkMode ? '#475569' : '#94A3B8'}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { color: colors.title, backgroundColor: colors.inputBg, borderColor: colors.border }]}
              />
            </View>

            {/* PASSWORD FIELD */}
            <View style={styles.inputWrapper}>
              <Lock size={16} color={colors.text} style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Senha"
                placeholderTextColor={isDarkMode ? '#475569' : '#94A3B8'}
                secureTextEntry
                autoCapitalize="none"
                style={[styles.input, { color: colors.title, backgroundColor: colors.inputBg, borderColor: colors.border }]}
              />
            </View>

            {/* VEHICLE PLATE FIELD (DRIVER & REGISTER ONLY) */}
            {!isLoginTab && role === 'driver' && (
              <View style={styles.inputWrapper}>
                <Car size={16} color={colors.text} style={styles.inputIcon} />
                <TextInput
                  value={plate}
                  onChangeText={(text) => setPlate(text.toUpperCase())}
                  placeholder="Matrícula do Veículo (Ex: ABC-1234)"
                  placeholderTextColor={isDarkMode ? '#475569' : '#94A3B8'}
                  maxLength={8}
                  autoCapitalize="characters"
                  style={[styles.input, { color: colors.title, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                />
              </View>
            )}

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitBtn, { backgroundColor: colors.yellow }]}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>
                    {isLoginTab ? 'Entrar no SHIFT' : 'Registar e Iniciar'}
                  </Text>
                  <ArrowRight size={16} color="#000000" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* DEMO ACCOUNTS HELPER */}
        <View style={styles.demoHelperCard}>
          <Text style={[styles.demoTitle, { color: colors.title }]}>Contas Semente de Teste:</Text>
          <Text style={[styles.demoRow, { color: colors.text }]}>🚗 **Motorista**: `joao@shift.com` | `123456` (Placa: XYZ-1992)</Text>
          <Text style={[styles.demoRow, { color: colors.text }]}>👥 **Passageiro**: `ana@shift.com` | `123456` (Foca em Auditorias)</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 70 : 40,
    justifyContent: 'center',
    gap: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 14,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '950',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    gap: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  actorTabContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    height: 42,
  },
  actorTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  actorTabActive: {
    backgroundColor: '#F59E0B',
  },
  actorTabText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  actorTabTextActive: {
    color: '#000000',
  },
  authTabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  authTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  authTabActive: {
    // Dynamically applied
  },
  authTabText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  form: {
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
    height: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 38,
    paddingRight: 12,
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 12,
    gap: 8,
    marginTop: 6,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
  },
  demoHelperCard: {
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  demoTitle: {
    fontSize: 10.5,
    fontWeight: '900',
  },
  demoRow: {
    fontSize: 9.5,
    fontWeight: '700',
  },
});
