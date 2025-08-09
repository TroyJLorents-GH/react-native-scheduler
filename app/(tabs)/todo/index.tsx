// app/(tabs)/todo/index.tsx
import CreateListModal from '@/components/CreateListModal';
import { useListContext } from '@/context/ListContext';
import { useTodoContext } from '@/context/TodoContext';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TodoDashboard() {
  const { todos } = useTodoContext();
  const { lists } = useListContext();
  const [listModalOpen, setListModalOpen] = useState(false);

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

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={s.grid}>
          <DashCard label="All" count={counts.all} href="/(tabs)/all" />
          <DashCard label="Scheduled" count={counts.scheduled} href="/(tabs)/scheduled" />
          <DashCard label="Completed" count={counts.completed} href="/(tabs)/completed" />
          <DashCard label="Favorites" count={counts.favorites} href="/(tabs)/favorite" />
          <DashCard label="Priority" count={counts.priority} href="/(tabs)/priority" />
          <DashCard label="Lists" count={counts.lists} href="/(tabs)/todo/lists" />
        </View>

        <Text style={s.sectionTitle}>My Lists</Text>
        <View style={{ gap: 10 }}>
          {lists.map(l => {
            const activeCount = todos.filter(t => t.listId === l.id && !t.done).length;
            return (
              <TouchableOpacity key={l.id} style={s.listRow}
                onPress={() => router.push({ pathname: '/todo/[listId]', params: { listId: l.id } })}
             >
                <View style={[s.listIconCircle, { backgroundColor: l.color || '#e5e7eb' }]}>
                    {!!l.icon && <Ionicons name={l.icon as any} size={16} color="#fff" />}
                </View>
                <Text style={s.listName}>{l.name}</Text>
                <Text style={s.listCount}>{activeCount}</Text>
             </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Two actions: new reminder + new list */}
      <View style={s.fabRow}>
        <TouchableOpacity style={[s.fab, { backgroundColor: '#4f46e5' }]} onPress={() => router.push('/todo/new')}>
          <Text style={s.fabText}>New Reminder</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.fab, { backgroundColor: '#2563eb' }]} onPress={() => setListModalOpen(true)}>
          <Text style={s.fabText}>New List</Text>
        </TouchableOpacity>
      </View>

      <CreateListModal visible={listModalOpen} onClose={() => setListModalOpen(false)} />
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
  fabRow: { position:'absolute', right:16, bottom:24, gap:10 },
  fab: { borderRadius:999, paddingHorizontal:16, paddingVertical:12 },
  fabText: { color:'#fff', fontWeight:'700' },
  listIconCircle:{ width:22, height:22, borderRadius:11, alignItems:'center', justifyContent:'center', marginRight:10 },
});
