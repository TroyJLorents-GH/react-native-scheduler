// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import React, { useState } from 'react';
// import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { useTodoContext } from '../context/TodoContext';

// export default function TodoListScreen() {
//   const { todos, addTodo, toggleTodo, deleteTodo } = useTodoContext();
//   const [input, setInput] = useState('');

//   const handleAdd = () => {
//     if (!input.trim()) return;
//     addTodo(input.trim());
//     setInput('');
//   };

//   const handleDelete = (id: string) => {
//     Alert.alert('Delete To-Do', 'Are you sure?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Delete', style: 'destructive', onPress: () => deleteTodo(id) },
//     ]);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>To-Do List</Text>
//       <View style={styles.inputRow}>
//         <TextInput
//           style={styles.input}
//           placeholder="Add new to-do"
//           value={input}
//           onChangeText={setInput}
//           onSubmitEditing={handleAdd}
//           returnKeyType="done"
//         />
//         <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
//           <Ionicons name="add-circle" size={36} color="#67c99a" />
//         </TouchableOpacity>
//       </View>
//       <FlatList
//         data={todos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())}
//         keyExtractor={item => item.id}
//         contentContainerStyle={{ paddingBottom: 100 }}
//         renderItem={({ item }) => (
//           <View style={styles.todoRow}>
//             <TouchableOpacity onPress={() => toggleTodo(item.id)}>
//               <Ionicons
//                 name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
//                 size={26}
//                 color={item.done ? '#67c99a' : '#aaa'}
//                 style={{ marginRight: 14 }}
//               />
//             </TouchableOpacity>
//             <Text style={[styles.todoText, item.done && styles.doneText]}>
//               {item.text}
//             </Text>
//             <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
//               <MaterialCommunityIcons name="trash-can-outline" size={22} color="#f87e7b" />
//             </TouchableOpacity>
//           </View>
//         )}
//         ListEmptyComponent={<Text style={{ color: '#aaa', marginTop: 40, alignSelf: 'center' }}>No to-dos yet.</Text>}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 22, backgroundColor: '#f5f8ff' },
//   header: { fontSize: 22, fontWeight: 'bold', color: '#556de8', marginBottom: 16, alignSelf: 'center' },
//   inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
//   input: {
//     flex: 1,
//     backgroundColor: '#fff',
//     borderRadius: 14,
//     paddingVertical: 10,
//     paddingHorizontal: 18,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: '#e5e6ef',
//   },
//   addBtn: { marginLeft: 10 },
//   todoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     marginBottom: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 18,
//     borderRadius: 14,
//     shadowColor: '#222',
//     shadowOpacity: 0.07,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   todoText: { fontSize: 16, color: '#222', flex: 1 },
//   doneText: { color: '#aaa', textDecorationLine: 'line-through' },
//   deleteBtn: { marginLeft: 14 },
// });













// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import moment from 'moment';
// import React, { useState } from 'react';
// import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { useTodoContext } from '../context/TodoContext';

// export default function TodoListScreen() {
//   const { todos, addTodo, toggleTodo, deleteTodo } = useTodoContext();
//   const [input, setInput] = useState('');
//   const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
//   const [favorite, setFavorite] = useState(false);
//   const [category, setCategory] = useState('');

//   const handleAdd = () => {
//     if (!input.trim()) return;
//     addTodo({
//       id: Date.now().toString(),
//       text: input.trim(),
//       done: false,
//       createdAt: new Date(),
//       priority,
//       favorite,
//       category: category.trim() ? category.trim() : undefined,
//     });
//     setInput('');
//     setPriority('medium');
//     setFavorite(false);
//     setCategory('');
//   };

