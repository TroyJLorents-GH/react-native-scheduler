import PomodoroTimer from '@/components/PomodoroTimer';
import { useTodoContext } from '@/context/TodoContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { todos, toggleTodo, toggleSubTask, updateTodo } = useTodoContext();
  const [moreExpanded, setMoreExpanded] = useState(false);

  const todo = todos.find(t => t.id === id);

  if (!todo) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Not Found</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>The requested task could not be found.</Text>
        </View>
      </View>
    );
  }

  const handleTimerComplete = () => {
    // Optionally mark the task as done when Pomodoro is completed
    // updateTodo(todo.id, { done: true });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push({
          pathname: '/todo/lists'
        })}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <TouchableOpacity onPress={() => router.push({
          pathname: '/todo/new',
          params: { editId: todo.id }
        })}>
          <Ionicons name="create-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Title */}
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => toggleTodo(todo.id)}
            >
              <Ionicons 
                name={todo.done ? 'checkmark-circle' : 'ellipse-outline'} 
                size={28} 
                color={todo.done ? '#67c99a' : '#bbb'} 
              />
            </TouchableOpacity>
            <Text style={[styles.title, todo.done && styles.doneText]}>
              {todo.text}
            </Text>
          </View>
        </View>

        {/* Work Session Pomodoro */}
        {todo.pomodoro?.enabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Session Pomodoro</Text>
            <PomodoroTimer 
              settings={todo.pomodoro}
              onComplete={handleTimerComplete}
            />
          </View>
        )}

        {/* Notes */}
        {todo.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{todo.notes}</Text>
          </View>
        )}

        {/* Subtasks */}
        {todo.subTasks && todo.subTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subtasks</Text>
            {todo.subTasks.map((subtask) => (
              <TouchableOpacity
                key={subtask.id}
                style={styles.subtaskRow}
                onPress={() => toggleSubTask(todo.id, subtask.id)}
              >
                <Ionicons
                  name={subtask.done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={subtask.done ? '#67c99a' : '#bbb'}
                />
                <Text style={[
                  styles.subtaskText,
                  subtask.done && styles.doneText
                ]}>
                  {subtask.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Due Date */}
        {todo.dueDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Due Date</Text>
            <View style={styles.dueDateRow}>
              <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              <Text style={styles.dueDateText}>
                {new Date(todo.dueDate).toLocaleDateString(undefined, { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                })}
                {todo.dueDate && new Date(todo.dueDate).getHours() !== 0 && (
                  ` at ${new Date(todo.dueDate).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}`
                )}
              </Text>
            </View>
          </View>
        )}

        {/* Priority */}
        {todo.priority && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priority</Text>
            <View style={styles.priorityRow}>
              <View style={[
                styles.priorityBadge, 
                { backgroundColor: todo.priority === 'high' ? '#FF6B6B' : todo.priority === 'medium' ? '#FFD93D' : '#6BCF7F' }
              ]}>
                <Text style={styles.priorityText}>
                  {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* More Section */}
        {(todo.repeat || todo.earlyReminder || todo.location || todo.url || (todo.images && todo.images.length > 0)) && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.moreHeader}
              onPress={() => setMoreExpanded(!moreExpanded)}
            >
              <Text style={styles.sectionTitle}>More</Text>
              <Ionicons 
                name={moreExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#007AFF" 
              />
            </TouchableOpacity>
            {moreExpanded && (
              <View style={styles.moreContainer}>
                {todo.repeat && (
                  <View style={styles.moreRow}>
                    <Ionicons name="repeat" size={20} color="#007AFF" />
                    <Text style={styles.moreText}>Repeat: {todo.repeat}</Text>
                  </View>
                )}
                {todo.earlyReminder && (
                  <View style={styles.moreRow}>
                    <Ionicons name="notifications" size={20} color="#007AFF" />
                    <Text style={styles.moreText}>Early Reminder: {todo.earlyReminder}</Text>
                  </View>
                )}
                {todo.location && (
                  <View style={styles.moreRow}>
                    <Ionicons name="location" size={20} color="#007AFF" />
                    <Text style={styles.moreText}>Location: {todo.location}</Text>
                  </View>
                )}
                {todo.url && (
                  <View style={styles.moreRow}>
                    <Ionicons name="link" size={20} color="#007AFF" />
                    <Text style={styles.moreText}>URL: {todo.url}</Text>
                  </View>
                )}
                {todo.images && todo.images.length > 0 && (
                  <View style={styles.moreRow}>
                    <Ionicons name="images" size={20} color="#007AFF" />
                    <Text style={styles.moreText}>Images: {todo.images.length} attached</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383a',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    lineHeight: 32,
  },
  doneText: {
    textDecorationLine: 'line-through',
    color: '#8e8e93',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  notes: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: '#1c1c1e',
    padding: 16,
    borderRadius: 12,
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    padding: 16,
    borderRadius: 12,
  },
  dueDateText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  priorityRow: {
    backgroundColor: '#1c1c1e',
    padding: 16,
    borderRadius: 12,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  subtaskText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  pomodoroInfo: {
    backgroundColor: '#1c1c1e',
    padding: 16,
    borderRadius: 12,
  },
  pomodoroText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  moreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moreContainer: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    overflow: 'hidden',
  },
  moreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383a',
  },
  moreText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
