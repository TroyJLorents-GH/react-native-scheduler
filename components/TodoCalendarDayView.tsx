import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import moment from 'moment';
import { Todo } from '../context/TodoContext';

type Props = {
  todos: Todo[];
};

// Simple calendar-like vertical timeline for a single day
export default function TodoCalendarDayView({ todos }: Props) {
  const startHour = 8; // 8 AM
  const endHour = 20; // 8 PM

  const dayTodos = [...todos]
    .filter(t => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {Array.from({ length: endHour - startHour + 1 }).map((_, idx) => {
        const hour = startHour + idx;
        const label = moment().hour(hour).minute(0).format('hh:00 a');
        const itemsThisHour = dayTodos.filter(t => new Date(t.dueDate as Date).getHours() === hour);
        return (
          <View key={hour} style={styles.hourRow}>
            <Text style={styles.hourLabel}>{label}</Text>
            <View style={styles.hourContent}>
              {itemsThisHour.map(todo => (
                <View key={todo.id} style={styles.block}>
                  <View style={styles.blockHeader}>
                    <Text style={styles.blockTitle} numberOfLines={1}>{todo.text}</Text>
                    <TouchableOpacity onPress={() => router.push({ pathname: '/todo/task-details', params: { id: todo.id, autostart: '1' } })}>
                      <Ionicons name="play-circle" size={20} color="#67c99a" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.blockTime}>
                    {moment(todo.dueDate).format('h:mm A')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 60,
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
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginTop: 4,
    fontSize: 12,
  },
});


