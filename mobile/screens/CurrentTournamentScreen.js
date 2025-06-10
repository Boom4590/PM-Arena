import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { UserContext } from '../UserContext';
import * as Clipboard from 'expo-clipboard';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = 'http://192.168.0.110:3000';

export default function CurrentTournament() {
  const { userInfo } = useContext(UserContext);
  const [tournament, setTournament] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [lobbyVisible, setLobbyVisible] = useState(false);
  const [lobbyCountdown, setLobbyCountdown] = useState(null);

  const timerRef = useRef(null);
  const pollingRef = useRef(null);
  const lobbyTimerRef = useRef(null);

  


function copyToClipboard(text) {
  Clipboard.setStringAsync(text);
  
}

  async function fetchCurrentTournament() {
    try {
      if (!userInfo?.pubg_id) return;

      const res = await fetch(`${BACKEND_URL}/current`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubg_id: userInfo.pubg_id }),
      });

      if (!res.ok) throw new Error('Нет текущего турнира');

      const data = await res.json();

      if (!data || Object.keys(data).length === 0) {
        setTournament(null);
        setLobbyVisible(false);
        setTimeLeft(null);
        setLobbyCountdown(null);
        clearLobbyTimer();
        return;
      }

      setTournament(data);

      const startTime = new Date(data.start_time);
      const now = new Date();
      const diffSec = Math.floor((startTime - now) / 1000);
      const timeToStart = diffSec > 0 ? diffSec : 0;

      setTimeLeft(timeToStart);
      setStartTime(startTime.getTime()); // startTime — объект Date


      clearLobbyTimer();
      const lobbyKey = `lobbyShown_${userInfo.pubg_id}_${data.id}`;
      const lobbyStartKey = `lobbyStart_${userInfo.pubg_id}_${data.id}`;

      const storedLobbyShown = await AsyncStorage.getItem(lobbyKey);
      const storedLobbyStart = await AsyncStorage.getItem(lobbyStartKey);

      if (storedLobbyShown === 'true') {
        setLobbyVisible(true);
        setLobbyCountdown(null);
        return;
      }

      if (data.room_id && data.room_password && data.seat) {
        const delaySeconds = data.seat * 5;

        if (storedLobbyStart) {
          // Восстанавливаем старт времени лобби
          const lobbyStartTime = parseInt(storedLobbyStart, 10);
          const elapsed = Math.floor((Date.now() - lobbyStartTime) / 1000);
          const remaining = delaySeconds - elapsed;

          if (remaining <= 0) {
            setLobbyVisible(true);
            setLobbyCountdown(null);
            await AsyncStorage.setItem(lobbyKey, 'true'); // Запоминаем, что лобби показано
          } else {
            setLobbyCountdown(remaining);

            lobbyTimerRef.current = setInterval(async () => {
              setLobbyCountdown((prev) => {
                if (prev === 1) {
                  clearLobbyTimer();
                  setLobbyVisible(true);
                  AsyncStorage.setItem(lobbyKey, 'true'); // Запоминаем
                  AsyncStorage.removeItem(lobbyStartKey);
                  return null;
                }
                return prev - 1;
              });
            }, 1000);
          }
        } else {
          // Начинаем новый отсчет и сохраняем время старта
          setLobbyCountdown(delaySeconds);
          await AsyncStorage.setItem(lobbyStartKey, Date.now().toString());

          lobbyTimerRef.current = setInterval(async () => {
            setLobbyCountdown((prev) => {
              if (prev === 1) {
                clearLobbyTimer();
                setLobbyVisible(true);
                AsyncStorage.setItem(lobbyKey, 'true'); // Запоминаем
                AsyncStorage.removeItem(lobbyStartKey);
                return null;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } else {
        setLobbyVisible(false);
        setLobbyCountdown(null);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Ошибка', 'Не удалось загрузить текущий турнир');
      setTournament(null);
      setLobbyVisible(false);
      setTimeLeft(null);
      setLobbyCountdown(null);
      clearLobbyTimer();
    }
  }

  function clearTimers() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function clearLobbyTimer() {
    if (lobbyTimerRef.current) {
      clearInterval(lobbyTimerRef.current);
      lobbyTimerRef.current = null;
    }
  }

  const [startTime, setStartTime] = useState(null);

useEffect(() => {
  if (!startTime) return;

  const interval = setInterval(() => {
    const now = Date.now();
    const diff = Math.floor((startTime - now) / 1000);
    setTimeLeft(diff > 0 ? diff : 0);
  }, 1000);

  return () => clearInterval(interval);
}, [startTime]);


  function formatTime(sec) {
    if (sec == null) return '';
    const days = Math.floor(sec / (3600 * 24));
    const hours = Math.floor((sec % (3600 * 24)) / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;

    return `${days.toString().padStart(2, '0')}:${hours
      .toString()
      .padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  useEffect(() => {
    if (!userInfo || !userInfo.pubg_id) {
      setTournament(null);
      setLobbyVisible(false);
      setTimeLeft(null);
      setLobbyCountdown(null);
      clearTimers();
      clearLobbyTimer();
      return;
    }

    fetchCurrentTournament();
    pollingRef.current = setInterval(fetchCurrentTournament, 20000);

    return () => {
      clearTimers();
      clearLobbyTimer();
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [userInfo]);

  if (!tournament) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTournamentText}>У вас нет текущего турнира.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Турнир #{tournament.id}</Text>

      {timeLeft !== null && (
        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>Осталось:</Text>
          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
        </View>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Режим: <Text style={styles.infoBold}>{tournament.mode}</Text>
        </Text>
        <Text style={styles.infoText}>
          Начало:{' '}
          <Text style={styles.infoBold}>
            {new Date(tournament.start_time).toLocaleString()}
          </Text>
        </Text>
        <Text style={styles.infoText}>
          Ваше место: <Text style={styles.infoBold}>{tournament.seat}</Text>
        </Text>
      </View>

      {!lobbyVisible && lobbyCountdown !== null && (
        <View style={styles.lobbyCountdownBox}>
          <Text style={styles.lobbyCountdownText}>
            Лобби появится через: {lobbyCountdown} сек
          </Text>
        </View>
      )}

      {lobbyVisible && (
        <View style={styles.lobbyBox}>
          <Text style={styles.lobbyTitle}>🎮 Данные лобби</Text>

          <View style={styles.copyRow}>
            <Text style={styles.lobbyLabel}>Комната:</Text>
            <Text style={styles.lobbyValue}>{tournament.room_id}</Text>
            <TouchableOpacity onPress={() => copyToClipboard(tournament.room_id)}>
              <MaterialIcons name="content-copy" size={16} color="#3498db" />
            </TouchableOpacity>
          </View>

          <View style={styles.copyRow}>
            <Text style={styles.lobbyLabel}>Пароль:</Text>
            <Text style={styles.lobbyValue}>{tournament.room_password}</Text>
            <TouchableOpacity onPress={() => copyToClipboard(tournament.room_password)}>
              <MaterialIcons name="content-copy" size={16} color="#3498db" />
            </TouchableOpacity>
          </View>
        </View>
      )}

    
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    padding: 20,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#2c3e50',
  },
  timerBox: {
    backgroundColor: '#fff',
    borderLeftWidth: 3,
    borderLeftColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    minWidth: 140,
  },
  timerLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  timer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  infoBox: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#34495e',
    marginBottom: 4,
  },
  infoBold: {
    fontWeight: '600',
    color: '#000',
  },
  lobbyBox: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 40,
  },
  lobbyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2980b9',
    marginBottom: 10,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lobbyLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2c3e50',
    width: 70,
  },
  lobbyValue: {
    fontSize: 12,
    color: '#2c3e50',
    flex: 1,
  },
  lobbyCountdownBox: {
    backgroundColor: '#fff',
    borderLeftWidth: 3,
    borderLeftColor: '#2980b9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    minWidth: 180,
  },
  lobbyCountdownText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2980b9',
  },
  noTournamentText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 30,
  },
  imagePlaceholder: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    height: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
});
