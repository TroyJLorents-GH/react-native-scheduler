import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TodoAgendaScreen from '../../components/TodoAgendaScreen';
import TodoCalendarDayView from '../../components/TodoCalendarDayView';
import { useTodoContext } from '../../context/TodoContext';

export default function ScheduleTab() {
  const { todos } = useTodoContext();

  // Only tasks with due dates; hide completed past-due items in vertical view component itself
  const todosWithDueDates = todos.filter(t => t.dueDate);

  const [viewMode, setViewMode] = useState<'vertical' | 'calendar'>('vertical');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleAddNew = () => {
    router.push('/todo/new');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
      <View style={styles.toggleBar}>
        <TouchableOpacity onPress={() => setViewMode('vertical')} style={[styles.toggleBtn, viewMode === 'vertical' && styles.toggleActive]}>
          <Text style={[styles.toggleText, viewMode === 'vertical' && styles.toggleTextActive]}>Vertical View</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewMode('calendar')} style={[styles.toggleBtn, viewMode === 'calendar' && styles.toggleActive]}>
          <Text style={[styles.toggleText, viewMode === 'calendar' && styles.toggleTextActive]}>Calendar View</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'vertical' ? (
        <TodoAgendaScreen todos={todosWithDueDates} />
      ) : (
        <TodoCalendarDayView 
          todos={todosWithDueDates} 
          date={selectedDate} 
          onDateChange={setSelectedDate} 
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleAddNew}>
        <Ionicons name="add" size={36} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  toggleBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#14151a',
  },
  toggleActive: {
    backgroundColor: '#2a2f38',
  },
  toggleText: {
    color: '#9aa3b2',
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#556de8',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#556de8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
  },
});







// import moment, { Moment } from 'moment';
// import React, { useState } from 'react';
// import CalendarStrip from 'react-native-calendar-strip';
// import AddEventScreen from '../../components/AddEventScreen';
// import ScheduleScreen from '../../components/ScheduleScreen';
// import { Event, useEventContext } from '../../context/EventContext';

// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import AgendaScreen from '../../components/AgendaScreen';

// export default function ScheduleTab() {
//   const { events, addEvent, editEvent, deleteEvent } = useEventContext();

//   const [editingEvent, setEditingEvent] = useState<Event | null>(null);
//   const [isAddEventVisible, setAddEventVisible] = useState(false);
//   const [selectedDate, setSelectedDate] = useState<Moment>(moment());

//   // Filter events for the selected date
//   const eventsForSelectedDate = events.filter(e =>
//     moment(e.startDate).isSame(selectedDate, 'day')
//   );

//   const handleSaveEvent = (event: Event) => {
//     if (editingEvent) {
//       editEvent(event);
//     } else {
//       addEvent({ ...event, id: Date.now().toString() });
//     }
//     setAddEventVisible(false);
//     setEditingEvent(null);
//   };

//   const handleEditEvent = (event: Event) => {
//     setEditingEvent(event);
//     setAddEventVisible(true);
//   };

//   const handleDeleteEvent = (event: Event) => {
//     Alert.alert(
//       'Delete Event',
//       'Are you sure you want to delete this event?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: () => deleteEvent(event.id),
//         },
//       ]
//     );
//   };

//   const handleAddNew = () => {
//     setEditingEvent(null);
//     setAddEventVisible(true);
//   };

//   // "Jump to Today" floating button
//   const isToday = selectedDate.isSame(moment(), 'day');

//   return (
//     <View style={{ flex: 1 }}>
//       <AgendaScreen events={events} />
//       <CalendarStrip
//         scrollable
//         style={{ height: 110, paddingTop: 18, paddingBottom: 10 }}
//         selectedDate={selectedDate}
//         onDateSelected={setSelectedDate}
//         calendarColor={'#f5f8ff'}
//         calendarHeaderStyle={{ color: '#556de8', fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}
//         dateNumberStyle={{ color: '#556de8', fontSize: 19, fontWeight: 'bold' }}
//         dateNameStyle={{ color: '#8ba9ff', fontSize: 13, fontWeight: '500' }}
//         highlightDateNumberStyle={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}
//         highlightDateNameStyle={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}
//         highlightDateContainerStyle={{
//           backgroundColor: '#556de8',
//           borderRadius: 15,
//           elevation: 4,
//           shadowColor: '#556de8',
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: 0.18,
//           shadowRadius: 4,
//           marginBottom: 2,
//         }}
//         iconContainer={{ flex: 0.1 }}
//       />

//       {!isToday && (
//         <TouchableOpacity style={styles.todayButton} onPress={() => setSelectedDate(moment())}>
//           <MaterialCommunityIcons name="calendar-today" size={24} color="white" />
//           <Text style={styles.todayText}>Today</Text>
//         </TouchableOpacity>
//       )}

//       <View style={{ flex: 1, marginTop: 6 }}>
//         {eventsForSelectedDate.length === 0 ? (
//           <View style={styles.emptyState}>
//             <Ionicons name="cloud-offline-outline" size={54} color="#a0abcb" />
//             <Text style={styles.emptyText}>No events for this day</Text>
//           </View>
//         ) : (
//           <ScheduleScreen
//             events={eventsForSelectedDate}
//             onEditEvent={handleEditEvent}
//             onDeleteEvent={handleDeleteEvent}
//           />
//         )}
//       </View>

//       <Modal visible={isAddEventVisible} animationType="slide">
//         <AddEventScreen
//           event={editingEvent ?? undefined}
//           onSave={handleSaveEvent}
//           onCancel={() => {
//             setAddEventVisible(false);
//             setEditingEvent(null);
//           }}
//         />
//       </Modal>

//       <TouchableOpacity style={styles.fab} onPress={handleAddNew}>
//         <Ionicons name="add" size={36} color="white" />
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   fab: {
//     position: 'absolute',
//     bottom: 32,
//     right: 32,
//     backgroundColor: '#556de8',
//     borderRadius: 28,
//     width: 56,
//     height: 56,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 5,
//     shadowColor: '#556de8',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 7,
//   },
//   todayButton: {
//     position: 'absolute',
//     top: 90,
//     left: 16,
//     flexDirection: 'row',
//     backgroundColor: '#ff9a62',
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 16,
//     alignItems: 'center',
//     elevation: 3,
//     zIndex: 10,
//     shadowColor: '#ff9a62',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.17,
//     shadowRadius: 4,
//   },
//   todayText: {
//     color: 'white',
//     marginLeft: 6,
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   emptyState: {
//     alignItems: 'center',
//     marginTop: 60,
//   },
//   emptyText: {
//     color: '#a0abcb',
//     fontSize: 19,
//     fontWeight: '600',
//     marginTop: 18,
//   },
// });