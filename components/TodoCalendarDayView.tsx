import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import moment from 'moment';
import { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Todo, useTodoContext } from '../context/TodoContext';

type Props = {
  todos: Todo[];
  date: Date;
  onDateChange: (next: Date) => void;
};

export default function TodoCalendarDayView({ todos, date, onDateChange }: Props) {
  const { updateTodo } = useTodoContext();
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const dragYRefs = useRef<Record<string, Animated.Value>>(Object.create(null));
  const [isDragging, setIsDragging] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const selectedDayKey = moment(date).format('YYYY-MM-DD');

  const dayTodos = useMemo(() => {
    const selected = moment(date);
    const isToday = selected.isSame(moment(), 'day');
    const filtered = [...todos]
      .filter(t => {
        if (!t.dueDate) return false;
        const due = moment(t.dueDate);
        if (due.isSame(selected, 'day')) return true;
        // Roll over: when viewing today, include all incomplete tasks from past days
        if (isToday && !t.done && due.isBefore(selected, 'day')) return true;
        return false;
      })
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    return filtered;
  }, [todos, selectedDayKey, date]);

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

  // Swipe left/right anywhere in the view to change the date
  const containerPan = useMemo(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gs) => !isDragging && Math.abs(gs.dx) > 25 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
      onPanResponderRelease: (_evt, gs) => {
        if (gs.dx > 40) {
          onDateChange(moment(date).subtract(1, 'day').toDate());
        } else if (gs.dx < -40) {
          onDateChange(moment(date).add(1, 'day').toDate());
        }
      },
    })
  , [date, isDragging, onDateChange]);

  return (
    <View style={{ flex: 1 }} {...containerPan.panHandlers}>
      <ScrollView contentContainerStyle={styles.container} scrollEnabled={!isDragging}>
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
                  const baseHeight = Math.max((computedDuration / 60) * 80, 60); // Increased minimum height
                  const blockHeight = isExpanded ? baseHeight + 50 : baseHeight; // Add more space for expanded content

                  // Helper for animated drag value per block
                  const getDragY = (id: string) => {
                    if (!dragYRefs.current[id]) {
                      dragYRefs.current[id] = new Animated.Value(0);
                    }
                    return dragYRefs.current[id];
                  };

                  // Drag-to-reschedule by hour (snap)
                  const blockPan = PanResponder.create({
                    onStartShouldSetPanResponder: () => false,
                    onMoveShouldSetPanResponder: (_evt, gs) => Math.abs(gs.dy) > 8 && Math.abs(gs.dy) > Math.abs(gs.dx),
                    onPanResponderGrant: () => {
                      setIsDragging(true);
                      setDraggingId(todo.id);
                    },
                    onPanResponderMove: Animated.event([null, { dy: getDragY(todo.id) }], { useNativeDriver: false }),
                    onPanResponderTerminationRequest: () => false,
                    onPanResponderRelease: (_evt, gs) => {
                      const dy = gs.dy || 0;
                      // Snap by 15-minute increments (80px per hour => 20px per 15min)
                      const quarterHeightPx = 80 / 4; // 20
                      const quarters = Math.round(dy / quarterHeightPx);
                      const deltaMinutes = quarters * 15;
                      Animated.timing(getDragY(todo.id), { toValue: 0, duration: 120, useNativeDriver: false }).start();
                      setIsDragging(false);
                      if (deltaMinutes !== 0) {
                        const original = moment(todo.dueDate);
                        const base = moment(date)
                          .hour(original.hour())
                          .minute(original.minute())
                          .second(0)
                          .millisecond(0)
                          .add(deltaMinutes, 'minutes');
                        // Constrain between 06:00 and 22:00
                        const earliest = moment(date).hour(6).minute(0).second(0).millisecond(0);
                        const latest = moment(date).hour(22).minute(0).second(0).millisecond(0);
                        const clamped = base.isBefore(earliest) ? earliest : base.isAfter(latest) ? latest : base;
                        updateTodo(todo.id, { dueDate: clamped.toDate() });
                      }
                      setDraggingId(null);
                    },
                    onPanResponderTerminate: () => {
                      Animated.timing(getDragY(todo.id), { toValue: 0, duration: 120, useNativeDriver: false }).start();
                      setIsDragging(false);
                      setDraggingId(null);
                    }
                  });

                  return (
                    <Animated.View 
                      key={todo.id} 
                      style={[
                        styles.block, 
                        { 
                          top: topOffset,
                          height: blockHeight,
                        },
                        { transform: [{ translateY: getDragY(todo.id) }] },
                        { zIndex: draggingId === todo.id ? 10 : 2 }
                      ]}
                      {...blockPan.panHandlers}
                    >
                      <View style={styles.blockHeader}>
                        <Text style={styles.blockTitle} numberOfLines={2}>
                          {todo.text}
                        </Text>
                        <View style={styles.blockActions}>
                          <TouchableOpacity 
                            onPress={() => router.push({ pathname: '/task-details', params: { id: todo.id, from: '/(tabs)/schedule' } })}
                            style={styles.expandButton}
                          >
                            <Ionicons 
                              name={"ellipsis-horizontal"}
                              size={26} 
                              color="#9aa3b2" 
                            />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => {
                              if (todo.listId === 'focus') {
                                router.push({ pathname: '/(tabs)/today', params: { focusTaskId: todo.id } });
                              } else {
                                router.push({ pathname: '/task-details', params: { id: todo.id, autostart: '1', from: '/(tabs)/schedule' } });
                              }
                            }}
                            style={styles.playButton}
                          >
                            <Ionicons name="play-circle" size={26} color="#67c99a" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.blockTime}>
                        {moment(todo.dueDate).format('h:mm A')} - {moment(todo.dueDate).add(computedDuration, 'minutes').format('h:mm A')}
                      </Text>
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
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
    overflow: 'hidden', // keep contents inside the card
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  blockTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
    marginRight: 12,
    lineHeight: 18,
  },
  blockTime: {
    color: '#9aa3b2',
    fontSize: 12,
    marginBottom: 0,
    marginTop: 0,
  },
  blockNotes: {
    color: '#9aa3b2',
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  playButton: {
    padding: 4,
    backgroundColor: 'rgba(103, 201, 154, 0.1)',
    borderRadius: 12,
  },
  blockActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
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


