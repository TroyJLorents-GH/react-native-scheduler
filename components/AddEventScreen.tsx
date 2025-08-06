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


// import React, { useState } from 'react';
// import {
//   Dimensions,
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
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
//   const insets = useSafeAreaInsets();
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

//   // Responsive padding top based on device height & safe area top inset
//   const screenHeight = Dimensions.get('window').height;
//   const dynamicMarginTop = Math.min(60 + insets.top, screenHeight * 0.15);
//   const [descHeight, setDescHeight] = useState(100);

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         style={{ flex: 1, justifyContent: 'center', paddingTop: dynamicMarginTop, paddingBottom: insets.bottom }}
//       >
//         <View style={[styles.container, { marginTop: 0 }]}>
//           <Text style={styles.header}>{event ? 'Edit Event' : 'Add Event'}</Text>


//            
//             <Text style={styles.label}>Start</Text>
//             <View style={styles.row}>
//               <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('start'); setPickerMode('date'); }}>
//                 <Text style={styles.dateButtonText}>{fmtDate(startDate)}</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('start'); setPickerMode('time'); }}>
//                 <Text style={styles.dateButtonText}>{fmtTime(startDate)}</Text>
//               </TouchableOpacity>
//             </View>

//             <Text style={styles.label}>End</Text>
//             <View style={styles.row}>
//               <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('end'); setPickerMode('date'); }}>
//                 <Text style={styles.dateButtonText}>{fmtDate(endDate)}</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('end'); setPickerMode('time'); }}>
//                 <Text style={styles.dateButtonText}>{fmtTime(endDate)}</Text>
//               </TouchableOpacity>
//             </View>


//           <DateTimePickerModal
//             isVisible={pickerMode !== null}
//             mode={pickerMode || 'date'}
//             date={which === 'start' ? startDate : endDate}
//             onConfirm={handleConfirm}
//             onCancel={() => setPickerMode(null)}
//             display="spinner"
//             minuteInterval={1}
//           />
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#fff',
//     borderRadius: 22,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     width: '90%',
//     maxWidth: 300,
//     maxHeight: 600,
//     alignSelf: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowRadius: 16,
//     elevation: 7,
//     overflow: 'hidden',
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
//     flexWrap: 'wrap',
//   },
//   label: {
//     fontWeight: 'bold',
//     color: '#444',
//     fontSize: 15,
//     marginTop: 1,
//     marginBottom: 1,
//     textAlign: 'center',
//   },
//   input: {
//     fontSize: 16,
//     marginVertical: 3,
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
//     gap: 8,
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
























// import React, { useState } from 'react';
// import {
//   Dimensions,
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
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
//   const insets = useSafeAreaInsets();
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
//       if (which === 'start')
//         setStartDate(
//           new Date(
//             selected.getFullYear(),
//             selected.getMonth(),
//             selected.getDate(),
//             startDate.getHours(),
//             startDate.getMinutes()
//           )
//         );
//       else
//         setEndDate(
//           new Date(
//             selected.getFullYear(),
//             selected.getMonth(),
//             selected.getDate(),
//             endDate.getHours(),
//             endDate.getMinutes()
//           )
//         );
//     } else if (pickerMode === 'time') {
//       if (which === 'start')
//         setStartDate(
//           new Date(
//             startDate.getFullYear(),
//             startDate.getMonth(),
//             startDate.getDate(),
//             selected.getHours(),
//             selected.getMinutes()
//           )
//         );
//       else
//         setEndDate(
//           new Date(
//             endDate.getFullYear(),
//             endDate.getMonth(),
//             endDate.getDate(),
//             selected.getHours(),
//             selected.getMinutes()
//           )
//         );
//     }
//     setPickerMode(null);
//   };

//   // Responsive padding top based on device height & safe area top inset
//   const screenHeight = Dimensions.get('window').height;
//   const dynamicMarginTop = Math.min(60 + insets.top, screenHeight * 0.15);
//   const [descHeight, setDescHeight] = useState(100);

//   // Updated handler with conditional state update to prevent infinite loops
//   const onDescriptionContentSizeChange = (event: any) => {
//     const newHeight = event.nativeEvent.contentSize.height;
//     if (newHeight !== descHeight) {
//       setDescHeight(newHeight);
//     }
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         style={{ flex: 1, justifyContent: 'center', paddingTop: dynamicMarginTop, paddingBottom: insets.bottom }}
//       >
//         <View style={[styles.container, { marginTop: 0 }]}>
//           <Text style={styles.header}>{event ? 'Edit Event' : 'Add Event'}</Text>

