// import React, { useState } from 'react';
// import {
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';

// export type EventType = {
//   title: string;
//   startDate: Date;
//   endDate: Date;
//   description: string;
//   location: string;
//   category: string;
//   reminder: string;
// };

// type Props = {
//   onSave: (event: EventType) => void;
//   onCancel: () => void;
//   event?: EventType;
// };

// export default function AddEventScreen({ onSave, onCancel, event }: Props) {
//   const [title, setTitle] = useState(event?.title ?? '');
//   const [startDate, setStartDate] = useState(event?.startDate ?? new Date());
//   const [endDate, setEndDate] = useState(event?.endDate ?? new Date());
//   const [description, setDescription] = useState(event?.description ?? '');
//   const [location, setLocation] = useState(event?.location ?? '');
//   const [category, setCategory] = useState(event?.category ?? '');
//   const [reminder, setReminder] = useState(event?.reminder ?? '');

//   const [pickerMode, setPickerMode] = useState<null | 'date' | 'time'>(null);
//   const [which, setWhich] = useState<'start' | 'end'>('start');

//   const fmtDate = (date: Date) => date.toLocaleDateString();
//   const fmtTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

//   const handleConfirm = (selected: Date) => {
//     if (pickerMode === 'date') {
//       if (which === 'start') setStartDate(new Date(
//         selected.getFullYear(), selected.getMonth(), selected.getDate(),
//         startDate.getHours(), startDate.getMinutes()
//       ));
//       else setEndDate(new Date(
//         selected.getFullYear(), selected.getMonth(), selected.getDate(),
//         endDate.getHours(), endDate.getMinutes()
//       ));
//     } else if (pickerMode === 'time') {
//       if (which === 'start') setStartDate(new Date(
//         startDate.getFullYear(), startDate.getMonth(), startDate.getDate(),
//         selected.getHours(), selected.getMinutes()
//       ));
//       else setEndDate(new Date(
//         endDate.getFullYear(), endDate.getMonth(), endDate.getDate(),
//         selected.getHours(), selected.getMinutes()
//       ));
//     }
//     setPickerMode(null);
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       style={{ flex: 1, justifyContent: 'center' }}
//     >
//       <View style={styles.container}>
//         <Text style={styles.header}>{event ? 'Edit Event' : 'Add Event'}</Text>

//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           <Text style={styles.label}>Title</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Event title"
//             value={title}
//             onChangeText={setTitle}
//           />

//           <Text style={styles.label}>Start</Text>
//           <View style={styles.row}>
//             <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('start'); setPickerMode('date'); }}>
//               <Text style={styles.dateButtonText}>{fmtDate(startDate)}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('start'); setPickerMode('time'); }}>
//               <Text style={styles.dateButtonText}>{fmtTime(startDate)}</Text>
//             </TouchableOpacity>
//           </View>

//           <Text style={styles.label}>End</Text>
//           <View style={styles.row}>
//             <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('end'); setPickerMode('date'); }}>
//               <Text style={styles.dateButtonText}>{fmtDate(endDate)}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('end'); setPickerMode('time'); }}>
//               <Text style={styles.dateButtonText}>{fmtTime(endDate)}</Text>
//             </TouchableOpacity>
//           </View>

//           <Text style={styles.label}>Description</Text>
//           <TextInput
//             style={[styles.input, { height: 40 }]}
//             placeholder="Event description"
//             value={description}
//             onChangeText={setDescription}
//             multiline
//           />

//           <Text style={styles.label}>Location</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Event location"
//             value={location}
//             onChangeText={setLocation}
//           />

//           <Text style={styles.label}>Category</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="e.g., Work, Personal"
//             value={category}
//             onChangeText={setCategory}
//           />

//           <Text style={styles.label}>Reminder</Text>
//           <TextInput
//             style={[styles.input, styles.reminderInput]}
//             placeholder="e.g., 10 min before"
//             value={reminder}
//             onChangeText={setReminder}
//           />
//         </ScrollView>

