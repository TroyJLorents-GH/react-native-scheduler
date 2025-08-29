import { useTodoContext } from '@/context/TodoContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import moment from 'moment';
import React, { useMemo } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TodaysTasksScreen() {
  const { todos, toggleTodo } = useTodoContext();

  // Filter todos for today
  const todaysTodos = useMemo(() => {
    return todos.filter(todo => {
      if (todo.done) return false; // Skip completed todos
      if (!todo.dueDate) return false; // Skip todos without due dates
      return moment(todo.dueDate).isSame(moment(), 'day'); // Check if due today
    }).sort((a, b) => {
      // Sort by priority (high first), then by due time
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // If same priority, sort by due time
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      return 0;
    });
  }, [todos]);

  const handleTodoPress = (todoId: string) => {
    router.push({ pathname: '/todo/task-details', params: { todoId } });
  };

  const renderTodo = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.todoItem}
      onPress={() => handleTodoPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.todoLeft}>
        <TouchableOpacity
          onPress={() => toggleTodo(item.id)}
          style={styles.checkbox}
        >
          <Ionicons
            name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={item.done ? '#67c99a' : '#aaa'}
          />
        </TouchableOpacity>
        
        <View style={styles.todoContent}>
          <Text style={[
            styles.todoTitle,
            item.done && styles.todoTitleCompleted
          ]}>
            {item.text}
          </Text>
          
          {item.notes && (
            <Text style={styles.todoNotes}>{item.notes}</Text>
          )}
          
          {item.dueDate && (
            <Text style={styles.todoDueDate}>
              Due: {moment(item.dueDate).format('h:mm A')}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.todoRight}>
        {item.priority && (
          <View style={[
            styles.priorityBadge,
            { backgroundColor: item.priority === 'high' ? '#ff8882' : item.priority === 'medium' ? '#ffdf6d' : '#9ad0f5' }
          ]}>
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>
        )}
        
        {item.pomodoro?.enabled && (
          <Ionicons name="timer-outline" size={20} color="#ff6b6b" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Today's Tasks</Text>
        <View style={styles.placeholder} />
      </View>

      {todaysTodos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No tasks for today!</Text>
          <Text style={styles.emptySubtitle}>All caught up or add some tasks with due dates.</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/todo/new')}
          >
            <Text style={styles.addButtonText}>Add New Task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={todaysTodos}
          renderItem={renderTodo}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1c1e',
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    padding: 16,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  todoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    marginRight: 12,
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  todoTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8e8e93',
  },
  todoNotes: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 4,
  },
  todoDueDate: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  todoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
