import { useListContext } from '@/context/ListContext';
import { useTodoContext } from '@/context/TodoContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListItems() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { todos, toggleTodo, toggleSubTask } = useTodoContext();
  const { lists } = useListContext();
  const [showCompleted, setShowCompleted] = React.useState(false);
  const [completedSheetOpen, setCompletedSheetOpen] = React.useState(false);

  const list = lists.find(l => l.id === listId);
  const listTodos = useMemo(() => {
    const filtered = todos.filter(t => t.listId === listId);
    return showCompleted ? filtered : filtered.filter(t => !t.done);
  }, [todos, listId, showCompleted]);

  const completedForList = useMemo(() => {
    return todos
      .filter(t => t.listId === listId && t.done)
      .sort((a: any, b: any) => {
        const at = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const bt = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return bt - at;
      });
  }, [todos, listId]);

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
        onPress={() => {
          if (item.listId === 'focus') {
            router.push({ pathname: '/(tabs)/today', params: { focusTaskId: item.id } });
          } else {
            router.push({ pathname: '/task-details', params: { id: item.id, from: '/todo/list-items' } });
          }
        }}
      >
        <Text style={[styles.todoText, item.done && styles.doneText]}>
          {item.text}
        </Text>
        <>
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
                {item.listId === 'focus' && item.pomodoro?.workTime && (
                  <Text style={styles.dueDateText}> for {item.pomodoro.workTime} min</Text>
                )}
              </Text>
            </View>
          )}
        </>
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        {String(listId) === 'focus' ? (
          <>
            <Text style={styles.centerTitle}>Focus</Text>
            <View style={styles.placeholder} />
          </>
        ) : (
          <View style={styles.headerInfo}>
            <View style={[styles.listIcon, { backgroundColor: list?.color || '#007AFF' }]}>
              {list?.icon && (
                <Ionicons name={list.icon as any} size={20} color="#fff" />
              )}
            </View>
            <Text style={styles.headerTitle}>{list?.name || 'List'}</Text>
            <Text style={styles.itemCount}>{listTodos.length} items</Text>
          </View>
        )}
        <View style={styles.placeholder} />
      </View>

      {/* List Items */}
      <FlatList
        data={listTodos}
        renderItem={renderTodo}
        keyExtractor={(item, index) => `${item.id}-${index}-${item.text}`}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Centered "View Completed" button (match SmartListScreen style) */}
      {listId === 'focus' && completedForList.length > 0 && (
        <TouchableOpacity style={styles.viewCompletedBtn} onPress={() => setCompletedSheetOpen(true)}>
          <Text style={styles.viewCompletedText}>View Completed ({completedForList.length})</Text>
        </TouchableOpacity>
      )}

      {/* Completed bottom sheet for Focus sessions */}
      <Modal transparent visible={completedSheetOpen} animationType="slide" onRequestClose={() => setCompletedSheetOpen(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setCompletedSheetOpen(false)} />
          <View style={styles.sheetContainer}>
            <Text style={styles.sheetTitle}>Completed Focus Sessions</Text>
            <FlatList
              data={completedForList}
              keyExtractor={(item:any) => item.id}
              renderItem={({ item }: any) => (
                <View style={styles.completedRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#67c99a" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.completedTitle} numberOfLines={1}>{item.text}</Text>
                    <Text style={styles.completedMeta}>
                      {item.completedAt ? new Date(item.completedAt).toLocaleString() : ''}
                      {item.pomodoro?.workTime ? ` • ${item.pomodoro.workTime} min` : ''}
                    </Text>
                  </View>
                </View>
              )}
              style={{ maxHeight: 340 }}
              showsVerticalScrollIndicator={false}
            />
            <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setCompletedSheetOpen(false)}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FAB - New Reminder */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
          if (listId === 'focus') {
            router.push('/focus/new');
          } else {
            router.push({ pathname: '/todo/new', params: { preSelectedListId: String(listId) } });
          }
        }}
      >
        <Ionicons name={listId === 'focus' ? 'timer-outline' : 'add'} size={16} color="#fff" />
        <Text style={styles.fabText}>{listId === 'focus' ? 'Add Focus Time' : 'New Reminder'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8
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
    bottom: 68,
    right: 20,
    backgroundColor: '#4f46e5',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
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
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  centerTitle: { 
    fontSize: 20,
    fontWeight: '700', 
    color: '#111827', 
    flex: 1, 
    textAlign: 'center'
     },
  viewCompletedBtn: {
    alignSelf: 'center',
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#f1f5ff',
    borderRadius: 16,
  },
  viewCompletedText: { color: '#3f51d1', fontWeight: '700' },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  sheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#111827' },
  completedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  completedTitle: { color: '#111827', fontSize: 14, fontWeight: '600' },
  completedMeta: { color: '#6b7280', fontSize: 12 },
  sheetCloseBtn: { alignSelf: 'center', marginTop: 10, backgroundColor: '#3f51d1', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 16 },
});
