import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { UserContext } from '../UserContext';

const BACKEND_URL = 'http://localhost:3000';

export default function CurrentTournament() {
  const { userInfo } = useContext(UserContext); // получаем user из контекста

  const [tournament, setTournament] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [lobbyVisible, setLobbyVisible] = useState(false);

  const timerRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      if (!userInfo || !userInfo.pubg_id) {
        setTournament(null);
        return;
      }

      fetchCurrentTournament();

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [userInfo])
  );

 async function fetchCurrentTournament() {
  try {
    const pubg_id = userInfo.pubg_id
    console.log('Отправляю pubg_id:', pubg_id);
    const res = await fetch(`${BACKEND_URL}/current`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pubg_id }),
    });


    if (!res.ok) {
      console.log(res.status)
      throw new Error('Нет текущего турнира');
      
    }

    const data = await res.json(); // Читаем ОДИН раз
    if (!data || Object.keys(data).length === 0) {
      setTournament(null);
      return;
    }

    setTournament(data);

    const startTime = new Date(data.start_time);
    const now = new Date();
    const diffSec = Math.floor((startTime - now) / 1000);

    if (diffSec <= 0) {
      if (data.room_id && data.room_password) {
        setLobbyVisible(true);
        setTimeLeft(15 * 60);
        startLobbyTimer(15 * 60);
      } else {
        setLobbyVisible(false);
        setTimeLeft(null);
      }
    } else if (diffSec <= 15 * 60) {
      setTimeLeft(diffSec);
      startTimer(diffSec);
    } else {
      setTimeLeft(null);
    }
  } catch (err) {
    console.error(err);
    Alert.alert('Ошибка', 'Не удалось загрузить текущий турнир');
    setTournament(null);
  }
}

  function startTimer(seconds) {
    if (timerRef.current) clearInterval(timerRef.current);
    let time = seconds;
    timerRef.current = setInterval(() => {
      time--;
      setTimeLeft(time);
      if (time <= 0) {
        clearInterval(timerRef.current);
        setTimeLeft(null);
        fetchCurrentTournament();
      }
    }, 1000);
  }

  function startLobbyTimer(seconds) {
    if (timerRef.current) clearInterval(timerRef.current);
    let time = seconds;
    timerRef.current = setInterval(() => {
      time--;
      setTimeLeft(time);
      if (time <= 0) {
        clearInterval(timerRef.current);
        setLobbyVisible(false);
        setTournament(null);
      }
    }, 1000);
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  if (!tournament) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTournamentText}>У вас нет текущего турнира.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Текущий турнир #{tournament.id}</Text>
      <Text style={styles.subtitle}>Режим: {tournament.mode}</Text>
      <Text style={styles.subtitle}>Дата начала: {new Date(tournament.start_time).toLocaleString()}</Text>
      
      {timeLeft !== null && (
        <Text style={styles.timer}>До начала: {formatTime(timeLeft)}</Text>
      )}
      <Text style={styles.lobbyText}>Ваше место: {tournament.seat}</Text>

      {lobbyVisible && (
        <View style={styles.lobbyContainer}>
          <Text style={styles.lobbyTitle}>🎮 Лобби</Text>
          <Text style={styles.lobbyText}>Комната: {tournament.room_id}</Text>
          <Text style={styles.lobbyText}>Пароль: {tournament.room_password}</Text>
          <Text style={styles.lobbyText}>Ваше место: {tournament.seat}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F8',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#34495E',
    marginBottom: 6,
  },
  timer: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginVertical: 20,
    backgroundColor: '#FFF0ED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 3,
  },
  lobbyContainer: {
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  lobbyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2980B9',
    marginBottom: 10,
  },
  lobbyText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#2C3E50',
    marginBottom: 5,
  },
  noTournamentText: {
    fontSize: 18,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
});