//         <View style={styles.buttonRow}>
//           <TouchableOpacity style={styles.button} onPress={onCancel}>
//             <Text style={styles.buttonText}>Cancel</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.button, styles.saveButton]}
//             onPress={() => {
//               onSave({
//                 title,
//                 startDate,
//                 endDate,
//                 description,
//                 location,
//                 category,
//                 reminder,
//               });
//             }}
//           >
//             <Text style={[styles.buttonText, styles.saveButtonText]}>Save Event</Text>
//           </TouchableOpacity>
//         </View>

//         <DateTimePickerModal
//           isVisible={pickerMode !== null}
//           mode={pickerMode || 'date'}
//           date={which === 'start' ? startDate : endDate}
//           onConfirm={handleConfirm}
//           onCancel={() => setPickerMode(null)}
//           display="spinner"
//           minuteInterval={1}
//         />
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#fff',
//     borderRadius: 22,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     width: '90%',        // Wider width
//     maxWidth: 600,       // Optional max width for large screens
//     maxHeight: 600,      // Limit height for scrolling
//     alignSelf: 'center', // Center horizontally
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowRadius: 16,
//     elevation: 7,
//     overflow: 'hidden',
//     paddingLeft: 24,
//     paddingRight: 24,
//     flexGrow: 1,         // Allow content to grow
//     justifyContent: 'center',
//     marginTop: '40%',
//   },
//   header: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     marginVertical: 16,
//     color: '#2d6cdf',
//     textAlign: 'center',
//     textShadowColor: 'rgba(0,0,0,0.1)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 2,
//   },
//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 10,
//   },
//   label: {
//     fontWeight: 'bold',
//     color: '#444',
//     fontSize: 15,
//     marginTop: 2,
//     marginBottom: 2,
//     textAlign: 'center',
//   },
//   input: {
//     fontSize: 16,
//     marginVertical: 7,
//     padding: 10,
//     borderBottomWidth: 1,
//     borderColor: '#eee',
//     borderRadius: 7,
//     backgroundColor: '#f5f6fa',
//   },
//   reminderInput: {
//     marginBottom: 24,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 2,
//   },
//   dateButton: {
//     padding: 8,
//     backgroundColor: '#e6e8f0',
//     borderRadius: 7,
//     marginVertical: 8,
//     flex: 1,
//     marginRight: 7,
//   },
//   dateButtonText: {
//     fontSize: 16,
//     color: '#2d6cdf',
//     textAlign: 'center',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     backgroundColor: '#fafafa',
//     gap: 5,
//   },
//   button: {
//     padding: 14,
//     borderRadius: 10,
//     backgroundColor: '#eee',
//     minWidth: 90,
//     alignItems: 'center',
//   },
//   saveButton: {
//     backgroundColor: '#2d6cdf',
//   },
//   buttonText: {
//     fontWeight: 'bold',
//     fontSize: 15,
//     color: '#2d6cdf',
//   },
//   saveButtonText: {
//     color: '#fff',
//   },
// });


