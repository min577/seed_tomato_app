import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './constants/colors';

// Screens
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import MonitorScreen from './screens/MonitorScreen';
import FarmDiaryScreen from './screens/FarmDiaryScreen';
import YieldTabNavigator from './screens/YieldTabNavigator';

const Tab = createBottomTabNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Splash 화면 표시
  if (showSplash) {
    return (
      <>
        <StatusBar style="light" backgroundColor={COLORS.primary} />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </>
    );
  }

  // 메인 앱
  return (
    <>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Chat') {
                iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              } else if (route.name === 'Monitor') {
                iconName = focused ? 'videocam' : 'videocam-outline';
              } else if (route.name === 'Diary') {
                iconName = focused ? 'book' : 'book-outline';
              } else if (route.name === 'Prediction') {
                iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: '#999',
            tabBarStyle: {
              backgroundColor: COLORS.white,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
            },
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.white,
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ 
              title: '홈',
              headerTitle: 'Seed Farm',
            }} 
          />
          <Tab.Screen 
            name="Chat" 
            component={ChatScreen} 
            options={{ 
              title: '채팅',
              headerTitle: 'AI 어시스턴트',
            }} 
          />
          <Tab.Screen 
            name="Monitor" 
            component={MonitorScreen} 
            options={{ 
              title: '모니터링',
              headerTitle: '실시간 모니터링',
            }} 
          />
          <Tab.Screen 
            name="Diary" 
            component={FarmDiaryScreen} 
            options={{ 
              title: '일지',
              headerTitle: '농가 일지',
            }} 
          />
          <Tab.Screen 
          name="Prediction" 
          component={YieldTabNavigator} 
          options={{ 
            title: '수확량',
            headerTitle: '수확량 예측',
            headerShown: false,
          }} 
        />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}