import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen({ navigation }) {
  // Dummy events and todos for preview
  const eventsToday = [
    { id: 1, time: '9:00 AM', title: 'Algorithms Class' },
    { id: 2, time: '11:00 AM', title: 'Team Meeting' },
    { id: 3, time: '2:00 PM', title: 'Study Block' },
  ];
  const todosToday = [
    { id: 1, task: 'Read Chapter 4' },
    { id: 2, task: 'Submit HW Assignment' },
    { id: 3, task: 'Reply to Emails' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* App Header */}
      <Text style={styles.header}>My Scheduler</Text>

      {/* Today's Events */}
      <Text style={styles.sectionTitle}>Today's Schedule</Text>
      {eventsToday.map(event => (
        <View key={event.id} style={styles.eventCard}>
          <Text style={styles.eventTime}>{event.time}</Text>
          <Text style={styles.eventTitle}>{event.title}</Text>
        </View>
      ))}

      {/* Add Event Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Add Event')}
      >
        <Text style={styles.addButtonText}>+ Add Event</Text>
      </TouchableOpacity>

      {/* To-Do List Preview */}
      <Text style={styles.sectionTitle}>Today's To-Do List</Text>
      {todosToday.map(todo => (
        <View key={todo.id} style={styles.todoItem}>
          <Text style={styles.todoText}>• {todo.task}</Text>
        </View>
      ))}

      {/* View Full Calendar Button */}
      <TouchableOpacity
        style={styles.calendarButton}
        onPress={() => navigation.navigate('Calendar')}
      >
        <Text style={styles.calendarButtonText}>📅 View Full Calendar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 18 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 18, marginBottom: 8 },
  eventCard: {
    backgroundColor: '#e9ecef',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTime: { fontWeight: 'bold', marginRight: 14 },
  eventTitle: { fontSize: 16 },
  addButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 14,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  todoItem: { marginLeft: 8, marginBottom: 6 },
  todoText: { fontSize: 15, color: '#343a40' },
  calendarButton: {
    backgroundColor: '#fff',
    borderColor: '#007bff',
    borderWidth: 1.5,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  calendarButtonText: { color: '#007bff', fontWeight: 'bold', fontSize: 16 },
});
