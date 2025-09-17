import { useTodoContext } from '@/context/TodoContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import moment from 'moment';
import { useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TodaysTasksScreen() {
  const { todos } = useTodoContext();

  const todaysTodos = useMemo(() => {
    return todos
      .filter((todo) => {
        if (todo.done) return false;
        if (!todo.dueDate) return false;
        return moment(todo.dueDate).isSame(moment(), 'day');
      })
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority as string] || 0;
        const bPriority = priorityOrder[b.priority as string] || 0;
        if (aPriority !== bPriority) return bPriority - aPriority;
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      });
  }, [todos]);

  const handleTodoPress = (todo: any) => {
    if (todo.listId === 'focus') {
      router.push({ pathname: '/(tabs)/today', params: { focusTaskId: todo.id } });
    } else {
      router.push({ pathname: '/task-details', params: { id: todo.id, from: '/todays-tasks' } });
    }
  };

  const renderTodo = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.todoItem} onPress={() => handleTodoPress(item)} activeOpacity={0.7}>
      <View style={styles.todoContent}>
        <View style={styles.todoHeader}>
          <Text style={[styles.todoTitle, item.done && styles.doneText]}>{item.text}</Text>
          <View style={styles.todoIcons}>
            {item.listId === 'focus' && item.pomodoro?.enabled && (
              <Ionicons name="timer-outline" size={20} color="#ff6b6b" />
            )}
          </View>
        </View>
        {item.notes ? <Text style={styles.todoNotes}>{item.notes}</Text> : null}
        {item.dueDate ? (
          <View style={styles.dueDateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#6b7280" />
            <Text style={styles.dueDateText}>
              {new Date(item.dueDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {item.listId === 'focus' && item.pomodoro?.workTime ? (
                <Text style={styles.dueDateText}> for {item.pomodoro.workTime} min</Text>
              ) : null}
            </Text>
          </View>
        ) : null}
        {item.subtasks && item.subtasks.length > 0 ? (
          <View style={styles.subtasksContainer}>
            {item.subtasks.slice(0, 2).map((subtask: any, index: number) => (
              <View key={index} style={styles.subtaskItem}>
                <Ionicons
                  name={subtask.done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={14}
                  color={subtask.done ? '#67c99a' : '#bbb'}
                />
                <Text style={[styles.subtaskText, subtask.done && styles.doneText]}>{subtask.text}</Text>
              </View>
            ))}
            {item.subtasks.length > 2 ? (
              <Text style={styles.moreSubtasks}>+{item.subtasks.length - 2} more</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Today's Tasks</Text>
        <View style={styles.placeholder} />
      </View>

      {todaysTodos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No tasks for today!</Text>
          <Text style={styles.emptySubtitle}>All caught up or add some tasks with due dates.</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/todo/new')}>
            <Text style={styles.addButtonText}>Add New Task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={todaysTodos}
          renderItem={renderTodo}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8ff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: { padding: 8 },
  title: { fontSize: 18, fontWeight: '600', color: '#333' },
  placeholder: { width: 36 },
  listContainer: { padding: 16 },
  todoItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todoContent: { flex: 1 },
  todoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  todoTitle: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1, marginRight: 8 },
  doneText: { textDecorationLine: 'line-through', color: '#999' },
  todoIcons: { flexDirection: 'row', alignItems: 'center' },
  todoNotes: { fontSize: 14, color: '#666', marginBottom: 8, fontStyle: 'italic' },
  dueDateContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dueDateText: { fontSize: 13, color: '#6b7280', marginLeft: 4 },
  subtasksContainer: { marginTop: 8 },
  subtaskItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  subtaskText: { fontSize: 13, color: '#666', marginLeft: 6, flex: 1 },
  moreSubtasks: { fontSize: 12, color: '#999', fontStyle: 'italic', marginTop: 4 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 },
  addButton: { backgroundColor: '#67c99a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});


