// app/(tabs)/todo/index.tsx
import CreateListModal from '@/components/CreateListModal';
import { useListContext } from '@/context/ListContext';
import { useTodoContext } from '@/context/TodoContext';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import moment from 'moment';
import React, { useMemo, useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';

export default function TodoDashboard() {
  const { todos } = useTodoContext();
  const { lists, deleteList } = useListContext();
  
  console.log('=== TODO DASHBOARD RENDERED ===');
  console.log('TodoDashboard - todos:', todos.length, 'lists:', lists.length);

  // --- derived counts for the cards ---
  const counts = useMemo(() => {
    const all = todos.filter(t => !t.done).length; // Only active todos
    const scheduled = todos.filter(t => !!t.dueDate && !t.done).length;
    const completed = todos.filter(t => t.done).length;
    const todaysTasks = todos.filter(t => {
      if (t.done) return false; // Skip completed todos
      if (!t.dueDate) return false; // Skip todos without due dates
      return moment(t.dueDate).isSame(moment(), 'day'); // Check if due today
    }).length;
    const priority = todos.filter(t => t.priority === 'high' && !t.done).length; // Only active high priority
    const listCountsMap: Record<string, number> = {};
    lists.forEach(l => {
      listCountsMap[l.id] = todos.filter(t => t.listId === l.id && !t.done).length;
    });
    return {
      all, scheduled, completed, todaysTasks, priority,
      lists: lists.length,
      perList: listCountsMap,
    };
  }, [todos, lists]);

  const [listModalOpen, setListModalOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>To‑Do</Text>

        {/* Cards grid */}
        <View style={s.grid}>
          <DashCard label="All"        count={counts.all}        href="/todo/all" />
          <DashCard label="Scheduled"  count={counts.scheduled}  href="/todo/scheduled" />
          <DashCard label="Completed"  count={counts.completed}  href="/todo/completed" />
          <DashCard label="Priority"   count={counts.priority}   href="/todo/priority" />
          <DashCard label="Lists"      count={counts.lists}      href="/todo/lists" />
        </View>

        {/* My Lists header */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>My Lists</Text>
        </View>

        {/* Swipeable list rows */}
        <SwipeListView
          data={lists}
          keyExtractor={l => l.id}
          scrollEnabled={false}
          contentContainerStyle={{ rowGap: 10 }}
          renderItem={({ item }) => {
            const activeCount = counts.perList[item.id] ?? 0;
            return (
              <View style={s.rowWrapper}>
                <TouchableOpacity
                  style={s.listRow}
                  activeOpacity={0.9}
                  onPress={() =>
                    router.push({ pathname: '/todo/list-items', params: { listId: item.id } })
                  }
                >
                  <View style={[s.listIconCircle, { backgroundColor: item.color || '#e5e7eb' }]}>
                    {!!item.icon && <Ionicons name={item.icon as any} size={18} color="#fff" />}
                  </View>
                  <Text style={s.listName}>{item.name}</Text>
                  <Text style={s.listCount}>{activeCount}</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          renderHiddenItem={({ item }) => (
            <View style={s.rowBack}>
              {/* Right-side delete */}
              <TouchableOpacity
                style={s.deleteAction}
                onPress={() => deleteList(item.id)}
              >
                <Ionicons name="trash" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          rightOpenValue={-84}
          leftOpenValue={0}
          disableRightSwipe={true}
          disableLeftSwipe={false}
          friction={12}
          tension={80}
          swipeToOpenPercent={20}
          swipeToClosePercent={20}
          previewRowKey={lists[0]?.id}
          previewOpenDelay={Platform.select({ ios: 800, android: 1200 })}
          previewOpenValue={-50}
        />
      </ScrollView>

      {/* Two actions: new reminder + new list */}
      <View style={s.fabRow}>
        <TouchableOpacity
          style={[s.fab, { backgroundColor: '#4f46e5' }]}
          onPress={() => router.push('/todo/new')}
        >
          <Text style={s.fabText}>New Reminder</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.fab, { backgroundColor: '#2563eb' }]}
          onPress={() => setListModalOpen(true)}
        >
          <Text style={s.fabText}>New List</Text>
        </TouchableOpacity>
      </View>

      <CreateListModal
        visible={listModalOpen}
        onClose={() => setListModalOpen(false)}
      />
    </View>
  );
}

function DashCard({
  label,
  count,
  href,
}: {
  label: string;
  count: number;
  href: any;
}) {
  return (
    <Link href={href} asChild>
      <TouchableOpacity style={s.card}>
        <Text style={s.cardTitle}>{label}</Text>
        <Text style={s.cardCount}>{count}</Text>
      </TouchableOpacity>
    </Link>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: '#3f51d1', marginBottom: 12 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#222',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { color: '#374151', fontWeight: '700', marginBottom: 10 },
  cardCount: { color: '#3f51d1', fontSize: 28, fontWeight: '800' },

  sectionHeader: { marginTop: 2, marginBottom: 10, paddingRight: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },

  rowWrapper: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  listIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listName: { fontSize: 18, color: '#111827', flex: 1 },
  listCount: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eef2ff',
    color: '#3f51d1',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '800',
  },

  // Hidden row (right)
  rowBack: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    paddingRight: 6,
    marginTop: 0,
  },
  deleteAction: {
    width: 78,
    height: '90%',
    backgroundColor: '#f87171',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    // subtle shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },

  fabRow: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    gap: 10,
  },
  fab: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 30,
  },
  fabText: { color: 'white', fontWeight: '800' },
});
