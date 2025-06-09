import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

const BACKEND_URL = 'http://localhost:3000';

export function UserProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [lobbyVisible, setLobbyVisible] = useState(false);

  const timerRef = useRef(null);

  // Загрузка user из AsyncStorage при старте
  useEffect(() => {
    async function loadUser() {
      const savedUser = await AsyncStorage.getItem('userInfo');
      if (savedUser) setUserInfo(JSON.parse(savedUser));
    }
    loadUser();
  }, []);

  // Сохраняем user в AsyncStorage при изменении
  useEffect(() => {
    if (userInfo) {
      AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
    } else {
      AsyncStorage.removeItem('userInfo');
    }
  }, [userInfo]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback((seconds) => {
    clearTimers();
    let time = seconds;
    timerRef.current = setInterval(() => {
      time--;
      setTimeLeft(time);
      if (time <= 0) {
        clearTimers();
        fetchCurrentTournament(); // обновить данные, чтобы проверить лобби
      }
    }, 1000);
  }, [clearTimers]);

  const startLobbyTimer = useCallback((seconds) => {
    clearTimers();
    let time = seconds;
    timerRef.current = setInterval(() => {
      time--;
      setTimeLeft(time);
      if (time <= 0) {
        clearTimers();
        setLobbyVisible(false);
        setTournament(null);
      }
    }, 1000);
  }, [clearTimers]);

  // Основная функция fetchCurrentTournament
  const fetchCurrentTournament = useCallback(async () => {
    if (!userInfo?.pubg_id) return;

    try {
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
        clearTimers();
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
          clearTimers();
        }
      } else {
        setLobbyVisible(false);
        setTimeLeft(diffSec);
        startTimer(diffSec);
      }
    } catch (err) {
      console.error('Ошибка при загрузке турнира:', err);
      setTournament(null);
      setLobbyVisible(false);
      setTimeLeft(null);
      clearTimers();
    }
  }, [userInfo, clearTimers, startTimer, startLobbyTimer]);

  return (
    <UserContext.Provider value={{
      userInfo,
      setUserInfo,
      tournament,
      timeLeft,
      lobbyVisible,
      fetchCurrentTournament,
    }}>
      {children}
    </UserContext.Provider>
  );
}
