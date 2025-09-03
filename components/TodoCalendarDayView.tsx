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

  const [dragId, setDragId] = useState<string | null>(null);
  const [dragDy, setDragDy] = useState(0);
  const [rowHeight, setRowHeight] = useState(64);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const pixelsPerHour = rowHeight; // dynamic
  const pixelsPerMinute = Math.max(pixelsPerHour / 60, 0.5);
  const snapMinutes = 15;

  const selectedDayKey = moment(date).format('YYYY-MM-DD');

  const dayTodos = useMemo(() => {
    const filtered = [...todos]
      .filter(t => t.dueDate && moment(t.dueDate).format('YYYY-MM-DD') === selectedDayKey)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    
    console.log('Filtered todos for day:', { selectedDayKey, filtered: filtered.length, todos: filtered.map(t => ({ id: t.id, text: t.text, dueDate: t.dueDate })) });
    
    return filtered;
  }, [todos, selectedDayKey]);

  // Dynamically extend visible hours to include tasks; clamp to 6am–10pm by default
  const hoursForTasks = dayTodos.map(t => new Date(t.dueDate as Date).getHours());
  const minTaskHour = hoursForTasks.length ? Math.min(...hoursForTasks) : 8;
  const maxTaskHour = hoursForTasks.length ? Math.max(...hoursForTasks) : 20;
  const startHour = Math.min(6, minTaskHour);
  const endHour = Math.max(22, maxTaskHour);

  const containerPan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_, g) => {
        if (g.dx > 60) onDateChange(moment(date).subtract(1, 'day').toDate());
        else if (g.dx < -60) onDateChange(moment(date).add(1, 'day').toDate());
      },
    })
  ).current;

  return (
    <ScrollView contentContainerStyle={styles.container} scrollEnabled={scrollEnabled} {...containerPan.panHandlers}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => onDateChange(moment(date).subtract(1, 'day').toDate())} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={18} color="#9aa3b2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{moment(date).format('dddd, MMM D')}</Text>
        <TouchableOpacity onPress={() => onDateChange(moment(date).add(1, 'day').toDate())} style={styles.headerBtn}>
          <Ionicons name="chevron-forward" size={18} color="#9aa3b2" />
        </TouchableOpacity>
      </View>
      {Array.from({ length: endHour - startHour + 1 }).map((_, idx) => {
        const hour = startHour + idx;
        const label = moment().hour(hour).minute(0).format('hh:00 a');
        const itemsThisHour = dayTodos.filter(t => new Date(t.dueDate as Date).getHours() === hour);
        
        console.log(`Hour ${hour}:`, { label, itemsThisHour: itemsThisHour.length, items: itemsThisHour.map(t => ({ id: t.id, text: t.text })) });
        
        return (
          <View key={hour} style={styles.hourRow} onLayout={e => setRowHeight(e.nativeEvent.layout.height)}>
            <Text style={styles.hourLabel}>{label}</Text>
            <View style={styles.hourContent}>
              {itemsThisHour.map(todo => {
                console.log(`Rendering todo:`, { id: todo.id, text: todo.text, dueDate: todo.dueDate, computedDuration: (() => {
                  if (todo.pomodoro?.enabled) {
                    const w = todo.pomodoro.workTime || 25;
                    const unit = todo.pomodoro.workUnit || 'min';
                    return Math.max(5, unit === 'hour' ? w * 60 : w);
                  }
                  return Math.max(5, todo.durationMinutes || 30);
                })() });
                
                const finishDrag = () => {
                  setScrollEnabled(true);
                  const current = new Date(todo.dueDate as Date);
                  const deltaMinutes = Math.round((dragDy / Math.max(pixelsPerMinute, 0.5)) / snapMinutes) * snapMinutes;
                  const target = new Date(date);
                  target.setHours(current.getHours(), current.getMinutes(), 0, 0);
                  target.setMinutes(target.getMinutes() + deltaMinutes);
                  // clamp to visible range
                  if (target.getHours() < startHour) target.setHours(startHour, 0, 0, 0);
                  if (target.getHours() > endHour) target.setHours(endHour, 0, 0, 0);
                  updateTodo(todo.id, { dueDate: target });
                  setDragId(null);
                  setDragDy(0);
                };

                const pan = PanResponder.create({
                  onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
                  onStartShouldSetPanResponder: () => true,
                  onPanResponderGrant: () => {
                    setDragId(todo.id);
                    setScrollEnabled(false);
                  },
                  onPanResponderMove: (_, g) => setDragDy(g.dy),
                  onPanResponderRelease: finishDrag,
                  onPanResponderEnd: finishDrag,
                  onPanResponderTerminate: () => {
                    setScrollEnabled(true);
                    setDragId(null);
                    setDragDy(0);
                  }
                });
                const isDragging = dragId === todo.id;
                const computedDuration = (() => {
                  if (todo.pomodoro?.enabled) {
                    const w = todo.pomodoro.workTime || 25;
                    const unit = todo.pomodoro.workUnit || 'min';
                    return Math.max(5, unit === 'hour' ? w * 60 : w);
                  }
                  return Math.max(5, todo.durationMinutes || 30);
                })();
                const blockHeight = Math.max((computedDuration / 60) * pixelsPerHour, 18);

                // Resize (bottom handle) pan
                const resizePan = !todo.pomodoro?.enabled ? PanResponder.create({
                  onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
                  onPanResponderGrant: () => setScrollEnabled(false),
                  onPanResponderMove: (_, g) => setDragDy(g.dy),
                  onPanResponderRelease: () => {
                    setScrollEnabled(true);
                    const deltaMinutes = Math.round((dragDy / Math.max(pixelsPerMinute, 0.5)) / snapMinutes) * snapMinutes;
                    const newDuration = Math.max(15, computedDuration + deltaMinutes);
                    updateTodo(todo.id, { durationMinutes: newDuration });
                    setDragDy(0);
                  },
                  onPanResponderTerminate: () => {
                    setScrollEnabled(true);
                    setDragDy(0);
                  }
                }) : undefined;

                return (
                  <View key={todo.id} style={[styles.block, { height: blockHeight }, isDragging && { transform: [{ translateY: dragDy }], zIndex: 2, elevation: 6 }]} {...pan.panHandlers}>
                    <View style={styles.blockHeader}>
                      <Text style={styles.blockTitle} numberOfLines={1}>{todo.text}</Text>
                      <TouchableOpacity onPress={() => router.push({ pathname: '/todo/task-details', params: { id: todo.id, autostart: '1' } })}>
                        <Ionicons name="play-circle" size={20} color="#67c99a" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.blockTime}>{moment(todo.dueDate).format('h:mm A')}  ·  {Math.round(computedDuration)}m</Text>
                    {!todo.pomodoro?.enabled && resizePan && (
                      <View style={styles.resizeHandle} {...resizePan.panHandlers}>
                        <Ionicons name="reorder-three" size={18} color="#6c93e6" />
                      </View>
                    )}
                  </View>
                );
              })}
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


