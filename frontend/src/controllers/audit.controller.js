import { useState } from 'react';
import ApiService from '../models/api.model';

export function useAuditController(soundEnabled, setNotification, refreshProfileCallback) {
  const [searchPlate, setSearchPlate] = useState('');
  const [searchedDriver, setSearchedDriver] = useState(null);
  const [isMonitoringRide, setIsMonitoringRide] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [rideRating, setRideRating] = useState(5);
  const [roadContext, setRoadContext] = useState('urbana'); 
  const [weatherContext, setWeatherContext] = useState('limpo'); 
  
  // Real-time audit metrics
  const [score, setScore] = useState(100);
  const [positiveActions, setPositiveActions] = useState([]);
  const [infractions, setInfractions] = useState([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const showNotification = (title, message, type = 'warning') => {
    setNotification({ title, message, type });
    if (soundEnabled) {
      console.log(`[BEEP SOUND EMITTED] Type: ${type} - ${title}: ${message}`);
    }
  };

  const handlePlateSearch = async () => {
    if (!searchPlate) {
      showNotification("Atenção", "Preencha a matrícula do veículo.", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const result = await ApiService.searchDriver(searchPlate);
      setSearchedDriver(result);
      
      if (result.found) {
        if (result.driver.status === 'danger') {
          showNotification("Alerta de Risco", "Este motorista possui histórico de condução perigosa na nossa comunidade.", "danger");
        } else {
          showNotification("Motorista Verificado", "Bom histórico de condução. Boa viagem!", "success");
        }
      } else {
        showNotification("Motorista Novo", "Veículo ainda não registado. Seja o primeiro a avaliá-lo!", "info");
      }
    } catch (err) {
      console.error('Error searching plate:', err);
      showNotification("Erro na Pesquisa", "Não foi possível pesquisar no servidor. Usando dados locais offline.", "warning");
      
      // Offline fallback
      setSearchedDriver({
        found: false,
        driver: {
          plate: searchPlate.toUpperCase(),
          name: 'Motorista Offline',
          score: '--',
          trips: 0,
          status: 'unknown',
          badges: [],
          rating: 0
        },
        history: [],
        audits: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAudit = () => {
    if (!searchPlate) {
      showNotification("Atenção", "Por favor, introduza a matrícula do veículo para iniciar.", "warning");
      return;
    }
    
    // Clear previous session metrics
    setScore(100);
    setPositiveActions([]);
    setInfractions([]);
    setFeedbackText('');
    setRideRating(5);
    
    setIsMonitoringRide(true);
    setShowReview(false);
    showNotification("Auditoria Iniciada", "Sensores ativados. Registe ações positivas ou infrações.", "success");
  };

  const handlePositiveReport = (action) => {
    if (!isMonitoringRide) return;
    
    setPositiveActions(prev => {
      if (prev.includes(action)) return prev;
      return [...prev, action];
    });
    setScore(prev => Math.min(100, prev + 5));
    showNotification("Ação Positiva", `${action} registado com sucesso.`, "success");
  };

  const handleInfractionReport = (infraction) => {
    if (!isMonitoringRide) return;

    setInfractions(prev => {
      if (prev.includes(infraction)) return prev;
      return [...prev, infraction];
    });
    setScore(prev => Math.max(30, prev - 15));
    showNotification("Infração Registada", `Reporte de ${infraction} adicionado.`, "danger");
  };

  const handleStopAudit = () => {
    setIsMonitoringRide(false);
    setShowReview(true);
    showNotification("Viagem Concluída", "Por favor, conclua a avaliação e atribua as estrelas.", "info");
  };

  const submitAudit = async () => {
    setIsLoading(true);
    try {
      const auditData = {
        driverPlate: searchPlate.toUpperCase().trim(),
        roadContext,
        weatherContext,
        score,
        ratingStars: rideRating,
        positiveActions,
        infractions,
        feedback: feedbackText || (score > 80 ? "Direção segura e defensiva." : "Condução com oportunidades de melhoria.")
      };

      await ApiService.submitAudit(auditData);
      
      showNotification("Auditoria Enviada!", "Obrigado! Ganhou +100 Pts Maio Amarelo pela sua contribuição.", "success");
      
      // Reset state
      setSearchPlate('');
      setSearchedDriver(null);
      setShowReview(false);
      
      if (refreshProfileCallback) {
        refreshProfileCallback();
      }
    } catch (err) {
      console.error('Error submitting audit:', err);
      showNotification("Erro ao Enviar", "Erro ao conectar com o servidor.", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchPlate,
    setSearchPlate,
    searchedDriver,
    setSearchedDriver,
    isMonitoringRide,
    showReview,
    setShowReview,
    rideRating,
    setRideRating,
    roadContext,
    setRoadContext,
    weatherContext,
    setWeatherContext,
    score,
    positiveActions,
    infractions,
    feedbackText,
    setFeedbackText,
    isLoading,
    handlePlateSearch,
    handleStartAudit,
    handlePositiveReport,
    handleInfractionReport,
    handleStopAudit,
    submitAudit
  };
}