//           <ScrollView
//             contentContainerStyle={styles.scrollContent}
//             keyboardShouldPersistTaps="handled"
//             showsVerticalScrollIndicator={false}
//           >
//             <Text style={styles.label}>Title</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Event title"
//               value={title}
//               onChangeText={setTitle}
//             />

//             <Text style={styles.label}>Start</Text>
//             <View style={styles.row}>
//               <TouchableOpacity
//                 style={styles.dateButton}
//                 onPress={() => {
//                   setWhich('start');
//                   setPickerMode('date');
//                 }}
//               >
//                 <Text style={styles.dateButtonText}>{fmtDate(startDate)}</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.dateButton}
//                 onPress={() => {
//                   setWhich('start');
//                   setPickerMode('time');
//                 }}
//               >
//                 <Text style={styles.dateButtonText}>{fmtTime(startDate)}</Text>
//               </TouchableOpacity>
//             </View>

//             <Text style={styles.label}>End</Text>
//             <View style={styles.row}>
//               <TouchableOpacity
//                 style={styles.dateButton}
//                 onPress={() => {
//                   setWhich('end');
//                   setPickerMode('date');
//                 }}
//               >
//                 <Text style={styles.dateButtonText}>{fmtDate(endDate)}</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.dateButton}
//                 onPress={() => {
//                   setWhich('end');
//                   setPickerMode('time');
//                 }}
//               >
//                 <Text style={styles.dateButtonText}>{fmtTime(endDate)}</Text>
//               </TouchableOpacity>
//             </View>

//             <Text style={styles.label}>Description</Text>
//             <TextInput
//               placeholder="Event description"
//               style={[
//                 styles.input,
//                 {
//                   height: descHeight,
//                   width: '100%',
//                   maxWidth: '100%',
//                   textAlignVertical: 'top',
//                   flexShrink: 1,
//                   flexGrow: 0,
//                   alignSelf: 'stretch',
//                 },
//               ]}
//               multiline={true}
//               onContentSizeChange={onDescriptionContentSizeChange}
//               value={description}
//               onChangeText={setDescription}
//             />
//             <Text style={styles.label}>Location</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Event location"
//               value={location}
//               onChangeText={setLocation}
//             />

//             <Text style={styles.label}>Category</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="e.g., Work, Personal"
//               value={category}
//               onChangeText={setCategory}
//             />

//             <Text style={styles.label}>Reminder</Text>
//             <TextInput
//               style={[styles.input, styles.reminderInput]}
//               placeholder="e.g., 10 min before"
//               value={reminder}
//               onChangeText={setReminder}
//             />
//           </ScrollView>

//           <View style={styles.buttonRow}>
//             <TouchableOpacity style={styles.button} onPress={onCancel}>
//               <Text style={styles.buttonText}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.button, styles.saveButton]}
//               onPress={() => {
//                 onSave({
//                   title,
//                   startDate,
//                   endDate,
//                   description,
//                   location,
//                   category,
//                   reminder,
//                 });
//               }}
//             >
//               <Text style={[styles.buttonText, styles.saveButtonText]}>Save Event</Text>
//             </TouchableOpacity>
//           </View>

//           <DateTimePickerModal
//             isVisible={pickerMode !== null}
//             mode={pickerMode || 'date'}
//             date={which === 'start' ? startDate : endDate}
//             onConfirm={handleConfirm}
//             onCancel={() => setPickerMode(null)}
//             display="spinner"
//             minuteInterval={1}
//           />
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#fff',
//     borderRadius: 22,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     width: '90%',
//     maxWidth: 300,
//     maxHeight: 600,
//     alignSelf: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowRadius: 16,
//     elevation: 7,
//     overflow: 'hidden',
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
//     flexWrap: 'wrap',
//   },
//   label: {
//     fontWeight: 'bold',
//     color: '#444',
//     fontSize: 15,
//     marginTop: 1,
//     marginBottom: 1,
//     textAlign: 'center',
//   },
//   input: {
//     fontSize: 16,
//     marginVertical: 3,
//     padding: 10,
//     borderBottomWidth: 1,
//     borderColor: '#eee',
//     borderRadius: 7,
//     backgroundColor: '#f5f6fa',
//   },
//   reminderInput: {
//     marginBottom: 12,
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
//     gap: 8,
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

















