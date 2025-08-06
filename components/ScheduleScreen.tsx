// import { Ionicons } from '@expo/vector-icons';
// import React from 'react';
// import {
//     Alert,
//     FlatList,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from 'react-native';
// import { EventType } from './AddEventScreen'; // adjust path as needed

// type Props = {
//   events: EventType[];
//   onEditEvent: (index: number) => void;
//   onDeleteEvent: (index: number) => void;
// };

// export default function ScheduleScreen({ events, onEditEvent, onDeleteEvent }: Props) {
//   const confirmDelete = (index: number) => {
//     Alert.alert(
//       'Delete Event?',
//       'Are you sure you want to delete this event?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { text: 'Delete', style: 'destructive', onPress: () => onDeleteEvent(index) },
//       ]
//     );
//   };

//   const renderItem = ({ item, index }: { item: EventType; index: number }) => (
//     <View style={styles.eventCard}>
//       <View style={styles.eventInfo}>
//         <Text style={styles.title}>{item.title}</Text>
//         <Text style={styles.time}>
//           {item.startDate.toLocaleString()} - {item.endDate.toLocaleString()}
//         </Text>
//         {item.category ? <Text style={styles.category}>{item.category}</Text> : null}
//       </View>
//       <View style={styles.actions}>
//         <TouchableOpacity onPress={() => onEditEvent(index)} style={styles.iconBtn}>
//           <Ionicons name="pencil" size={22} color="#2d6cdf" />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={() => confirmDelete(index)} style={styles.iconBtn}>
//           <Ionicons name="trash" size={22} color="#ff4d4d" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       {events.length === 0 ? (
//         <Text style={styles.emptyText}>No events scheduled.</Text>
//       ) : (
//         <FlatList
//           data={events}
//           keyExtractor={(_, index) => index.toString()}
//           renderItem={renderItem}
//           contentContainerStyle={{ paddingBottom: 20 }}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: '#fff' },
//   emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#888' },
//   eventCard: {
//     flexDirection: 'row',
//     backgroundColor: '#e8f0fe',
//     marginBottom: 12,
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//   },
//   eventInfo: { flex: 1 },
//   title: { fontSize: 18, fontWeight: '600', color: '#2d6cdf' },
//   time: { fontSize: 14, color: '#444', marginTop: 4 },
//   category: { fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' },
//   actions: { flexDirection: 'row', marginLeft: 12 },
//   iconBtn: { marginHorizontal: 8 },
// });







import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Event } from '../context/EventContext';

type Props = {
  events: Event[];
  onEditEvent?: (event: Event) => void;
  onDeleteEvent?: (event: Event) => void;
};

export default function ScheduleScreen({ events, onEditEvent, onDeleteEvent }: Props) {
  const grouped = events.reduce((groups: Record<string, Event[]>, event) => {
    const dateKey = event.startDate.toISOString().slice(0, 10);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(event);
    return groups;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      {sortedDates.length === 0 && <Text>No scheduled events.</Text>}
      {sortedDates.map(date => (
        <View key={date} style={{ marginBottom: 24 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{date}</Text>
          {grouped[date].map(event => (
            <View key={event.id} style={styles.card}>
              <Text style={styles.title}>{event.title}</Text>
              <Text>{event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              {event.description ? <Text>{event.description}</Text> : null}
              <Text>{event.location} | {event.category}</Text>
              <Text>Reminder: {event.reminder}</Text>
              <View style={{ flexDirection: 'row', marginTop: 6 }}>
                {onEditEvent && (
                  <TouchableOpacity onPress={() => onEditEvent(event)} style={styles.actionButton}>
                    <Text style={{ color: 'blue' }}>Edit</Text>
                  </TouchableOpacity>
                )}
                {onDeleteEvent && (
                  <TouchableOpacity onPress={() => onDeleteEvent(event)} style={styles.actionButton}>
                    <Text style={{ color: 'red' }}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f3f3f3',
    width: 320,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  actionButton: { marginRight: 12 },
});
