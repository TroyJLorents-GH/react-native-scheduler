import { Tabs } from 'expo-router';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'today') iconName = 'calendar-today';
          else if (route.name === 'schedule') iconName = 'calendar';
          else if (route.name === 'reminders') iconName = 'alarm';

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2561cfff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarLabelStyle: { fontSize: 12 },
      })}
    />
  );
}