// import React, { useState } from 'react';
// import {
//   Dimensions,
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
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// export type EventType = {
//   id: string; // Added id for better event management
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
//   const insets = useSafeAreaInsets();

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
//       if (which === 'start')
//         setStartDate(
//           new Date(
//             selected.getFullYear(),
//             selected.getMonth(),
//             selected.getDate(),
//             startDate.getHours(),
//             startDate.getMinutes()
//           )
//         );
//       else
//         setEndDate(
//           new Date(
//             selected.getFullYear(),
//             selected.getMonth(),
//             selected.getDate(),
//             endDate.getHours(),
//             endDate.getMinutes()
//           )
//         );
//     } else if (pickerMode === 'time') {
//       if (which === 'start')
//         setStartDate(
//           new Date(
//             startDate.getFullYear(),
//             startDate.getMonth(),
//             startDate.getDate(),
//             selected.getHours(),
//             selected.getMinutes()
//           )
//         );
//       else
//         setEndDate(
//           new Date(
//             endDate.getFullYear(),
//             endDate.getMonth(),
//             endDate.getDate(),
//             selected.getHours(),
//             selected.getMinutes()
//           )
//         );
//     }
//     setPickerMode(null);
//   };

//   const screenHeight = Dimensions.get('window').height;
//   const dynamicMarginTop = Math.min(60 + insets.top, screenHeight * 0.15);
//   const [descHeight, setDescHeight] = useState(100);

//   // Only update height on native platforms to avoid web infinite loops
//   const onDescriptionContentSizeChange = (event: any) => {
//     if (Platform.OS !== 'web') {
//       const newHeight = event.nativeEvent.contentSize.height;
//       if (newHeight !== descHeight) {
//         setDescHeight(newHeight);
//       }
//     }
//   };

//   // Handler for web date/time input changes
//   const onWebDateChange = (whichField: 'start' | 'end', value: string, isDate: boolean) => {
//     if (!value) return;
//     if (isDate) {
//       const parts = value.split('-'); // yyyy-mm-dd
//       if (parts.length !== 3) return;
//       const [y, m, d] = parts.map(Number);
//       if (whichField === 'start') {
//         setStartDate(new Date(y, m - 1, d, startDate.getHours(), startDate.getMinutes()));
//       } else {
//         setEndDate(new Date(y, m - 1, d, endDate.getHours(), endDate.getMinutes()));
//       }
//     } else {
//       const parts = value.split(':'); // hh:mm
//       if (parts.length !== 2) return;
//       const [h, min] = parts.map(Number);
//       if (whichField === 'start') {
//         setStartDate(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), h, min));
//       } else {
//         setEndDate(new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), h, min));
//       }
//     }
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         style={{ flex: 1, justifyContent: 'center', paddingTop: dynamicMarginTop, paddingBottom: insets.bottom }}
//       >
//         <View style={[styles.container, { marginTop: 0 }]}>
//           <Text style={styles.header}>{event ? 'Edit Event' : 'Add Event'}</Text>

//           <ScrollView
//             contentContainerStyle={styles.scrollContent}
//             keyboardShouldPersistTaps="handled"
//             showsVerticalScrollIndicator={false}
//           >
//             <Text style={styles.label}>Title</Text>
//             <TextInput style={styles.input} placeholder="Event title" value={title} onChangeText={setTitle} />

//             <Text style={styles.label}>Start</Text>
//             {Platform.OS === 'web' ? (
//               <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
//                 <TextInput
//                   style={[styles.input, { flex: 1, marginRight: 8 }]}
//                   placeholder="YYYY-MM-DD"
//                   value={startDate.toISOString().slice(0, 10)}
//                   onChangeText={(v) => onWebDateChange('start', v, true)}
//                 />
//                 <TextInput
//                   style={[styles.input, { flex: 1 }]}
//                   placeholder="HH:mm"
//                   value={startDate.toTimeString().slice(0, 5)}
//                   onChangeText={(v) => onWebDateChange('start', v, false)}
//                 />
//               </View>
//             ) : (
//               <View style={styles.row}>
//                 <TouchableOpacity
//                   style={styles.dateButton}
//                   onPress={() => {
//                     setWhich('start');
//                     setPickerMode('date');
//                   }}
//                 >
//                   <Text style={styles.dateButtonText}>{fmtDate(startDate)}</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={styles.dateButton}
//                   onPress={() => {
//                     setWhich('start');
//                     setPickerMode('time');
//                   }}
//                 >
//                   <Text style={styles.dateButtonText}>{fmtTime(startDate)}</Text>
//                 </TouchableOpacity>
//               </View>
//             )}

