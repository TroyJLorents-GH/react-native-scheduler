// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { NavigationContainer } from '@react-navigation/native';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// import RemindersScreen from './screens/RemindersScreen';
// import ScheduleScreen from './screens/ScheduleScreen';
// import TodayScreen from './screens/TodayScreen';

// const Tab = createBottomTabNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Tab.Navigator
//         screenOptions={({ route }) => ({
//           headerShown: false,
//           tabBarIcon: ({ color, size }) => {
//             let iconName = '';

//             if (route.name === 'Today') iconName = 'calendar-today';
//             else if (route.name === 'Schedule') iconName = 'calendar';
//             else if (route.name === 'Reminders') iconName = 'alarm';

//             return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
//           },
//           tabBarActiveTintColor: '#2d6cdf',
//           tabBarInactiveTintColor: 'gray',
//           tabBarStyle: { paddingBottom: 5, height: 60 },
//         })}
//       >
//         <Tab.Screen name="Today" component={TodayScreen} />
//         <Tab.Screen name="Schedule" component={ScheduleScreen} />
//         <Tab.Screen name="Reminders" component={RemindersScreen} />
//       </Tab.Navigator>
//     </NavigationContainer>
//   );
// }


// app/_layout.tsx or App.js

// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { NavigationContainer } from '@react-navigation/native';
// import React, { useState } from 'react';
// import { Modal, View } from 'react-native';
// import AddEventScreen, { EventType } from '@components/AddEventScreen';
// import ScheduleScreen from '@components/ScheduleScreen';
// import TodaysCard from '@components/TodaysCard';

// const Tab = createBottomTabNavigator();

// export default function App() {
//   const [events, setEvents] = useState<EventType[]>([]);
//   const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
//   const [modalVisible, setModalVisible] = useState(false);

//   const handleSaveEvent = (event: EventType) => {
//     if (editingEvent) {
//       setEvents(events.map(e => (e.id === editingEvent.id ? event : e)));
//     } else {
//       setEvents([...events, event]);
//     }
//     setModalVisible(false);
//     setEditingEvent(null);
//   };

//   return (
//     <NavigationContainer>
//       <Tab.Navigator>
//         <Tab.Screen name="Today">
//           {() => <TodaysCard day={{ /* build day object with events and weather */ }} />}
//         </Tab.Screen>
//         <Tab.Screen name="Schedule">
//           {() => (
//             <View style={{ flex: 1 }}>
//               <ScheduleScreen
//                 events={events}
//                 onEditEvent={(id) => {
//                   const event = events.find(e => e.id === id);
//                   if (event) {
//                     setEditingEvent(event);
//                     setModalVisible(true);
//                   }
//                 }}
//                 onDeleteEvent={(id) => setEvents(events.filter(e => e.id !== id))}
//               />
//               <Modal visible={modalVisible} animationType="slide">
//                 <AddEventScreen
//                   event={editingEvent ?? undefined}
//                   onSave={handleSaveEvent}
//                   onCancel={() => { setModalVisible(false); setEditingEvent(null); }}
//                 />
//               </Modal>
//             </View>
//           )}
//         </Tab.Screen>
//       </Tab.Navigator>
//     </NavigationContainer>
//   );
// }
