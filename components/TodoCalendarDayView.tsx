import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import moment from 'moment';
import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Todo, useTodoContext } from '../context/TodoContext';

type Props = {
  todos: Todo[];
  date: Date;
  onDateChange: (next: Date) => void;
};

// Simple calendar-like vertical timeline for a single day with drag/drop + swipe date
export default function TodoCalendarDayView({ todos, date, onDateChange }: Props) {
  const { updateTodo } = useTodoContext();

  console.log('TodoCalendarDayView render:', { todos: todos.length, date, selectedDayKey: moment(date).format('YYYY-MM-DD') });

  const selectedDayKey = moment(date).format('YYYY-MM-DD');

  const dayTodos = useMemo(() => {
    const filtered = [...todos]
      .filter(t => t.dueDate && moment(t.dueDate).format('YYYY-MM-DD') === selectedDayKey)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    
    console.log('Filtered todos for day:', { selectedDayKey, filtered: filtered.length, todos: filtered.map(t => ({ id: t.id, text: t.text, dueDate: t.dueDate })) });
    
    return filtered;
  }, [todos, selectedDayKey]);

  // Simple test render to debug
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#000' }}>
      <Text style={{ color: '#fff', fontSize: 18, marginBottom: 20 }}>
        Calendar View - {moment(date).format('MMM D, YYYY')}
      </Text>
      
      <Text style={{ color: '#fff', fontSize: 16, marginBottom: 10 }}>
        Total todos: {todos.length}
      </Text>
      
      <Text style={{ color: '#fff', fontSize: 16, marginBottom: 10 }}>
        Todos with due dates: {todos.filter(t => t.dueDate).length}
      </Text>
      
      <Text style={{ color: '#fff', fontSize: 16, marginBottom: 10 }}>
        Todos for selected day: {dayTodos.length}
      </Text>
      
      {dayTodos.map(todo => (
        <View key={todo.id} style={{ backgroundColor: '#333', padding: 15, marginBottom: 10, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{todo.text}</Text>
          <Text style={{ color: '#67c99a', fontSize: 14 }}>
            {moment(todo.dueDate).format('h:mm A')}
          </Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#67c99a', padding: 8, borderRadius: 4, marginTop: 8, alignSelf: 'flex-start' }}
            onPress={() => router.push({ pathname: '/todo/task-details', params: { id: todo.id, autostart: '1' } })}
          >
            <Ionicons name="play-circle" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ))}
      
      {dayTodos.length === 0 && (
        <Text style={{ color: '#999', fontSize: 16, textAlign: 'center', marginTop: 50 }}>
          No tasks for {moment(date).format('MMM D')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#14151a',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  hourLabel: {
    width: 74,
    color: '#9aa3b2',
    fontSize: 12,
    textTransform: 'lowercase',
  },
  hourContent: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#2a2f38',
    paddingLeft: 12,
    gap: 8,
  },
  block: {
    backgroundColor: '#1f2430',
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
  },
  resizeHandle: {
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
    padding: 4,
    borderRadius: 8,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  blockTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  blockTime: {
    color: '#6c93e6',
    fontSize: 12,
  },
});


