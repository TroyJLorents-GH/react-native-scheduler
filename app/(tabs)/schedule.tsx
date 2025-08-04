import React, { useState } from 'react';
import AddEventScreen, { EventType } from '../../components/AddEventScreen';
import ScheduleScreen from '../../components/ScheduleScreen';

import { Ionicons } from '@expo/vector-icons';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ScheduleTab() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [isAddEventVisible, setAddEventVisible] = useState(false);

  const handleEditEvent = (index: number) => {
    setEditingEvent(events[index]);
    setAddEventVisible(true);
  };

  const handleDeleteEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const handleSaveEvent = (event: EventType) => {
    if (editingEvent) {
      setEvents(events.map((e) => (e.id === editingEvent.id ? { ...event, id: editingEvent.id } : e)));
    } else {
      setEvents([...events, { ...event, id: Date.now().toString() }]);
    }
    setAddEventVisible(false);
    setEditingEvent(null);
  };

  const handleAddNew = () => {
    setEditingEvent(null);
    setAddEventVisible(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScheduleScreen
        events={events}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
      />

      <Modal visible={isAddEventVisible} animationType="slide">
        <AddEventScreen
          event={editingEvent ?? undefined}
          onSave={handleSaveEvent}
          onCancel={() => {
            setAddEventVisible(false);
            setEditingEvent(null);
          }}
        />
      </Modal>

      <TouchableOpacity style={styles.fab} onPress={handleAddNew}>
        <Ionicons name="add" size={36} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#2d6cdf',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});
