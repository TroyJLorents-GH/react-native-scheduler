// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import React, { useState } from 'react';
// import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { useListContext } from '../context/ListContext';
// import { useTodoContext } from '../context/TodoContext';
// import { router } from 'expo-router';

// // Some nice default colors and icons
// const COLORS = ['#418cff', '#ff4136', '#2ecc40', '#ffb64f', '#9b59b6', '#34495e', '#ffdf6d', '#67c99a', '#ff8882'];
// const ICONS = ['format-list-bulleted', 'cart-outline', 'lightbulb-outline', 'star-outline', 'book-outline', 'briefcase-outline', 'home-outline', 'run', 'airplane-outline'];

// export default function MyListsScreen({ navigation }: any) {
//   const { lists, addList, deleteList } = useListContext();
//   const { todos } = useTodoContext();
//   const [showModal, setShowModal] = useState(false);
//   const [name, setName] = useState('');
//   const [color, setColor] = useState(COLORS[0]);
//   const [icon, setIcon] = useState(ICONS[0]);

//   const handleAddList = () => {
//     if (!name.trim()) return;
//     addList({ name: name.trim(), color, icon });
//     setName('');
//     setColor(COLORS[0]);
//     setIcon(ICONS[0]);
//     setShowModal(false);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>My Lists</Text>
//       <FlatList
//         data={lists}
//         keyExtractor={item => item.id}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             style={[styles.listRow, { backgroundColor: '#fff' }]}
//             onPress={() => navigation?.navigate?.('ListTodos', { listId: item.id })}
//           >
//             <View style={[styles.listIcon, { backgroundColor: item.color }]}>
//               <MaterialCommunityIcons name={item.icon as any} size={26} color="#fff" />
//             </View>
//             <Text style={styles.listName}>{item.name}</Text>
//             <View style={styles.countBadge}>
//               <Text style={{ color: '#fff', fontWeight: 'bold' }}>
//                 {todos.filter(t => t.listId === item.id && !t.done).length}
//               </Text>
//             </View>
//             <TouchableOpacity onPress={() => deleteList(item.id)}>
//               <MaterialCommunityIcons name="delete-outline" size={24} color="#ff4136" />
//             </TouchableOpacity>
//           </TouchableOpacity>
//         )}
//         contentContainerStyle={{ paddingBottom: 100 }}
//         ListFooterComponent={
//           <TouchableOpacity style={styles.addListBtn} onPress={() => setShowModal(true)}>
//             <MaterialCommunityIcons name="plus" size={26} color="#418cff" />
//             <Text style={{ color: '#418cff', fontWeight: 'bold', fontSize: 17, marginLeft: 7 }}>Add List</Text>
//           </TouchableOpacity>
//         }
//       />
//       {/* Add List Modal */}
//       <Modal visible={showModal} animationType="slide" transparent>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalCard}>
//             <Text style={styles.modalTitle}>New List</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="List name"
//               value={name}
//               onChangeText={setName}
//               autoFocus
//             />
//             <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Color</Text>
//             <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 6 }}>
//               {COLORS.map(c => (
//                 <TouchableOpacity
//                   key={c}
//                   onPress={() => setColor(c)}
//                   style={{
//                     width: 28, height: 28, borderRadius: 15,
//                     backgroundColor: c, marginHorizontal: 4, marginVertical: 3,
//                     borderWidth: color === c ? 2.2 : 0, borderColor: '#418cff'
//                   }}
//                 />
//               ))}
//             </View>
//             <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Icon</Text>
//             <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 6 }}>
//               {ICONS.map(ic => (
//                 <TouchableOpacity
//                   key={ic}
//                   onPress={() => setIcon(ic)}
//                   style={{
//                     width: 32, height: 32, borderRadius: 10,
//                     backgroundColor: icon === ic ? '#eee' : '#fff',
//                     marginHorizontal: 4, marginVertical: 3,
//                     alignItems: 'center', justifyContent: 'center'
//                   }}>
//                   <MaterialCommunityIcons name={icon as any} size={21} color="#418cff" />
//                 </TouchableOpacity>
//               ))}
//             </View>
//             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
//               <TouchableOpacity >
//                 <Text style={{ color: '#aaa', fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={handleAddList}>
//                 <Text style={{ color: '#418cff', fontWeight: 'bold', fontSize: 16 }}>Add</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f5f8ff', paddingTop: 30 },
//   header: { fontSize: 24, fontWeight: 'bold', color: '#418cff', marginBottom: 14, alignSelf: 'center' },
//   listRow: {
//     flexDirection: 'row', alignItems: 'center', marginVertical: 7, paddingVertical: 11,
//     paddingHorizontal: 18, borderRadius: 15, elevation: 1, marginHorizontal: 16,
//     shadowColor: '#aaa', shadowOpacity: 0.06, shadowRadius: 7,
//   },
//   listIcon: { width: 37, height: 37, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
//   listName: { fontSize: 17, fontWeight: 'bold', flex: 1, color: '#323447' },
//   countBadge: {
//     backgroundColor: '#418cff', borderRadius: 11, minWidth: 24, height: 22, alignItems: 'center',
//     justifyContent: 'center', marginRight: 14, paddingHorizontal: 4
//   },
//   addListBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 25, alignSelf: 'center', padding: 9 },
//   modalOverlay: { flex: 1, backgroundColor: '#2229', justifyContent: 'center', alignItems: 'center' },
//   modalCard: {
//     backgroundColor: '#fff', borderRadius: 19, padding: 22, minWidth: 320, maxWidth: 340,
//     shadowColor: '#222', shadowOpacity: 0.18, shadowRadius: 13, elevation: 7
//   },
//   modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#418cff', marginBottom: 10, alignSelf: 'center' },
//   input: { borderWidth: 1, borderColor: '#eee', borderRadius: 7, padding: 8, marginVertical: 6, fontSize: 17 }
// });