//   const handleDelete = (id: string) => {
//     Alert.alert('Delete To-Do', 'Are you sure?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Delete', style: 'destructive', onPress: () => deleteTodo(id) },
//     ]);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>To-Do List</Text>
//       {/* Add To-Do Input */}
//       <View style={styles.inputRow}>
//         <TextInput
//           style={styles.input}
//           placeholder="Add new to-do"
//           value={input}
//           onChangeText={setInput}
//           onSubmitEditing={handleAdd}
//           returnKeyType="done"
//         />
//         <TouchableOpacity onPress={() => setFavorite(f => !f)}>
//           <Ionicons name={favorite ? 'star' : 'star-outline'} size={26} color={favorite ? '#ffd700' : '#aaa'} />
//         </TouchableOpacity>
//         <View style={styles.priorityRow}>
//           {['high', 'medium', 'low'].map(level => (
//             <TouchableOpacity
//               key={level}
//               style={{
//                 marginHorizontal: 2,
//                 padding: 3,
//                 backgroundColor: priority === level ? '#556de8' : '#e0e5f2',
//                 borderRadius: 7,
//               }}
//               onPress={() => setPriority(level as 'high' | 'medium' | 'low')}
//             >
//               <Text style={{ color: priority === level ? 'white' : '#556de8', fontWeight: 'bold' }}>{level[0].toUpperCase()}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//         <TextInput
//           style={[styles.input, { width: 80, marginLeft: 5 }]}
//           placeholder="Category"
//           value={category}
//           onChangeText={setCategory}
//         />
//         <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
//           <Ionicons name="add-circle" size={36} color="#67c99a" />
//         </TouchableOpacity>
//       </View>
//       {/* To-Do List */}
//       <FlatList
//         data={todos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())}
//         keyExtractor={item => item.id}
//         contentContainerStyle={{ paddingBottom: 100 }}
//         renderItem={({ item }) => (
//           <View style={styles.todoRow}>
//             {/* Star/favorite */}
//             {item.favorite && (
//               <Ionicons name="star" size={22} color="#ffd700" style={{ marginRight: 4 }} />
//             )}
//             {/* Priority badge */}
//             <View style={{
//               backgroundColor: item.priority === 'high' ? '#ff8882'
//                 : item.priority === 'medium' ? '#ffdf6d'
//                 : '#9ad0f5',
//               borderRadius: 6, width: 12, height: 12, marginRight: 6,
//             }} />
//             {/* Checkbox */}
//             <TouchableOpacity onPress={() => toggleTodo(item.id)}>
//               <Ionicons
//                 name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
//                 size={24}
//                 color={item.done ? '#67c99a' : '#aaa'}
//                 style={{ marginRight: 9 }}
//               />
//             </TouchableOpacity>
//             {/* Task text */}
//             <Text style={[styles.todoText, item.done && styles.doneText]}>{item.text}</Text>
//             {/* Due date */}
//             {item.dueDate && (
//               <View style={{ marginLeft: 6, flexDirection: 'row', alignItems: 'center' }}>
//                 <Ionicons name="calendar-outline" size={17} color="#9ad0f5" style={{ marginRight: 2 }} />
//                 <Text style={{ fontSize: 13, color: '#9ad0f5' }}>{moment(item.dueDate).format('MMM D')}</Text>
//               </View>
//             )}
//             {/* Category/tag pill */}
//             {item.category && (
//               <View style={{
//                 backgroundColor: '#e9f4fa',
//                 borderRadius: 8,
//                 paddingHorizontal: 8,
//                 paddingVertical: 2,
//                 marginLeft: 7,
//               }}>
//                 <Text style={{ color: '#3d61b2', fontSize: 12 }}>{item.category}</Text>
//               </View>
//             )}
//             {/* Delete button */}
//             <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
//               <MaterialCommunityIcons name="trash-can-outline" size={22} color="#f87e7b" />
//             </TouchableOpacity>
//           </View>
//         )}
//         ListEmptyComponent={<Text style={{ color: '#aaa', marginTop: 40, alignSelf: 'center' }}>No to-dos yet.</Text>}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 22, backgroundColor: '#f5f8ff' },
//   header: { fontSize: 22, fontWeight: 'bold', color: '#556de8', marginBottom: 16, alignSelf: 'center' },
//   inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
//   input: {
//     backgroundColor: '#fff',
//     borderRadius: 14,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: '#e5e6ef',
//     marginRight: 4,
//     minWidth: 110,
//     flex: 1,
//   },
//   addBtn: { marginLeft: 5 },
//   priorityRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 5 },
//   todoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     marginBottom: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 18,
//     borderRadius: 14,
//     shadowColor: '#222',
//     shadowOpacity: 0.07,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   todoText: { fontSize: 16, color: '#222', flex: 1 },
//   doneText: { color: '#aaa', textDecorationLine: 'line-through' },
//   deleteBtn: { marginLeft: 10 },
// });









// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import moment from 'moment';
// import React, { useState } from 'react';
// import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { SwipeListView } from 'react-native-swipe-list-view';
// import { useTodoContext } from '../context/TodoContext';

// export default function TodoListScreen() {
//   const { todos, addTodo, toggleTodo, deleteTodo } = useTodoContext();
//   const [input, setInput] = useState('');
//   const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
//   const [favorite, setFavorite] = useState(false);
//   const [category, setCategory] = useState('');

//   const handleAdd = () => {
//     if (!input.trim()) return;
//     addTodo({
//       id: Date.now().toString(),
//       text: input.trim(),
//       done: false,
//       createdAt: new Date(),
//       priority,
//       favorite,
//       category: category.trim() ? category.trim() : undefined,
//     });
//     setInput('');
//     setPriority('medium');
//     setFavorite(false);
//     setCategory('');
//   };

//   const handleDelete = (id: string) => {
//     Alert.alert('Delete To-Do', 'Are you sure?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Delete', style: 'destructive', onPress: () => deleteTodo(id) },
//     ]);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>To-Do List</Text>
//       {/* Add To-Do Input */}
//       <View style={styles.inputRow}>
//         <TextInput
//           style={styles.input}
//           placeholder="Add new to-do"
//           value={input}
//           onChangeText={setInput}
//           onSubmitEditing={handleAdd}
//           returnKeyType="done"
//         />
//         <TouchableOpacity onPress={() => setFavorite(f => !f)}>
//           <Ionicons name={favorite ? 'star' : 'star-outline'} size={26} color={favorite ? '#ffd700' : '#aaa'} />
//         </TouchableOpacity>
//         <View style={styles.priorityRow}>
//           {['high', 'medium', 'low'].map(level => (
//             <TouchableOpacity
//               key={level}
//               style={{
//                 marginHorizontal: 2,
//                 padding: 3,
//                 backgroundColor: priority === level ? '#556de8' : '#e0e5f2',
//                 borderRadius: 7,
//               }}
//               onPress={() => setPriority(level as 'high' | 'medium' | 'low')}
//             >
//               <Text style={{ color: priority === level ? 'white' : '#556de8', fontWeight: 'bold' }}>{level[0].toUpperCase()}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//         <TextInput
//           style={[styles.input, { width: 80, marginLeft: 5 }]}
//           placeholder="Category"
//           value={category}
//           onChangeText={setCategory}
//         />
//         <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
//           <Ionicons name="add-circle" size={36} color="#67c99a" />
//         </TouchableOpacity>
//       </View>
//       {/* To-Do List */}
//       <SwipeListView
//         data={todos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())}
//         keyExtractor={item => item.id}
//         contentContainerStyle={{ paddingBottom: 100 }}
//         renderItem={({ item }) => (
//           <View style={styles.todoRow}>
//             {/* Favorite star */}
//             {item.favorite && (
//               <Ionicons name="star" size={22} color="#ffd700" style={{ marginRight: 4 }} />
//             )}
//             {/* Priority badge */}
//             <View style={{
//               backgroundColor: item.priority === 'high' ? '#ff8882'
//                 : item.priority === 'medium' ? '#ffdf6d'
//                 : '#9ad0f5',
//               borderRadius: 6, width: 12, height: 12, marginRight: 6,
//             }} />
//             {/* Checkbox */}
//             <TouchableOpacity onPress={() => toggleTodo(item.id)}>
//               <Ionicons
//                 name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
//                 size={24}
//                 color={item.done ? '#67c99a' : '#aaa'}
//                 style={{ marginRight: 9 }}
//               />
//             </TouchableOpacity>
//             {/* Task text */}
//             <Text style={[styles.todoText, item.done && styles.doneText]}>{item.text}</Text>
//             {/* Due date */}
//             {item.dueDate && (
//               <View style={{ marginLeft: 6, flexDirection: 'row', alignItems: 'center' }}>
//                 <Ionicons name="calendar-outline" size={17} color="#9ad0f5" style={{ marginRight: 2 }} />
//                 <Text style={{ fontSize: 13, color: '#9ad0f5' }}>{moment(item.dueDate).format('MMM D')}</Text>
//               </View>
//             )}
//             {/* Category/tag pill */}
//             {item.category && (
//               <View style={{
//                 backgroundColor: '#e9f4fa',
//                 borderRadius: 8,
//                 paddingHorizontal: 8,
//                 paddingVertical: 2,
//                 marginLeft: 7,
//               }}>
//                 <Text style={{ color: '#3d61b2', fontSize: 12 }}>{item.category}</Text>
//               </View>
//             )}
//           </View>
//         )}
//         renderHiddenItem={({ item }) => (
//           <View style={styles.rowBack}>
//             <TouchableOpacity style={styles.completeAction} onPress={() => toggleTodo(item.id)}>
//               <Ionicons name="checkmark-done" size={22} color="#fff" />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(item.id)}>
//               <MaterialCommunityIcons name="trash-can-outline" size={22} color="#fff" />
//             </TouchableOpacity>
//           </View>
//         )}
//         rightOpenValue={-85}
//         leftOpenValue={75}
//         disableRightSwipe={false}
//         disableLeftSwipe={false}
//       />

