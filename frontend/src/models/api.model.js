import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getBaseUrl = () => {
    return 'http://192.168.1.105:3333/api';

};

const BASE_URL = getBaseUrl();
console.log('==============================================');
console.log('🚗 [SHIFT NETWORK] API CONECTANDO EM:', BASE_URL);
console.log('==============================================');
let authToken = null;

class ApiService {
  static getBaseUrl() {
    return BASE_URL;
  }

  // -------------------------------------------------------------
  // OFFLINE CACHE ENGINE
  // -------------------------------------------------------------
  static async saveToCache(key, data) {
    try {
      await AsyncStorage.setItem(
        `@shift_cache_${key}`,
        JSON.stringify({
          timestamp: Date.now(),
          data,
        }),
      );
    } catch (e) {
      console.warn(`[CACHE] Save failed for ${key}:`, e);
    }
  }

  static async getFromCache(key) {
    return null; // FORCING NO CACHE FOR DEBUGGING
  }

  static setAuthToken(token) {
    authToken = token;
  }

  static getHeaders() {
    const headers = { "Content-Type": "application/json" };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
    return headers;
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  static async login(email, password) {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Falha ao efetuar login.");
      if (data.token) this.setAuthToken(data.token);
      return data;
    } catch (error) {
      console.error("ApiService.login error:", error);
      throw error;
    }
  }

  static async register({ name, email, password, role, plate }) {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ name, email, password, role, plate }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Erro ao efetuar registo.");
      if (data.token) this.setAuthToken(data.token);
      return data;
    } catch (error) {
      console.error("ApiService.register error:", error);
      throw error;
    }
  }

  // ==========================================
  // SECURE RESOURCES (WITH CACHE FALLBACK)
  // ==========================================
  static async fetchSelfProfile() {
    try {
      const response = await fetch(`${BASE_URL}/drivers/self`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error("Servidor indisponível.");
      const data = await response.json();
      await this.saveToCache("profile", data);
      return data;
    } catch (error) {
      const cached = await this.getFromCache("profile");
      if (cached) return cached;
      throw new Error("Sem conexão e sem dados em cache.");
    }
  }

  static async searchDriver(plate) {
    try {
      const response = await fetch(
        `${BASE_URL}/drivers/search?plate=${encodeURIComponent(plate)}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        },
      );
      if (!response.ok) throw new Error("Erro ao pesquisar veículo.");
      return await response.json();
    } catch (error) {
      console.error("ApiService.searchDriver error:", error);
      throw error;
    }
  }

  static async fetchLeaderboard() {
    try {
      const response = await fetch(`${BASE_URL}/drivers/leaderboard`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error("Erro no ranking.");
      const data = await response.json();
      await this.saveToCache("leaderboard", data);
      return data;
    } catch (error) {
      const cached = await this.getFromCache("leaderboard");
      if (cached) return cached;
      throw error;
    }
  }

  static async fetchHotspots() {
    try {
      const response = await fetch(`${BASE_URL}/hotspots`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error("Erro nas zonas de risco.");
      const data = await response.json();
      await this.saveToCache("hotspots", data);
      return data;
    } catch (error) {
      const cached = await this.getFromCache("hotspots");
      if (cached) return cached;
      return { hotspots: [] };
    }
  }

  static async submitAudit(auditData) {
    try {
      const response = await fetch(`${BASE_URL}/audits`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(auditData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao enviar auditoria.");
      }
      return await response.json();
    } catch (error) {
      // Future: Queue for later sync
      console.error("ApiService.submitAudit error:", error);
      throw error;
    }
  }

  static async saveTrip(tripData) {
    try {
      const response = await fetch(`${BASE_URL}/trips`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(tripData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao guardar viagem.");
      }
      return await response.json();
    } catch (error) {
      console.error("ApiService.saveTrip error:", error);
      throw error;
    }
  }

  static async fetchChallenges() {
    try {
      const response = await fetch(`${BASE_URL}/campaign/challenges`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error("Erro nos desafios.");
      const data = await response.json();
      await this.saveToCache("challenges", data);
      return data;
    } catch (error) {
      const cached = await this.getFromCache("challenges");
      if (cached) return cached;
      throw error;
    }
  }

  static async fetchTips() {
    try {
      const response = await fetch(`${BASE_URL}/campaign/tips`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error("Erro nas dicas.");
      const data = await response.json();
      await this.saveToCache("tips", data);
      return data;
    } catch (error) {
      const cached = await this.getFromCache("tips");
      if (cached) return cached;
      throw error;
    }
  }

  static async fetchRewards() {
    try {
      const response = await fetch(`${BASE_URL}/clube/rewards`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error("Erro nas vantagens.");
      const data = await response.json();
      await this.saveToCache("rewards", data);
      return data;
    } catch (error) {
      const cached = await this.getFromCache("rewards");
      if (cached) return cached;
      throw error;
    }
  }

  static async addBonusPoints(points) {
    try {
      const response = await fetch(`${BASE_URL}/clube/points`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ points }),
      });
      if (!response.ok) throw new Error("Erro ao adicionar pontos.");
      return await response.json();
    } catch (error) {
      console.error("ApiService.addBonusPoints error:", error);
      throw error;
    }
  }

  static async fetchConfigs() {
    try {
      const response = await fetch(`${BASE_URL}/config`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error("Erro nas configurações.");
      return await response.json();
    } catch (error) {
      console.error("ApiService.fetchConfigs error:", error);
      throw error;
    }
  }

  static async updateConfig(key, value) {
    try {
      const response = await fetch(`${BASE_URL}/admin/config`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify({ key, value }),
      });
      if (!response.ok) throw new Error("Erro ao atualizar config.");
      return await response.json();
    } catch (error) {
      console.error("ApiService.updateConfig error:", error);
      throw error;
    }
  }

  static async createChallenge(challengeData) {
    try {
      const response = await fetch(`${BASE_URL}/admin/challenges`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(challengeData),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async deleteChallenge(id) {
    try {
      const response = await fetch(`${BASE_URL}/admin/challenges/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async createReward(rewardData) {
    try {
      const response = await fetch(`${BASE_URL}/admin/rewards`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(rewardData),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async deleteReward(id) {
    try {
      const response = await fetch(`${BASE_URL}/admin/rewards/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async createTip(tipData) {
    try {
      const response = await fetch(`${BASE_URL}/admin/tips`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(tipData),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async deleteTip(id) {
    try {
      const response = await fetch(`${BASE_URL}/admin/tips/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

export default ApiService;
