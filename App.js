import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import RemindersScreen from './screens/RemindersScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import TodayScreen from './screens/TodayScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName = '';

            if (route.name === 'Today') iconName = 'calendar-today';
            else if (route.name === 'Schedule') iconName = 'calendar';
            else if (route.name === 'Reminders') iconName = 'alarm';

            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2d6cdf',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { paddingBottom: 5, height: 60 },
        })}
      >
        <Tab.Screen name="Today" component={TodayScreen} />
        <Tab.Screen name="Schedule" component={ScheduleScreen} />
        <Tab.Screen name="Reminders" component={RemindersScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
