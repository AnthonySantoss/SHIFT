import { useState, useEffect, useRef } from 'react';
import { AppState, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import ApiService from '../models/api.model';

export function useTripController(soundEnabled, setNotification, refreshProfileCallback, isAuthenticated) {
  const [isDriving, setIsDriving] = useState(false);
  const [score, setScore] = useState(100);
  const [dbTips, setDbTips] = useState([]);

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

  // Hotspots / Risk Zones
  const [hotspots, setHotspots] = useState([]);
  const [lastHotspotAlert, setLastHotspotAlert] = useState(0);

  // References for native watchers
  const locationSubscription = useRef(null);
  const accelSubscription = useRef(null);
  const gyroSubscription = useRef(null);
  
  const lastWeatherFetchTime = useRef(0);
  const currentCoords = useRef(null);
  
  const timerRef = useRef(null);
  const appStateListener = useRef(null);

  // Buffer for sensor fusion
  const accelBuffer = useRef([]); // Stores last 10 force readings
  const gyroBuffer = useRef([]); // Stores last 10 rotation readings

  // Dynamic references to keep track of current telemetry state inside asynchronous callbacks
  const speedsArray = useRef([]);
  const maxFatigue = useRef(10);
  const prevSpeed = useRef(0);
  const currentIsDriving = useRef(false);

  // Administrative dynamic settings
  const maxSpeedLimit = useRef(90);
  const brakingDecelThreshold = useRef(-10);
  const gyroDistractionLimit = useRef(1.2);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

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

  // Fetch real weather and hotspots
  useEffect(() => {
    async function initData() {
      if (!isAuthenticated) return;
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (loc && loc.coords) {
            currentCoords.current = loc.coords;
            await fetchWeather(loc.coords.latitude, loc.coords.longitude);
          }
        } else {
          setShowPermissionModal(true);
        }

        // Load Hotspots from API
        const response = await ApiService.fetchHotspots();
        setHotspots(response.hotspots || []);
      } catch (e) {
        console.warn('Initial data load failed:', e);
      }
    }
    initData();
  }, [isAuthenticated]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (loc && loc.coords) {
          currentCoords.current = loc.coords;
          await fetchWeather(loc.coords.latitude, loc.coords.longitude);
        }
        showNotification("Localização Permitida", "O acesso ao GPS e à telemetria de condução foi ativado.", "success");
      } else {
        showNotification("Permissão Negada", "Algumas funcionalidades de condução e score podem ficar indisponíveis.", "warning");
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    } finally {
      setShowPermissionModal(false);
    }
  };

  // Telemetry GPS & Sensors Lifecycle
  useEffect(() => {
    currentIsDriving.current = isDriving;

    if (isDriving) {
      speedsArray.current = [];
      maxFatigue.current = 10;
      prevSpeed.current = 0;
      accelBuffer.current = [];
      gyroBuffer.current = [];

      // Fetch dynamic thresholds from backend config
      ApiService.fetchConfigs().then(loadedConfigs => {
        const speedCfg = loadedConfigs.find(c => c.key === 'MAX_SPEED_LIMIT');
        const brakeCfg = loadedConfigs.find(c => c.key === 'BRAKING_DECELE_THRESHOLD');
        const gyroCfg = loadedConfigs.find(c => c.key === 'GYRO_DISTRACTION_LIMIT');
        
        if (speedCfg) maxSpeedLimit.current = parseFloat(speedCfg.value) || 90;
        if (brakeCfg) brakingDecelThreshold.current = parseFloat(brakeCfg.value) || -10;
        if (gyroCfg) gyroDistractionLimit.current = parseFloat(gyroCfg.value) || 1.2;
      }).catch(err => {
        console.warn('Using default telemetry configs:', err);
      });

      timerRef.current = setInterval(() => {
        setTripSeconds(prev => prev + 1);
        setFatigueLevel(prev => {
          const nextFatigue = Math.min(100, prev + 0.1);
          if (nextFatigue > maxFatigue.current) maxFatigue.current = nextFatigue;
          if (nextFatigue > 80 && prev <= 80) {
            showNotification("Alerta de Fadiga!", "Nível crítico. Pare para descansar na próxima estação.", "danger");
          }
          return nextFatigue;
        });
        if (Math.random() < 0.04) triggerSafeDrivingTip();
      }, 1000);

      appStateListener.current = AppState.addEventListener('change', (nextAppState) => {
        if (currentIsDriving.current && nextAppState !== 'active') {
          handlePhoneDistraction(true);
        }
      });

      Accelerometer.setUpdateInterval(100);
      accelSubscription.current = Accelerometer.addListener(data => {
        if (!currentIsDriving.current) return;
        const force = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
        accelBuffer.current.push(force);
        if (accelBuffer.current.length > 10) accelBuffer.current.shift();

        if (Math.abs(force - 1.0) > 0.4 && speed > 5) {
          handlePhoneDistraction();
        }
      });

      Gyroscope.setUpdateInterval(100);
      gyroSubscription.current = Gyroscope.addListener(data => {
        if (!currentIsDriving.current) return;
        const rotationRate = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
        gyroBuffer.current.push(rotationRate);
        if (gyroBuffer.current.length > 10) gyroBuffer.current.shift();

        if (rotationRate > gyroDistractionLimit.current && speed > 5) {
          handlePhoneDistraction();
        }
      });

      startGpsWatching();
    } else {
      cleanupListeners();
    }
    return () => cleanupListeners();
  }, [isDriving]);

  const cleanupListeners = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (appStateListener.current) appStateListener.current.remove();
    if (locationSubscription.current) locationSubscription.current.remove();
    if (accelSubscription.current) accelSubscription.current.remove();
    if (gyroSubscription.current) gyroSubscription.current.remove();
  };

  const fetchWeather = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
      );
      const data = await response.json();
      if (data && data.current) {
        const temp = data.current.temperature_2m;
        const code = data.current.weather_code;
        let isWet = false; let desc = 'Tempo Limpo'; let iconName = 'sun';

        if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
          isWet = true; desc = 'Chuva Detetada'; iconName = 'cloud-rain';
        } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
          isWet = true; desc = 'Neve Detetada'; iconName = 'snowflake';
        } else if ([45, 48].includes(code)) {
          isWet = true; desc = 'Nevoeiro Detetado'; iconName = 'cloud-fog';
        } else if ([1, 2, 3].includes(code)) {
          desc = 'Parcialmente Nublado'; iconName = 'cloud';
        }
        setWeatherInfo({ isWetRoad: isWet, description: desc, temperature: Math.round(temp), icon: iconName });
      }
    } catch (error) {
      console.warn('Weather API fetch failed:', error);
    }
  };

  const startGpsWatching = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        setShowPermissionModal(true); setIsDriving(false); return;
      }
      locationSubscription.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 1 },
        (loc) => {
          if (!currentIsDriving.current) return;
          currentCoords.current = loc.coords;

          const now = Date.now();
          if (now - lastHotspotAlert > 60000) {
            const nearby = hotspots.find(h => calculateDistance(loc.coords.latitude, loc.coords.longitude, h.lat, h.lng) < 0.3);
            if (nearby) {
              setLastHotspotAlert(now);
              showNotification("Zona de Risco!", "Aproximando-se de área com histórico de infrações.", "danger");
            }
          }

          if (now - lastWeatherFetchTime.current > 300000) {
            lastWeatherFetchTime.current = now;
            fetchWeather(loc.coords.latitude, loc.coords.longitude);
          }

          const speedMps = loc.coords.speed || 0;
          const speedKmh = Math.max(0, Math.round(speedMps * 3.6));
          setSpeed(speedKmh);
          speedsArray.current.push(speedKmh);
          setDistance(prev => parseFloat((prev + (speedKmh / 3600)).toFixed(3)));

          const deceleration = speedKmh - prevSpeed.current;
          const maxAccel = accelBuffer.current.length > 0 ? Math.max(...accelBuffer.current) : 1.0;

          if (prevSpeed.current > 15 && deceleration < brakingDecelThreshold.current) {
            if (maxAccel > 1.25) { // Fusion confirmation
              handleSuddenBrake(deceleration);
            }
          }

          if (speedKmh > maxSpeedLimit.current) {
            setSpeedingAlert(true);
            setScore(prev => Math.max(30, prev - 3));
            showNotification("Velocidade Elevada!", `Reduza abaixo dos ${maxSpeedLimit.current} km/h.`, "danger");
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

  const handleSuddenBrake = (decelerationVal) => {
    setBrakingAlert(true);
    setScore(prev => Math.max(30, prev - 8));
    showNotification("Travagem Brusca!", `Desaceleração severa detetada. Conduza defensivamente.`, "warning");
    setTimeout(() => setBrakingAlert(false), 3500);
  };

  const handlePhoneDistraction = (isBackground = false) => {
    if (!isBackground && speed < 5) return;
    setPhoneDistracted(true);
    setDistractionAlert(true);
    setScore(prev => Math.max(20, prev - (isBackground ? 15 : 5)));
    showNotification("Distração Detetada!", isBackground ? "App em segundo plano!" : "Uso de telemóvel detetado!", "danger");
    setTimeout(() => { setPhoneDistracted(false); setDistractionAlert(false); }, 4000);
  };

  const toggleTrip = async () => {
    if (isDriving) {
      setIsDriving(false);
      const finalScore = score;
      const finalDistance = distance;
      const duration = tripSeconds;
      const avgSpeed = speedsArray.current.length > 0
        ? Math.round(speedsArray.current.reduce((a, b) => a + b, 0) / speedsArray.current.length)
        : 50;

      showNotification("A guardar viagem...", "A enviar telemetria real...", "info");

      try {
        await ApiService.saveTrip({
          score: finalScore,
          speedAvg: avgSpeed,
          fatigueMax: Math.round(maxFatigue.current),
          distance: finalDistance,
          durationSeconds: duration,
          latitude: currentCoords.current?.latitude,
          longitude: currentCoords.current?.longitude
        });
        showNotification("Viagem Concluída!", `Score: ${finalScore}% | Distância: ${finalDistance.toFixed(2)} km.`, "success");
        if (refreshProfileCallback) refreshProfileCallback();
      } catch (err) {
        console.error('Error synchronizing trip:', err);
        showNotification("Guardado Localmente", `Viagem salva no dispositivo. Score: ${finalScore}%.`, "warning");
      }
    } else {
      setScore(100); setDistance(0.0); setTripSeconds(0); setFatigueLevel(10); speedsArray.current = [];
      setIsDriving(true);
      showNotification("Telemetria Ativa", "Sensores e GPS ligados. Boa viagem!", "success");
    }
  };

  return {
    isDriving, score, speed, brakingAlert, speedingAlert, distractionAlert, phoneDistracted,
    setPhoneDistracted, tripSeconds, distance, fatigueLevel, weatherInfo,
    toggleTrip, handleSuddenBrake, triggerSafeDrivingTip,
    showPermissionModal, setShowPermissionModal, requestLocationPermission
  };
}
