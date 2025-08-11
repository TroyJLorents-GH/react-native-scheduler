// import TodoListScreen from '@/components/TodoListScreen';
// import { useLocalSearchParams } from 'expo-router';

// export default function ListItems() {
//   const { listId } = useLocalSearchParams<{ listId: string }>();
//   return <TodoListScreen listId={String(listId)} />;
// }


import { useListContext } from '@/context/ListContext';
import { useTodoContext } from '@/context/TodoContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function ListDetail() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { todos, addTodo, toggleTodo, toggleSubTask, addSubTask } = useTodoContext();
  const { lists } = useListContext();

  const list = lists.find(l => l.id === listId);
  const listTodos = useMemo(() => todos.filter(t => t.listId === listId), [todos, listId]);

  // expand state for subtasks per-item
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // bottom sheet state (quick add)
  const [sheetOpen, setSheetOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [tempSubs, setTempSubs] = useState<string[]>([]);
  const [newSub, setNewSub] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [pickerVisible, setPickerVisible] = useState(false);

  const endOfDay = (d: Date) => { const x = new Date(d); x.setHours(23, 59, 0, 0); return x; };
  const setToday = () => { setDueDate(endOfDay(new Date())); };
  const setTomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); setDueDate(endOfDay(d)); };
  const setWeekend = () => { const d = new Date(); const toSat = (6 - d.getDay() + 7) % 7; d.setDate(d.getDate() + toSat); setDueDate(endOfDay(d)); };

  const saveQuick = () => {
    if (!title.trim()) return;
    addTodo({
      id: Date.now().toString(),
      text: title.trim(),
      listId: String(listId),
      done: false,
      createdAt: new Date(),
      priority,
      subTasks: tempSubs.map((txt, i) => ({
        id: `${Date.now()}_${i}`,
        text: txt,
        done: false,
        createdAt: new Date(),
      })),
      dueDate,
    });
    setTitle(''); setTempSubs([]); setNewSub(''); setPriority('medium'); setDueDate(undefined);
    setSheetOpen(false);
  };

  const addTempSub = () => {
    if (!newSub.trim()) return;
    setTempSubs(prev => [...prev, newSub.trim()]);
    setNewSub('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#f6f8ff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ padding: 16, paddingTop: 20, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.link}>Back</Text></TouchableOpacity>
        <Text style={[s.header, { marginLeft: 10 }]} numberOfLines={1}>{list?.name ?? 'List'}</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => router.push('/todo/new')}>
          <Text style={s.link}>Full form</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={listTodos}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={s.card}>
            {/* left dot indicates priority */}
            <View style={[s.dot, { backgroundColor: item.priority === 'high' ? '#f87171' : item.priority === 'medium' ? '#fde047' : '#60a5fa' }]} />
            <TouchableOpacity onPress={() => toggleTodo(item.id)} style={{ marginRight: 8 }}>
              <Ionicons name={item.done ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={item.done ? '#22c55e' : '#94a3b8'} />
            </TouchableOpacity>

            <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push({ pathname: '/todo/[id]', params: { id: item.id } })}>
              <Text style={[s.title, item.done && s.done]}>{item.text}</Text>
              <View style={{ flexDirection: 'row', marginTop: 4 }}>
                {item.dueDate && <Text style={s.meta}><Ionicons name="calendar-outline" size={14} />{' '}{new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>}
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setExpanded(e => ({ ...e, [item.id]: !e[item.id] }))}>
              <Ionicons name={expanded[item.id] ? 'chevron-up' : 'chevron-down'} size={20} color="#22c55e" />
            </TouchableOpacity>

            {expanded[item.id] && (
              <View style={s.subs}>
                {item.subTasks?.map(st => (
                  <TouchableOpacity key={st.id} style={s.subRow} onPress={() => toggleSubTask(item.id, st.id)}>
                    <Ionicons name={st.done ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={st.done ? '#22c55e' : '#cbd5e1'} style={{ marginRight: 6 }} />
                    <Text style={[s.subText, st.done && { textDecorationLine: 'line-through', color: '#9ca3af' }]}>{st.text}</Text>
                  </TouchableOpacity>
                ))}
                {/* Add subtask inline — same pattern as other tabs */}
                <View style={s.subInputRow}>
                  <TextInput
                    style={s.subInput}
                    placeholder="Add subtask"
                    value={newSub}
                    onChangeText={setNewSub}
                    onSubmitEditing={() => addTempSub()}
                    returnKeyType="done"
                  />
                  <TouchableOpacity onPress={addTempSub}>
                    <Ionicons name="add-circle-outline" size={22} color="#22c55e" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      />

      {/* Quick Add BottomSheet */}
      <TouchableOpacity style={s.fab} onPress={() => setSheetOpen(true)}>
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '800', marginLeft: 8 }}>New Task</Text>
      </TouchableOpacity>

      <Modal transparent animationType="slide" visible={sheetOpen} onRequestClose={() => setSheetOpen(false)}>
        <View style={s.sheetBackdrop}>
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>New Task</Text>

            <TextInput
              style={s.input}
              placeholder="What do you need to remember?"
              value={title}
              onChangeText={setTitle}
              returnKeyType="done"
            />

            {/* Temp subtasks list preview */}
            {!!tempSubs.length && (
              <View style={{ marginBottom: 6 }}>
                {tempSubs.map((txt, i) => (
                  <Text key={`${i}-${txt}`} style={{ color: '#4b5563', marginBottom: 2 }}>• {txt}</Text>
                ))}
              </View>
            )}
            <View style={s.subInputRow}>
              <TextInput
                style={s.subInput}
                placeholder="Add subtask"
                value={newSub}
                onChangeText={setNewSub}
                onSubmitEditing={addTempSub}
              />
              <TouchableOpacity onPress={addTempSub}><Ionicons name="add-circle-outline" size={22} color="#22c55e" /></TouchableOpacity>
            </View>

            {/* Minimal controls: Date & Priority */}
            <View style={s.row}>
              <TouchableOpacity style={s.pill} onPress={() => setPickerVisible(true)}><Text style={s.pillTxt}>{dueDate ? dueDate.toLocaleDateString() : 'Date'}</Text></TouchableOpacity>
              <TouchableOpacity style={[s.pill, priority === 'high' && s.pillActive]} onPress={() => setPriority('high')}><Text style={[s.pillTxt, priority==='high' && s.pillActiveTxt]}>High</Text></TouchableOpacity>
              <TouchableOpacity style={[s.pill, priority === 'medium' && s.pillActive]} onPress={() => setPriority('medium')}><Text style={[s.pillTxt, priority==='medium' && s.pillActiveTxt]}>Medium</Text></TouchableOpacity>
              <TouchableOpacity style={[s.pill, priority === 'low' && s.pillActive]} onPress={() => setPriority('low')}><Text style={[s.pillTxt, priority==='low' && s.pillActiveTxt]}>Low</Text></TouchableOpacity>
            </View>

            {/* Quick date helpers */}
            <View style={[s.row, { marginTop: 8 }]}>
              <TouchableOpacity style={s.helper} onPress={setToday}><Text style={s.helperTxt}>Today</Text></TouchableOpacity>
              <TouchableOpacity style={s.helper} onPress={setTomorrow}><Text style={s.helperTxt}>Tomorrow</Text></TouchableOpacity>
              <TouchableOpacity style={s.helper} onPress={setWeekend}><Text style={s.helperTxt}>Weekend</Text></TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <TouchableOpacity onPress={() => setSheetOpen(false)}><Text style={[s.link, { color: '#6b7280' }]}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={saveQuick}><Text style={s.link}>Add</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={pickerVisible}
        mode="datetime"
        date={dueDate ?? new Date()}
        onConfirm={(d) => { setPickerVisible(false); setDueDate(d); }}
        onCancel={() => setPickerVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: { fontSize: 20, fontWeight: '800', color: '#111827' },
  link: { color: '#2563eb', fontWeight: '700' },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#eef2ff', flexDirection: 'row', alignItems: 'flex-start' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8, marginTop: 7 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  done: { color: '#9ca3af', textDecorationLine: 'line-through' },
  meta: { fontSize: 12, color: '#3b82f6' },

  subs: { width: '100%', marginTop: 8, marginLeft: 18, borderLeftWidth: 2, borderColor: '#e5e7eb', paddingLeft: 10 },
  subRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  subText: { fontSize: 15, color: '#4b5563' },
  subInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  subInput: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 10, paddingVertical: 8, marginRight: 6 },

  fab: { position: 'absolute', right: 16, bottom: 24, backgroundColor: '#22c55e', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'row', alignItems: 'center' },

  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
  sheetHandle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: '#e5e7eb', marginBottom: 8 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 10 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },

  row: { flexDirection: 'row', alignItems: 'center' },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#eef2ff', marginRight: 8 },
  pillTxt: { color: '#304ffe', fontWeight: '700' },
  pillActive: { backgroundColor: '#304ffe' },
  pillActiveTxt: { color: '#fff', fontWeight: '800' },

  helper: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f3f4f6', marginRight: 8 },
  helperTxt: { color: '#374151', fontWeight: '600' },
});
