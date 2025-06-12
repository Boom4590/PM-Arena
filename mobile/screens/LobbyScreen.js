import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import LobbyGrid from './LobbyGrid';

const BACKEND_URL = 'http://192.168.0.110:3000';

const LobbyScreen = ({ route }) => {
  const [players, setPlayers] = useState([]);
  const { currentUserSlot } = route.params;

  // Функция загрузки игроков с сервера
  async function fetchPlayers() {
    try {
      const response = await fetch(`${BACKEND_URL}/players`);
      if (!response.ok) {
        throw new Error('Ошибка при загрузке игроков');
      }
      const playersFromServer = await response.json();

      // Текущий пользователь
    

      // Объединяем в один массив
      const combinedPlayers = [...playersFromServer];
      setPlayers(combinedPlayers);

      console.log('Игроки:', combinedPlayers);
    } catch (error) {
      console.error(error);
      setPlayers([]); // если ошибка - пустой массив
    }
  }

  // Загружаем игроков один раз при монтировании компонента
  useEffect(() => {
    fetchPlayers();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}></Text>
      <LobbyGrid players={players} currentUserId={currentUserSlot} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'none', paddingHorizontal: 12 },
  title: { fontSize: 20, color: 'white', textAlign: 'center', marginBottom: 12 },
});

export default LobbyScreen;
