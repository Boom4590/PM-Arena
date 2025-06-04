import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { UserContext } from '../UserContext';

const BACKEND_URL = 'http://localhost:3000';

export default function Tournaments({ navigation }) {
  const { userInfo } = useContext(UserContext);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchTournaments() {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/tournaments`);
      const data = await res.json();

      const updated = data.map(t => ({
        ...t,
        isParticipating: t.participants?.some(p => p.pubg_id === userInfo?.pubg_id) || false,
      }));

      setTournaments([
        ...updated,
        {
          id: 24,
          mode: 'Erangel, Solo',
          entry_fee: 500,
          prize_pool: 45000,
          start_time: new Date().toISOString(),
          participants_count: 0,
          isParticipating: false,
          isFake: true,
        },
      ]);
    } catch {
      Alert.alert('Ошибка', 'Не удалось загрузить турниры');
    } finally {
      setLoading(false);
    }
  }

  async function joinTournament(tournament_id, entry_fee) {
    if (!userInfo) {
      Alert.alert('Ошибка', 'Вы не вошли в систему');
      return;
    }

    if (userInfo.balance < entry_fee) {
      Alert.alert('Ошибка', 'Недостаточно средств для участия');
      return;
    }

    try {
      const pubg_id = userInfo.pubg_id;
      const res = await fetch(`${BACKEND_URL}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubg_id, tournament_id }),
      });

      if (!res.ok) {
        const json = await res.json();
        Alert.alert('Ошибка', json.error || 'Не удалось присоединиться');
        return;
      }

      Alert.alert('Успешно', 'Вы зарегистрированы на турнир');
      setTournaments(prev =>
        prev.map(t =>
          t.id === tournament_id ? { ...t, isParticipating: true } : t
        )
      );
      navigation.navigate('Current');
    } catch {
      Alert.alert('Ошибка', 'Ошибка подключения к серверу');
    }
  }

  useEffect(() => {
    fetchTournaments();
  }, []);

  function renderItem({ item }) {
    const isFull = item.participants_count >= 100;
    const isParticipating = item.isParticipating;
    const startDate = new Date(item.start_time);
    const startTimeStr = startDate.toLocaleString();

    let buttonTitle = 'Участвовать';
    let disabled = false;

    if (isParticipating) {
      buttonTitle = 'Вы участвуете';
      disabled = true;
    } else if (isFull) {
      buttonTitle = 'Заполнен';
      disabled = true;
    }

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>#{item.id} · {item.mode}</Text>
        <Text style={styles.cardDetail}>💵 Вход билет: <Text style={styles.bold}>{item.entry_fee} $</Text></Text>
        <Text style={styles.cardDetail}>🏆 Приз. фонд: <Text style={styles.bold}>{item.prize_pool} $</Text></Text>
        <Text style={styles.cardDetail}>🕒 Дата Старт: <Text style={styles.muted}>{startTimeStr}</Text></Text>
        <Text style={styles.cardDetail}>👥 Участников: {item.participants_count || 0}/100</Text>

        <TouchableOpacity
          disabled={item.isFake || disabled}
          onPress={() => !item.isFake && joinTournament(item.id, item.entry_fee)}
          style={[
            styles.button,
            (item.isFake || disabled) && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>
            {item.isFake ? 'Скоро' : buttonTitle}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && <Text style={styles.loading}>Загрузка...</Text>}
      {!loading && tournaments.length === 0 && <Text style={styles.loading}>Турниры не найдены</Text>}
      <FlatList
        data={tournaments}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  cardDetail: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  bold: {
    fontWeight: '600',
    color: '#1f2937',
  },
  muted: {
    color: '#6b7280',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  loading: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 20,
    color: '#6b7280',
  },
});
