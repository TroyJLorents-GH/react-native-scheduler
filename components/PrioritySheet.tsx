// components/PrioritySheet.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  visible: boolean;
  value: 'high' | 'medium' | 'low';
  onChange: (v: 'high' | 'medium' | 'low') => void;
  onClose: () => void;
};

export default function PrioritySheet({ visible, value, onChange, onClose }: Props) {
  const Row = ({
    label, icon, color, v,
  }: { label: string; icon: any; color: string; v: 'high'|'medium'|'low' }) => (
    <TouchableOpacity style={s.item} onPress={() => { onChange(v); onClose(); }}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={s.itemText}>{label}</Text>
      {value === v && <Ionicons name="checkmark" size={18} color="#111827" style={{ marginLeft: 'auto' }} />}
    </TouchableOpacity>
  );

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.sheet}>
          <Text style={s.title}>Priority</Text>
          <Row label="High"   icon="flag"          color="#ef4444" v="high" />
          <Row label="Medium" icon="flag-outline" color="#f59e0b" v="medium" />
          <Row label="Low"    icon="flag-outline" color="#10b981" v="low" />
          <TouchableOpacity style={[s.item, { justifyContent: 'center' }]} onPress={onClose}>
            <Text style={{ color: '#2563eb', fontWeight: '700' }}>Done</Text>
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
  item:{ flexDirection:'row', alignItems:'center', gap:10, paddingVertical:12, borderBottomWidth:1, borderColor:'#f3f4f6' },
  itemText:{ color:'#111827', fontWeight:'600' },
});
