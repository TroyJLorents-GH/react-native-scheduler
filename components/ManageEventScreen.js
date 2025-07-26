import * as Calendar from 'expo-calendar';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ManageEventsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarIds, setCalendarIds] = useState([]);

  // Load events for today (customize as needed)
  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const calIds = cals.map(c => c.id);
        setCalendarIds(calIds);

        const now = new Date();
        const end = new Date(now);
        end.setDate(end.getDate() + 7); // Load 7 days ahead

        const eventList = await Calendar.getEventsAsync(calIds, now, end);
        setEvents(eventList);
      }
      setLoading(false);
    })();
  }, []);

  const handleDelete = async (eventId) => {
    try {
      await Calendar.deleteEventAsync(eventId);
      setEvents(events.filter(e => e.id !== eventId));
      Alert.alert('Deleted', 'Event deleted.');
    } catch (e) {
      Alert.alert('Error', 'Could not delete event.');
    }
  };

  // Optionally add edit logic here (navigate to AddEventScreen with event info)
  // For now, show details and delete

  if (loading) return <Text>Loading...</Text>;
  if (!events.length) return <Text>No events found.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upcoming Events</Text>
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{new Date(item.startDate).toLocaleString()} - {new Date(item.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 18 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  eventCard: { backgroundColor: '#e9ecef', padding: 14, borderRadius: 10, marginBottom: 10 },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 3 },
  deleteButton: { marginTop: 6, alignSelf: 'flex-end' },
  deleteText: { color: 'red', fontWeight: 'bold' },
});