//       {todos.length === 0 && (
//         <Text style={{ color: '#aaa', marginTop: 40, alignSelf: 'center' }}>No to-dos yet.</Text>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 22, backgroundColor: '#f5f8ff' },
//   header: { fontSize: 22, fontWeight: 'bold', color: '#556de8', marginBottom: 16, alignSelf: 'center' },
//   inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
//   input: {
//     backgroundColor: '#fff',
//     borderRadius: 14,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: '#e5e6ef',
//     marginRight: 4,
//     minWidth: 110,
//     flex: 1,
//   },
//   addBtn: { marginLeft: 5 },
//   priorityRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 5 },
//   todoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     marginBottom: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 18,
//     borderRadius: 14,
//     shadowColor: '#222',
//     shadowOpacity: 0.07,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   todoText: { fontSize: 16, color: '#222', flex: 1 },
//   doneText: { color: '#aaa', textDecorationLine: 'line-through' },
//   rowBack: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//     borderRadius: 14,
//     overflow: 'hidden',
//     backgroundColor: 'transparent',
//   },
//   deleteAction: {
//     backgroundColor: '#f87e7b',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 85,
//     height: '100%',
//     borderRadius: 12,
//   },
//   completeAction: {
//     backgroundColor: '#67c99a',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 75,
//     height: '100%',
//     borderRadius: 12,
//   },
// });



// August 6th -----------------------------------






// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import moment from 'moment';
// import React, { useState } from 'react';
// import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { SwipeListView } from 'react-native-swipe-list-view';
// import { useTodoContext } from '../context/TodoContext';

// export default function TodoListScreen() {
//   const { todos, addTodo, toggleTodo, deleteTodo, addSubTask, toggleSubTask } = useTodoContext();
//   const [input, setInput] = useState('');
//   const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
//   const [favorite, setFavorite] = useState(false);
//   const [category, setCategory] = useState('');
//   const [expandedIds, setExpandedIds] = useState<string[]>([]);

//   const handleAdd = () => {
//     if (!input.trim()) return;
//     addTodo({
//       id: Date.now().toString(),
//       text: input.trim(),
//       done: false,
//       createdAt: new Date(),
//       priority,
//       favorite,
//       category: category.trim() ? category.trim() : undefined,
//     });
//     setInput('');
//     setPriority('medium');
//     setFavorite(false);
//     setCategory('');
//   };