//             <Text style={styles.label}>End</Text>
//             {Platform.OS === 'web' ? (
//               <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
//                 <TextInput
//                   style={[styles.input, { flex: 1, marginRight: 8 }]}
//                   placeholder="YYYY-MM-DD"
//                   value={endDate.toISOString().slice(0, 10)}
//                   onChangeText={(v) => onWebDateChange('end', v, true)}
//                 />
//                 <TextInput
//                   style={[styles.input, { flex: 1 }]}
//                   placeholder="HH:mm"
//                   value={endDate.toTimeString().slice(0, 5)}
//                   onChangeText={(v) => onWebDateChange('end', v, false)}
//                 />
//               </View>
//             ) : (
//               <View style={styles.row}>
//                 <TouchableOpacity
//                   style={styles.dateButton}
//                   onPress={() => {
//                     setWhich('end');
//                     setPickerMode('date');
//                   }}
//                 >
//                   <Text style={styles.dateButtonText}>{fmtDate(endDate)}</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={styles.dateButton}
//                   onPress={() => {
//                     setWhich('end');
//                     setPickerMode('time');
//                   }}
//                 >
//                   <Text style={styles.dateButtonText}>{fmtTime(endDate)}</Text>
//                 </TouchableOpacity>
//               </View>
//             )}

//             <Text style={styles.label}>Description</Text>
//             <TextInput
//               placeholder="Event description"
//               style={[
//                 styles.input,
//                 {
//                   height: descHeight,
//                   width: '100%',
//                   maxWidth: '100%',
//                   textAlignVertical: 'top',
//                   flexShrink: 1,
//                   flexGrow: 0,
//                   alignSelf: 'stretch',
//                 },
//               ]}
//               multiline={true}
//               onContentSizeChange={onDescriptionContentSizeChange}
//               value={description}
//               onChangeText={setDescription}
//             />

//             <Text style={styles.label}>Location</Text>
//             <TextInput style={styles.input} placeholder="Event location" value={location} onChangeText={setLocation} />

//             <Text style={styles.label}>Category</Text>
//             <TextInput style={styles.input} placeholder="e.g., Work, Personal" value={category} onChangeText={setCategory} />

//             <Text style={styles.label}>Reminder</Text>
//             <TextInput
//               style={[styles.input, styles.reminderInput]}
//               placeholder="e.g., 10 min before"
//               value={reminder}
//               onChangeText={setReminder}
//             />
//           </ScrollView>

//           <View style={styles.buttonRow}>
//             <TouchableOpacity style={styles.button} onPress={onCancel}>
//               <Text style={styles.buttonText}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.button, styles.saveButton]}
//               onPress={() => {
//                 onSave({
//                   id: event?.id || Date.now().toString(), // Generate a unique ID if not editing
//                   title,
//                   startDate,
//                   endDate,
//                   description,
//                   location,
//                   category,
//                   reminder,
//                 });
//               }}
//             >
//               <Text style={[styles.buttonText, styles.saveButtonText]}>Save Event</Text>
//             </TouchableOpacity>
//           </View>

//           {Platform.OS !== 'web' && (
//             <DateTimePickerModal
//               isVisible={pickerMode !== null}
//               mode={pickerMode || 'date'}
//               date={which === 'start' ? startDate : endDate}
//               onConfirm={handleConfirm}
//               onCancel={() => setPickerMode(null)}
//               display="spinner"
//               minuteInterval={1}
//             />
//           )}
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#fff',
//     borderRadius: 22,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     width: '90%',
//     maxWidth: 300,
//     maxHeight: 600,
//     alignSelf: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowRadius: 16,
//     elevation: 7,
//     overflow: 'hidden',
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
//     flexWrap: 'wrap',
//   },
//   label: {
//     fontWeight: 'bold',
//     color: '#444',
//     fontSize: 15,
//     marginTop: 1,
//     marginBottom: 1,
//     textAlign: 'center',
//   },
//   input: {
//     fontSize: 16,
//     marginVertical: 1,
//     padding: 10,
//     borderColor: '#eee',
//     // borderBottomWidth: 1,
//     borderRadius: 7,
//     backgroundColor: '#f5f6fa',
//   },
//   reminderInput: {
//     marginBottom: 4,
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
//     gap: 8,
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






// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import { Event } from '../context/EventContext';

// type Props = {
//   onSave: (event: Event) => void;
//   onCancel: () => void;
//   event?: Event;
// };

// function fmtDate(date: Date) {
//   return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
// }
// function fmtTime(date: Date) {
//   return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
// }

// export default function AddEventScreen({ onSave, onCancel, event }: Props) {
//   const [title, setTitle] = useState(event?.title || '');
//   const [description, setDescription] = useState(event?.description || '');
//   const [location, setLocation] = useState(event?.location || '');
//   const [category, setCategory] = useState(event?.category || '');
//   const [reminder, setReminder] = useState(event?.reminder || '');

//   const [startDate, setStartDate] = useState<Date>(event?.startDate || new Date());
//   const [endDate, setEndDate] = useState<Date>(event?.endDate || new Date());

//   const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
//   const [which, setWhich] = useState<'start' | 'end'>('start');

//   // Modal confirm handler
//   const handleConfirm = (date: Date) => {
//     if (which === 'start') {
//       if (pickerMode === 'date') {
//         setStartDate(d => new Date(date.getFullYear(), date.getMonth(), date.getDate(), d.getHours(), d.getMinutes()));
//       } else if (pickerMode === 'time') {
//         setStartDate(d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), date.getHours(), date.getMinutes()));
//       }
//     } else {
//       if (pickerMode === 'date') {
//         setEndDate(d => new Date(date.getFullYear(), date.getMonth(), date.getDate(), d.getHours(), d.getMinutes()));
//       } else if (pickerMode === 'time') {
//         setEndDate(d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), date.getHours(), date.getMinutes()));
//       }
//     }
//     setPickerMode(null);
//   };

//   const handleSave = () => {
//     if (!title || !startDate || !endDate) return;
//     const newEvent: Event = {
//       id: event?.id || Date.now().toString(),
//       title,
//       startDate,
//       endDate,
//       description,
//       location,
//       category,
//       reminder,
//     };
//     onSave(newEvent);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         style={{ flex: 1, justifyContent: 'center' }}
//       >
//         <View style={styles.container}>
//           <Text style={styles.header}>{event ? "Edit Event" : "Add Event"}</Text>
//           <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />

//           {/* Start */}
//           <Text style={styles.label}>Start</Text>
//           <View style={styles.row}>
//             <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('start'); setPickerMode('date'); }}>
//               <Text style={styles.dateButtonText}>{fmtDate(startDate)}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('start'); setPickerMode('time'); }}>
//               <Text style={styles.dateButtonText}>{fmtTime(startDate)}</Text>
//             </TouchableOpacity>
//           </View>

//           {/* End */}
//           <Text style={styles.label}>End</Text>
//           <View style={styles.row}>
//             <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('end'); setPickerMode('date'); }}>
//               <Text style={styles.dateButtonText}>{fmtDate(endDate)}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('end'); setPickerMode('time'); }}>
//               <Text style={styles.dateButtonText}>{fmtTime(endDate)}</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Other fields */}
//           <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
//           <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
//           <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} />
//           <TextInput style={styles.input} placeholder="Reminder" value={reminder} onChangeText={setReminder} />

//           {/* Modal Date/Time Picker */}
//           <DateTimePickerModal
//             isVisible={pickerMode !== null}
//             mode={pickerMode || 'date'}
//             date={which === 'start' ? startDate : endDate}
//             onConfirm={handleConfirm}
//             onCancel={() => setPickerMode(null)}
//             display="spinner"
//             minuteInterval={1}
//           />

//           {/* Save/Cancel Buttons */}
//           <View style={styles.buttonRow}>
//             <Button title="Cancel" onPress={onCancel} />
//             <Button title="Save" onPress={handleSave} />
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 24 },
//   header: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
//   input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginVertical: 6 },
//   label: { fontWeight: 'bold', marginTop: 16, marginBottom: 2 },
//   row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
//   dateButton: {
//     backgroundColor: '#e0e5f2',
//     borderRadius: 7,
//     paddingVertical: 8,
//     paddingHorizontal: 18,
//     marginRight: 8,
//   },
//   dateButtonText: { color: '#2d6cdf', fontWeight: 'bold', fontSize: 16 },
//   buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
// });



