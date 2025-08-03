import { Tabs } from 'expo-router';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#2d6cdf',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'today') iconName = 'calendar-today';
          else if (route.name === 'schedule') iconName = 'calendar';
          else if (route.name === 'reminders') iconName = 'alarm';

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarLabelStyle: { fontSize: 12 },
      })}
    />
  );
}
