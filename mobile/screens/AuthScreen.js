import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../UserContext';

const BACKEND_URL = 'http://192.168.0.110:3000';

export default function AuthScreen() {
  const { setUserInfo } = useContext(UserContext);

  const [isRegister, setIsRegister] = useState(true);
  const [pubg_id, setPubgId] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorPubgId, setErrorPubgId] = useState('');

  // Проверка PUBG ID при вводе
  const handlePubgIdChange = (text) => {
    const digitsOnly = text.replace(/[^0-9]/g, '');
    if (digitsOnly.length <= 8) {
      setPubgId(digitsOnly);
      if (errorPubgId) setErrorPubgId('');
    }
  };

  // Проверка всех полей для регистрации
  async function register() {
    if (!pubg_id || pubg_id.length !== 8) {
      setErrorPubgId('Введите корректный PUBG MOBILE ID');
      return;
    }
    if (!nickname || !phone || !password) {
      setErrorPubgId('');
      alert('Заполните все поля');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubg_id, nickname, phone, password }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || 'Ошибка регистрации');
        return;
      }
      alert('Регистрация прошла успешно. Войдите в аккаунт.');

setIsRegister(false);

// Очистка полей:
setPubgId('');
setPassword('');
setNickname('');
setPhone('');

      
    } catch (e) {
      alert('Сервер недоступен');
    }
  }

  // Проверка полей для логина
  async function login() {
    if (!pubg_id || pubg_id.length !== 8) {
      setErrorPubgId('Введите корректный PUBG MOBILE ID');
      return;
    }
    if (!password) {
      setErrorPubgId('');
      alert('Заполните PUBG ID и пароль');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubg_id, password }),
      });
    if (!res.ok) {
  const json = await res.json();
  if (res.status === 403) {
    alert(json.error || 'Ошибка авторизации');
    console.log('Вы заблокированы и не можете войти в аккаунт.')
    alert('Вы заблокированы и не можете войти в аккаунт.');
  } else {
    alert(json.error || 'Ошибка авторизации');
  }
  return;
}

      const data = await res.json();
      await AsyncStorage.setItem('loginSuccess', JSON.stringify(data.success));
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setUserInfo(data.user);
      console.log('User logged in:', data.user);
    } catch (e) {
      alert('Сервер недоступен');
    }
  }

  return (
   <View style={styles.container}>
  {isRegister && <Text style={styles.title}>Регистрация</Text>}

  <Text style={styles.label}>PUBG MOBILE ID</Text>
  <TextInput
    style={[styles.input, errorPubgId ? styles.inputError : null]}
    placeholder="Введите PUBG ID"
    value={pubg_id}
    keyboardType="number-pad"
    maxLength={8}
    onChangeText={handlePubgIdChange}
  />
  {!!errorPubgId && <Text style={styles.errorText}>{errorPubgId}</Text>}

  {isRegister && (
    <>
     
      <TextInput
        style={styles.input}
        placeholder="Введите никнейм"
        value={nickname}
        onChangeText={setNickname}
      />

    
      <TextInput
        style={styles.input}
        placeholder="Введите номер телефона"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
    </>
  )}


  <TextInput
    style={styles.input}
    placeholder="Введите пароль"
    
    value={password}
    onChangeText={setPassword}
  />

  {isRegister ? (
    <>
      <Button title="Зарегистрироваться" onPress={register} />
      <TouchableOpacity onPress={() => setIsRegister(false)}>
        <Text style={styles.switch}>Уже есть аккаунт? Войти</Text>
      </TouchableOpacity>
    </>
  ) : (
    <>
      <Button title="Войти" onPress={login} />
      <TouchableOpacity onPress={() => setIsRegister(true)}>
        <Text style={styles.switch}>Нет аккаунта? Зарегистрироваться</Text>
      </TouchableOpacity>
    </>
  )}
</View>



  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 10,
    padding: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  switch: {
    color: 'blue',
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 5,
  },
});