//   const handleDelete = (id: string) => {
//     Alert.alert('Delete To-Do', 'Are you sure?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Delete', style: 'destructive', onPress: () => deleteTodo(id) },
//     ]);
//   };

//   const isExpanded = (id: string) => expandedIds.includes(id);
//   const toggleExpand = (id: string) =>
//     setExpandedIds(prev =>
//       prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
//     );

//   function AddSubtaskInput({ parentId }: { parentId: string }) {
//     const [subInput, setSubInput] = useState('');
//     const handleAddSub = () => {
//       if (!subInput.trim()) return;
//       addSubTask(parentId, subInput.trim());
//       setSubInput('');
//     };
//     return (
//       <View style={styles.subTaskInputRow}>
//         <TextInput
//           style={styles.subTaskInput}
//           placeholder="Add subtask"
//           value={subInput}
//           onChangeText={setSubInput}
//           onSubmitEditing={handleAddSub}
//           returnKeyType="done"
//         />
//         <TouchableOpacity onPress={handleAddSub}>
//           <Ionicons name="add-circle-outline" size={22} color="#67c99a" />
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>To-Do List</Text>
//       {/* Add To-Do Input */}
//       <View style={styles.inputRow}>
//         <TextInput
//           style={styles.input}
//           placeholder="Add new to-do"
//           value={input}
//           onChangeText={setInput}
//           onSubmitEditing={handleAdd}
//           returnKeyType="done"
//         />
//         <TouchableOpacity onPress={() => setFavorite(f => !f)}>
//           <Ionicons name={favorite ? 'star' : 'star-outline'} size={26} color={favorite ? '#ffd700' : '#aaa'} />
//         </TouchableOpacity>
//         <View style={styles.priorityRow}>
//           {['high', 'medium', 'low'].map(level => (
//             <TouchableOpacity
//               key={level}
//               style={{
//                 marginHorizontal: 2,
//                 padding: 3,
//                 backgroundColor: priority === level ? '#556de8' : '#e0e5f2',
//                 borderRadius: 7,
//               }}
//               onPress={() => setPriority(level as 'high' | 'medium' | 'low')}
//             >
//               <Text style={{ color: priority === level ? 'white' : '#556de8', fontWeight: 'bold' }}>{level[0].toUpperCase()}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//         <TextInput
//           style={[styles.input, { width: 80, marginLeft: 5 }]}
//           placeholder="Category"
//           value={category}
//           onChangeText={setCategory}
//         />
//         <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
//           <Ionicons name="add-circle" size={36} color="#67c99a" />
//         </TouchableOpacity>
//       </View>
//       {/* To-Do List */}
//       <SwipeListView
//         data={todos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())}
//         keyExtractor={item => item.id}
//         contentContainerStyle={{ paddingBottom: 100 }}
//         renderItem={({ item }) => (
//           <View style={styles.todoRow}>
//             {/* Favorite star */}
//             {item.favorite && (
//               <Ionicons name="star" size={22} color="#ffd700" style={{ marginRight: 4 }} />
//             )}
//             {/* Priority badge */}
//             <View style={{
//               backgroundColor: item.priority === 'high' ? '#ff8882'
//                 : item.priority === 'medium' ? '#ffdf6d'
//                 : '#9ad0f5',
//               borderRadius: 6, width: 12, height: 12, marginRight: 6,
//             }} />
//             {/* Checkbox */}
//             <TouchableOpacity onPress={() => toggleTodo(item.id)}>
//               <Ionicons
//                 name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
//                 size={24}
//                 color={item.done ? '#67c99a' : '#aaa'}
//                 style={{ marginRight: 9 }}
//               />
//             </TouchableOpacity>
//             {/* Task text */}
//             <Text style={[styles.todoText, item.done && styles.doneText]}>{item.text}</Text>
//             {/* Due date */}
//             {item.dueDate && (
//               <View style={{ marginLeft: 6, flexDirection: 'row', alignItems: 'center' }}>
//                 <Ionicons name="calendar-outline" size={17} color="#9ad0f5" style={{ marginRight: 2 }} />
//                 <Text style={{ fontSize: 13, color: '#9ad0f5' }}>{moment(item.dueDate).format('MMM D')}</Text>
//               </View>
//             )}
//             {/* Category/tag pill */}
//             {item.category && (
//               <View style={{
//                 backgroundColor: '#e9f4fa',
//                 borderRadius: 8,
//                 paddingHorizontal: 8,
//                 paddingVertical: 2,
//                 marginLeft: 7,
//               }}>
//                 <Text style={{ color: '#3d61b2', fontSize: 12 }}>{item.category}</Text>
//               </View>
//             )}

