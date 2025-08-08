// import { Tabs } from 'expo-router';
// import React from 'react';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// export default function TabsLayout() {
//   return (
//     <Tabs
//       screenOptions={({ route }) => ({
//         tabBarIcon: ({ color, size }) => {
//           let iconName = '';
//           if (route.name === 'today') iconName = 'calendar-today';
//           else if (route.name === 'schedule') iconName = 'calendar';
//           else if (route.name === 'reminders') iconName = 'alarm';

//           return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
//         },
//         tabBarActiveTintColor: '#2561cfff',
//         tabBarInactiveTintColor: 'gray',
//         headerShown: false,
//         tabBarStyle: { paddingBottom: 5, height: 60 },
//         tabBarLabelStyle: { fontSize: 12 },
//       })}
//     />
//   );
// }



import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home', href: null }} />
      <Tabs.Screen name="all" options={{ title: 'All' }} />
      <Tabs.Screen name="completed" options={{ title: 'Completed' }} />
      <Tabs.Screen name="favorite" options={{ title: 'Favorites' }} />
      <Tabs.Screen name="priority" options={{ title: 'Priority' }} />
      <Tabs.Screen name="scheduled" options={{ title: 'Scheduled' }} />
      <Tabs.Screen name="reminders" options={{ title: 'Reminders' }} />
      <Tabs.Screen name="lists" options={{ title: 'Lists (old)'}} />
      {/* NEW nested stack under the Todo tab */}
      <Tabs.Screen name="todo" options={{ title: 'To‑Do' }} />
    </Tabs>
  );
}
