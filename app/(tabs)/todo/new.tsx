// // app/(tabs)/todo/new.tsx
// import { useListContext } from '@/context/ListContext';
// import { useTodoContext } from '@/context/TodoContext';
// import { router } from 'expo-router';
// import React, { useMemo, useState } from 'react';
// import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';

// export default function NewReminder() {
//   const { addTodo } = useTodoContext();
//   const { lists } = useListContext();

//   const defaultListId = useMemo(() => (lists[0]?.id ?? 'inbox'), [lists]);

//   const [text, setText] = useState('');
//   const [listId, setListId] = useState(defaultListId);
//   const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
//   const [favorite, setFavorite] = useState(false);
//   const [category, setCategory] = useState('');
//   const [notes, setNotes] = useState('');
//   const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

//   const [pickerVisible, setPickerVisible] = useState(false);
//   const [quickDateOpen, setQuickDateOpen] = useState(false);

//   const save = () => {
//     if (!text.trim()) return;
//     addTodo({
//       id: Date.now().toString(),
//       text: text.trim(),
//       listId,
//       done: false,
//       createdAt: new Date(),
//       priority,
//       favorite,
//       category: category.trim() ? category.trim() : undefined,
//       notes: notes.trim() ? notes.trim() : undefined,
//       dueDate,
//     });
//     router.replace({ pathname: '/todo/[listId]', params: { listId } });
//   };

//   // quick date helpers
//   const setToday = () => { setDueDate(endOfDay(new Date())); setQuickDateOpen(false); };
//   const setTomorrow = () => { const d=new Date(); d.setDate(d.getDate()+1); setDueDate(endOfDay(d)); setQuickDateOpen(false); };
//   const setWeekend = () => { const d=new Date(); const day=d.getDay(); const toSat=(6 - day + 7)%7; d.setDate(d.getDate()+toSat); setDueDate(endOfDay(d)); setQuickDateOpen(false); };
//   const setNextWeek = () => { const d=new Date(); d.setDate(d.getDate() + (7 - d.getDay() + 1)); setDueDate(endOfDay(d)); setQuickDateOpen(false); };
//   function endOfDay(d: Date){ const x=new Date(d); x.setHours(23,59,0,0); return x; }

//   return (
//     <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//       <View style={{ flex: 1, padding: 50 }}>
//         <View style={s.topBar}>
//           <TouchableOpacity onPress={() => router.back()}><Text style={s.link}>Back</Text></TouchableOpacity>
//           <Text style={s.title}>New Task</Text>
//           <TouchableOpacity onPress={save}><Text style={s.link}>Add</Text></TouchableOpacity>
//         </View>

//         <Text style={s.label}>New Task</Text>
//         <TextInput
//           style={s.input}
//           placeholder="Description"
//           value={text}
//           onChangeText={setText}
//           returnKeyType="done"
//         />

//         <Text style={s.label}>List</Text>
//         <View style={s.pillRow}>
//           {lists.map(l => (
//             <TouchableOpacity key={l.id} style={[s.pill, listId===l.id && s.pillActive]} onPress={() => setListId(l.id)}>
//               <Text style={[s.pillText, listId===l.id && s.pillTextActive]}>{l.name}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <Text style={s.label}>Priority</Text>
//         <View style={s.pillRow}>
//           {(['high','medium','low'] as const).map(p=>(
//             <TouchableOpacity key={p} style={[s.pill, priority===p && s.pillActive]} onPress={()=>setPriority(p)}>
//               <Text style={[s.pillText, priority===p && s.pillTextActive]}>{p.toUpperCase()}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <Text style={s.label}>Favorite</Text>
//         <TouchableOpacity style={s.row} onPress={() => setFavorite(v=>!v)}>
//           <Text style={{ fontWeight: '600' }}>{favorite ? '⭐ Favorited' : '☆ Not favorited'}</Text>
//         </TouchableOpacity>

//         <Text style={s.label}>Date & Time</Text>
//         <View style={s.row}>
//           <TouchableOpacity style={s.btn} onPress={() => setQuickDateOpen(true)}>
//             <Text style={s.btnText}>{dueDate ? dueDate.toLocaleString() : 'Pick date'}</Text>
//           </TouchableOpacity>
//           {dueDate && (
//             <TouchableOpacity style={[s.btn, { marginLeft: 8, backgroundColor: '#fee2e2' }]} onPress={() => setDueDate(undefined)}>
//               <Text style={[s.btnText, { color: '#b91c1c' }]}>Clear</Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         <Text style={s.label}>Category</Text>
//         <TextInput style={s.input} placeholder="Category (optional)" value={category} onChangeText={setCategory} />

