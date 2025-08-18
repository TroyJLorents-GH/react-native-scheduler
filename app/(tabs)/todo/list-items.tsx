import { useListContext } from '@/context/ListContext';
import { useTodoContext } from '@/context/TodoContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ListItems() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { todos, toggleTodo, toggleSubTask } = useTodoContext();
  const { lists } = useListContext();
  const [showCompleted, setShowCompleted] = React.useState(false);

  const list = lists.find(l => l.id === listId);
  const listTodos = useMemo(() => {
    const filtered = todos.filter(t => t.listId === listId);
    return showCompleted ? filtered : filtered.filter(t => !t.done);
  }, [todos, listId, showCompleted]);

  const renderTodo = ({ item }: { item: any }) => (
    <View style={styles.todoRow}>
      <TouchableOpacity onPress={() => toggleTodo(item.id)} style={styles.checkbox}>
        <Ionicons 
          name={item.done ? 'checkmark-circle' : 'ellipse-outline'} 
          size={24} 
          color={item.done ? '#67c99a' : '#bbb'} 
        />
      </TouchableOpacity>
      {item.pomodoro?.enabled && (
        <Ionicons 
          name="timer-outline" 
          size={16} 
          color="#FF6B6B" 
          style={{ marginRight: 6, marginTop: 4 }}
        />
      )}
      
      <TouchableOpacity 
        style={styles.todoContent}
        onPress={() => router.push({ pathname: '/todo/task-details', params: { id: item.id } })}
      >
        <Text style={[styles.todoText, item.done && styles.doneText]}>
          {item.text}
        </Text>
        {item.notes && (
          <Text style={styles.notesText}>{item.notes}</Text>
        )}
        {item.dueDate && (
          <View style={styles.dueDateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#6b7280" />
            <Text style={styles.dueDateText}>
              {new Date(item.dueDate).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        )}
        {item.subTasks && item.subTasks.length > 0 && (
          <View style={styles.subtasksContainer}>
            {item.subTasks.map((sub: any) => (
              <TouchableOpacity 
                key={sub.id} 
                style={styles.subtaskRow}
                onPress={() => toggleSubTask(item.id, sub.id)}
              >
                <Ionicons 
                  name={sub.done ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={16} 
                  color={sub.done ? '#67c99a' : '#bbb'} 
                />
                <Text style={[styles.subtaskText, sub.done && styles.doneText]}>
                  {sub.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={[styles.listIcon, { backgroundColor: list?.color || '#007AFF' }]}>
            {list?.icon && (
              <Ionicons name={list.icon as any} size={20} color="#fff" />
            )}
          </View>
          <Text style={styles.headerTitle}>{list?.name || 'List'}</Text>
          <Text style={styles.itemCount}>{listTodos.length} items</Text>
        </View>
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={() => setShowCompleted(!showCompleted)}
        >
          <Text style={styles.toggleText}>
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* List Items */}
      <FlatList
        data={listTodos}
        renderItem={renderTodo}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB - New Reminder */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push({
          pathname: '/todo/new',
          params: { preSelectedListId: String(listId) }
        })}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.fabText}>New Reminder</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f8ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  itemCount: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  placeholder: {
    width: 24,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
  },
  toggleText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    lineHeight: 22,
  },
  doneText: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  notesText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dueDateText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  subtasksContainer: {
    marginTop: 8,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  subtaskText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4f46e5',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
