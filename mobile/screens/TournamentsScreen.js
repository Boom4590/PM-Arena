import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { UserContext } from '../UserContext';

const BACKEND_URL = 'http://192.168.0.110:3000';

export default function Tournaments({ navigation }) {
  const { userInfo } = useContext(UserContext);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);

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
      console.log('Ошибка при загрузке турниров',error);
    } finally {
      setLoading(false);
    }
  }

  async function confirmJoin() {
    if (!selectedTournament || !userInfo) return;

    const { id, entry_fee } = selectedTournament;

    if (userInfo.balance < entry_fee) {
      setConfirmVisible(false);
      return Alert.alert('Ошибка', 'Недостаточно средств для участия');
    }

    try {
      const res = await fetch(`${BACKEND_URL}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubg_id: userInfo.pubg_id, tournament_id: id }),
      });

      const json = await res.json();
      if (!res.ok) {
        Alert.alert('Ошибка', json.error || 'Не удалось присоединиться');
        setConfirmVisible(false);
        return;
      }

      // Успешно
      await fetchTournaments();
      setConfirmVisible(false);
      navigation.navigate('Current');
    } catch {
      Alert.alert('Ошибка', 'Ошибка подключения к серверу');
      setConfirmVisible(false);
    }
  }

  function handleJoinPress(tournament) {
    setSelectedTournament(tournament);
    setConfirmVisible(true);
  }

  useFocusEffect(
    useCallback(() => {
      fetchTournaments();
    }, [userInfo])
  );

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
          onPress={() => !item.isFake && handleJoinPress(item)}
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

      {/* Подтверждение участия */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              Подтвердить участие в турнире #{selectedTournament?.id} за {selectedTournament?.entry_fee} $?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#d1d5db' }]}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#2563eb' }]}
                onPress={confirmJoin}
              >
                <Text style={styles.modalButtonText}>Подтвердить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#111827',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
