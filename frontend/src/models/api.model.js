import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseUrl = () => {
  // Use the verified absolute host LAN IP address of your machine
  let LAN_IP = '192.168.0.24';
  
  // Extract dynamically from Expo configuration if running in development mode
  if (Constants.expoConfig && Constants.expoConfig.hostUri) {
    const host = Constants.expoConfig.hostUri.split(':').shift();
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      LAN_IP = host;
    }
  }
  
  // Using the absolute LAN IP is bulletproof for both physical Wi-Fi devices and emulators!
  console.log(`[SHIFT TELEMETRY] Pointing API server directly to: http://${LAN_IP}:3333/api`);
  return `http://${LAN_IP}:3333/api`;
};

const BASE_URL = getBaseUrl();
console.log('==============================================');
console.log('🚗 [SHIFT NETWORK] FINAL API BASE_URL:', BASE_URL);
console.log('==============================================');
let authToken = null; // Local in-memory JWT storage

class ApiService {
  static getBaseUrl() {
    return BASE_URL;
  }

  static setAuthToken(token) {
    authToken = token;
  }

  static getAuthToken() {
    return authToken;
  }

  // Helper to compile request headers dynamically
  static getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  }

  // ==========================================
  // AUTHENTICATION API CALLS
  // ==========================================
  
  static async login(email, password) {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao efetuar login.');
      }
      // Store in memory
      if (data.token) {
        this.setAuthToken(data.token);
      }
      return data;
    } catch (error) {
      console.error('ApiService.login error:', error);
      throw error;
    }
  }

  static async register({ name, email, password, role, plate }) {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ name, email, password, role, plate }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao efetuar registo.');
      }
      // Store in memory
      if (data.token) {
        this.setAuthToken(data.token);
      }
      return data;
    } catch (error) {
      console.error('ApiService.register error:', error);
      throw error;
    }
  }

  // ==========================================
  // SECURE RESOURCES
  // ==========================================

  static async fetchSelfProfile() {
    try {
      const response = await fetch(`${BASE_URL}/drivers/self`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error('Não foi possível carregar o perfil do utilizador.');
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.fetchSelfProfile error:', error);
      throw error;
    }
  }

  static async searchDriver(plate) {
    try {
      const response = await fetch(`${BASE_URL}/drivers/search?plate=${encodeURIComponent(plate)}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error('Erro ao pesquisar veículo.');
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.searchDriver error:', error);
      throw error;
    }
  }

  static async submitAudit(auditData) {
    try {
      const response = await fetch(`${BASE_URL}/audits`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(auditData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao enviar auditoria.');
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.submitAudit error:', error);
      throw error;
    }
  }

  static async saveTrip(tripData) {
    try {
      const response = await fetch(`${BASE_URL}/trips`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(tripData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao guardar a viagem.');
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.saveTrip error:', error);
      throw error;
    }
  }

  static async fetchChallenges() {
    try {
      const response = await fetch(`${BASE_URL}/campaign/challenges`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error('Não foi possível carregar desafios.');
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.fetchChallenges error:', error);
      throw error;
    }
  }

  static async fetchTips() {
    try {
      const response = await fetch(`${BASE_URL}/campaign/tips`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error('Não foi possível carregar dicas rápidas.');
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.fetchTips error:', error);
      throw error;
    }
  }

  static async fetchRewards() {
    try {
      const response = await fetch(`${BASE_URL}/clube/rewards`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error('Não foi possível carregar vantagens.');
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.fetchRewards error:', error);
      throw error;
    }
  }

  static async addBonusPoints(points) {
    try {
      const response = await fetch(`${BASE_URL}/clube/points`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ points }),
      });
      if (!response.ok) {
        throw new Error('Erro ao adicionar pontos no Clube SHIFT.');
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.addBonusPoints error:', error);
      throw error;
    }
  }

  static async fetchConfigs() {
    try {
      const response = await fetch(`${BASE_URL}/config`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error('Não foi possível carregar as configurações do app.');
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.fetchConfigs error:', error);
      throw error;
    }
  }

  static async updateConfig(key, value) {
    try {
      const response = await fetch(`${BASE_URL}/admin/config`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ key, value }),
      });
      if (!response.ok) {
        throw new Error('Erro ao atualizar configuração.');
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.updateConfig error:', error);
      throw error;
    }
  }

  static async createChallenge(challengeData) {
    try {
      const response = await fetch(`${BASE_URL}/admin/challenges`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(challengeData),
      });
      if (!response.ok) {
        throw new Error('Erro ao criar desafio.');
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.createChallenge error:', error);
      throw error;
    }
  }

  static async deleteChallenge(id) {
    try {
      const response = await fetch(`${BASE_URL}/admin/challenges/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error('Erro ao excluir desafio.');
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.deleteChallenge error:', error);
      throw error;
    }
  }

  static async createReward(rewardData) {
    try {
      const response = await fetch(`${BASE_URL}/admin/rewards`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(rewardData),
      });
      if (!response.ok) {
        throw new Error('Erro ao criar recompensa.');
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.createReward error:', error);
      throw error;
    }
  }

  static async deleteReward(id) {
    try {
      const response = await fetch(`${BASE_URL}/admin/rewards/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error('Erro ao excluir recompensa.');
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.deleteReward error:', error);
      throw error;
    }
  }

  static async createTip(tipData) {
    try {
      const response = await fetch(`${BASE_URL}/admin/tips`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(tipData),
      });
      if (!response.ok) {
        throw new Error('Erro ao criar dica rápida.');
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.createTip error:', error);
      throw error;
    }
  }

  static async deleteTip(id) {
    try {
      const response = await fetch(`${BASE_URL}/admin/tips/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error('Erro ao excluir dica rápida.');
      }
      return await response.json();
    } catch (error) {
      console.error('ApiService.deleteTip error:', error);
      throw error;
    }
  }
}

export default ApiService;
