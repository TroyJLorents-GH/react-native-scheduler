import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { EventType } from './AddEventScreen'; // adjust path as needed

type Props = {
  events: EventType[];
  onEditEvent: (index: number) => void;
  onDeleteEvent: (index: number) => void;
};

export default function ScheduleScreen({ events, onEditEvent, onDeleteEvent }: Props) {
  const confirmDelete = (index: number) => {
    Alert.alert(
      'Delete Event?',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteEvent(index) },
      ]
    );
  };

  const renderItem = ({ item, index }: { item: EventType; index: number }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventInfo}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.time}>
          {item.startDate.toLocaleString()} - {item.endDate.toLocaleString()}
        </Text>
        {item.category ? <Text style={styles.category}>{item.category}</Text> : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEditEvent(index)} style={styles.iconBtn}>
          <Ionicons name="pencil" size={22} color="#2d6cdf" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDelete(index)} style={styles.iconBtn}>
          <Ionicons name="trash" size={22} color="#ff4d4d" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {events.length === 0 ? (
        <Text style={styles.emptyText}>No events scheduled.</Text>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#888' },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#e8f0fe',
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  eventInfo: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600', color: '#2d6cdf' },
  time: { fontSize: 14, color: '#444', marginTop: 4 },
  category: { fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' },
  actions: { flexDirection: 'row', marginLeft: 12 },
  iconBtn: { marginHorizontal: 8 },
});
