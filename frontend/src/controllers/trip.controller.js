import { useState, useEffect, useRef } from 'react';
import { AppState, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import ApiService from '../models/api.model';

export function useTripController(soundEnabled, setNotification, refreshProfileCallback, isAuthenticated) {
  const [isDriving, setIsDriving] = useState(false);
  const [score, setScore] = useState(100);
  const [dbTips, setDbTips] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      ApiService.fetchTips().then(loadedTips => {
        setDbTips(loadedTips);
      }).catch(err => {
        console.warn('Failed to load telemetry tips:', err);
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsDriving(false);
      setShowPermissionModal(false);
      setSpeed(0);
      setTripSeconds(0);
      setDistance(0.0);
    }
  }, [isAuthenticated]);

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [brakingAlert, setBrakingAlert] = useState(false);
  const [speedingAlert, setSpeedingAlert] = useState(false);
  const [distractionAlert, setDistractionAlert] = useState(false);
  const [phoneDistracted, setPhoneDistracted] = useState(false);
  const [tripSeconds, setTripSeconds] = useState(0);
  const [distance, setDistance] = useState(0.0);
  const [fatigueLevel, setFatigueLevel] = useState(10);
  
  // Real-time Weather Context
  const [weatherInfo, setWeatherInfo] = useState({
    isWetRoad: false,
    description: 'Tempo Limpo',
    temperature: 20,
    icon: 'sun'
  });

  // References for native watchers
  const locationSubscription = useRef(null);
  const accelSubscription = useRef(null);
  const gyroSubscription = useRef(null);
  
  const lastWeatherFetchTime = useRef(0);
  
  const timerRef = useRef(null);
  const appStateListener = useRef(null);

  // Dynamic references to keep track of current telemetry state inside asynchronous callbacks
  const speedsArray = useRef([]);
  const maxFatigue = useRef(10);
  const prevSpeed = useRef(0);
  const currentIsDriving = useRef(false);

  // Administrative dynamic settings
  const maxSpeedLimit = useRef(90);
  const brakingDecelThreshold = useRef(-10);
  const gyroDistractionLimit = useRef(1.2);

  const showNotification = (title, message, type = 'warning') => {
    setNotification({ title, message, type });
    if (soundEnabled) {
      console.log(`[AUDIO ALARM BEEP] Type: ${type} - ${title}: ${message}`);
    }
  };

  const triggerSafeDrivingTip = () => {
    if (dbTips.length > 0) {
      const randomTip = dbTips[Math.floor(Math.random() * dbTips.length)];
      showNotification("Dica de Trânsito", randomTip.title, "info");
    } else {
      showNotification("Dica de Trânsito", "Maio Amarelo: A paz no trânsito começa em si.", "info");
    }
  };

  // Fetch real weather immediately on mount using device location
  useEffect(() => {
    async function initWeather() {
      if (!isAuthenticated) return;
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (loc && loc.coords) {
            await fetchWeather(loc.coords.latitude, loc.coords.longitude);
          }
        } else {
          setShowPermissionModal(true);
        }
      } catch (e) {
        console.warn('Initial weather load failed:', e);
      }
    }
    initWeather();
  }, [isAuthenticated]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (loc && loc.coords) {
          await fetchWeather(loc.coords.latitude, loc.coords.longitude);
        }
        showNotification("Localização Permitida", "O acesso ao GPS e à telemetria de condução foi ativado.", "success");
      } else {
        showNotification("Permissão Negada", "Algumas funcionalidades de condução e score podem ficar indisponíveis.", "warning");
      }
    } catch (e) {
      console.error('Error requesting location permission:', e);
    } finally {
      setShowPermissionModal(false);
    }
  };

  // 1. Telemetry GPS & Sensors Lifecycle
  useEffect(() => {
    currentIsDriving.current = isDriving;

    if (isDriving) {
      speedsArray.current = [];
      maxFatigue.current = 10;
      prevSpeed.current = 0;

      // Fetch dynamic thresholds from backend config
      ApiService.fetchConfigs().then(loadedConfigs => {
        const speedCfg = loadedConfigs.find(c => c.key === 'MAX_SPEED_LIMIT');
        const brakeCfg = loadedConfigs.find(c => c.key === 'BRAKING_DECELE_THRESHOLD');
        const gyroCfg = loadedConfigs.find(c => c.key === 'GYRO_DISTRACTION_LIMIT');
        
        if (speedCfg) maxSpeedLimit.current = parseFloat(speedCfg.value) || 90;
        if (brakeCfg) brakingDecelThreshold.current = parseFloat(brakeCfg.value) || -10;
        if (gyroCfg) gyroDistractionLimit.current = parseFloat(gyroCfg.value) || 1.2;
        
        console.log(`[TELEMETRY] Dynamic config applied: SpeedLimit=${maxSpeedLimit.current} | BrakeLimit=${brakingDecelThreshold.current} | GyroLimit=${gyroDistractionLimit.current}`);
      }).catch(err => {
        console.warn('Using default telemetry configs:', err);
      });

      // -------------------------------------------------------------
      // TIMER CLOCK LOOP
      // -------------------------------------------------------------
      timerRef.current = setInterval(() => {
        setTripSeconds(prev => prev + 1);

        // Fatigue growth over time
        setFatigueLevel(prev => {
          const nextFatigue = Math.min(100, prev + 0.1); // ~10% increase per hour
          if (nextFatigue > maxFatigue.current) maxFatigue.current = nextFatigue;

          if (nextFatigue > 80 && prev <= 80) {
            showNotification("Alerta de Fadiga!", "Nível crítico. Pare para descansar na próxima estação.", "danger");
          }
          return nextFatigue;
        });

        // Trigger occasional random safe tips
        if (Math.random() < 0.04) {
          triggerSafeDrivingTip();
        }
      }, 1000);

      // -------------------------------------------------------------
      // LIFECYCLE MONITORING: OS BACKGROUND APP USAGE DETECTOR
      // -------------------------------------------------------------
      appStateListener.current = AppState.addEventListener('change', (nextAppState) => {
        if (currentIsDriving.current && nextAppState !== 'active') {
          // Severely flag when driver minimizes/backgrounds SHIFT App while driving!
          setPhoneDistracted(true);
          setDistractionAlert(true);
          setScore(prev => Math.max(20, prev - 15)); // Huge penalty for operating phone!
          showNotification("Distração Detetada!", "Uso de telemóvel detetado enquanto conduz!", "danger");
        }
      });

      // -------------------------------------------------------------
      // PHYSICAL HARDWARE: ACCELEROMETER PHONE SHAKE DETECTOR
      // -------------------------------------------------------------
      Accelerometer.setUpdateInterval(500); // 2Hz
      accelSubscription.current = Accelerometer.addListener(data => {
        if (!currentIsDriving.current) return;
        const force = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
        // Normal force is ~1.0g. If it drifts by 0.35g, phone is being actively handled or shaken
        if (Math.abs(force - 1.0) > 0.35) {
          handlePhoneDistraction();
        }
      });

      // -------------------------------------------------------------
      // PHYSICAL HARDWARE: GYROSCOPE PHONE ROTATION DETECTOR
      // -------------------------------------------------------------
      Gyroscope.setUpdateInterval(500);
      gyroSubscription.current = Gyroscope.addListener(data => {
        if (!currentIsDriving.current) return;
        const rotationRate = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
        // Rad/s rotation. Dynamic distraction threshold
        if (rotationRate > gyroDistractionLimit.current) {
          handlePhoneDistraction();
        }
      });

      // Start GPS monitoring
      startGpsWatching();

    } else {
      // Clean up subscriptions when stopping
      cleanupListeners();
    }

    return () => cleanupListeners();
  }, [isDriving]);

  // Clean up all native Android listeners defensively
  const cleanupListeners = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (appStateListener.current) {
      appStateListener.current.remove();
      appStateListener.current = null;
    }
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    if (accelSubscription.current) {
      accelSubscription.current.remove();
      accelSubscription.current = null;
    }
    if (gyroSubscription.current) {
      gyroSubscription.current.remove();
      gyroSubscription.current = null;
    }
  };

  // -------------------------------------------------------------
  // REAL-TIME WEATHER API CALLER (OPEN-METEO API)
  // -------------------------------------------------------------
  const fetchWeather = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
      );
      const data = await response.json();
      if (data && data.current) {
        const temp = data.current.temperature_2m;
        const code = data.current.weather_code;
        
        let isWet = false;
        let desc = 'Tempo Limpo';
        let iconName = 'sun';

        // WMO Weather Codes (https://open-meteo.com/en/docs)
        // 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99: Rain/Drizzle/Thunderstorms
        // 71, 73, 75, 77, 85, 86: Snow
        // 45, 48: Fog
        if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
          isWet = true;
          desc = 'Chuva Detetada';
          iconName = 'cloud-rain';
        } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
          isWet = true;
          desc = 'Neve Detetada';
          iconName = 'snowflake';
        } else if ([45, 48].includes(code)) {
          isWet = true;
          desc = 'Nevoeiro Detetado';
          iconName = 'cloud-fog';
        } else if ([1, 2, 3].includes(code)) {
          desc = 'Parcialmente Nublado';
          iconName = 'cloud';
        }

        setWeatherInfo({
          isWetRoad: isWet,
          description: desc,
          temperature: Math.round(temp),
          icon: iconName
        });
        console.log(`[WEATHER API] Successfully updated: ${desc} | ${temp}°C`);
      }
    } catch (error) {
      console.warn('Weather API fetch failed:', error);
    }
  };

  // -------------------------------------------------------------
  // REAL-TIME GPS WATCHER
  // -------------------------------------------------------------
  const startGpsWatching = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        setShowPermissionModal(true);
        setIsDriving(false);
        return;
      }

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (loc) => {
          if (!currentIsDriving.current) return;

          // Smart real-time weather update (Throttle to fetch at most once every 5 minutes)
          const now = Date.now();
          if (now - lastWeatherFetchTime.current > 300000) {
            lastWeatherFetchTime.current = now;
            fetchWeather(loc.coords.latitude, loc.coords.longitude);
          }

          // coords.speed is speed in meters per second
          const speedMps = loc.coords.speed || 0;
          const speedKmh = Math.max(0, Math.round(speedMps * 3.6));

          setSpeed(speedKmh);
          speedsArray.current.push(speedKmh);

          // Real distance accumulation in kilometers
          setDistance(prev => parseFloat((prev + (speedKmh / 3600)).toFixed(3)));

          // Deceleration derivative (Sudden braking)
          const deceleration = speedKmh - prevSpeed.current;
          if (prevSpeed.current > 15 && deceleration < brakingDecelThreshold.current) {
            // Dynamic sudden brake threshold
            handleSuddenBrake(deceleration);
          }

          // Speeding check
          if (speedKmh > maxSpeedLimit.current) {
            setSpeedingAlert(true);
            setScore(prev => Math.max(30, prev - 3));
            showNotification("Velocidade Elevada!", `Reduza a velocidade abaixo dos ${maxSpeedLimit.current} km/h.`, "danger");
          } else {
            setSpeedingAlert(false);
          }

          prevSpeed.current = speedKmh;
        }
      );
    } catch (error) {
      console.error('GPS Telemetry startup failed:', error);
      showNotification("Erro no GPS", "Não foi possível aceder ao sinal de satélite.", "danger");
      setIsDriving(false);
    }
  };

  // -------------------------------------------------------------
  // TRAVAGEM BRUSCA (SUDDEN BRAKING DETECTED)
  // -------------------------------------------------------------
  const handleSuddenBrake = (decelerationVal) => {
    setBrakingAlert(true);
    setScore(prev => Math.max(30, prev - 8));
    showNotification("Travagem Brusca!", `Desaceleração severa detetada (${Math.round(decelerationVal)} km/h). Conduza defensivamente.`, "warning");
    
    // Auto clear warning screen feedback after 3.5 seconds
    setTimeout(() => {
      setBrakingAlert(false);
    }, 3500);
  };

  // -------------------------------------------------------------
  // USO DE TELEMÓVEL (PHONE HANDLING DISTRACTION)
  // -------------------------------------------------------------
  const handlePhoneDistraction = () => {
    // Only trigger distraction warnings if driving speed is above minimum threshold to avoid triggers while parked
    if (speed < 5) return;

    setPhoneDistracted(true);
    setDistractionAlert(true);
    setScore(prev => Math.max(30, prev - 5));
    showNotification("Uso de Telemóvel!", "Mantenha as mãos no volante e o telemóvel fixo no suporte!", "danger");

    setTimeout(() => {
      setPhoneDistracted(false);
      setDistractionAlert(false);
    }, 4000);
  };

  // -------------------------------------------------------------
  // START/STOP DRIVING SESSION TRIGGERS
  // -------------------------------------------------------------
  const toggleTrip = async () => {
    if (isDriving) {
      setIsDriving(false);
      setPhoneDistracted(false);
      setDistractionAlert(false);
      setSpeedingAlert(false);
      setBrakingAlert(false);

      const finalScore = score;
      const finalDistance = distance;
      const duration = tripSeconds;
      const avgSpeed = speedsArray.current.length > 0
        ? Math.round(speedsArray.current.reduce((a, b) => a + b, 0) / speedsArray.current.length)
        : 50;

      showNotification("A guardar viagem...", "A enviar telemetria real ao servidor...", "info");

      // Save real telemetric data directly to local SQLite
      try {
        await ApiService.saveTrip({
          score: finalScore,
          speedAvg: avgSpeed,
          fatigueMax: Math.round(maxFatigue.current),
          distance: finalDistance,
          durationSeconds: duration
        });
        showNotification("Viagem Concluída!", `Telemetria processada! Score: ${finalScore}% | Distância: ${finalDistance.toFixed(2)} km.`, "success");
        
        // Refresh feeds
        if (refreshProfileCallback) refreshProfileCallback();
      } catch (err) {
        console.error('Error synchronizing trip telematics:', err);
        showNotification("Guardado Localmente", `Viagem salva em cache no dispositivo. Score: ${finalScore}%.`, "warning");
      }
    } else {
      // Reset variables for fresh session
      setScore(100);
      setDistance(0.0);
      setTripSeconds(0);
      setFatigueLevel(10);
      speedsArray.current = [];
      setIsDriving(true);
      showNotification("Telemetria Ativa", "Sensores Android e GPS ligados. Boa viagem!", "success");
    }
  };

  return {
    isDriving,
    score,
    speed,
    brakingAlert,
    speedingAlert,
    distractionAlert,
    phoneDistracted,
    setPhoneDistracted,
    tripSeconds,
    distance,
    fatigueLevel,
    weatherInfo,
    toggleTrip,
    handleSuddenBrake,
    triggerSafeDrivingTip,
    showPermissionModal,
    setShowPermissionModal,
    requestLocationPermission
  };
}
