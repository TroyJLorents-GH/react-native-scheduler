// app/(tabs)/todo/new.tsx
import { useListContext } from '@/context/ListContext'; // your existing lists source
import { useTodoContext } from '@/context/TodoContext';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function NewReminder() {
  const { addTodo } = useTodoContext();
  const { lists } = useListContext();

  const defaultListId = useMemo(() => (lists[0]?.id ?? 'inbox'), [lists]);

  const [text, setText] = useState('');
  const [listId, setListId] = useState(defaultListId);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [favorite, setFavorite] = useState(false);
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const [pickerVisible, setPickerVisible] = useState(false);

  const save = () => {
    if (!text.trim()) return;
    const id = Date.now().toString();
    addTodo({
      id,
      text: text.trim(),
      listId,
      done: false,
      createdAt: new Date(),
      priority,
      favorite,
      category: category.trim() ? category.trim() : undefined,
      notes: notes.trim() ? notes.trim() : undefined,
      dueDate,
    });
    // go to that list so user sees their new reminder
    router.replace({ pathname: '/todo/[listId]', params: { listId } });
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.link}>Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>New Reminder</Text>
        <TouchableOpacity onPress={save}>
          <Text style={s.link}>Add</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.label}>Title</Text>
      <TextInput
        style={s.input}
        placeholder="What do you need to remember?"
        value={text}
        onChangeText={setText}
        returnKeyType="done"
      />

      <Text style={s.label}>List</Text>
      <View style={s.pillRow}>
        {lists.map(l => (
          <TouchableOpacity
            key={l.id}
            style={[s.pill, listId === l.id && s.pillActive]}
            onPress={() => setListId(l.id)}
          >
            <Text style={[s.pillText, listId === l.id && s.pillTextActive]}>{l.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.label}>Priority</Text>
      <View style={s.pillRow}>
        {(['high', 'medium', 'low'] as const).map(p => (
          <TouchableOpacity
            key={p}
            style={[s.pill, priority === p && s.pillActive]}
            onPress={() => setPriority(p)}
          >
            <Text style={[s.pillText, priority === p && s.pillTextActive]}>{p.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.label}>Favorite</Text>
      <TouchableOpacity style={s.row} onPress={() => setFavorite(v => !v)}>
        <Text style={{ fontWeight: '600' }}>{favorite ? '⭐ Favorited' : '☆ Not favorited'}</Text>
      </TouchableOpacity>

      <Text style={s.label}>Date & Time</Text>
      <View style={s.row}>
        <TouchableOpacity style={s.btn} onPress={() => setPickerVisible(true)}>
          <Text style={s.btnText}>{dueDate ? dueDate.toLocaleString() : 'Set date'}</Text>
        </TouchableOpacity>
        {dueDate && (
          <TouchableOpacity style={[s.btn, { marginLeft: 8, backgroundColor: '#fee2e2' }]} onPress={() => setDueDate(undefined)}>
            <Text style={[s.btnText, { color: '#b91c1c' }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={s.label}>Category</Text>
      <TextInput
        style={s.input}
        placeholder="Category (optional)"
        value={category}
        onChangeText={setCategory}
      />

      <Text style={s.label}>Notes</Text>
      <TextInput
        style={[s.input, { height: 100, textAlignVertical: 'top' }]}
        placeholder="Notes (optional)"
        multiline
        value={notes}
        onChangeText={setNotes}
      />

      <DateTimePickerModal
        isVisible={pickerVisible}
        mode="datetime"
        date={dueDate ?? new Date()}
        onConfirm={(d) => { setDueDate(d); setPickerVisible(false); }}
        onCancel={() => setPickerVisible(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  link: { color: '#418cff', fontWeight: '600' },
  title: { fontWeight: '700', fontSize: 16 },
  label: { marginTop: 14, marginBottom: 6, fontWeight: '700', color: '#111827' },
  input: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    backgroundColor: '#fff',
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#eef2ff' },
  pillActive: { backgroundColor: '#4f46e5' },
  pillText: { color: '#4338ca', fontWeight: '600' },
  pillTextActive: { color: 'white' },
  row: { flexDirection: 'row', alignItems: 'center' },
  btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#eef2ff' },
  btnText: { color: '#4338ca', fontWeight: '600' },
});
