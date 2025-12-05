import { useTodoContext } from '@/context/TodoContext';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TodoDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { todos, updateTodo, deleteTodo } = useTodoContext();

  const todo = useMemo(() => todos.find(t => t.id === id), [todos, id]);
  const [text, setText] = useState(todo?.text ?? '');
  const [notes, setNotes] = useState(todo?.notes ?? '');
  const [priority, setPriority] = useState<'high'|'medium'|'low'>(todo?.priority ?? 'medium');
  const [reminderOn, setReminderOn] = useState(!!todo?.dueDate);

  if (!todo) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Not found</Text>
      </View>
    );
  }

  const save = () => {
    updateTodo(todo.id, {
      text: text.trim() || todo.text,
      notes: notes.trim() || undefined,
      priority,
      // if reminder toggled off, clear dueDate
      ...(reminderOn ? {} : { dueDate: undefined }),
    });
    router.back();
  };

  const onDelete = () => {
    Alert.alert('Delete', 'Delete this reminder?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteTodo(todo.id); router.back(); } },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 50 }}>
      <View style={s.top}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.link}>Back</Text></TouchableOpacity>
        <Text style={s.title}>Details</Text>
        <TouchableOpacity onPress={save}><Text style={s.link}>Done</Text></TouchableOpacity>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={s.label}>Title</Text>
        <TextInput style={s.input} value={text} onChangeText={setText} placeholder="Title" />

        <Text style={s.label}>Set Reminder</Text>
        {/* SegmentedControl; fallback to Switch if package is missing */}
        <SegmentedControl
          values={['No', 'Yes']}
          selectedIndex={reminderOn ? 1 : 0}
          onChange={(e: any) => setReminderOn(e.nativeEvent.selectedSegmentIndex === 1)}
          style={{ marginBottom: 12 }}
        />
        {/* Fallback (devs can temporarily comment SegmentedControl above) */}
        {/* <View style={{ flexDirection:'row', alignItems:'center', marginBottom:12 }}>
          <Switch value={reminderOn} onValueChange={setReminderOn} />
          <Text style={{ marginLeft: 8 }}>{reminderOn ? 'Yes' : 'No'}</Text>
        </View> */}

        <Text style={s.label}>Priority</Text>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          {(['high','medium','low'] as const).map(p => (
            <TouchableOpacity key={p} style={[s.pill, priority===p && s.pillActive]} onPress={() => setPriority(p)}>
              <Text style={[s.pillTxt, priority===p && s.pillTxtActive]}>{p.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Notes</Text>
        <TextInput
          style={[s.input, { height: 110, textAlignVertical: 'top' }]}
          multiline
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes (optional)"
        />

        <TouchableOpacity onPress={onDelete} style={{ marginTop: 16 }}>
          <Text style={[s.link, { color: '#ef4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  top: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  link: { color: '#2563eb', fontWeight: '700' },
  label: { fontWeight: '800', color: '#111827', marginTop: 12, marginBottom: 6 },

  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },

  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#eef2ff', marginRight: 8 },
  pillTxt: { color: '#304ffe', fontWeight: '700' },
  pillActive: { backgroundColor: '#304ffe' },
  pillTxtActive: { color: '#fff', fontWeight: '800' },
});
