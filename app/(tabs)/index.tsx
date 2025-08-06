import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEventContext } from '../../context/EventContext';

// DUMMY WEATHER DATA (replace with real API later)
const weather = {
  city: 'Phoenix',
  temp: '107°F',
  desc: 'Sunny',
  icon: 'weather-sunny' as const, // Use MaterialCommunityIcons name
};

export default function HomeDashboard() {
  const { events } = useEventContext();
  const today = moment();
  const todaysEvents = events.filter(e => moment(e.startDate).isSame(today, 'day'));

  // DUMMY TODOs FOR NOW
  const todaysTodos = [
    { id: '1', text: 'Finish UI for dashboard', done: false },
    { id: '2', text: 'Send meeting notes', done: true },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Weather Card */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="weather-sunny" size={42} color="#ffb64f" style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.weatherCity}>{weather.city}</Text>
              <Text style={styles.weatherTemp}>{weather.temp}</Text>
            </View>
          </View>
        <Text style={styles.weatherDesc}>{weather.desc}</Text>
      </View>

      {/* Today's Events */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="calendar-outline" size={20} color="#556de8" />  Today’s Schedule
        </Text>
        {todaysEvents.length === 0 ? (
          <Text style={styles.emptyText}>No events for today.</Text>
        ) : (
          todaysEvents.map(ev => (
            <View key={ev.id} style={styles.eventItem}>
              <Text style={styles.eventTitle}>{ev.title}</Text>
              <Text style={styles.eventTime}>
                {moment(ev.startDate).format('h:mm A')} - {moment(ev.endDate).format('h:mm A')}
              </Text>
              {ev.location ? <Text style={styles.eventLoc}>{ev.location}</Text> : null}
            </View>
          ))
        )}
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add-circle" size={28} color="#556de8" />
          <Text style={styles.addBtnText}>Add Event</Text>
        </TouchableOpacity>
      </View>

      {/* Today's To-Dos (Dummy for now) */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          <MaterialCommunityIcons name="check-circle-outline" size={21} color="#67c99a" />  Today’s To-Do
        </Text>
        {todaysTodos.length === 0 ? (
          <Text style={styles.emptyText}>No to-dos for today.</Text>
        ) : (
          todaysTodos.map(todo => (
            <View key={todo.id} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
              <Ionicons
                name={todo.done ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={todo.done ? '#67c99a' : '#aaa'}
                style={{ marginRight: 9 }}
              />
              <Text style={{ textDecorationLine: todo.done ? 'line-through' : 'none', color: todo.done ? '#aaa' : '#222' }}>
                {todo.text}
              </Text>
            </View>
          ))
        )}
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add-circle" size={28} color="#67c99a" />
          <Text style={styles.addBtnText}>Add To-Do</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    paddingBottom: 80,
    backgroundColor: '#f5f8ff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 26,
    shadowColor: '#222',
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 3,
  },
  weatherCity: { fontSize: 18, fontWeight: 'bold', color: '#323447' },
  weatherTemp: { fontSize: 27, fontWeight: 'bold', color: '#ffb64f' },
  weatherDesc: { color: '#a4a4a4', fontSize: 16, marginTop: 5 },
  sectionTitle: { fontSize: 19, fontWeight: 'bold', marginBottom: 12, color: '#323447', flexDirection: 'row', alignItems: 'center' },
  emptyText: { color: '#a7aac6', fontSize: 16, fontStyle: 'italic', marginTop: 6 },
  eventItem: { marginBottom: 12 },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#3d61b2' },
  eventTime: { color: '#7a7c96', fontSize: 14 },
  eventLoc: { color: '#8cc1b8', fontSize: 13 },
  addBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  addBtnText: { color: '#556de8', fontWeight: 'bold', marginLeft: 7, fontSize: 16 },
});