import React, { useState } from 'react';
import { Button, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Event } from '../context/EventContext';

type Props = {
  onSave: (event: Event) => void;
  onCancel: () => void;
  event?: Event;
};

function fmtDate(date: Date) {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AddEventScreen({ onSave, onCancel, event }: Props) {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [location, setLocation] = useState(event?.location || '');
  const [category, setCategory] = useState(event?.category || '');
  const [reminder, setReminder] = useState(event?.reminder || '');

  const [startDate, setStartDate] = useState<Date>(event?.startDate || new Date());
  const [endDate, setEndDate] = useState<Date>(event?.endDate || new Date());

  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  const [which, setWhich] = useState<'start' | 'end'>('start');

  // Modal confirm handler
  const handleConfirm = (date: Date) => {
    if (which === 'start') {
      if (pickerMode === 'date') {
        setStartDate(d => new Date(date.getFullYear(), date.getMonth(), date.getDate(), d.getHours(), d.getMinutes()));
      } else if (pickerMode === 'time') {
        setStartDate(d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), date.getHours(), date.getMinutes()));
      }
    } else {
      if (pickerMode === 'date') {
        setEndDate(d => new Date(date.getFullYear(), date.getMonth(), date.getDate(), d.getHours(), d.getMinutes()));
      } else if (pickerMode === 'time') {
        setEndDate(d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), date.getHours(), date.getMinutes()));
      }
    }
    setPickerMode(null);
  };

  const handleSave = () => {
    if (!title || !startDate || !endDate) return;
    const newEvent: Event = {
      id: event?.id || Date.now().toString(),
      title,
      startDate,
      endDate,
      description,
      location,
      category,
      reminder,
    };
    onSave(newEvent);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'center' }}
      >
        <View style={styles.container}>
          <Text style={styles.header}>{event ? "Edit Event" : "Add Event"}</Text>
          <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />

          {/* Start */}
          <Text style={styles.label}>Start</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('start'); setPickerMode('date'); }}>
              <Text style={styles.dateButtonText}>{fmtDate(startDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('start'); setPickerMode('time'); }}>
              <Text style={styles.dateButtonText}>{fmtTime(startDate)}</Text>
            </TouchableOpacity>
          </View>

          {/* End */}
          <Text style={styles.label}>End</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('end'); setPickerMode('date'); }}>
              <Text style={styles.dateButtonText}>{fmtDate(endDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateButton} onPress={() => { setWhich('end'); setPickerMode('time'); }}>
              <Text style={styles.dateButtonText}>{fmtTime(endDate)}</Text>
            </TouchableOpacity>
          </View>

          {/* Other fields */}
          <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
          <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
          <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} />
          <TextInput style={styles.input} placeholder="Reminder" value={reminder} onChangeText={setReminder} />

          {/* Modal Date/Time Picker */}
          <DateTimePickerModal
            isVisible={pickerMode !== null}
            mode={pickerMode || 'date'}
            date={which === 'start' ? startDate : endDate}
            onConfirm={handleConfirm}
            onCancel={() => setPickerMode(null)}
            display="spinner"
            minuteInterval={1}
          />

          {/* Save/Cancel Buttons */}
          <View style={styles.buttonRow}>
            <Button title="Cancel" onPress={onCancel} />
            <Button title="Save" onPress={handleSave} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center', color: '#2d6cdf' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginVertical: 6, width: '75%', alignSelf: 'center' },
  label: { fontWeight: 'bold', marginTop: 16, marginBottom: 2, alignSelf: 'center', color: '#444' },
  row: { 
    flexDirection: 'row',
    alignItems: 'center', 
    marginBottom: 8, 
    justifyContent: 'center',  
    width: '75%', 
    alignSelf: 'center'
   },
  dateButton: {
    backgroundColor: '#e0e5f2',
    borderRadius: 7,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 8,
  },
  dateButtonText: { color: '#2d6cdf', fontWeight: 'bold', fontSize: 16, alignContent: 'center' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
});

