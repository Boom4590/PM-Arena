import React, { useState, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';





import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../UserContext';
import profileImage from '../jpg/profile.png';

const BACKEND_URL = 'http://192.168.0.110:3000';
const MANAGER_WHATSAPP = 'https://wa.me/996507535771'; // ВАШ номер менеджера в формате https://wa.me/номер_без_знаков

export default function Profile({ openAdminPanel }) {
  const { userInfo, setUserInfo } = useContext(UserContext);
  const [amountUsd, setAmountUsd] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [payCurrency, setPayCurrency] = useState('btc');
  const navigation = useNavigation();
  const [isError, setIsError] = useState(false);

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

  const handleManagerContact = async () => {
    const supported = await Linking.canOpenURL(MANAGER_WHATSAPP);
    if (supported) {
      Linking.openURL(MANAGER_WHATSAPP);
    } else {
      Alert.alert('Ошибка', 'Не удалось открыть WhatsApp');
    }
  };

  const handlePay = async () => {
    if (!amountUsd) {
      Alert.alert('Введите сумму');
      return;
    }
    const amount = parseFloat(amountUsd);
    if (isNaN(amount) || amount < 13) {
      setIsError(true);
      Alert.alert('Ошибка', 'Сумма должна быть не меньше 13 USD');
      return;
    }
    setIsError(false);

    const pubg_id = userInfo.pubg_id;
    try {
      const response = await fetch(`${BACKEND_URL}/api/payment/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountUsd: Number(amountUsd), payCurrency, pubg_id }),
      });

      const data = await response.json();

      navigation.navigate("CryptoPayment", { invoiceUrl: data.invoice_url });
      console.log(data.invoice_url)

    } catch (e) {
      Alert.alert('Ошибка', e.message);
    }
  };

  if (!userInfo) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notAuthText}>Пользователь не авторизован</Text>
      </View>
    );
  }

  const amountNum = parseFloat(amountUsd);

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
              <Text style={styles.labelTitle}>
                <FontAwesome name="phone" size={17} color="black"  />
                

                </Text>
                <FontAwesome name="phone" size={10} color="#fff" />
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
          keyboardType="numeric"
          placeholder="Сумма в USD"
          value={amountUsd}
          onChangeText={setAmountUsd}
          style={[styles.input, isError && styles.inputError]}
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={handlePay} style={styles.cryptoBtn}>
  <View style={styles.cryptoContent}>
   
    <Text style={styles.cryptoText}>Пополнить криптой</Text>
     <Image
      source={require('../jpg/bitcoin.png')} // Убедитесь, что иконка биткоина есть в этом пути
      style={styles.cryptoIcon}
    />
  </View>
</TouchableOpacity>

        {/* CHANGES: Показать текст и кнопку в зависимости от суммы */}
        {amountUsd && amountNum < 13 ? (
          <TouchableOpacity onPress={handleManagerContact} style={styles.managerContact}>
            <Text style={styles.managerText}>
              Если у вас меньше 13, то{'\n'} можно пополнить через менеджера →
            </Text>
            
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleManagerContact} style={styles.managerBtn}>
  <View style={styles.managerContent}>
    <Text style={styles.managerBtnText}>Оплатить через менеджера</Text>
    <Image
      source={require('../jpg/whatsapp-3.svg')} // убедись, что файл есть по этому пути
      style={styles.whatsappIcon}
    />
  </View>
</TouchableOpacity>

        )}

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
  cryptoBtn: {
  backgroundColor: '#F7931A', // классический оранжевый биткоина
  paddingVertical: 14,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#F7931A',
  shadowOpacity: 0.35,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
  marginTop: 20,
},

cryptoContent: {
  flexDirection: 'row',
  alignItems: 'center',
},

cryptoIcon: {
  width: 32,
  height: 32,
  marginTop:2,
  marginRight: 8,
},

cryptoText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingVertical: 30,
    backgroundColor: '#fff', // CHANGES: белый фон
  },
  profileRow: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius:3,
    marginBottom: 16,
    padding: 15,
    backgroundColor: 'white',
  },
  image: {
    width: 90,
    height: 90,
    marginRight: 18,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'black',
  },
  inputError: {
    borderColor: '#E53935', // Красный акцент для ошибки
  },
  dataColumn: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#2E2E2E',
    fontFamily: 'System',
  },
  labelTitle: {
    fontWeight: '700',
    color: '#555',
  },
  balanceRow: {
    backgroundColor: '#F5F5F5', // светло-серый
    borderRadius: 10,
    width: '60%',
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3E2723', // темно-коричневый для контраста
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12, // более геометричный радиус
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 17,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  button: {
    backgroundColor: '#FF8C00', // насыщенный оранжевый
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
    shadowColor: '#FF8C00',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
  promoToggle: {
    marginTop: 30,
    alignItems: 'center',
  },
  promoText: {
    color: '#888',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  adminButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 0,
  },
  adminBtn: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
  },
  cancelBtn: {
    backgroundColor: '#eee',
    shadowOpacity: 0,
  },
  logoutButton: {
    marginTop: 45,
    alignItems: 'flex-end',
  },
  logoutText: {
    color: '#D32F2F',
    fontWeight: '700',
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notAuthText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#777',
  },

  // CHANGES для менеджера:
  managerContact: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: 'rgb(35, 152, 78)',
    borderRadius: 12,
    flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
    
    
  },
  managerText: {
    color: 'white',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
 managerBtn: {
  backgroundColor:'rgb(35, 152, 78)', // фирменный зелёный WhatsApp
  paddingVertical: 14,
  paddingHorizontal: 20,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#25D366',
  shadowOpacity: 0.25,
  shadowRadius: 5,
  shadowOffset: { width: 0, height: 2 },
  marginTop: 15,
},

managerContent: {
  flexDirection: 'row',
  
},

managerBtnText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
  marginRight: 8,
},

whatsappIcon: {
  width: 20,
  height: 20,
},

});
