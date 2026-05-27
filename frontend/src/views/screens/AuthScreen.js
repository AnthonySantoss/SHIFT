import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { ShieldCheck, Mail, Lock, User, Car, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import getTheme from '../../theme';

export default function AuthScreen({ isDarkMode, controller }) {
  const theme = getTheme(isDarkMode);
  const { handleLogin, handleRegister, isLoading, authError, setAuthError } = controller;

  // Active form state
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [role, setRole] = useState('driver'); // 'driver' or 'passenger'
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plate, setPlate] = useState('');

  // Refs for keyboard navigation
  const emailRef = React.useRef(null);
  const passwordRef = React.useRef(null);
  const plateRef = React.useRef(null);

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
        setAuthError('A placa do veículo é obrigatória para condutores.');
        return;
      }
      await handleRegister({ name, email, password, role, plate });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.bg }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* LOGO SHIELD DECORATION */}
        <View style={styles.logoSection} accessibilityRole="header">
          <View style={[styles.logoBadge, { backgroundColor: theme.colors.primary }, theme.shadows.medium]}>
            <ShieldCheck size={40} color={theme.colors.onPrimary} strokeWidth={2.5} />
          </View>
          <Text style={[styles.logoText, { color: theme.colors.title }]}>
            SHIFT<Text style={{ color: theme.colors.primary }}> PRO</Text>
          </Text>
          <Text style={[styles.tagline, { color: theme.colors.text }]}>
            A Paz no Trânsito Começa Conosco
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, theme.shadows.soft]}>
          {/* ACTOR SELECTOR */}
          <View style={[styles.actorTabContainer, { backgroundColor: theme.colors.bg }]} accessibilityRole="tablist">
            <TouchableOpacity
              onPress={() => {
                setRole('driver');
                setAuthError(null);
              }}
              style={[styles.actorTab, role === 'driver' && { backgroundColor: theme.colors.primary }]}
              accessibilityRole="tab"
              accessibilityState={{ selected: role === 'driver' }}
              accessibilityLabel="Perfil Motorista"
              accessibilityHint="Seleciona o modo motorista para login ou registo"
            >
              <Text style={[styles.actorTabText, role === 'driver' && { color: theme.colors.onPrimary }]}>
                MOTORISTA
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setRole('passenger');
                setAuthError(null);
              }}
              style={[styles.actorTab, role === 'passenger' && { backgroundColor: theme.colors.primary }]}
              accessibilityRole="tab"
              accessibilityState={{ selected: role === 'passenger' }}
              accessibilityLabel="Perfil Passageiro"
              accessibilityHint="Seleciona o modo passageiro para login ou registo"
            >
              <Text style={[styles.actorTabText, role === 'passenger' && { color: theme.colors.onPrimary }]}>
                PASSAGEIRO
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB SWITCHER (LOGIN / SIGNUP) */}
          <View style={styles.authTabContainer} accessibilityRole="tablist">
            <TouchableOpacity
              onPress={() => {
                setIsLoginTab(true);
                setAuthError(null);
              }}
              style={[styles.authTab, isLoginTab && { borderBottomColor: theme.colors.primary }]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isLoginTab }}
              accessibilityLabel="Aba Entrar"
            >
              <Text style={[styles.authTabText, isLoginTab && { color: theme.colors.title }]}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsLoginTab(false);
                setAuthError(null);
              }}
              style={[styles.authTab, !isLoginTab && { borderBottomColor: theme.colors.primary }]}
              accessibilityRole="tab"
              accessibilityState={{ selected: !isLoginTab }}
              accessibilityLabel="Aba Criar Conta"
            >
              <Text style={[styles.authTabText, !isLoginTab && { color: theme.colors.title }]}>Criar Conta</Text>
            </TouchableOpacity>
          </View>

          {/* ERRORS BANNER */}
          {authError && (
            <View 
              style={[styles.errorContainer, { backgroundColor: `${theme.colors.danger}1A`, borderColor: `${theme.colors.danger}33` }]} 
              accessibilityLiveRegion="assertive"
              accessibilityRole="alert"
            >
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>{authError}</Text>
            </View>
          )}

          {/* FORM FIELDS */}
          <View style={styles.form}>
            {/* NAME FIELD (REGISTER ONLY) */}
            {!isLoginTab && (
              <View style={styles.inputWrapper}>
                <User size={16} color={theme.colors.text} style={styles.inputIcon} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Nome Completo"
                  placeholderTextColor={theme.colors.muted}
                  style={[styles.input, { color: theme.colors.title, backgroundColor: theme.colors.input, borderColor: theme.colors.border }]}
                  accessibilityLabel="Campo de Nome Completo"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>
            )}

            {/* EMAIL FIELD */}
            <View style={styles.inputWrapper}>
              <Mail size={16} color={theme.colors.text} style={styles.inputIcon} />
              <TextInput
                ref={emailRef}
                value={email}
                onChangeText={setEmail}
                placeholder="E-mail"
                placeholderTextColor={theme.colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { color: theme.colors.title, backgroundColor: theme.colors.input, borderColor: theme.colors.border }]}
                accessibilityLabel="Campo de E-mail"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            {/* PASSWORD FIELD */}
            <View style={styles.inputWrapper}>
              <Lock size={16} color={theme.colors.text} style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                value={password}
                onChangeText={setPassword}
                placeholder="Senha"
                placeholderTextColor={theme.colors.muted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={[styles.input, { color: theme.colors.title, backgroundColor: theme.colors.input, borderColor: theme.colors.border, paddingRight: 44 }]}
                accessibilityLabel="Campo de Senha"
                returnKeyType={!isLoginTab && role === 'driver' ? "next" : "done"}
                onSubmitEditing={() => {
                  if (!isLoginTab && role === 'driver') {
                    plateRef.current?.focus();
                  } else {
                    handleSubmit();
                  }
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Esconder senha" : "Mostrar senha"}
                accessibilityHint="Alterna a visibilidade dos caracteres da senha"
              >
                {showPassword ? (
                  <EyeOff size={20} color={theme.colors.text} />
                ) : (
                  <Eye size={20} color={theme.colors.text} />
                )}
              </TouchableOpacity>
            </View>

            {/* VEHICLE PLATE FIELD (DRIVER & REGISTER ONLY) */}
            {!isLoginTab && role === 'driver' && (
              <View style={styles.inputWrapper}>
                <Car size={16} color={theme.colors.text} style={styles.inputIcon} />
                <TextInput
                  ref={plateRef}
                  value={plate}
                  onChangeText={(text) => setPlate(text.toUpperCase())}
                  placeholder="Placa do Veículo (Ex: ABC1D23)"
                  placeholderTextColor={theme.colors.muted}
                  maxLength={8}
                  autoCapitalize="characters"
                  style={[styles.input, { color: theme.colors.title, backgroundColor: theme.colors.input, borderColor: theme.colors.border }]}
                  accessibilityLabel="Campo de Matrícula do Veículo"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>
            )}

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitBtn, { backgroundColor: theme.colors.primary }, theme.shadows.medium]}
              disabled={isLoading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={isLoginTab ? 'Botão de Entrar' : 'Botão de Criar Conta'}
              accessibilityState={{ disabled: isLoading }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.onPrimary} />
              ) : (
                <>
                  <Text style={[styles.submitBtnText, { color: theme.colors.onPrimary }]}>
                    {isLoginTab ? 'Entrar no SHIFT' : 'Registar e Iniciar'}
                  </Text>
                  <ArrowRight size={16} color={theme.colors.onPrimary} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* DEMO ACCOUNTS HELPER */}
        <View style={[styles.demoHelperCard, { backgroundColor: `${theme.colors.text}0D` }]} accessibilityLabel="Ajuda para contas de teste">
          <Text style={[styles.demoTitle, { color: theme.colors.title }]}>Contas Semente de Teste:</Text>
          <Text style={[styles.demoRow, { color: theme.colors.text }]}>🚗 **Motorista**: `joao@shift.com` | `123456`</Text>
          <Text style={[styles.demoRow, { color: theme.colors.text }]}>👥 **Passageiro**: `ana@shift.com` | `123456`</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
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
    minHeight: 44, // Minimum touch target height
  },
  actorTabText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
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
    minHeight: 44, // Minimum touch target height
  },
  authTabText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
  },
  errorContainer: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  errorText: {
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
    height: 48, // Improved height for touch target
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 38,
    paddingRight: 12,
    fontSize: 12,
    fontWeight: '700',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50, // Improved height for touch target
    borderRadius: 12,
    gap: 8,
    marginTop: 6,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '900',
  },
  demoHelperCard: {
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
