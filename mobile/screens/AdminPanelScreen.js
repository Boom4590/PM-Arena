import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';

const BACKEND_URL = 'http://localhost:3000';

export default function AdminPanel({ user, onClose }) {
  const [activeSection, setActiveSection] = useState(null); // null или 'block', 'create', 'lobby', 'delete', 'archive'

  const [deleteTournamentId, setDeleteTournamentId] = useState('');
  const [blockPhone, setBlockPhone] = useState('');
  const [pubgId, setBlockPubgId] = useState('');
  const [createMode, setCreateMode] = useState('');
  const [createEntryFee, setCreateEntryFee] = useState('');
  const [createPrizePool, setCreatePrizePool] = useState('');
  const [createStartTime, setCreateStartTime] = useState('');
  const [lobbyTournamentId, setLobbyTournamentId] = useState('');
  const [lobbyRoomId, setLobbyRoomId] = useState('');
  const [lobbyPassword, setLobbyPassword] = useState('');

  async function blockUser() {
   
   
    const pubg_id = pubgId;
    try {
      const res = await fetch(`${BACKEND_URL}/admin/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubg_id}),
      });
      if (!res.ok) {
        const json = await res.json();
        Alert.alert('Ошибка', json.error || 'Ошибка блокировки');
        return;
      }
      Alert.alert('Успешно', 'Пользователь заблокирован');
      setBlockPhone('');
      setBlockPubgId('');
    } catch {
      Alert.alert('Ошибка', 'Ошибка сервера');
    }
  }

  async function archiveParticipants() {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/archiveParticipants`, {
        method: 'POST',
      });
      const json = await res.json();

      if (res.ok) {
        Alert.alert('Успех', json.message);
      } else {
        Alert.alert('Ошибка', json.error || 'Не удалось архивировать');
        console.log('Ошибка', json.error || 'Не удалось архивировать')
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Ошибка подключения к серверу');
    }
  }

  async function createTournament() {
    if (
      !createMode.trim() ||
      !createEntryFee.trim() ||
      !createPrizePool.trim() ||
      !createStartTime.trim()
    ) {
      Alert.alert('Ошибка', 'Заполните все поля для создания турнира');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/admin/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: createMode,
          entry_fee: Number(createEntryFee),
          prize_pool: Number(createPrizePool),
          start_time: createStartTime,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        Alert.alert('Ошибка', json.error || 'Ошибка создания турнира');
        return;
      }
      Alert.alert('Успешно', 'Турнир создан');
      setCreateMode('');
      setCreateEntryFee('');
      setCreatePrizePool('');
      setCreateStartTime('');
    } catch {
      Alert.alert('Ошибка', 'Ошибка сервера');
    }
  }

  async function deleteTournament() {
    if (!deleteTournamentId.trim()) {
      Alert.alert('Ошибка', 'Введите ID турнира для удаления');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/admin/delete/${deleteTournamentId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok) {
        Alert.alert('Успешно', 'Турнир удалён');
        setDeleteTournamentId('');
      } else {
        Alert.alert('Ошибка', json.error || 'Не удалось удалить турнир');
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Ошибка подключения к серверу');
    }
  }

  async function sendLobby() {
    if (!lobbyTournamentId || !lobbyRoomId || !lobbyPassword) {
      Alert.alert('Ошибка', 'Заполните все поля для отправки лобби');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/admin/send_lobby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournament_id: Number(lobbyTournamentId),
          room_id: lobbyRoomId,
          room_password: lobbyPassword,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        Alert.alert('Ошибка', json.error || 'Ошибка отправки лобби');
        return;
      }
      Alert.alert('Успешно', 'Данные лобби отправлены');
      setLobbyTournamentId('');
      setLobbyRoomId('');
      setLobbyPassword('');
    } catch {
      Alert.alert('Ошибка', 'Ошибка сервера');
    }
  }

  function toggleSection(sectionName) {
    setActiveSection((prev) => (prev === sectionName ? null : sectionName));
  }

  return (
    <ScrollView style={styles.container}>
      {/* Аккордеон: Заголовок и тело */}
      <TouchableOpacity onPress={() => toggleSection('block')} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Блокировка пользователя по телефону</Text>
      </TouchableOpacity>
      {activeSection === 'block' && (
        <View>
          <TextInput
            placeholder="PUBG MOBILE ID"
            value={pubgId}
            onChangeText={(text) => {
              const digitsOnly = text.replace(/[^0-9]/g, '');
              if (digitsOnly.length <= 8) {
                setBlockPubgId(digitsOnly);
              }
            }}
            keyboardType="number-pad"
            maxLength={8}
            style={styles.input}
          />
          <Button title="Заблокировать пользователя" onPress={blockUser} />
        </View>
      )}

      <TouchableOpacity onPress={() => toggleSection('create')} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Создание турнира</Text>
      </TouchableOpacity>
      {activeSection === 'create' && (
        <View>
          <TextInput
            placeholder="Режим"
            value={createMode}
            onChangeText={setCreateMode}
            style={styles.input}
          />
          <TextInput
            placeholder="Вступительный взнос"
            value={createEntryFee}
            onChangeText={setCreateEntryFee}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Призовой фонд"
            value={createPrizePool}
            onChangeText={setCreatePrizePool}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInputMask
            type={'datetime'}
            options={{
              format: 'YYYY-MM-DD HH:mm:ss',
            }}
            value={createStartTime}
            onChangeText={setCreateStartTime}
            style={styles.input}
          />
          <Button title="Создать турнир" onPress={createTournament} />
        </View>
      )}

      <TouchableOpacity onPress={() => toggleSection('lobby')} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Отправка данных лобби</Text>
      </TouchableOpacity>
      {activeSection === 'lobby' && (
        <View>
          <TextInput
            placeholder="ID турнира"
            value={lobbyTournamentId}
            onChangeText={setLobbyTournamentId}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="ID комнаты"
            value={lobbyRoomId}
            onChangeText={setLobbyRoomId}
            style={styles.input}
          />
          <TextInput
            placeholder="Пароль комнаты"
            value={lobbyPassword}
            onChangeText={setLobbyPassword}
            style={styles.input}
          />
          <Button title="Отправить лобби" onPress={sendLobby} />
        </View>
      )}

      <TouchableOpacity onPress={() => toggleSection('delete')} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Удаление турнира</Text>
      </TouchableOpacity>
      {activeSection === 'delete' && (
        <View>
          <TextInput
            placeholder="ID турнира"
            value={deleteTournamentId}
            onChangeText={setDeleteTournamentId}
            keyboardType="numeric"
            style={styles.input}
          />
          <Button title="Удалить турнир" onPress={deleteTournament} />
        </View>
      )}

      <TouchableOpacity onPress={() => toggleSection('archive')} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Архивировать участников</Text>
      </TouchableOpacity>
      {activeSection === 'archive' && (
        <View style={{ marginVertical: 10 }}>
          <Button title="Архивировать Participants" onPress={archiveParticipants} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  sectionHeader: {
    backgroundColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 15,
    borderRadius: 5,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 8,
    padding: 10,
  },
});
