// app/(tabs)/todo/index.tsx
import { useListContext } from '@/context/ListContext';
import { useTodoContext } from '@/context/TodoContext';
import { Link, router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TodoDashboard() {
  const { todos } = useTodoContext();
  const { lists } = useListContext();

  const counts = {
    all: todos.length,
    scheduled: todos.filter(t => t.dueDate && t.dueDate > new Date()).length,
    completed: todos.filter(t => t.done).length,
    favorites: todos.filter(t => t.favorite).length,
    priority: todos.filter(t => t.priority === 'high').length,
    lists: lists.length,
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f8ff', padding: 16 }}>
      <Text style={s.title}>To‑Do</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Dashboard cards */}
        <View style={s.grid}>
          <DashCard label="All" count={counts.all} href="/(tabs)/all" />
          <DashCard label="Scheduled" count={counts.scheduled} href="/(tabs)/scheduled" />
          <DashCard label="Completed" count={counts.completed} href="/(tabs)/completed" />
          <DashCard label="Favorites" count={counts.favorites} href="/(tabs)/favorite" />
          <DashCard label="Priority" count={counts.priority} href="/(tabs)/priority" />
          <DashCard label="Lists" count={counts.lists} href="/(tabs)/todo/lists" />
        </View>

        {/* My Lists preview */}
        <Text style={s.sectionTitle}>My Lists</Text>
        <View style={{ gap: 10 }}>
          {lists.map(l => {
            const open = () => router.push({ pathname: '/todo/[listId]', params: { listId: l.id } });
            const activeCount = todos.filter(t => t.listId === l.id && !t.done).length;
            return (
              <TouchableOpacity key={l.id} style={s.listRow} onPress={open}>
                <Text style={s.listName}>{l.name}</Text>
                <Text style={s.listCount}>{activeCount}</Text>
              </TouchableOpacity>
            );
          })}
          {lists.length === 0 && (
            <Text style={{ color: '#6b7280' }}>No lists yet. Tap “New Reminder” or add a list from Lists.</Text>
          )}
        </View>
      </ScrollView>

      {/* Floating create */}
      <TouchableOpacity style={s.fab} onPress={() => router.push('/todo/new')}>
        <Text style={s.fabText}>New Reminder</Text>
      </TouchableOpacity>
    </View>
  );
}

function DashCard({ label, count, href }: { label: string; count: number; href: any }) {
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
  title: { fontSize: 22, fontWeight: '700', color: '#4557d6', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48%', backgroundColor: '#fff', padding: 16, borderRadius: 14, elevation: 2 },
  cardTitle: { fontWeight: '600', color: '#1f2937' },
  cardCount: { marginTop: 8, fontSize: 22, fontWeight: '800', color: '#4557d6' },
  sectionTitle: { marginTop: 18, marginBottom: 8, fontSize: 16, fontWeight: '700', color: '#1f2937' },
  listRow: {
    backgroundColor: '#fff', padding: 14, borderRadius: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  listName: { fontWeight: '600', color: '#111827' },
  listCount: { color: '#6b7280', fontWeight: '700' },
  fab: {
    position: 'absolute', bottom: 24, right: 16, backgroundColor: '#4557d6',
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: 999,
  },
  fabText: { color: '#fff', fontWeight: '700' },
});
