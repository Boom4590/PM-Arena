import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { enableScreens } from 'react-native-screens';
enableScreens(true);

import { UserProvider, UserContext } from './UserContext';
import CryptoPaymentScreen from './screens/CryptoPaymentScreen';
import AuthScreen from './screens/AuthScreen';
import Tournaments from './screens/TournamentsScreen';
import CurrentTournament from './screens/CurrentTournamentScreen';
import Profile from './screens/ProfileScreen';
import AdminPanel from './screens/AdminPanelScreen';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HeaderRight() {
  return (
    <View style={styles.headerRight}>
      <Text style={styles.headerText}>PM Arena</Text>
      <Ionicons name="game-controller" size={22} color="#E74C3C" style={{ marginLeft: 6 }} />
    </View>
  );
}

function TabScreens() {
  const { userInfo, setUserInfo } = useContext(UserContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerRight: () => <HeaderRight />,
        tabBarIcon: ({ color, size }) => {
          let iconName = 'ios-help';
          if (route.name === 'Tournaments') iconName = 'list';
          else if (route.name === 'Current') iconName = 'timer';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 10,
        },
      })}
    >
      <Tab.Screen name="Tournaments" component={Tournaments} options={{ title: 'Турниры' }} />
      <Tab.Screen name="Current" component={CurrentTournament} options={{ title: 'Текущий турнир' }} />
      <Tab.Screen
        name="Profile"
        options={{ title: 'Профиль' }}
      >
        {({ navigation }) => (
          <Profile
            user={userInfo}
            setUser={setUserInfo}
            openAdminPanel={() => navigation.navigate('Admin')}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function MainApp() {
  const { userInfo } = useContext(UserContext);

  if (userInfo === null) {
    return <AuthScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          animation: 'slide_from_left',
          animationDuration: 300,
          headerRight: () => <HeaderRight />,
        }}
      >
        <Stack.Screen
          name="Main"
          options={{
            headerShown: false,
          }}
          component={TabScreens}
        />
        <Stack.Screen
          name="Admin"
          options={{
            title: 'Админ-панель',
          }}
          component={AdminPanel}
          initialParams={{ user: userInfo }}
        />
        <Stack.Screen name="CryptoPayment" component={CryptoPaymentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#E74C3C',
  },
});

export default function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}