//             {/* Chevron for subtasks */}
//             {item.subTasks && item.subTasks.length > 0 && (
//               <TouchableOpacity onPress={() => toggleExpand(item.id)} style={{ marginLeft: 6 }}>
//                 <Ionicons
//                   name={isExpanded(item.id) ? 'chevron-up' : 'chevron-down'}
//                   size={22}
//                   color="#67c99a"
//                 />
//               </TouchableOpacity>
//             )}
//             {/* Expandable subtasks section */}
//             {isExpanded(item.id) && (
//               <View style={styles.subTasksContainer}>
//                 {item.subTasks?.map(sub => (
//                   <TouchableOpacity
//                     key={sub.id}
//                     style={styles.subTaskRow}
//                     onPress={() => toggleSubTask(item.id, sub.id)}
//                   >
//                     <Ionicons
//                       name={sub.done ? 'checkmark-circle' : 'ellipse-outline'}
//                       size={20}
//                       color={sub.done ? '#67c99a' : '#bbb'}
//                       style={{ marginRight: 7 }}
//                     />
//                     <Text style={[
//                       styles.subTaskText,
//                       sub.done && { textDecorationLine: 'line-through', color: '#aaa' }
//                     ]}>
//                       {sub.text}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//                 <AddSubtaskInput parentId={item.id} />
//               </View>
//             )}
//           </View>
//         )}
//         renderHiddenItem={({ item }) => (
//           <View style={styles.rowBack}>
//             <TouchableOpacity style={styles.completeAction} onPress={() => toggleTodo(item.id)}>
//               <Ionicons name="checkmark-done" size={22} color="#fff" />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(item.id)}>
//               <MaterialCommunityIcons name="trash-can-outline" size={22} color="#fff" />
//             </TouchableOpacity>
//           </View>
//         )}
//         rightOpenValue={-85}
//         leftOpenValue={75}
//         disableRightSwipe={false}
//         disableLeftSwipe={false}
//       />

//       {todos.length === 0 && (
//         <Text style={{ color: '#aaa', marginTop: 40, alignSelf: 'center' }}>No to-dos yet.</Text>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 22, backgroundColor: '#f5f8ff' },
//   header: { fontSize: 22, fontWeight: 'bold', color: '#556de8', marginBottom: 16, alignSelf: 'center' },
//   inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
//   input: {
//     backgroundColor: '#fff',
//     borderRadius: 14,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: '#e5e6ef',
//     marginRight: 4,
//     minWidth: 110,
//     flex: 1,
//   },
//   addBtn: { marginLeft: 5 },
//   priorityRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 5 },
//   todoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     marginBottom: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 18,
//     borderRadius: 14,
//     shadowColor: '#222',
//     shadowOpacity: 0.07,
//     shadowRadius: 6,
//     elevation: 2,
//     flexWrap: 'wrap'
//   },
//   todoText: { fontSize: 16, color: '#222', flex: 1 },
//   doneText: { color: '#aaa', textDecorationLine: 'line-through' },
//   rowBack: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//     borderRadius: 14,
//     overflow: 'hidden',
//     backgroundColor: 'transparent',
//   },
//   deleteAction: {
//     backgroundColor: '#f87e7b',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 85,
//     height: '100%',
//     borderRadius: 12,
//   },
//   completeAction: {
//     backgroundColor: '#67c99a',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 75,
//     height: '100%',
//     borderRadius: 12,
//   },
//   subTasksContainer: {
//     marginTop: 7,
//     marginLeft: 36,
//     borderLeftWidth: 2,
//     borderColor: '#e0e5f2',
//     paddingLeft: 11,
//     width: '100%',
//   },
//   subTaskRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   subTaskText: {
//     fontSize: 15,
//     color: '#555',
//   },
//   subTaskInputRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 7,
//     marginBottom: 2,
//   },
//   subTaskInput: {
//     backgroundColor: '#f4f4f8',
//     borderRadius: 8,
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     fontSize: 15,
//     borderWidth: 1,
//     borderColor: '#e0e5f2',
//     marginRight: 6,
//     flex: 1,
//   },
// });







