import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null);

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

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}

