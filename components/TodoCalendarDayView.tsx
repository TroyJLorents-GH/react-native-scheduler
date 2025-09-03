import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import moment from 'moment';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Todo, useTodoContext } from '../context/TodoContext';

type Props = {
  todos: Todo[];
  date: Date;
  onDateChange: (next: Date) => void;
};

export default function TodoCalendarDayView({ todos, date, onDateChange }: Props) {
  const { updateTodo } = useTodoContext();
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());

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

  const toggleBlockExpansion = (todoId: string) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(todoId)) {
      newExpanded.delete(todoId);
    } else {
      newExpanded.add(todoId);
    }
    setExpandedBlocks(newExpanded);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
                const computedDuration = (() => {
                  if (todo.pomodoro?.enabled) {
                    const w = todo.pomodoro.workTime || 25;
                    const unit = todo.pomodoro.workUnit || 'min';
                    return Math.max(15, unit === 'hour' ? w * 60 : w);
                  }
                  return Math.max(15, todo.durationMinutes || 60);
                })();
                
                const isExpanded = expandedBlocks.has(todo.id);
                
                // Calculate position and height
                const startMinutes = moment(todo.dueDate).minutes();
                const topOffset = (startMinutes / 60) * 80; // 80px per hour
                const baseHeight = Math.max((computedDuration / 60) * 80, 50); // Base height for duration
                const blockHeight = isExpanded ? baseHeight + 40 : baseHeight; // Add space for expanded content

                return (
                  <View 
                    key={todo.id} 
                    style={[
                      styles.block, 
                      { 
                        top: topOffset,
                        height: blockHeight,
                      }
                    ]}
                  >
                    <View style={styles.blockHeader}>
                      <Text style={styles.blockTitle} numberOfLines={isExpanded ? 3 : 1}>
                        {todo.text}
                      </Text>
                      <View style={styles.blockActions}>
                        <TouchableOpacity 
                          onPress={() => toggleBlockExpansion(todo.id)}
                          style={styles.expandButton}
                        >
                          <Ionicons 
                            name={isExpanded ? "chevron-up" : "ellipsis-horizontal"} 
                            size={16} 
                            color="#9aa3b2" 
                          />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => router.push({ pathname: '/todo/task-details', params: { id: todo.id, autostart: '1' } })}
                          style={styles.playButton}
                        >
                          <Ionicons name="play-circle" size={20} color="#67c99a" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <Text style={styles.blockTime}>
                      {moment(todo.dueDate).format('h:mm A')} - {moment(todo.dueDate).add(computedDuration, 'minutes').format('h:mm A')}
                    </Text>
                    
                    {isExpanded && todo.notes && (
                      <Text style={styles.blockNotes} numberOfLines={2}>
                        {todo.notes}
                      </Text>
                    )}
                    
                    {isExpanded && (
                      <View style={styles.expandedActions}>
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => router.push({ pathname: '/todo/task-details', params: { id: todo.id } })}
                        >
                          <Ionicons name="eye" size={16} color="#9aa3b2" />
                          <Text style={styles.actionText}>View Details</Text>
                        </TouchableOpacity>
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
    minHeight: 50, // Ensure minimum height for visibility
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
  blockNotes: {
    color: '#9aa3b2',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  playButton: {
    padding: 4,
    backgroundColor: 'rgba(103, 201, 154, 0.1)',
    borderRadius: 12,
  },
  blockActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButton: {
    padding: 4,
    marginRight: 8,
  },
  expandedActions: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2a2f38',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    color: '#9aa3b2',
    fontSize: 12,
    marginLeft: 5,
  },
});


