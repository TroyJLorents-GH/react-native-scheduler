// components/ListPickerModal.tsx
import { useListContext } from '@/context/ListContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  visible: boolean;
  value: string;                   // listId
  onChange: (listId: string) => void;
  onClose: () => void;
};

export default function ListPickerModal({ visible, value, onChange, onClose }: Props) {
  const { lists } = useListContext();

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.sheet}>
          <Text style={s.title}>Lists</Text>
          <ScrollView style={{ maxHeight: 360 }}>
            {lists.map(l => (
              <TouchableOpacity
                key={l.id}
                style={s.row}
                onPress={() => { onChange(l.id); onClose(); }}
              >
                <View style={[s.iconCircle, { backgroundColor: l.color || '#e5e7eb' }]}>
                  {!!l.icon && <Ionicons name={l.icon as any} size={16} color="#fff" />}
                </View>
                <Text style={s.name}>{l.name}</Text>
                {value === l.id && <Ionicons name="checkmark" size={18} color="#111827" style={{ marginLeft: 'auto' }} />}
              </TouchableOpacity>
            ))}
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
  row:{ flexDirection:'row', alignItems:'center', gap:10, paddingVertical:12, borderBottomWidth:1, borderColor:'#f3f4f6' },
  iconCircle:{ width:26, height:26, borderRadius:13, alignItems:'center', justifyContent:'center' },
  name:{ color:'#111827', fontWeight:'600' },
  doneRow:{ paddingVertical:12, alignItems:'center' },
  doneTxt:{ color:'#2563eb', fontWeight:'700' },
});