//         <Text style={s.label}>Notes</Text>
//         <TextInput style={[s.input, { height: 100, textAlignVertical: 'top' }]} placeholder="Notes (optional)" multiline value={notes} onChangeText={setNotes} />
//       </View>

//       {/* Keyboard accessory */}
//       <View style={s.accessory}>
//         <AccessoryButton label="Date" onPress={() => setQuickDateOpen(true)} />
//         <AccessoryButton label="Priority" onPress={() => { /* already above; keep for parity */ }} />
//         <AccessoryButton label="Labels" onPress={() => { /* could open tags in future */ }} />
//         <AccessoryButton label="Location" onPress={() => { /* TBD */ }} />
//         <AccessoryButton label="Photo" onPress={() => { /* TBD */ }} />
//         <AccessoryButton label="Lists" onPress={() => { /* list chips already above */ }} />
//       </View>

//       {/* Quick date sheet */}
//       <Modal transparent animationType="slide" visible={quickDateOpen} onRequestClose={()=>setQuickDateOpen(false)}>
//         <View style={s.sheetBackdrop}>
//           <View style={s.sheet}>
//             <Text style={s.sheetTitle}>Schedule</Text>
//             <TouchableOpacity style={s.sheetItem} onPress={setToday}><Text>Today</Text></TouchableOpacity>
//             <TouchableOpacity style={s.sheetItem} onPress={setTomorrow}><Text>Tomorrow</Text></TouchableOpacity>
//             <TouchableOpacity style={s.sheetItem} onPress={setWeekend}><Text>This Weekend</Text></TouchableOpacity>
//             <TouchableOpacity style={s.sheetItem} onPress={setNextWeek}><Text>Next Week</Text></TouchableOpacity>
//             <TouchableOpacity style={[s.sheetItem, {justifyContent:'space-between'}]} onPress={()=>{ setQuickDateOpen(false); setPickerVisible(true); }}>
//               <Text>Custom…</Text><Text style={{color:'#6b7280'}}>{dueDate ? dueDate.toLocaleString() : ''}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={[s.sheetItem,{justifyContent:'center'}]} onPress={()=>setQuickDateOpen(false)}>
//               <Text style={{color:'#2563eb',fontWeight:'700'}}>Done</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Native picker for Custom */}
//       <DateTimePickerModal
//         isVisible={pickerVisible}
//         mode="datetime"
//         date={dueDate ?? new Date()}
//         onConfirm={(d)=>{ setPickerVisible(false); setDueDate(d); }}
//         onCancel={()=>setPickerVisible(false)}
//       />
//     </KeyboardAvoidingView>
//   );
// }

// function AccessoryButton({ label, onPress }: { label: string; onPress: () => void }) {
//   return (
//     <TouchableOpacity style={s.accBtn} onPress={onPress}>
//       <Text style={s.accTxt}>{label}</Text>
//     </TouchableOpacity>
//   );
// }

// const s = StyleSheet.create({
//   topBar:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
//   link:{ color:'#418cff', fontWeight:'600' },
//   title:{ fontWeight:'700', fontSize:16 },
//   label:{ marginTop:14, marginBottom:6, fontWeight:'700', color:'#111827' },
//   input:{ borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, paddingHorizontal:12, paddingVertical: Platform.OS==='ios'?12:8, backgroundColor:'#fff' },
//   pillRow:{ flexDirection:'row', flexWrap:'wrap', gap:8 },
//   pill:{ paddingVertical:6, paddingHorizontal:10, borderRadius:999, backgroundColor:'#eef2ff' },
//   pillActive:{ backgroundColor:'#4f46e5' },
//   pillText:{ color:'#4338ca', fontWeight:'600' },
//   pillTextActive:{ color:'#fff' },
//   row:{ flexDirection:'row', alignItems:'center' },
//   btn:{ paddingVertical:8, paddingHorizontal:12, borderRadius:8, backgroundColor:'#eef2ff' },
//   btnText:{ color:'#4338ca', fontWeight:'600' },

//   // accessory row
//   accessory:{ position:'absolute', left:0, right:0, bottom:0, flexDirection:'row', flexWrap:'wrap',
//     padding:8, backgroundColor:'#f3f4f6', borderTopWidth:1, borderColor:'#e5e7eb', gap:8 },
//   accBtn:{ backgroundColor:'#fff', paddingHorizontal:10, paddingVertical:6, borderRadius:10, borderWidth:1, borderColor:'#e5e7eb' },
//   accTxt:{ fontWeight:'600', color:'#111827' },

//   // quick date sheet
//   sheetBackdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.25)', justifyContent:'flex-end' },
//   sheet:{ backgroundColor:'#fff', padding:16, borderTopLeftRadius:16, borderTopRightRadius:16 },
//   sheetTitle:{ fontWeight:'700', fontSize:16, textAlign:'center', marginBottom:8 },
//   sheetItem:{ paddingVertical:12, borderBottomWidth:1, borderColor:'#f3f4f6' },
// });



