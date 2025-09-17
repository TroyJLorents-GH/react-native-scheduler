import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import moment from 'moment';
import { useEffect, useMemo, useRef } from 'react';
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { Todo, useTodoContext } from '../context/TodoContext';

type Props = {
  todos: Todo[];
};

function getSectionedTodos(todos: Todo[]) {
  const grouped: { [date: string]: Todo[] } = {};
  const processedIds = new Set<string>();

  todos.forEach(todo => {
    if (!todo.dueDate || processedIds.has(todo.id)) return;
    if (todo.done) return; // Hide completed items from vertical view
    processedIds.add(todo.id);

    const due = moment(todo.dueDate);
    // No rollover: always keep tasks on their original due dates
    const dateKey = due.format('YYYY-MM-DD');
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(todo);
  });

  // Ensure today section exists, even if empty, so we can focus it at top
  const todayKey = moment().format('YYYY-MM-DD');
  if (!grouped[todayKey]) grouped[todayKey] = [];

  return Object.entries(grouped)
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
  | { type: 'item'; todo: Todo };

export default function TodoAgendaScreen({ todos }: Props) {
  const { toggleTodo, updateTodo } = useTodoContext();
  const listRef = useRef<SectionList<any>>(null);
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
      sec.data.forEach(t => rows.push({ type: 'item', todo: t }));
    });
    return rows;
  }, [sections]);

  // Auto-position so today's header is at top on mount/update
  useEffect(() => {
    if (todayIndex >= 0) {
      const id = requestAnimationFrame(() => {
        // Find the index of today's header in flat data
        const idx = flatData.findIndex(r => r.type === 'header' && r.key === todayKey);
        if (idx >= 0) {
          // Using SectionList ref not applicable; we can scroll DraggableFlatList via scrollToIndex after ref capture.
        }
      });
      return () => cancelAnimationFrame(id);
    }
  }, [todayIndex, flatData, todayKey]);

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
    return (
      <TouchableOpacity
        style={[styles.itemCard, isActive && { opacity: 0.9 }]}
        onLongPress={drag}
        activeOpacity={0.85}
        onPress={() => {
          if (todo.listId === 'focus') {
            router.push({ pathname: '/(tabs)/today', params: { focusTaskId: todo.id } });
          } else {
            router.push({ pathname: '/task-details', params: { id: todo.id, from: '/(tabs)/schedule' } });
          }
        }}
      >
        <View style={[styles.colorDot, { backgroundColor: todo.done ? '#67c99a' : '#ffb86b' }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.itemTitle, todo.done && { textDecorationLine: 'line-through', color: '#8e8e93' }]}>
            {todo.text}
          </Text>
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
              router.push({ pathname: '/task-details', params: { id: todo.id, autostart: '1', from: '/(tabs)/schedule' } });
            }
          }} style={{ marginRight: 10 }}>
            <Ionicons name="play-circle" size={22} color="#67c99a" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleTodo(todo.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name={todo.done ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={todo.done ? '#67c99a' : '#bbb'}
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
      data={flatData}
      keyExtractor={(item, index) => item.type === 'header' ? `h-${item.key}` : `i-${item.todo.id}`}
      renderItem={renderRow}
      activationDistance={12}
      onDragEnd={onDragEnd}
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


