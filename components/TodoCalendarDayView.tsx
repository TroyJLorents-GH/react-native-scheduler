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

export default function TodoCalendarDayView({ todos, date, onDateChange }: Props) {
  const { updateTodo } = useTodoContext();

  const [dragId, setDragId] = useState<string | null>(null);
  const [dragDy, setDragDy] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const pixelsPerHour = 80; // Fixed height for better visibility
  const pixelsPerMinute = pixelsPerHour / 60;
  const snapMinutes = 15;

  const selectedDayKey = moment(date).format('YYYY-MM-DD');

  const dayTodos = useMemo(() => {
    const filtered = [...todos]
      .filter(t => t.dueDate && moment(t.dueDate).format('YYYY-MM-DD') === selectedDayKey)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    
    return filtered;
  }, [todos, selectedDayKey]);

  // Dynamically extend visible hours to include tasks
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
    <ScrollView 
      contentContainerStyle={styles.container} 
      scrollEnabled={scrollEnabled} 
      {...containerPan.panHandlers}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity 
          onPress={() => onDateChange(moment(date).subtract(1, 'day').toDate())} 
          style={styles.headerBtn}
        >
          <Ionicons name="chevron-back" size={18} color="#9aa3b2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{moment(date).format('dddd, MMM D')}</Text>
        <TouchableOpacity 
          onPress={() => onDateChange(moment(date).add(1, 'day').toDate())} 
          style={styles.headerBtn}
        >
          <Ionicons name="chevron-forward" size={18} color="#9aa3b2" />
        </TouchableOpacity>
      </View>

      {Array.from({ length: endHour - startHour + 1 }).map((_, idx) => {
        const hour = startHour + idx;
        const label = moment().hour(hour).minute(0).format('hh:00 a');
        const itemsThisHour = dayTodos.filter(t => new Date(t.dueDate as Date).getHours() === hour);
        
        return (
          <View key={hour} style={styles.hourRow}>
            <Text style={styles.hourLabel}>{label}</Text>
            <View style={styles.hourContent}>
              {itemsThisHour.map(todo => {
                const finishDrag = () => {
                  setScrollEnabled(true);
                  const current = new Date(todo.dueDate as Date);
                  const deltaMinutes = Math.round((dragDy / pixelsPerMinute) / snapMinutes) * snapMinutes;
                  const target = new Date(date);
                  target.setHours(current.getHours(), current.getMinutes(), 0, 0);
                  target.setMinutes(target.getMinutes() + deltaMinutes);
                  
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
                    return Math.max(15, unit === 'hour' ? w * 60 : w);
                  }
                  return Math.max(15, todo.durationMinutes || 60);
                })();
                
                // Calculate position and height
                const startMinutes = moment(todo.dueDate).minutes();
                const topOffset = (startMinutes / 60) * pixelsPerHour;
                const blockHeight = Math.max((computedDuration / 60) * pixelsPerHour, 40); // Minimum height for visibility

                return (
                  <View 
                    key={todo.id} 
                    style={[
                      styles.block, 
                      { 
                        top: topOffset,
                        height: blockHeight,
                        zIndex: isDragging ? 10 : 1
                      }, 
                      isDragging && { transform: [{ translateY: dragDy }] }
                    ]} 
                    {...pan.panHandlers}
                  >
                    <View style={styles.blockHeader}>
                      <Text style={styles.blockTitle} numberOfLines={2}>{todo.text}</Text>
                      <TouchableOpacity 
                        onPress={() => router.push({ pathname: '/todo/task-details', params: { id: todo.id, autostart: '1' } })}
                        style={styles.playButton}
                      >
                        <Ionicons name="play-circle" size={20} color="#67c99a" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.blockTime}>
                      {moment(todo.dueDate).format('h:mm A')} - {moment(todo.dueDate).add(computedDuration, 'minutes').format('h:mm A')}
                    </Text>
                    {!todo.pomodoro?.enabled && (
                      <View style={styles.resizeHandle}>
                        <Ionicons name="reorder-three" size={16} color="#6c93e6" />
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
    backgroundColor: '#1a1a1a',
    marginBottom: 8,
  },
  headerBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
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
    paddingVertical: 0,
    height: 80, // Fixed height for consistent spacing
  },
  hourLabel: {
    width: 80,
    color: '#9aa3b2',
    fontSize: 12,
    textTransform: 'lowercase',
    paddingTop: 8,
  },
  hourContent: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#2a2f38',
    paddingLeft: 12,
    position: 'relative',
    height: 80, // Match hourRow height
  },
  block: {
    position: 'absolute',
    left: 0,
    right: 8,
    backgroundColor: '#2a2f38',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#67c99a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resizeHandle: {
    position: 'absolute',
    bottom: 4,
    right: 8,
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(108, 147, 230, 0.1)',
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  blockTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
    lineHeight: 18,
  },
  blockTime: {
    color: '#9aa3b2',
    fontSize: 12,
    marginBottom: 4,
  },
  playButton: {
    padding: 4,
    backgroundColor: 'rgba(103, 201, 154, 0.1)',
    borderRadius: 12,
  },
});


