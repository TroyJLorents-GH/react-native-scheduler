// // components/CreateListModal.tsx
// import { useListContext } from '@/context/ListContext';
// import { Ionicons } from '@expo/vector-icons';
// import React, { useState } from 'react';
// import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// const COLORS = ['#3b82f6','#ef4444','#f59e0b','#10b981','#8b5cf6','#f97316','#14b8a6','#f9a8d4'];
// const ICONS: (keyof typeof Ionicons.glyphMap)[] = [
//   'list','checkmark-done','calendar','star','flag','cart','briefcase','heart'
// ];

// export default function CreateListModal({
//   visible, onClose,
// }: { visible: boolean; onClose: () => void }) {
//   const { addList } = useListContext();
//   const [name, setName] = useState('');
//   const [color, setColor] = useState(COLORS[0]);
//   const [icon, setIcon] = useState<(typeof ICONS)[number]>('list');

//   const add = () => {
//     if (!name.trim()) return;
//     addList({ name: name.trim(), color, icon });
//     setName('');
//     setColor(COLORS[0]);
//     setIcon('list');
//     onClose();
//   };

//   return (
//     <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
//       <View style={s.backdrop}>
//         <View style={s.sheet}>
//           <Text style={s.title}>New List</Text>

//           <TextInput
//             style={s.input}
//             placeholder="List name"
//             value={name}
//             onChangeText={setName}
//           />

//           <Text style={s.label}>Color</Text>
//           <View style={s.rowWrap}>
//             {COLORS.map(c => (
//               <TouchableOpacity key={c} style={[s.colorDot, { backgroundColor: c, borderColor: color===c ? '#111' : 'transparent'}]} onPress={() => setColor(c)} />
//             ))}
//           </View>

//           <Text style={s.label}>Icon</Text>
//           <View style={s.rowWrap}>
//             {ICONS.map(ic => (
//               <TouchableOpacity key={ic} style={[s.iconBtn, icon===ic && s.iconBtnActive]} onPress={() => setIcon(ic)}>
//                 <Ionicons name={ic} size={20} color={icon===ic ? '#fff' : '#374151'} />
//               </TouchableOpacity>
//             ))}
//           </View>

//           <View style={s.actions}>
//             <TouchableOpacity onPress={onClose}><Text style={s.cancel}>Cancel</Text></TouchableOpacity>
//             <TouchableOpacity onPress={add}><Text style={s.add}>Add</Text></TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const s = StyleSheet.create({
//   backdrop:{flex:1,backgroundColor:'rgba(0,0,0,0.25)',justifyContent:'center',alignItems:'center',padding:20},
//   sheet:{width:'100%',backgroundColor:'#fff',borderRadius:16,padding:18},
//   title:{fontSize:18,fontWeight:'700',textAlign:'center',marginBottom:12},
//   input:{borderWidth:1,borderColor:'#e5e7eb',borderRadius:10,paddingHorizontal:12,paddingVertical:10},
//   label:{marginTop:12,marginBottom:6,fontWeight:'700',color:'#111827'},
//   rowWrap:{flexDirection:'row',flexWrap:'wrap',gap:10},
//   colorDot:{width:28,height:28,borderRadius:999,borderWidth:2},
//   iconBtn:{width:36,height:36,borderRadius:10,alignItems:'center',justifyContent:'center',backgroundColor:'#eef2ff'},
//   iconBtnActive:{backgroundColor:'#4f46e5'},
//   actions:{marginTop:16,flexDirection:'row',justifyContent:'space-between'},
//   cancel:{color:'#ef4444',fontWeight:'700'},
//   add:{color:'#2563eb',fontWeight:'700'}
// });


import { useListContext } from '@/context/ListContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// make ICONS a literal union
const ICONS = ['list', 'checkmark-done', 'calendar', 'star', 'flag', 'cart', 'briefcase', 'heart'] as const;
type IconName = (typeof ICONS)[number];

export default function CreateListModal({
  visible, onClose,
}: { visible: boolean; onClose: () => void }) {
  const { addList } = useListContext();

  const COLORS = ['#3b82f6','#ef4444','#f59e0b','#10b981','#8b5cf6','#f97316','#14b8a6','#f9a8d4'];

  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState<IconName>('list');   // <-- fixed

  const add = () => {
    if (!name.trim()) return;

    addList({ name: name.trim(), color, icon });

    setName('');
    setColor(COLORS[0]);
    setIcon('list');
    onClose();
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.sheet}>
          <Text style={s.title}>New List</Text>

          <TextInput style={s.input} placeholder="List name" value={name} onChangeText={setName} />

          <Text style={s.label}>Color</Text>
          <View style={s.rowWrap}>
            {COLORS.map(c => (
              <TouchableOpacity key={c} style={[s.colorDot, { backgroundColor: c, borderColor: color===c ? '#111' : 'transparent'}]} onPress={() => setColor(c)} />
            ))}
          </View>

          <Text style={s.label}>Icon</Text>
          <View style={s.rowWrap}>
            {ICONS.map(ic => (
              <TouchableOpacity key={ic} style={[s.iconBtn, icon===ic && s.iconBtnActive]} onPress={() => setIcon(ic)}>
                <Ionicons name={ic as keyof typeof Ionicons.glyphMap} size={20} color={icon===ic ? '#fff' : '#374151'} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.actions}>
            <TouchableOpacity onPress={onClose}><Text style={s.cancel}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={add}><Text style={s.add}>Add</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop:{flex:1,backgroundColor:'rgba(0,0,0,0.25)',justifyContent:'center',alignItems:'center',padding:20},
  sheet:{width:'100%',backgroundColor:'#fff',borderRadius:16,padding:18},
  title:{fontSize:18,fontWeight:'700',textAlign:'center',marginBottom:12},
  input:{borderWidth:1,borderColor:'#e5e7eb',borderRadius:10,paddingHorizontal:12,paddingVertical:10},
  label:{marginTop:12,marginBottom:6,fontWeight:'700',color:'#111827'},
  rowWrap:{flexDirection:'row',flexWrap:'wrap',gap:10},
  colorDot:{width:28,height:28,borderRadius:999,borderWidth:2},
  iconBtn:{width:36,height:36,borderRadius:10,alignItems:'center',justifyContent:'center',backgroundColor:'#eef2ff'},
  iconBtnActive:{backgroundColor:'#4f46e5'},
  actions:{marginTop:16,flexDirection:'row',justifyContent:'space-between'},
  cancel:{color:'#ef4444',fontWeight:'700'},
  add:{color:'#2563eb',fontWeight:'700'}
});
