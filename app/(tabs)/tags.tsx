// app/(tabs)/tags.tsx
import { useListContext } from '@/context/ListContext';
import { useTodoContext } from '@/context/TodoContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type MatchMode = 'any' | 'all';

export default function TagsScreen() {
  const { todos, toggleTodo } = useTodoContext();
  const { lists } = useListContext();

  // Build a unique, normalized tag pool from all todos
  const tagPool = useMemo(() => {
    const set = new Set<string>();
    for (const t of todos) {
      (t.tags ?? []).forEach(tag => set.add(tag.trim()));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [todos]);

  const [selected, setSelected] = useState<string[]>([]);
  const [mode, setMode] = useState<MatchMode>('any');

  const toggleTag = (tag: string) => {
    setSelected(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const clearTags = () => setSelected([]);

  const filtered = useMemo(() => {
    if (selected.length === 0) return todos;
    return todos.filter(t => {
      const tags = t.tags ?? [];
      if (mode === 'any') return selected.some(tag => tags.includes(tag));
      // 'all'
      return selected.every(tag => tags.includes(tag));
    });
  }, [todos, selected, mode]);

  const listName = (listId?: string) => lists.find(l => l.id === listId)?.name ?? 'Reminders';

  const renderTodo = ({ item }: any) => (
    <TouchableOpacity style={s.todoRow} onPress={() => toggleTodo(item.id)}>
      <Ionicons
        name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
        size={22}
        color={item.done ? '#10b981' : '#9ca3af'}
        style={{ marginRight: 10 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={[s.todoText, item.done && s.done]} numberOfLines={2}>{item.text}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <Text style={s.listHint}>{listName(item.listId)}</Text>
          {(item.tags ?? []).map((tg: string) => (
            <View key={tg} style={s.tagPillSmall}><Text style={s.tagTxtSmall}>{tg}</Text></View>
          ))}
        </View>
      </View>
      {item.priority === 'high' && <Ionicons name="flag" size={16} color="#f59e0b" style={{ marginLeft: 8 }} />}
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <Text style={s.header}>{selected.length ? `${selected.length} Tag${selected.length>1?'s':''}` : 'Tags'}</Text>

      {/* Tag chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        <TouchableOpacity
          style={[s.tagPill, selected.length === 0 && s.tagActive]}
          onPress={clearTags}
        >
          <Text style={[s.tagTxt, selected.length === 0 && s.tagTxtActive]}>All Tags</Text>
        </TouchableOpacity>

        {tagPool.map(tag => (
          <TouchableOpacity
            key={tag}
            style={[s.tagPill, selected.includes(tag) && s.tagActive]}
            onPress={() => toggleTag(tag)}
          >
            <Text style={[s.tagTxt, selected.includes(tag) && s.tagTxtActive]}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Match mode */}
      <View style={s.modeRow}>
        <Text style={s.modeLabel}>Show reminders that match</Text>
        <View style={s.modeSwitcher}>
          {(['any', 'all'] as const).map(m => (
            <TouchableOpacity
              key={m}
              style={[s.modeBtn, mode === m && s.modeBtnActive]}
              onPress={() => setMode(m)}
            >
              <Text style={[s.modeTxt, mode === m && s.modeTxtActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {selected.length > 0 && (
          <TouchableOpacity onPress={clearTags} style={{ marginLeft: 'auto' }}>
            <Text style={s.clear}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderTodo}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ListEmptyComponent={
          <Text style={{ textAlign:'center', color:'#6b7280', marginTop: 40 }}>
            {tagPool.length === 0 ? 'No tags yet.' : 'No reminders match these tags.'}
          </Text>
        }
      />

      {/* New Reminder FAB */}
      <TouchableOpacity style={s.fab} onPress={() => router.push('/(tabs)/todo/new')}>
        <Ionicons name="add" size={26} color="#fff" />
        <Text style={s.fabTxt}>New Reminder</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#f7f8ff' },
  header:{ fontSize:24, fontWeight:'800', color:'#3b5bdb', marginTop: 12, marginBottom: 6, paddingHorizontal:16 },

  tagPill:{ paddingHorizontal:12, paddingVertical:8, borderRadius:999, borderWidth:1, borderColor:'#e5e7eb', backgroundColor:'#fff', marginRight:8 },
  tagTxt:{ fontWeight:'700', color:'#111827' },
  tagActive:{ backgroundColor:'#111827', borderColor:'#111827' },
  tagTxtActive:{ color:'#fff' },

  modeRow:{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, gap:10, marginTop:10, marginBottom:4 },
  modeLabel:{ color:'#6b7280' },
  modeSwitcher:{ flexDirection:'row', borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, overflow:'hidden' },
  modeBtn:{ paddingHorizontal:10, paddingVertical:6, backgroundColor:'#fff' },
  modeBtnActive:{ backgroundColor:'#111827' },
  modeTxt:{ color:'#111827', fontWeight:'600' },
  modeTxtActive:{ color:'#fff' },
  clear:{ color:'#2563eb', fontWeight:'700' },

  todoRow:{ backgroundColor:'#fff', borderRadius:14, padding:12, flexDirection:'row', alignItems:'center', marginBottom:10, borderWidth:1, borderColor:'#eef2ff' },
  todoText:{ fontSize:16, color:'#111827' },
  done:{ color:'#9ca3af', textDecorationLine:'line-through' },
  listHint:{ color:'#6b7280' },

  tagPillSmall:{ backgroundColor:'#eef2ff', borderRadius:999, paddingHorizontal:8, paddingVertical:3 },
  tagTxtSmall:{ fontSize:12, color:'#3b5bdb', fontWeight:'700' },

  fab:{ position:'absolute', right:20, bottom:26, backgroundColor:'#4f46e5', borderRadius:999, paddingHorizontal:16, paddingVertical:12, flexDirection:'row', alignItems:'center', gap:8, shadowColor:'#000', shadowOpacity:0.2, shadowRadius:8, elevation:4 },
  fabTxt:{ color:'#fff', fontWeight:'700' },
});
