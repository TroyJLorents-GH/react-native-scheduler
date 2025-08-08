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
//       listId,
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

//             {/* Always show chevron for subtasks */}
//             <TouchableOpacity onPress={() => toggleExpand(item.id)} style={{ marginLeft: 6 }}>
//               <Ionicons
//                 name={isExpanded(item.id) ? 'chevron-up' : 'chevron-down'}
//                 size={22}
//                 color="#67c99a"
//               />
//             </TouchableOpacity>

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



// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import moment from 'moment';
// import React, { useState } from 'react';
// import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { SwipeListView } from 'react-native-swipe-list-view';
// import { useTodoContext } from '../context/TodoContext';


// type TodoListScreenProps = {
//   route: { params: { listId: string } };
// };

// // Get the listId from navigation params (or props)
// export default function TodoListScreen({ route }: TodoListScreenProps) {
//   const { listId } = route.params;

//   const { todos, addTodo, toggleTodo, deleteTodo, addSubTask, toggleSubTask } = useTodoContext();
//   const [input, setInput] = useState('');
//   const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
//   const [favorite, setFavorite] = useState(false);
//   const [category, setCategory] = useState('');
//   const [expandedIds, setExpandedIds] = useState<string[]>([]);

//   // Filter todos for this list
//   const listTodos = todos.filter(t => t.listId === listId);

//   const handleAdd = () => {
//     if (!input.trim()) return;
//     addTodo({
//       id: Date.now().toString(),
//       text: input.trim(),
//       listId,
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
//         data={listTodos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())}
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

//             {/* Always show chevron for subtasks */}
//             <TouchableOpacity onPress={() => toggleExpand(item.id)} style={{ marginLeft: 6 }}>
//               <Ionicons
//                 name={isExpanded(item.id) ? 'chevron-up' : 'chevron-down'}
//                 size={22}
//                 color="#67c99a"
//               />
//             </TouchableOpacity>

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

//       {listTodos.length === 0 && (
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



// components/TodoListScreen.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useTodoContext } from '../context/TodoContext';

type Props = { listId: string };

