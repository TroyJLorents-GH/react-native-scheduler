import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Event } from '../context/EventContext';
import AddEventScreen from './AddEventScreen';

export default function EventListScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Add or update event
  const handleSaveEvent = (event: Event) => {
    setEvents((prevEvents) => {
      // If editing, update existing
      if (editingEvent) {
        return prevEvents.map((e) =>
          e === editingEvent ? event : e
        );
      }
      // Else add new
      return [...prevEvents, event];
    });
    setModalVisible(false);
    setEditingEvent(null);
  };

  // Delete event with confirmation
  const handleDeleteEvent = (event: Event) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEvents((prevEvents) =>
              prevEvents.filter((e) => e !== event)
            );
          },
        },
      ]
    );
  };

  // Render event card
  const renderEvent = ({ item }: { item: Event }) => {
    const startDateStr = item.startDate.toLocaleDateString();
    const startTimeStr = item.startDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => {
            setEditingEvent(item);
            setModalVisible(true);
          }}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>
            {startDateStr} @ {startTimeStr}
          </Text>
          <Text style={styles.category}>{item.category}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteEvent(item)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditingEvent(null);
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>+ Add Event</Text>
      </TouchableOpacity>

      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No events yet. Add some!</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderEvent}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}

      {modalVisible && (
        <AddEventScreen
          event={editingEvent ?? undefined}
          onSave={handleSaveEvent}
          onCancel={() => {
            setModalVisible(false);
            setEditingEvent(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f6fa' },
  addButton: {
    backgroundColor: '#2d6cdf',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  date: { fontSize: 14, color: '#666', marginTop: 4 },
  category: { fontSize: 14, color: '#2d6cdf', marginTop: 4 },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f44336',
    borderRadius: 10,
    marginLeft: 16,
  },
  deleteButtonText: { color: '#fff', fontWeight: 'bold' },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 16, color: '#999' },
});
