// components/TagPickerModal.tsx
import React, { useMemo, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';

type Props = {
  visible: boolean;
  value: string[];              // current selected tags
  suggestions?: string[];       // optional pool
  onChange: (tags: string[]) => void;
  onClose: () => void;
};

export default function TagPickerModal({ visible, value, suggestions = [], onChange, onClose }: Props) {
  const [text, setText] = useState('');
  const pool = useMemo(() => {
    const s = new Set<string>([...suggestions.map(n => n.trim()).filter(Boolean), ...value]);
    return Array.from(s);
  }, [suggestions, value]);

  const toggle = (t: string) => {
    const exists = value.includes(t);
    onChange(exists ? value.filter(x => x !== t) : [...value, t]);
  };

  const addText = () => {
    const t = text.trim();
    if (!t) return;
    const norm = t.startsWith('#') ? t : `#${t}`;
    onChange(value.includes(norm) ? value : [...value, norm]);
    setText('');
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.sheet}>
          <Text style={s.title}>Tags</Text>

          <View style={s.row}>
            <TextInput
              placeholder="Add a tag…"
              value={text}
              onChangeText={setText}
              style={s.input}
              onSubmitEditing={addText}
              returnKeyType="done"
            />
            <TouchableOpacity style={s.addBtn} onPress={addText}><Text style={s.addTxt}>Add</Text></TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 240 }}>
            <Text style={s.sectionLabel}>Suggested</Text>
            <View style={s.wrap}>
              {pool.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[s.tag, value.includes(tag) && s.tagActive]}
                  onPress={() => toggle(tag)}
                >
                  <Text style={[s.tagTxt, value.includes(tag) && s.tagTxtActive]}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={s.doneRow} onPress={onClose}>
            <Text style={s.doneTxt}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.25)', justifyContent:'flex-end' },
  sheet:{ backgroundColor:'#fff', padding:16, borderTopLeftRadius:16, borderTopRightRadius:16 },
  title:{ fontWeight:'700', fontSize:16, textAlign:'center', marginBottom:8 },
  row:{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:10 },
  input:{ flex:1, borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, paddingHorizontal:12, paddingVertical:10 },
  addBtn:{ backgroundColor:'#2563eb', paddingHorizontal:12, paddingVertical:10, borderRadius:10 },
  addTxt:{ color:'#fff', fontWeight:'700' },
  sectionLabel:{ fontWeight:'700', marginVertical:8, color:'#111827' },
  wrap:{ flexDirection:'row', flexWrap:'wrap', gap:8 },
  tag:{ paddingVertical:6, paddingHorizontal:10, borderRadius:999, borderWidth:1, borderColor:'#e5e7eb', backgroundColor:'#fff' },
  tagActive:{ backgroundColor:'#111827' },
  tagTxt:{ color:'#111827', fontWeight:'600' },
  tagTxtActive:{ color:'#fff' },
  doneRow:{ paddingVertical:12, alignItems:'center' },
  doneTxt:{ color:'#2563eb', fontWeight:'700' },
});