import React, { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export type EventType = {
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
  location: string;
  category: string;
  reminder: string;
};

type Props = {
  onSave: (event: EventType) => void;
  onCancel: () => void;
  event?: EventType;
};

export default function AddEventScreen({ onSave, onCancel, event }: Props) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState(event?.title ?? '');
  const [startDate, setStartDate] = useState(event?.startDate ?? new Date());
  const [endDate, setEndDate] = useState(event?.endDate ?? new Date());
  const [description, setDescription] = useState(event?.description ?? '');
  const [location, setLocation] = useState(event?.location ?? '');
  const [category, setCategory] = useState(event?.category ?? '');
  const [reminder, setReminder] = useState(event?.reminder ?? '');

  const [pickerMode, setPickerMode] = useState<null | 'date' | 'time'>(null);
  const [which, setWhich] = useState<'start' | 'end'>('start');


  const fmtDate = (date: Date) => date.toLocaleDateString();
  const fmtTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleConfirm = (selected: Date) => {
    if (pickerMode === 'date') {
      if (which === 'start') setStartDate(new Date(
        selected.getFullYear(), selected.getMonth(), selected.getDate(),
        startDate.getHours(), startDate.getMinutes()
      ));
      else setEndDate(new Date(
        selected.getFullYear(), selected.getMonth(), selected.getDate(),
        endDate.getHours(), endDate.getMinutes()
      ));
    } else if (pickerMode === 'time') {
      if (which === 'start') setStartDate(new Date(
        startDate.getFullYear(), startDate.getMonth(), startDate.getDate(),
        selected.getHours(), selected.getMinutes()
      ));
      else setEndDate(new Date(
        endDate.getFullYear(), endDate.getMonth(), endDate.getDate(),
        selected.getHours(), selected.getMinutes()
      ));
    }
    setPickerMode(null);
  };

  // Responsive padding top based on device height & safe area top inset
  const screenHeight = Dimensions.get('window').height;
  const dynamicMarginTop = Math.min(60 + insets.top, screenHeight * 0.15);
  const [descHeight, setDescHeight] = useState(100);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'center', paddingTop: dynamicMarginTop, paddingBottom: insets.bottom }}
      >
        <View style={[styles.container, { marginTop: 0 }]}>
          <Text style={styles.header}>{event ? 'Edit Event' : 'Add Event'}</Text>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Event title"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Start</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('start'); setPickerMode('date'); }}>
                <Text style={styles.dateButtonText}>{fmtDate(startDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('start'); setPickerMode('time'); }}>
                <Text style={styles.dateButtonText}>{fmtTime(startDate)}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>End</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('end'); setPickerMode('date'); }}>
                <Text style={styles.dateButtonText}>{fmtDate(endDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('end'); setPickerMode('time'); }}>
                <Text style={styles.dateButtonText}>{fmtTime(endDate)}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput
              placeholder="Event description"
               style={[styles.input, {
                height: descHeight,
                width: '100%',
                maxWidth: '100%',
                textAlignVertical: 'top',
                flexShrink: 1,
                flexGrow: 0,
                alignSelf: 'stretch',
              }]}
              multiline={true}
              onContentSizeChange={(event) => {
                setDescHeight(event.nativeEvent.contentSize.height);
              }}
              value={description}
              onChangeText={setDescription}
            />
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Event location"
              value={location}
              onChangeText={setLocation}
            />

            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Work, Personal"
              value={category}
              onChangeText={setCategory}
            />

            <Text style={styles.label}>Reminder</Text>
            <TextInput
              style={[styles.input, styles.reminderInput]}
              placeholder="e.g., 10 min before"
              value={reminder}
              onChangeText={setReminder}
            />
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={() => {
                onSave({
                  title,
                  startDate,
                  endDate,
                  description,
                  location,
                  category,
                  reminder,
                });
              }}
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>Save Event</Text>
            </TouchableOpacity>
          </View>

          <DateTimePickerModal
            isVisible={pickerMode !== null}
            mode={pickerMode || 'date'}
            date={which === 'start' ? startDate : endDate}
            onConfirm={handleConfirm}
            onCancel={() => setPickerMode(null)}
            display="spinner"
            minuteInterval={1}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '90%',
    maxWidth: 300,
    maxHeight: 600,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 7,
    overflow: 'hidden',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#2d6cdf',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: 'bold',
    color: '#444',
    fontSize: 15,
    marginTop: 1,
    marginBottom: 1,
    textAlign: 'center',
  },
  input: {
    fontSize: 16,
    marginVertical: 6,
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    borderRadius: 7,
    backgroundColor: '#f5f6fa',
  },
  reminderInput: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  dateButton: {
    padding: 8,
    backgroundColor: '#e6e8f0',
    borderRadius: 7,
    marginVertical: 8,
    flex: 1,
    marginRight: 7,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#2d6cdf',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fafafa',
    gap: 8,
  },
  button: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#eee',
    minWidth: 90,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#2d6cdf',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#2d6cdf',
  },
  saveButtonText: {
    color: '#fff',
  },
});