// August 7th

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useTodoContext } from '../context/TodoContext';

export default function TodoListScreen() {
  const { todos, addTodo, toggleTodo, deleteTodo, addSubTask, toggleSubTask } = useTodoContext();
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [favorite, setFavorite] = useState(false);
  const [category, setCategory] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const handleAdd = () => {
    if (!input.trim()) return;
    addTodo({
      id: Date.now().toString(),
      text: input.trim(),
      done: false,
      createdAt: new Date(),
      priority,
      favorite,
      category: category.trim() ? category.trim() : undefined,
    });
    setInput('');
    setPriority('medium');
    setFavorite(false);
    setCategory('');
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete To-Do', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTodo(id) },
    ]);
  };

  const isExpanded = (id: string) => expandedIds.includes(id);
  const toggleExpand = (id: string) =>
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );

  function AddSubtaskInput({ parentId }: { parentId: string }) {
    const [subInput, setSubInput] = useState('');
    const handleAddSub = () => {
      if (!subInput.trim()) return;
      addSubTask(parentId, subInput.trim());
      setSubInput('');
    };
    return (
      <View style={styles.subTaskInputRow}>
        <TextInput
          style={styles.subTaskInput}
          placeholder="Add subtask"
          value={subInput}
          onChangeText={setSubInput}
          onSubmitEditing={handleAddSub}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={handleAddSub}>
          <Ionicons name="add-circle-outline" size={22} color="#67c99a" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>To-Do List</Text>
      {/* Add To-Do Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add new to-do"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={() => setFavorite(f => !f)}>
          <Ionicons name={favorite ? 'star' : 'star-outline'} size={26} color={favorite ? '#ffd700' : '#aaa'} />
        </TouchableOpacity>
        <View style={styles.priorityRow}>
          {['high', 'medium', 'low'].map(level => (
            <TouchableOpacity
              key={level}
              style={{
                marginHorizontal: 2,
                padding: 3,
                backgroundColor: priority === level ? '#556de8' : '#e0e5f2',
                borderRadius: 7,
              }}
              onPress={() => setPriority(level as 'high' | 'medium' | 'low')}
            >
              <Text style={{ color: priority === level ? 'white' : '#556de8', fontWeight: 'bold' }}>{level[0].toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={[styles.input, { width: 80, marginLeft: 5 }]}
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
        />
        <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
          <Ionicons name="add-circle" size={36} color="#67c99a" />
        </TouchableOpacity>
      </View>
      {/* To-Do List */}
      <SwipeListView
        data={todos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.todoRow}>
            {/* Favorite star */}
            {item.favorite && (
              <Ionicons name="star" size={22} color="#ffd700" style={{ marginRight: 4 }} />
            )}
            {/* Priority badge */}
            <View style={{
              backgroundColor: item.priority === 'high' ? '#ff8882'
                : item.priority === 'medium' ? '#ffdf6d'
                : '#9ad0f5',
              borderRadius: 6, width: 12, height: 12, marginRight: 6,
            }} />
            {/* Checkbox */}
            <TouchableOpacity onPress={() => toggleTodo(item.id)}>
              <Ionicons
                name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={item.done ? '#67c99a' : '#aaa'}
                style={{ marginRight: 9 }}
              />
            </TouchableOpacity>
            {/* Task text */}
            <Text style={[styles.todoText, item.done && styles.doneText]}>{item.text}</Text>
            {/* Due date */}
            {item.dueDate && (
              <View style={{ marginLeft: 6, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="calendar-outline" size={17} color="#9ad0f5" style={{ marginRight: 2 }} />
                <Text style={{ fontSize: 13, color: '#9ad0f5' }}>{moment(item.dueDate).format('MMM D')}</Text>
              </View>
            )}
            {/* Category/tag pill */}
            {item.category && (
              <View style={{
                backgroundColor: '#e9f4fa',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginLeft: 7,
              }}>
                <Text style={{ color: '#3d61b2', fontSize: 12 }}>{item.category}</Text>
              </View>
            )}

            {/* Always show chevron for subtasks */}
            <TouchableOpacity onPress={() => toggleExpand(item.id)} style={{ marginLeft: 6 }}>
              <Ionicons
                name={isExpanded(item.id) ? 'chevron-up' : 'chevron-down'}
                size={22}
                color="#67c99a"
              />
            </TouchableOpacity>

            {/* Expandable subtasks section */}
            {isExpanded(item.id) && (
              <View style={styles.subTasksContainer}>
                {item.subTasks?.map(sub => (
                  <TouchableOpacity
                    key={sub.id}
                    style={styles.subTaskRow}
                    onPress={() => toggleSubTask(item.id, sub.id)}
                  >
                    <Ionicons
                      name={sub.done ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={sub.done ? '#67c99a' : '#bbb'}
                      style={{ marginRight: 7 }}
                    />
                    <Text style={[
                      styles.subTaskText,
                      sub.done && { textDecorationLine: 'line-through', color: '#aaa' }
                    ]}>
                      {sub.text}
                    </Text>
                  </TouchableOpacity>
                ))}
                <AddSubtaskInput parentId={item.id} />
              </View>
            )}
          </View>
        )}
        renderHiddenItem={({ item }) => (
          <View style={styles.rowBack}>
            <TouchableOpacity style={styles.completeAction} onPress={() => toggleTodo(item.id)}>
              <Ionicons name="checkmark-done" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(item.id)}>
              <MaterialCommunityIcons name="trash-can-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        rightOpenValue={-85}
        leftOpenValue={75}
        disableRightSwipe={false}
        disableLeftSwipe={false}
      />

      {todos.length === 0 && (
        <Text style={{ color: '#aaa', marginTop: 40, alignSelf: 'center' }}>No to-dos yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 22, backgroundColor: '#f5f8ff' },
  header: { fontSize: 22, fontWeight: 'bold', color: '#556de8', marginBottom: 16, alignSelf: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e6ef',
    marginRight: 4,
    minWidth: 110,
    flex: 1,
  },
  addBtn: { marginLeft: 5 },
  priorityRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 5 },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    shadowColor: '#222',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    flexWrap: 'wrap'
  },
  todoText: { fontSize: 16, color: '#222', flex: 1 },
  doneText: { color: '#aaa', textDecorationLine: 'line-through' },
  rowBack: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  deleteAction: {
    backgroundColor: '#f87e7b',
    justifyContent: 'center',
    alignItems: 'center',
    width: 85,
    height: '100%',
    borderRadius: 12,
  },
  completeAction: {
    backgroundColor: '#67c99a',
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    height: '100%',
    borderRadius: 12,
  },
  subTasksContainer: {
    marginTop: 7,
    marginLeft: 36,
    borderLeftWidth: 2,
    borderColor: '#e0e5f2',
    paddingLeft: 11,
    width: '100%',
  },
  subTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  subTaskText: {
    fontSize: 15,
    color: '#555',
  },
  subTaskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    marginBottom: 2,
  },
  subTaskInput: {
    backgroundColor: '#f4f4f8',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e5f2',
    marginRight: 6,
    flex: 1,
  },
});
