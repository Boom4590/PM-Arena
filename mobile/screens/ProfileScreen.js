import React, { useState, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../UserContext';
import profileImage from '../jpg/profile.png';

const BACKEND_URL = 'http://localhost:3000';

export default function Profile({ openAdminPanel }) {
  const { userInfo, setUserInfo } = useContext(UserContext);
  const [amount, setAmount] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminInput, setShowAdminInput] = useState(false);

  useFocusEffect(
  useCallback(() => {
    if (userInfo?.pubg_id) {
      fetchLatestUserData();
    }
  }, [userInfo?.pubg_id])
);

  const logout = async () => {
    
    setUserInfo(null);
  };

  async function topUpBalance() {
    const sum = Number(amount);
    if (!sum || sum <= 0) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userInfo.phone, amount: sum }),
      });
      if (!res.ok) {
        const json = await res.json();
        Alert.alert('Ошибка', json.error || 'Ошибка пополнения');
        return;
      }
      const updatedUser = await res.json();
      await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));

      Alert.alert('Успешно', 'Баланс пополнен');
      setAmount('');
    } catch {
      Alert.alert('Ошибка', 'Ошибка сервера');
    }
  }
async function fetchLatestUserData() {
  try {
    const res = await fetch(`${BACKEND_URL}/user?pubg_id=${userInfo.pubg_id}`);
    if (!res.ok) {
      console.log('Ошибка при получении данных пользователя');
      return;
    }
    const updatedUser = await res.json();
    await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));
    setUserInfo(updatedUser);
  } catch (error) {
    console.log('Ошибка сервера:', error);
  }
}

  function tryAdminLogin() {
    if (adminPassword === 'm') {
      openAdminPanel();
      setShowAdminInput(false);
      setAdminPassword('');
    } else {
      Alert.alert('Ошибка', 'Неверный пароль администратора');
    }
  }

  if (!userInfo) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notAuthText}>Пользователь не авторизован</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View>
        <View style={styles.profileRow}>
          <Image source={profileImage} style={styles.image} resizeMode="contain" />
          <View style={styles.dataColumn}>
            <Text style={styles.label}>
              <Text style={styles.labelTitle}>Pubg ID: </Text>
              {userInfo.pubg_id}
            </Text>
            <Text style={styles.label}>
              <Text style={styles.labelTitle}>Никнейм: </Text>
              {userInfo.nickname}
            </Text>
            <Text style={styles.label}>
              <Text style={styles.labelTitle}>Телефон: </Text>
              {userInfo.phone}
            </Text>
          </View>
        </View>

        <View style={styles.balanceRow}>
          <Text style={styles.balanceText}>
            Баланс: <Text style={styles.balanceAmount}>{userInfo.balance} $</Text>
          </Text>
        </View>

        <TextInput
          placeholder="Введите сумму для пополнения"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          style={styles.input}
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.button} onPress={topUpBalance}>
          <Text style={styles.buttonText}>Пополнить баланс</Text>
        </TouchableOpacity>

        {!showAdminInput && (
          <TouchableOpacity
            onPress={() => setShowAdminInput(true)}
            style={styles.promoToggle}
            activeOpacity={0.7}
          >
            <Text style={styles.promoText}>Введите промокод</Text>
          </TouchableOpacity>
        )}

        {showAdminInput && (
          <>
            <TextInput
              placeholder="Введите Promocode"
              secureTextEntry
              value={adminPassword}
              onChangeText={setAdminPassword}
              style={[styles.input, { marginTop: 20 }]}
              placeholderTextColor="#999"
            />
            <View style={styles.adminButtonsRow}>
              <TouchableOpacity style={[styles.button, styles.adminBtn]} onPress={tryAdminLogin}>
                <Text style={styles.buttonText}>Подтвердить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.adminBtn, styles.cancelBtn]}
                onPress={() => {
                  setShowAdminInput(false);
                  setAdminPassword('');
                }}
              >
                <Text style={[styles.buttonText, { color: '#555' }]}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#f9fafb'
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'dark',
    borderRadius: 6,
    padding: 14,
    backgroundColor:'white'
  },
  image: {
    width: 90,
    height: 90,
    marginRight: 15,
    borderRadius: 45,
    
    borderWidth: 2,
    borderColor: 'black',
  },
  dataColumn: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  labelTitle: {
    fontWeight: '600',
    color: '#555',
  },
  balanceRow: {
    backgroundColor: '#ECEFF1',
    borderRadius: 6,
    width:'60%',
    padding: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A2700',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft:10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: 'orange',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#D9730D',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  promoToggle: {
    marginTop: 30,
    alignItems: 'center',
  },
  promoText: {
    color: '#888',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  adminButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  adminBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
  },
  cancelBtn: {
    backgroundColor: '#eee',
    shadowOpacity: 0,
  },
  logoutButton: {
    marginTop: 35,
    alignItems: 'center',
  },
  logoutText: {
    color: 'tomato',
    fontWeight: '600',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notAuthText: {
    fontSize: 18,
    color: '#888',
  },
});
