import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Lists</Text>

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.listItem, { backgroundColor: '#fff' }]}
            onPress={() => router.push({ pathname: '/todo/list-items', params: { listId: item.id } })}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9ff' },
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