import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useListContext } from '../context/ListContext';
import { useTodoContext } from '../context/TodoContext';

export default function MyListsScreen() {
  const { lists, addList, deleteList } = useListContext();
  const { todos } = useTodoContext();

  const [isModalVisible, setModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6'); // default blue
  const [selectedIcon, setSelectedIcon] = useState<'list' | 'checkbox' | 'calendar' | 'star' | 'flag' | 'cart' | 'school' | 'briefcase' | 'heart'>('list');

  const colors = ['#3b82f6', '#ef4444', '#22c55e', '#facc15', '#a855f7', '#64748b', '#f97316', '#14b8a6', '#fda4af'];
  const icons: typeof selectedIcon[] = ['list', 'checkbox', 'calendar', 'star', 'flag', 'cart', 'school', 'briefcase', 'heart'];

  const handleAddList = () => {
    if (!newListName.trim()) return;
    // IMPORTANT: do NOT pass id if addList expects Omit<List,'id'>
    addList({
      name: newListName.trim(),
      color: selectedColor,
      icon: selectedIcon,
    });
    setNewListName('');
    setSelectedColor('#3b82f6');
    setSelectedIcon('list');
    setModalVisible(false);
  };

  const countForList = (listId: string) =>
    todos.filter(t => t.listId === listId && !t.done).length;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Lists</Text>

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.listItem, { backgroundColor: '#fff' }]}
            onPress={() => router.push(`/todo/${item.id}`)}
          >
            <Ionicons name={item.icon as any} size={22} color={item.color} style={{ marginRight: 10 }} />
            <Text style={styles.listName}>{item.name}</Text>
            <View style={{ flex: 1 }} />
            <View style={[styles.countBadge, { backgroundColor: item.color }]}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{countForList(item.id)}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteList(item.id)} style={{ marginLeft: 12 }}>
              <Ionicons name="trash" size={20} color="#f87171" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#999' }}>No lists yet.</Text>}
      />

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add List Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>New List</Text>
            <TextInput
              style={styles.input}
              placeholder="List name"
              value={newListName}
              onChangeText={setNewListName}
            />

            <Text style={styles.sectionLabel}>Color</Text>
            <View style={styles.colorRow}>
              {colors.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c, borderWidth: selectedColor === c ? 2 : 0 },
                  ]}
                  onPress={() => setSelectedColor(c)}
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>Icon</Text>
            <View style={styles.iconRow}>
              {icons.map((ic) => (
                <TouchableOpacity key={ic} onPress={() => setSelectedIcon(ic)}>
                  <Ionicons
                    name={ic as any}
                    size={26}
                    color={selectedIcon === ic ? selectedColor : '#888'}
                    style={{ marginHorizontal: 6 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtn}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddList}>
                <Text style={styles.addBtn}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9ff', padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, alignSelf: 'center', color: '#374151' },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listName: { fontSize: 16, fontWeight: '500', color: '#111827' },
  countBadge: {
    minWidth: 28,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 28,
    backgroundColor: '#556de8',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff', width: '85%', borderRadius: 14, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8,
  },
  modalHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 14, textAlign: 'center' },
  input: {
    backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginBottom: 16,
  },
  sectionLabel: { fontWeight: 'bold', marginTop: 10, marginBottom: 6 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  colorCircle: { width: 28, height: 28, borderRadius: 14, marginRight: 8 },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  cancelBtn: { color: '#ef4444', fontSize: 16 },
  addBtn: { color: '#3b82f6', fontSize: 16, fontWeight: 'bold' },
});