// app/(tabs)/todo/new.tsx
import ListPickerModal from '@/components/ListPickerModal';
import PrioritySheet from '@/components/PrioritySheet';
import TagPickerModal from '@/components/TagPickerModal';
import { useListContext } from '@/context/ListContext';
import { useTodoContext } from '@/context/TodoContext';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

type Priority = 'high'|'medium'|'low';

export default function NewReminder() {
  const { addTodo } = useTodoContext();
  const { lists } = useListContext();

  const defaultListId = useMemo(() => (lists[0]?.id ?? 'inbox'), [lists]);

  const [text, setText] = useState('');
  const [listId, setListId] = useState(defaultListId);
  const [priority, setPriority] = useState<Priority>('medium');
  const [favorite, setFavorite] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  // // subtasks for new item
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [subInput, setSubInput] = useState('');

  

  const [pickerVisible, setPickerVisible] = useState(false);
  const [quickDateOpen, setQuickDateOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [listPickerOpen, setListPickerOpen] = useState(false);

  // const addSub = () => {
  //   const t = subInput.trim();
  //   if (!t) return;
  //   setSubtasks(prev => [...prev, { id: Date.now().toString(), text: t, done: false }]);
  //   setSubInput('');
  // };

  
   const addSub = () => {
    const t = subInput.trim();
    if (!t) return;
    setSubtasks(prev => [
      ...prev,
      { id: Date.now().toString(), text: t, done: false, createdAt: new Date() } // ← add createdAt
    ]);
   setSubInput('');
  }; 

  const save = () => {
  if (!text.trim()) return;
  addTodo({
    id: Date.now().toString(),
    text: text.trim(),
    listId,
    done: false,
    createdAt: new Date(),
    priority,
    favorite,
    category: category.trim() ? category.trim() : undefined,
    notes: notes.trim() ? notes.trim() : undefined,
    dueDate,
    // subTasks: [],   // <- omit or keep [] if your type requires it
  });
  router.replace({ pathname: '/todo/[listId]', params: { listId } });
 };

  // const save = () => {
  //   if (!text.trim()) return;
  //   addTodo({
  //     id: Date.now().toString(),
  //     text: text.trim(),
  //     listId,
  //     done: false,
  //     createdAt: new Date(),
  //     priority,
  //     favorite,
  //     notes: notes.trim() ? notes.trim() : undefined,
  //     dueDate,
  //     tags: tags.length ? tags : undefined,
  //     subTasks: subtasks.length ? subtasks : undefined,
  //   });
  //   router.replace({ pathname: '/todo/[listId]', params: { listId } });
  // };

  // quick date helpers
  const setToday = () => { setDueDate(endOfDay(new Date())); setQuickDateOpen(false); };
  const setTomorrow = () => { const d=new Date(); d.setDate(d.getDate()+1); setDueDate(endOfDay(d)); setQuickDateOpen(false); };
  const setWeekend = () => { const d=new Date(); const day=d.getDay(); const toSat=(6 - day + 7)%7; d.setDate(d.getDate()+toSat); setDueDate(endOfDay(d)); setQuickDateOpen(false); };
  const setNextWeek = () => { const d=new Date(); d.setDate(d.getDate() + (7 - d.getDay() + 1)); setDueDate(endOfDay(d)); setQuickDateOpen(false); };
  function endOfDay(d: Date){ const x=new Date(d); x.setHours(23,59,0,0); return x; }

  // tag suggestions sourced from your existing todos (optional): pass via context if you have it
  const tagSuggestions: string[] = []; // fill later if you expose tags pool

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, padding: 50 }}>
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => router.back()}><Text style={s.link}>Back</Text></TouchableOpacity>
          <Text style={s.title}>New Task</Text>
          <TouchableOpacity onPress={save}><Text style={s.link}>Add</Text></TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={s.label}>New Task</Text>
        <TextInput
          style={s.input}
          placeholder="Description"
          value={text}
          onChangeText={setText}
          returnKeyType="done"
        />

        {/* Subtasks */}
        <Text style={s.label}>Subtasks</Text>
        <View style={s.subRow}>
          <TextInput
            style={[s.input, { flex: 1, marginRight: 8 }]}
            placeholder="Add subtask"
            value={subInput}
            onChangeText={setSubInput}
            onSubmitEditing={addSub}
            returnKeyType="done"
          />
          <TouchableOpacity style={s.smallBtn} onPress={addSub}><Text style={s.smallBtnTxt}>Add</Text></TouchableOpacity>
        </View>
        <FlatList
          data={subtasks}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <View style={s.subItem}>
              <Text style={s.subText}>{'○'} {item.text}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color:'#6b7280' }}>No subtasks yet.</Text>}
        />
      </View>

      {/* Keyboard accessory */}
      <View style={s.accessory}>
        <AccessoryButton label={dueDate ? dueDate.toLocaleDateString() : 'Date'} onPress={() => setQuickDateOpen(true)} />
        <AccessoryButton label={`Priority`} onPress={() => setPriorityOpen(true)} />
        <AccessoryButton label={tags.length ? `${tags.length} Tag${tags.length>1?'s':''}` : 'Tags'} onPress={() => setTagsOpen(true)} />
        <AccessoryButton label="Location" onPress={() => { /* later */ }} />
        <AccessoryButton label="Photo" onPress={() => { /* later */ }} />
        <AccessoryButton label="Lists" onPress={() => setListPickerOpen(true)} />
      </View>

      {/* Quick date sheet */}
      <Modal transparent animationType="slide" visible={quickDateOpen} onRequestClose={()=>setQuickDateOpen(false)}>
        <View style={s.sheetBackdrop}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Schedule</Text>
            <TouchableOpacity style={s.sheetItem} onPress={setToday}><Text>Today</Text></TouchableOpacity>
            <TouchableOpacity style={s.sheetItem} onPress={setTomorrow}><Text>Tomorrow</Text></TouchableOpacity>
            <TouchableOpacity style={s.sheetItem} onPress={setWeekend}><Text>This Weekend</Text></TouchableOpacity>
            <TouchableOpacity style={s.sheetItem} onPress={setNextWeek}><Text>Next Week</Text></TouchableOpacity>
            <TouchableOpacity style={[s.sheetItem, {justifyContent:'space-between'}]} onPress={()=>{ setQuickDateOpen(false); setPickerVisible(true); }}>
              <Text>Custom…</Text><Text style={{color:'#6b7280'}}>{dueDate ? dueDate.toLocaleString() : ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.sheetItem,{justifyContent:'center'}]} onPress={()=>setQuickDateOpen(false)}>
              <Text style={{color:'#2563eb',fontWeight:'700'}}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Native picker for Custom */}
      <DateTimePickerModal
        isVisible={pickerVisible}
        mode="datetime"
        date={dueDate ?? new Date()}
        onConfirm={(d)=>{ setPickerVisible(false); setDueDate(d); }}
        onCancel={()=>setPickerVisible(false)}
      />

      {/* Priority */}
      <PrioritySheet visible={priorityOpen} value={priority} onChange={setPriority} onClose={()=>setPriorityOpen(false)} />

      {/* Tags */}
      <TagPickerModal visible={tagsOpen} value={tags} suggestions={tagSuggestions} onChange={setTags} onClose={()=>setTagsOpen(false)} />

      {/* List Picker */}
      <ListPickerModal visible={listPickerOpen} value={listId} onChange={setListId} onClose={()=>setListPickerOpen(false)} />
    </KeyboardAvoidingView>
  );
}

function AccessoryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.accBtn} onPress={onPress}>
      <Text style={s.accTxt}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  topBar:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  link:{ color:'#418cff', fontWeight:'600' },
  title:{ fontWeight:'700', fontSize:16 },
  label:{ marginTop:14, marginBottom:6, fontWeight:'700', color:'#111827' },
  input:{ borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, paddingHorizontal:12, paddingVertical: Platform.OS==='ios'?12:8, backgroundColor:'#fff' },

  // subtasks
  subRow:{ flexDirection:'row', alignItems:'center', marginBottom:8 },
  smallBtn:{ backgroundColor:'#4f46e5', paddingHorizontal:12, paddingVertical:10, borderRadius:10 },
  smallBtnTxt:{ color:'#fff', fontWeight:'700' },
  subItem:{ paddingVertical:8 },
  subText:{ color:'#111827' },

  // accessory row
  accessory:{ position:'absolute', left:0, right:0, bottom:0, flexDirection:'row', flexWrap:'wrap', padding:8, backgroundColor:'#f3f4f6', borderTopWidth:1, borderColor:'#e5e7eb', gap:8 },
  accBtn:{ backgroundColor:'#fff', paddingHorizontal:10, paddingVertical:6, borderRadius:10, borderWidth:1, borderColor:'#e5e7eb' },
  accTxt:{ fontWeight:'600', color:'#111827' },

  // quick date sheet
  sheetBackdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.25)', justifyContent:'flex-end' },
  sheet:{ backgroundColor:'#fff', padding:16, borderTopLeftRadius:16, borderTopRightRadius:16 },
  sheetTitle:{ fontWeight:'700', fontSize:16, textAlign:'center', marginBottom:8 },
  sheetItem:{ paddingVertical:12, borderBottomWidth:1, borderColor:'#f3f4f6' },
});
