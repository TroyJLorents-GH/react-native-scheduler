import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import moment from 'moment';
import { useEffect, useMemo, useRef } from 'react';
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { Todo, useTodoContext } from '../context/TodoContext';
import { shouldTaskAppearOnDate, isTaskCompletedForDate } from '../utils/recurring';

type Props = {
  todos: Todo[];
};

function getSectionedTodos(todos: Todo[]) {
  const grouped: { [date: string]: Todo[] } = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Show 7 days back and 30 days forward
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 7);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 30);
  
  // Generate all dates in range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    grouped[dateKey] = [];
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // For each date, find all tasks that should appear (including recurring)
  Object.keys(grouped).forEach(dateKey => {
    const [year, month, day] = dateKey.split('-').map(Number);
    const checkDate = new Date(year, month - 1, day);
    checkDate.setHours(0, 0, 0, 0);
    
    const isPastDay = checkDate < today;
    
    todos.forEach(todo => {
      // Skip completed items
      if (todo.done) return;
      
      // Check if task should appear on this date (including recurring logic)
      if (shouldTaskAppearOnDate(todo, checkDate)) {
        // Avoid duplicates
        if (!grouped[dateKey].some(t => t.id === todo.id)) {
          grouped[dateKey].push(todo);
        }
      }
    });
  });

  // Remove empty past days (keep today even if empty)
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  return Object.entries(grouped)
    .filter(([date, dayTodos]) => dayTodos.length > 0 || date === todayKey || date >= todayKey)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, dayTodos]) => ({
      key: date,
      title: moment(date).format('ddd D MMM YYYY'),
      day: moment(date),
      data: dayTodos.sort((a, b) => {
        const aTime = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const bTime = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return aTime - bTime;
      }),
    }));
}

type Row = 
  | { type: 'header'; key: string; title: string; dayLabel: { name: string; num: string; month: string } }
  | { type: 'item'; todo: Todo; dateKey: string };

