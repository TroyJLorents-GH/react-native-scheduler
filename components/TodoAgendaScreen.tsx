import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import moment from 'moment';
import React from 'react';
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Todo, useTodoContext } from '../context/TodoContext';

type Props = {
  todos: Todo[];
};

function getSectionedTodos(todos: Todo[]) {
  const grouped: { [date: string]: Todo[] } = {};
  const today = moment().startOf('day');
  const processedIds = new Set<string>(); // Track processed todos to avoid duplicates
  
  todos.forEach(todo => {
    if (!todo.dueDate || processedIds.has(todo.id)) return;
    processedIds.add(todo.id);
    
    const due = moment(todo.dueDate);
    // Rollover rule: past due incomplete -> show under today; past due completed -> hide
    if (due.isBefore(today)) {
      if (todo.done) return; // hide completed past tasks from schedule view
    }
    const displayDate = due.isBefore(today) ? today : due;
    const dateKey = displayDate.format('YYYY-MM-DD');
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(todo);
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, dayTodos]) => ({
      key: date, // stable section key
      title: moment(date).format('ddd D MMM YYYY'),
      day: moment(date),
      data: dayTodos.sort((a, b) => {
        const aTime = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const bTime = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return aTime - bTime;
      }),
    }));
}

export default function TodoAgendaScreen({ todos }: Props) {
  const { toggleTodo } = useTodoContext();
  const sections = getSectionedTodos(todos);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => {
        const ts = item.dueDate ? new Date(item.dueDate).getTime() : 0;
        return `${item.id}-${ts}`;
      }}
      renderSectionHeader={({ section: { title, day } }) => (
        <View style={styles.sectionHeader}>
          <View style={styles.dateRail}>
            <Text style={styles.dayName}>{day.format('ddd').toUpperCase()}</Text>
            <Text style={styles.dayNum}>{day.format('D')}</Text>
            <Text style={styles.monthYear}>{day.format('MMM')}</Text>
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.itemCard}
          onPress={() => {
            if (item.listId === 'focus') {
              router.push({ pathname: '/(tabs)/today', params: { focusTaskId: item.id } });
            } else {
              router.push({ pathname: '/todo/task-details', params: { id: item.id } });
            }
          }}
        >
          <View style={[styles.colorDot, { backgroundColor: item.done ? '#67c99a' : '#ffb86b' }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.itemTitle, item.done && { textDecorationLine: 'line-through', color: '#8e8e93' }]}>
              {item.text}
            </Text>
            <Text style={styles.itemMeta}>
              {item.dueDate ? moment(item.dueDate).format('h:mm A') : ''}
            </Text>
            {item.notes ? (
              <Text style={styles.itemDesc}>{item.notes}</Text>
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => {
              if (item.listId === 'focus') {
                router.push({ pathname: '/(tabs)/today', params: { focusTaskId: item.id } });
              } else {
                router.push({ pathname: '/todo/task-details', params: { id: item.id, autostart: '1' } });
              }
            }} style={{ marginRight: 10 }}>
              <Ionicons name="play-circle" size={22} color="#67c99a" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleTodo(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons
                name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={item.done ? '#67c99a' : '#bbb'}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={{ paddingBottom: 60 }}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', marginTop: 60 }}>
          <Text style={{ color: '#bbb', fontSize: 19 }}>No tasks with due dates</Text>
        </View>
      }
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
    backgroundColor: '#14151a',
    borderRadius: 17,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 7,
  },
  dayName: { color: '#ffc863', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  dayNum: { color: '#fff', fontWeight: 'bold', fontSize: 22 },
  monthYear: { color: '#ffb86b', fontSize: 13, fontWeight: '600', marginTop: -1 },
  sectionTitle: { color: '#aaa', fontSize: 15, fontWeight: '600', marginLeft: 6 },
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


