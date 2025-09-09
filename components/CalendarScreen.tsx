import * as Calendar from 'expo-calendar';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CalendarScreen() {
  const [calendars, setCalendars] = useState<Calendar.Calendar[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        setCalendars(cals);
      }
    })();
  }, []);

  const addSampleEvent = async (calendarId: string) => {
    try {
      const now = new Date();
      const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
      await Calendar.createEventAsync(calendarId, {
        title: 'Sample Event from App',
        startDate: now,
        endDate: inOneHour,
        timeZone: 'America/Phoenix', // change as needed
        notes: 'This was added from our Scheduler app!',
      });
      Alert.alert('Success', 'Sample event created!');
    } catch (e) {
      Alert.alert('Error', 'Could not create event.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Device Calendars</Text>
      <FlatList
        data={calendars}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.calendarItem,
              selectedId === item.id && styles.selected
            ]}
            onPress={() => setSelectedId(item.id)}
            onLongPress={() => addSampleEvent(item.id)}
          >
            <Text style={styles.calTitle}>{item.title}</Text>
            <Text style={styles.calSource}>{item.source?.name}</Text>
            {selectedId === item.id && (
              <Text style={{ color: '#007bff', fontSize: 13 }}>Tap & hold to add sample event</Text>
            )}
          </TouchableOpacity>
        )}
      />
      {selectedId && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addSampleEvent(selectedId)}
        >
          <Text style={styles.addButtonText}>Add Sample Event to Selected Calendar</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.note}>Events added here will show up in your Apple/Google/Outlook calendar apps!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  calendarItem: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
  },
  selected: { borderWidth: 2, borderColor: '#007bff' },
  calTitle: { fontSize: 17, fontWeight: '600' },
  calSource: { fontSize: 13, color: '#555', fontWeight: '600' },
  addButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  note: { marginTop: 30, color: '#666', fontSize: 13, textAlign: 'center' },
});
