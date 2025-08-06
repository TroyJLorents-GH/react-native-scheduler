// import React, { useState } from 'react';
// import AddEventScreen, { EventType } from '../../components/AddEventScreen';
// import ScheduleScreen from '../../components/ScheduleScreen';

// import { Ionicons } from '@expo/vector-icons';
// import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

// export default function ScheduleTab() {
//   const [events, setEvents] = useState<EventType[]>([]);
//   const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
//   const [isAddEventVisible, setAddEventVisible] = useState(false);

//   const handleEditEvent = (index: number) => {
//     setEditingEvent(events[index]);
//     setAddEventVisible(true);
//   };

//   const handleDeleteEvent = (index: number) => {
//     setEvents(events.filter((_, i) => i !== index));
//   };

//   const handleSaveEvent = (event: EventType) => {
//     if (editingEvent) {
//       setEvents(events.map((e) => (e.id === editingEvent.id ? { ...event, id: editingEvent.id } : e)));
//     } else {
//       setEvents([...events, { ...event, id: Date.now().toString() }]);
//     }
//     setAddEventVisible(false);
//     setEditingEvent(null);
//   };

//   const handleAddNew = () => {
//     setEditingEvent(null);
//     setAddEventVisible(true);
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <ScheduleScreen
//         events={events}
//         onEditEvent={handleEditEvent}
//         onDeleteEvent={handleDeleteEvent}
//       />

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
//     backgroundColor: '#2d6cdf',
//     borderRadius: 28,
//     width: 56,
//     height: 56,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 5,
//   },
// });



// import React, { useState } from 'react';
// import AddEventScreen from '../../components/AddEventScreen';
// import ScheduleScreen from '../../components/ScheduleScreen';
// import { Event, useEventContext } from '../../context/EventContext';

// import { Ionicons } from '@expo/vector-icons';
// import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

// export default function ScheduleTab() {
//   const { events, addEvent } = useEventContext();

//   const [editingEvent, setEditingEvent] = useState<Event | null>(null);
//   const [isAddEventVisible, setAddEventVisible] = useState(false);

//   const handleSaveEvent = (event: Event) => {
//     // If editing, you'd implement an edit in context
//     addEvent({ ...event, id: editingEvent?.id || Date.now().toString() });
//     setAddEventVisible(false);
//     setEditingEvent(null);
//   };

//   const handleAddNew = () => {
//     setEditingEvent(null);
//     setAddEventVisible(true);
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <ScheduleScreen
//         events={events}
//         // onEditEvent={event => { setEditingEvent(event); setAddEventVisible(true); }}
//         // onDeleteEvent={event => { /* add delete logic in context and call here */ }}
//       />

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
//     backgroundColor: '#2d6cdf',
//     borderRadius: 28,
//     width: 56,
//     height: 56,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 5,
//   },
// });





import React, { useState } from 'react';
import AddEventScreen from '../../components/AddEventScreen';
import ScheduleScreen from '../../components/ScheduleScreen';
import { Event, useEventContext } from '../../context/EventContext';

import { Ionicons } from '@expo/vector-icons';
import { Alert, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ScheduleTab() {
  const { events, addEvent, editEvent, deleteEvent } = useEventContext();

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isAddEventVisible, setAddEventVisible] = useState(false);

  const handleSaveEvent = (event: Event) => {
    if (editingEvent) {
      editEvent(event);
    } else {
      addEvent({ ...event, id: Date.now().toString() });
    }
    setAddEventVisible(false);
    setEditingEvent(null);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setAddEventVisible(true);
  };

  const handleDeleteEvent = (event: Event) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteEvent(event.id),
        },
      ]
    );
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