export default function TodoAgendaScreen({ todos }: Props) {
  const { toggleTodo, updateTodo } = useTodoContext();
  const listRef = useRef<SectionList<any>>(null);
  const flatRef = useRef<any>(null);
  const sections = useMemo(() => getSectionedTodos(todos), [todos]);
  const todayKey = moment().format('YYYY-MM-DD');
  const todayIndex = useMemo(() => sections.findIndex(s => s.key === todayKey), [sections, todayKey]);

  // Build flat data for draggable list (headers are non-draggable)
  const flatData: Row[] = useMemo(() => {
    const rows: Row[] = [];
    sections.forEach(sec => {
      rows.push({
        type: 'header',
        key: sec.key,
        title: sec.title,
        dayLabel: { name: sec.day.format('ddd').toUpperCase(), num: sec.day.format('D'), month: sec.day.format('MMM') },
      });
      // Include dateKey to make recurring task keys unique per date
      sec.data.forEach(t => rows.push({ type: 'item', todo: t, dateKey: sec.key }));
    });
    return rows;
  }, [sections]);

  // Calculate index of today's header
  const todayFlatIndex = useMemo(() => flatData.findIndex(r => r.type === 'header' && r.key === todayKey), [flatData, todayKey]);

  // Auto-position so today's header is at top on mount/update
  useEffect(() => {
    if (todayFlatIndex >= 0) {
      const id = requestAnimationFrame(() => {
        try {
          flatRef.current?.scrollToIndex?.({ index: todayFlatIndex, animated: false, viewPosition: 0 });
        } catch {
          setTimeout(() => flatRef.current?.scrollToIndex?.({ index: todayFlatIndex, animated: false, viewPosition: 0 }), 150);
        }
      });
      return () => cancelAnimationFrame(id);
    }
  }, [todayFlatIndex]);

  const renderRow = ({ item, drag, isActive }: RenderItemParams<Row>) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <View style={styles.dateRail}>
            <Text style={styles.dayName}>{item.dayLabel.name}</Text>
            <Text style={styles.dayNum}>{item.dayLabel.num}</Text>
            <Text style={styles.monthYear}>{item.dayLabel.month}</Text>
          </View>
          <Text style={styles.sectionTitle}>{item.title}</Text>
        </View>
      );
    }
    const todo = item.todo;
    const dateKey = item.dateKey;
    
    // For recurring tasks, check completion for this specific date
    const rowDate = new Date(dateKey);
    const isCompletedForThisDate = todo.repeat && todo.repeat !== 'Never' 
      ? isTaskCompletedForDate(todo, rowDate)
      : todo.done;
    
    return (
      <TouchableOpacity
        style={[styles.itemCard, isActive && { opacity: 0.9 }]}
        onLongPress={drag}
        activeOpacity={0.85}
        onPress={() => {
          if (todo.listId === 'focus') {
            router.push({ pathname: '/(tabs)/today', params: { focusTaskId: todo.id } });
          } else {
            router.push({ pathname: '/task-details', params: { id: todo.id, from: '/(tabs)/schedule', forDate: dateKey } });
          }
        }}
      >
        <View style={[styles.colorDot, { backgroundColor: isCompletedForThisDate ? '#67c99a' : '#ffb86b' }]} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.itemTitle, isCompletedForThisDate && { textDecorationLine: 'line-through', color: '#8e8e93' }]}>
              {todo.text}
            </Text>
            {todo.repeat && todo.repeat !== 'Never' && (
              <Ionicons name="repeat" size={14} color="#007AFF" />
            )}
          </View>
          <Text style={styles.itemMeta}>
            {todo.dueDate ? moment(todo.dueDate).format('h:mm A') : ''}
          </Text>
          {todo.notes ? (
            <Text style={styles.itemDesc}>{todo.notes}</Text>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => {
            if (todo.listId === 'focus') {
              router.push({ pathname: '/(tabs)/today', params: { focusTaskId: todo.id } });
            } else {
              router.push({ pathname: '/task-details', params: { id: todo.id, autostart: '1', from: '/(tabs)/schedule', forDate: dateKey } });
            }
          }} style={{ marginRight: 10 }}>
            <Ionicons name="play-circle" size={22} color="#67c99a" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleTodo(todo.id, rowDate)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name={isCompletedForThisDate ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={isCompletedForThisDate ? '#67c99a' : '#bbb'}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Identify which todo moved and set its date based on the nearest header above the drop index
  const onDragEnd = ({ data, from, to }: { data: Row[]; from: number; to: number }) => {
    const moved = data[to];
    if (!moved || moved.type !== 'item') return;
    // Find last header at or before 'to'
    let sectionDateKey: string | null = null;
    for (let i = to; i >= 0; i--) {
      const r = data[i];
      if (r.type === 'header') { sectionDateKey = r.key; break; }
    }
    if (!sectionDateKey) return;
    const targetDate = moment(sectionDateKey, 'YYYY-MM-DD');
    const orig = moment(moved.todo.dueDate);
    if (!orig.isSame(targetDate, 'day')) {
      const updated = targetDate
        .hour(orig.hour())
        .minute(orig.minute())
        .second(0)
        .millisecond(0)
        .toDate();
      updateTodo(moved.todo.id, { dueDate: updated });
    }
  };

  return (
    <DraggableFlatList<Row>
      ref={flatRef}
      data={flatData}
      keyExtractor={(item, index) => item.type === 'header' ? `h-${item.key}` : `i-${item.dateKey}-${item.todo.id}`}
      renderItem={renderRow}
      activationDistance={12}
      onDragEnd={onDragEnd}
      onScrollToIndexFailed={({ index, highestMeasuredFrameIndex }) => {
        if (highestMeasuredFrameIndex >= 0) {
          flatRef.current?.scrollToIndex?.({ index: Math.max(0, highestMeasuredFrameIndex), animated: false });
        } else {
          flatRef.current?.scrollToOffset?.({ offset: 0, animated: false });
        }
        setTimeout(() => flatRef.current?.scrollToIndex?.({ index, animated: false, viewPosition: 0 }), 200);
      }}
      containerStyle={{ paddingBottom: 60 }}
    />
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 2,
    marginLeft: 6,
  },
  dateRail: {
    width: 50,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#de5612',
    borderRadius: 17,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 7,
  },
  dayName: { color: '#fff', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  dayNum: { color: '#fff', fontWeight: 'bold', fontSize: 22 },
  monthYear: { color: '#fff', fontSize: 13, fontWeight: '600', marginTop: -1 },
  sectionTitle: { color: '#aaa1d', fontSize: 15, fontWeight: '600', marginLeft: 6 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 14,
    marginVertical: 8,
    padding: 14,
    borderRadius: 19,
    shadowColor: '#252b34',
    shadowOpacity: 0.09,
    shadowRadius: 7,
    elevation: 3,
  },
  colorDot: {
    width: 8,
    height: 45,
    borderRadius: 5,
    backgroundColor: '#ffb86b',
    marginRight: 11,
  },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  itemMeta: { color: '#3d61b2', fontSize: 14, marginTop: 2 },
  itemDesc: { color: '#888', marginTop: 4, fontSize: 13 },
});


