import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../models/api.model';

const TOKEN_KEY = '@shift_auth_token';
const USER_KEY = '@shift_auth_user';

export function useAuthController(setNotification, refreshProfileCallback) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const showNotification = (title, message, type = 'info') => {
    setNotification({ title, message, type });
  };

  // 1. Bootstrap: Check for persistent token on app load
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);

        if (token && storedUser) {
          ApiService.setAuthToken(token);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          
          // Verify token and fetch fresh profile in background
          try {
            await refreshProfileCallback();
          } catch (e) {
            console.warn('Silent session validation failed:', e);
            // If API fails completely (e.g. server down), we keep local offline state
          }
        }
      } catch (e) {
        console.error('Failed to load session bootstrap:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // 2. Handle Login
  const handleLogin = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await ApiService.login(email.trim(), password);
      
      // Persist token and user profile
      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAuthenticated(true);
      showNotification("Sessão Iniciada", `Bem-vindo de volta, ${response.user.name}!`, "success");
      
      // Update historical feeds
      setTimeout(() => refreshProfileCallback(), 200);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      const errMsg = error.message || 'E-mail ou senha incorretos.';
      setAuthError(errMsg);
      showNotification("Erro no Acesso", errMsg, "danger");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Registration
  const handleRegister = async ({ name, email, password, role, plate }) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await ApiService.register({ name, email, password, role, plate });
      
      // Persist token and user profile
      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAuthenticated(true);
      showNotification("Conta Criada!", `Conta registada com sucesso como ${role === 'driver' ? 'Motorista' : 'Passageiro'}!`, "success");
      
      setTimeout(() => refreshProfileCallback(), 200);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      const errMsg = error.message || 'Erro ao criar conta. Verifique os dados.';
      setAuthError(errMsg);
      showNotification("Erro no Registo", errMsg, "danger");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Logout
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Clear persistence and cache
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      ApiService.setAuthToken(null);
      
      setUser(null);
      setIsAuthenticated(false);
      showNotification("Sessão Encerrada", "Volte sempre com segurança!", "info");
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    authError,
    setAuthError,
    handleLogin,
    handleRegister,
    handleLogout
  };
}
