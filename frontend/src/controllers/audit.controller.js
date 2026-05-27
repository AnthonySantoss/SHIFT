import { useState } from 'react';
import * as Location from 'expo-location';
import ApiService from '../models/api.model';

export function useAuditController(soundEnabled, setNotification, refreshProfileCallback) {
  const [searchPlate, setSearchPlate] = useState('');
  const [searchedDriver, setSearchedDriver] = useState(null);
  const [isMonitoringRide, setIsMonitoringRide] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [rideRating, setRideRating] = useState(5);
  const [roadContext, setRoadContext] = useState('urbana'); 
  const [weatherContext, setWeatherContext] = useState('limpo'); 
  const [currentCoords, setCurrentCoords] = useState(null);
  
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
      showNotification("Atenção", "Preencha a placa do veículo.", "warning");
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
        showNotification("Motorista Novo", "Veículo ainda não registrado. Seja o primeiro a avaliá-lo!", "info");
      }
    } catch (err) {
      console.error('Error searching plate:', err);
      showNotification("Erro na Pesquisa", "Não foi possível pesquisar no servidor. Usando dados locais offline.", "warning");
      
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

  const handleStartAudit = async () => {
    if (!searchPlate) {
      showNotification("Atenção", "Por favor, introduza a placa do veículo para iniciar.", "warning");
      return;
    }

    // Auto-detect location and weather for the audit
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (loc && loc.coords) {
          setCurrentCoords(loc.coords);
          const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${loc.coords.latitude}&longitude=${loc.coords.longitude}&current=weather_code`
          );
          const weatherData = await weatherResponse.json();
          if (weatherData && weatherData.current) {
            const code = weatherData.current.weather_code;
            if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) setWeatherContext('chuva');
            else if (new Date().getHours() > 18 || new Date().getHours() < 6) setWeatherContext('noite');
            else setWeatherContext('limpo');
          }
        }
      }
    } catch (e) {
      console.warn('Auto-context detection failed:', e);
    }
    
    setScore(100);
    setPositiveActions([]);
    setInfractions([]);
    setFeedbackText('');
    setRideRating(5);
    
    setIsMonitoringRide(true);
    setShowReview(false);
    showNotification("Auditoria Iniciada", "Monitoramento ativado. Registre ações positivas ou infrações.", "success");
  };

  const handlePositiveReport = (action) => {
    if (!isMonitoringRide) return;
    setPositiveActions(prev => {
      if (prev.includes(action)) return prev;
      return [...prev, action];
    });
    setScore(prev => Math.min(100, prev + 5));
    showNotification("Ação Positiva", `${action} registrado com sucesso.`, "success");
  };

  const handleInfractionReport = (infraction) => {
    if (!isMonitoringRide) return;
    setInfractions(prev => {
      if (prev.includes(infraction)) return prev;
      return [...prev, infraction];
    });
    setScore(prev => Math.max(30, prev - 15));
    showNotification("Infração Registrada", `Reporte de ${infraction} adicionado.`, "danger");
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
        feedback: feedbackText || (score > 80 ? "Direção segura e defensiva." : "Condução com oportunidades de melhoria."),
        latitude: currentCoords?.latitude,
        longitude: currentCoords?.longitude
      };

      await ApiService.submitAudit(auditData);
      showNotification("Auditoria Enviada!", "Obrigado! Ganhou +100 Pts Maio Amarelo pela sua contribuição.", "success");
      
      setSearchPlate('');
      setSearchedDriver(null);
      setShowReview(false);
      
      if (refreshProfileCallback) refreshProfileCallback();
    } catch (err) {
      console.error('Error submitting audit:', err);
      showNotification("Erro ao Enviar", "Erro ao conectar com o servidor.", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchPlate, setSearchPlate, searchedDriver, setSearchedDriver, isMonitoringRide,
    showReview, setShowReview, rideRating, setRideRating, roadContext, setRoadContext,
    weatherContext, setWeatherContext, score, positiveActions, infractions,
    feedbackText, setFeedbackText, isLoading, handlePlateSearch, handleStartAudit,
    handlePositiveReport, handleInfractionReport, handleStopAudit, submitAudit
  };
}