export default function TodoListScreen({ listId }: Props) {
  const {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    addSubTask,
    toggleSubTask,
    updateTodo, // make sure this exists in your context
  } = useTodoContext();

  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [favorite, setFavorite] = useState(false);
  const [category, setCategory] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailsDueDate, setDetailsDueDate] = useState<Date | undefined>(undefined);
  const [detailsNotes, setDetailsNotes] = useState('');
  const [detailsPriority, setDetailsPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [detailsFavorite, setDetailsFavorite] = useState(false);

  const [pickerVisible, setPickerVisible] = useState(false);

  const listTodos = useMemo(
    () => todos.filter(t => t.listId === listId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [todos, listId]
  );

  const isExpanded = (id: string) => expandedIds.includes(id);
  const toggleExpand = (id: string) =>
    setExpandedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));

  const resetComposer = () => {
    setInput('');
    setPriority('medium');
    setFavorite(false);
    setCategory('');
  };

  const handleAdd = () => {
    if (!input.trim()) return;
    addTodo({
      id: Date.now().toString(),
      text: input.trim(),
      listId,
      done: false,
      createdAt: new Date(),
      priority,
      favorite,
      category: category.trim() ? category.trim() : undefined,
      // you can seed dueDate/notes here if you want
    });
    resetComposer();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete To-Do', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTodo(id) },
    ]);
  };

  // --- Quick toolbar helpers ---
  const setDue = (date: Date) => {
    // create a quick todo with due date if user typed something, else do nothing
    if (!input.trim()) {
      setPickerVisible(false);
      return;
    }
    addTodo({
      id: Date.now().toString(),
      text: input.trim(),
      listId,
      done: false,
      createdAt: new Date(),
      priority,
      favorite,
      category: category.trim() ? category.trim() : undefined,
      dueDate: date,
    });
    resetComposer();
    setPickerVisible(false);
  };

  const pickToday = () => setDue(moment().endOf('day').toDate());
  const pickTomorrow = () => setDue(moment().add(1, 'day').endOf('day').toDate());
  const pickWeekend = () => setDue(moment().day(6).endOf('day').toDate()); // Sat

  // --- Details modal open/populate ---
  const openDetailsFor = (todoId: string) => {
    const t = todos.find(x => x.id === todoId);
    if (!t) return;
    setEditingId(t.id);
    setDetailsDueDate(t.dueDate);
    setDetailsNotes(t.notes || '');
    setDetailsPriority(t.priority || 'medium');
    setDetailsFavorite(!!t.favorite);
    setDetailsOpen(true);
  };

  const saveDetails = () => {
    if (!editingId) return;
    updateTodo(editingId, {
      dueDate: detailsDueDate,
      notes: detailsNotes || undefined,
      priority: detailsPriority,
      favorite: detailsFavorite,
    });
    setDetailsOpen(false);
  };

  // --- Subtask adder inside details ---
  const addSubFromDetails = (text: string) => {
    if (!editingId || !text.trim()) return;
    addSubTask(editingId, text.trim());
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f5f8ff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header / Title could be your list name if you pass it in */}
      <View style={{ padding: 18 }}>
        <Text style={styles.header}>To-Do</Text>

        {/* Composer + Toolbar */}
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
            {(['high', 'medium', 'low'] as const).map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.priPill,
                  { backgroundColor: priority === level ? '#556de8' : '#e0e5f2' },
                ]}
                onPress={() => setPriority(level)}
              >
                <Text style={{ color: priority === level ? 'white' : '#556de8', fontWeight: 'bold' }}>
                  {level[0].toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[styles.input, { width: 90, marginLeft: 5 }]}
            placeholder="Category"
            value={category}
            onChangeText={setCategory}
          />
          <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
            <Ionicons name="add-circle" size={36} color="#67c99a" />
          </TouchableOpacity>
        </View>

        {/* Keyboard toolbar (quick actions) */}
        <View style={styles.toolbar}>
          <ToolbarButton icon="calendar" label="Today" onPress={pickToday} />
          <ToolbarButton icon="calendar" label="Tomorrow" onPress={pickTomorrow} />
          <ToolbarButton icon="calendar" label="Weekend" onPress={pickWeekend} />
          <ToolbarButton icon="calendar-clock" label="Date & Time" onPress={() => setPickerVisible(true)} />
          <ToolbarButton icon="tag" label="Tag" onPress={() => category || setCategory('tag')} />
          <ToolbarButton icon="flag" label="Flag" onPress={() => setPriority('high')} />
          <ToolbarButton icon="camera" label="Photo" onPress={() => Alert.alert('Photo', 'Not implemented yet')} />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={listTodos}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.todoRow}>
            {item.favorite && <Ionicons name="star" size={20} color="#ffd700" style={{ marginRight: 4 }} />}
            <View
              style={[
                styles.priorityDot,
                {
                  backgroundColor:
                    item.priority === 'high' ? '#ff8882' : item.priority === 'medium' ? '#ffdf6d' : '#9ad0f5',
                },
              ]}
            />
            <TouchableOpacity onPress={() => toggleTodo(item.id)}>
              <Ionicons
                name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={item.done ? '#67c99a' : '#aaa'}
                style={{ marginRight: 9 }}
              />
            </TouchableOpacity>

            <TouchableOpacity style={{ flex: 1 }} onPress={() => openDetailsFor(item.id)}>
              <Text style={[styles.todoText, item.done && styles.doneText]} numberOfLines={2}>
                {item.text}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                {item.dueDate && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                    <Ionicons name="calendar-outline" size={16} color="#9ad0f5" />
                    <Text style={{ fontSize: 12, color: '#3d61b2', marginLeft: 4 }}>
                      {moment(item.dueDate).format('MMM D, h:mm A')}
                    </Text>
                  </View>
                )}
                {item.category && (
                  <View style={styles.tagPill}>
                    <Text style={styles.tagText}>{item.category}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => toggleExpand(item.id)} style={{ marginLeft: 6 }}>
              <Ionicons name={isExpanded(item.id) ? 'chevron-up' : 'chevron-down'} size={22} color="#67c99a" />
            </TouchableOpacity>

            {/* Expandable subtasks */}
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
                    <Text
                      style={[
                        styles.subTaskText,
                        sub.done && { textDecorationLine: 'line-through', color: '#aaa' },
                      ]}
                    >
                      {sub.text}
                    </Text>
                  </TouchableOpacity>
                ))}
                <SubtaskInput onAdd={(txt) => addSubFromDetails(txt)} />
              </View>
            )}
          </View>
        )}
      />

      {/* Date & Time picker for composer quick action */}
      <DateTimePickerModal
        isVisible={pickerVisible}
        mode="datetime"
        date={new Date()}
        onConfirm={(date) => setDue(date)}
        onCancel={() => setPickerVisible(false)}
      />

      {/* Details modal */}
      <Modal visible={detailsOpen} animationType="slide" onRequestClose={() => setDetailsOpen(false)}>
        <View style={{ flex: 1, padding: 18, backgroundColor: '#fff' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <TouchableOpacity onPress={() => setDetailsOpen(false)}>
              <Text style={{ color: '#418cff', fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Details</Text>
            <TouchableOpacity onPress={saveDetails}>
              <Text style={{ color: '#418cff', fontSize: 16 }}>Done</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalLabel}>Date & Time</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() =>
                setDetailsDueDate(detailsDueDate ? undefined : new Date())
              }
            >
              <Ionicons name="calendar" size={18} color="#3d61b2" />
              <Text style={styles.dateBtnText}>
                {detailsDueDate ? moment(detailsDueDate).format('MMM D, h:mm A') : 'Set'}
              </Text>
            </TouchableOpacity>
            {detailsDueDate && (
              <TouchableOpacity style={[styles.dateBtn, { marginLeft: 8 }]} onPress={() => setDetailsDueDate(undefined)}>
                <MaterialCommunityIcons name="close-circle-outline" size={18} color="#b84a4a" />
                <Text style={[styles.dateBtnText, { color: '#b84a4a' }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.modalLabel}>Priority</Text>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            {(['high', 'medium', 'low'] as const).map(p => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priPill,
                  { backgroundColor: detailsPriority === p ? '#556de8' : '#e0e5f2', marginRight: 8 },
                ]}
                onPress={() => setDetailsPriority(p)}
              >
                <Text style={{ color: detailsPriority === p ? '#fff' : '#556de8', fontWeight: 'bold' }}>
                  {p.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.modalLabel}>Favorite</Text>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
            onPress={() => setDetailsFavorite(v => !v)}
          >
            <Ionicons name={detailsFavorite ? 'star' : 'star-outline'} size={24} color={detailsFavorite ? '#ffd700' : '#aaa'} />
            <Text style={{ marginLeft: 8 }}>{detailsFavorite ? 'Favorited' : 'Not favorited'}</Text>
          </TouchableOpacity>

          <Text style={styles.modalLabel}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Notes…"
            value={detailsNotes}
            onChangeText={setDetailsNotes}
            multiline
          />

          <Text style={styles.modalLabel}>Subtasks</Text>
          {editingId && (
            <SubtaskInput onAdd={(txt) => addSubFromDetails(txt)} />
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ---------- small components ----------
function ToolbarButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.toolbarBtn} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={20} color="#3d61b2" />
      <Text style={styles.toolbarLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function SubtaskInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState('');
  const submit = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText('');
  };
  return (
    <View style={styles.subTaskInputRow}>
      <TextInput
        style={styles.subTaskInput}
        placeholder="Add subtask"
        value={text}
        onChangeText={setText}
        onSubmitEditing={submit}
        returnKeyType="done"
      />
      <TouchableOpacity onPress={submit}>
        <Ionicons name="add-circle-outline" size={22} color="#67c99a" />
      </TouchableOpacity>
    </View>
  );
}

// ---------- styles ----------
const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: 'bold', color: '#556de8' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  input: {
    backgroundColor: '#fff', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12,
    fontSize: 16, borderWidth: 1, borderColor: '#e5e6ef', marginRight: 4, minWidth: 110, flex: 1,
  },
  addBtn: { marginLeft: 5 },
  priorityRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 5 },
  priPill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },

  toolbar: {
    flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, backgroundColor: '#eef3ff',
    borderRadius: 12, padding: 8,
  },
  toolbarBtn: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10,
    backgroundColor: '#ffffff', borderRadius: 10, marginRight: 8, marginBottom: 8,
  },
  toolbarLabel: { marginLeft: 6, color: '#3d61b2', fontWeight: '600' },

  todoRow: {
    backgroundColor: '#fff', marginBottom: 12, paddingVertical: 12, paddingHorizontal: 18,
    borderRadius: 14, shadowColor: '#222', shadowOpacity: 0.07, shadowRadius: 6, elevation: 2, flexWrap: 'wrap',
    flexDirection: 'row', alignItems: 'center',
  },
  todoText: { fontSize: 16, color: '#222', flex: 1 },
  doneText: { color: '#aaa', textDecorationLine: 'line-through' },

  priorityDot: { borderRadius: 6, width: 12, height: 12, marginRight: 6 },

  subTasksContainer: {
    marginTop: 7, marginLeft: 36, borderLeftWidth: 2, borderColor: '#e0e5f2', paddingLeft: 11, width: '100%',
  },
  subTaskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  subTaskText: { fontSize: 15, color: '#555' },
  subTaskInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 7, marginBottom: 2 },
  subTaskInput: {
    backgroundColor: '#f4f4f8', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10,
    fontSize: 15, borderWidth: 1, borderColor: '#e0e5f2', marginRight: 6, flex: 1,
  },

  modalLabel: { fontWeight: 'bold', color: '#2d3748', marginTop: 14, marginBottom: 6 },
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef3ff',
    paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8,
  },
  dateBtnText: { marginLeft: 6, color: '#3d61b2', fontWeight: '600' },
  notesInput: {
    backgroundColor: '#fafafa', borderRadius: 10, padding: 10, minHeight: 90, textAlignVertical: 'top',
    borderWidth: 1, borderColor: '#eee',
  },
  tagPill: {
  backgroundColor: '#e9f4fa',
  borderRadius: 8,
  paddingHorizontal: 8,
  paddingVertical: 2,
},
tagText: { color: '#3d61b2', fontSize: 12, fontWeight: '600' },
});
