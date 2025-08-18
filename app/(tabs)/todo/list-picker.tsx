import { useListContext } from '@/context/ListContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ListPickerScreen() {
  const params = useLocalSearchParams();
  const { selectedListId } = params;
  const { lists } = useListContext();

  const handleListSelect = (listId: string) => {
    // Replace the current screen with the new reminder screen (no stack buildup)
    router.replace({
      pathname: '/todo/new',
      params: { 
        preSelectedListId: listId,
        fromListPicker: 'true',
        // Preserve form data
        title: params.title || '',
        notes: params.notes || '',
        subtasks: params.subtasks || '',
        priority: params.priority || 'medium',
        dueDate: params.dueDate || '',
        // Preserve edit context
        editId: params.editId || '',
        isEditing: params.isEditing || 'false',
        // Preserve Pomodoro settings
        pomodoroEnabled: params.pomodoroEnabled || '',
        workTime: params.workTime || '',
        workUnit: params.workUnit || '',
        breakTime: params.breakTime || '',
        breakUnit: params.breakUnit || '',
        // Preserve additional details
        earlyReminder: params.earlyReminder || '',
        repeat: params.repeat || '',
        location: params.location || '',
        url: params.url || ''
      }
    });
  };

  const renderList = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => handleListSelect(item.id)}
    >
      <View style={styles.listInfo}>
        <View style={[styles.listIcon, { backgroundColor: item.color || '#007AFF' }]}>
          {item.icon && (
            <Ionicons name={item.icon as any} size={20} color="#fff" />
          )}
        </View>
        <Text style={styles.listName}>{item.name}</Text>
      </View>
      {selectedListId === item.id && (
        <Ionicons name="checkmark" size={24} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>List</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={lists}
        renderItem={renderList}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383a',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383a',
  },
  listInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '400',
  },
});
