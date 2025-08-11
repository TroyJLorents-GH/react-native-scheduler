// // app/(tabs)/todo/index.tsx
// import CreateListModal from '@/components/CreateListModal';
// import { useListContext } from '@/context/ListContext';
// import { useTodoContext } from '@/context/TodoContext';
// import { Ionicons } from '@expo/vector-icons';
// import { Link, router } from 'expo-router';
// import React, { useState } from 'react';
// import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// export default function TodoDashboard() {
//   const { todos } = useTodoContext();
//   const { lists } = useListContext();
//   const [listModalOpen, setListModalOpen] = useState(false);

//   const counts = {
//     all: todos.length,
//     scheduled: todos.filter(t => t.dueDate && t.dueDate > new Date()).length,
//     completed: todos.filter(t => t.done).length,
//     favorites: todos.filter(t => t.favorite).length,
//     priority: todos.filter(t => t.priority === 'high').length,
//     lists: lists.length,
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: '#f5f8ff', padding: 16 }}>
//       <Text style={s.title}>To‑Do</Text>

//       <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
//         <View style={s.grid}>
//           <DashCard label="All" count={counts.all} href="/(tabs)/all" />
//           <DashCard label="Scheduled" count={counts.scheduled} href="/(tabs)/scheduled" />
//           <DashCard label="Completed" count={counts.completed} href="/(tabs)/completed" />
//           <DashCard label="Favorites" count={counts.favorites} href="/(tabs)/favorite" />
//           <DashCard label="Priority" count={counts.priority} href="/(tabs)/priority" />
//           <DashCard label="Lists" count={counts.lists} href="/(tabs)/todo/lists" />
//         </View>

//         <Text style={s.sectionTitle}>My Lists</Text>
//         <View style={{ gap: 10 }}>
//           {lists.map(l => {
//             const activeCount = todos.filter(t => t.listId === l.id && !t.done).length;
//             return (
//               <TouchableOpacity key={l.id} style={s.listRow}
//                 onPress={() => router.push({ pathname: '/todo/[listId]', params: { listId: l.id } })}
//              >
//                 <View style={[s.listIconCircle, { backgroundColor: l.color || '#e5e7eb' }]}>
//                     {!!l.icon && <Ionicons name={l.icon as any} size={16} color="#fff" />}
//                 </View>
//                 <Text style={s.listName}>{l.name}</Text>
//                 <Text style={s.listCount}>{activeCount}</Text>
//              </TouchableOpacity>
//             );
//           })}
//         </View>
//       </ScrollView>

//       {/* Two actions: new reminder + new list */}
//       <View style={s.fabRow}>
//         <TouchableOpacity style={[s.fab, { backgroundColor: '#4f46e5' }]} onPress={() => router.push('/todo/new')}>
//           <Text style={s.fabText}>New Reminder</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={[s.fab, { backgroundColor: '#2563eb' }]} onPress={() => setListModalOpen(true)}>
//           <Text style={s.fabText}>New List</Text>
//         </TouchableOpacity>
//       </View>

//       <CreateListModal visible={listModalOpen} onClose={() => setListModalOpen(false)} />
//     </View>
//   );
// }

// function DashCard({ label, count, href }: { label: string; count: number; href: any }) {
//   return (
//     <Link href={href} asChild>
//       <TouchableOpacity style={s.card}>
//         <Text style={s.cardTitle}>{label}</Text>
//         <Text style={s.cardCount}>{count}</Text>
//       </TouchableOpacity>
//     </Link>
//   );
// }

// const s = StyleSheet.create({
//   title: { fontSize: 22, fontWeight: '700', color: '#4557d6', marginBottom: 10 },
//   grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
//   card: { width: '48%', backgroundColor: '#fff', padding: 16, borderRadius: 14, elevation: 2 },
//   cardTitle: { fontWeight: '600', color: '#1f2937' },
//   cardCount: { marginTop: 8, fontSize: 22, fontWeight: '800', color: '#4557d6' },
//   sectionTitle: { marginTop: 18, marginBottom: 8, fontSize: 16, fontWeight: '700', color: '#1f2937' },
//   listRow: {
//     backgroundColor: '#fff', padding: 14, borderRadius: 12,
//     flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
//   },
//   listName: { fontWeight: '600', color: '#111827' },
//   listCount: { color: '#6b7280', fontWeight: '700' },
//   fabRow: { position:'absolute', right:16, bottom:24, gap:10 },
//   fab: { borderRadius:999, paddingHorizontal:16, paddingVertical:12 },
//   fabText: { color:'#fff', fontWeight:'700' },
//   listIconCircle:{ width:22, height:22, borderRadius:11, alignItems:'center', justifyContent:'center', marginRight:10 },
// });























// // app/(tabs)/todo/index.tsx
// import CreateListModal from '@/components/CreateListModal';
// import { useListContext } from '@/context/ListContext';
// import { useTodoContext } from '@/context/TodoContext';
// import { Ionicons } from '@expo/vector-icons';
// import { Link, router } from 'expo-router';
// import React, { useMemo, useState } from 'react';
// import {
//   FlatList,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// export default function TodoDashboard() {
//   const { todos } = useTodoContext();
//   const { lists, deleteList } = useListContext();

//   // --- derived counts for the cards ---
//   const counts = useMemo(() => {
//     const all = todos.length;
//     const scheduled = todos.filter(t => !!t.dueDate && !t.done).length;
//     const completed = todos.filter(t => t.done).length;
//     const favorites = todos.filter(t => t.favorite).length;
//     const priority = todos.filter(t => t.priority === 'high').length;
//     const listCountsMap: Record<string, number> = {};
//     lists.forEach(l => {
//       listCountsMap[l.id] = todos.filter(t => t.listId === l.id && !t.done).length;
//     });
//     return {
//       all, scheduled, completed, favorites, priority,
//       lists: lists.length,
//       perList: listCountsMap,
//     };
//   }, [todos, lists]);

//   const [listModalOpen, setListModalOpen] = useState(false);

//   return (
//     <View style={{ flex: 1, backgroundColor: '#f5f8ff', padding: 16 }}>
//       <Text style={s.title}>To‑Do</Text>

//       <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
//         <View style={s.grid}>
//           <DashCard label="All"        count={counts.all}        href="/(tabs)/all" />
//           <DashCard label="Scheduled"  count={counts.scheduled}  href="/(tabs)/scheduled" />
//           <DashCard label="Completed"  count={counts.completed}  href="/(tabs)/completed" />
//           <DashCard label="Favorites"  count={counts.favorites}  href="/(tabs)/favorite" />
//           <DashCard label="Priority"   count={counts.priority}   href="/(tabs)/priority" />
//           <DashCard label="Lists"      count={counts.lists}      href="/(tabs)/todo/lists" />
//         </View>

//         <View style={s.sectionHeader}>
//           <Text style={s.sectionTitle}>My Lists</Text>
//         </View>

//         <FlatList
//           data={lists}
//           keyExtractor={l => l.id}
//           scrollEnabled={false}
//           ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
//           renderItem={({ item }) => {
//             const activeCount = counts.perList[item.id] ?? 0;
//             return (
//               <View style={s.listRowOuter}>
//                 <TouchableOpacity
//                   style={s.listRow}
//                   onPress={() =>
//                     router.push({ pathname: '/todo/[listId]', params: { listId: item.id } })
//                   }
//                 >
//                   <View style={[s.listIconCircle, { backgroundColor: item.color || '#e5e7eb' }]}>
//                     {!!item.icon && <Ionicons name={item.icon as any} size={18} color="#fff" />}
//                   </View>
//                   <Text style={s.listName}>{item.name}</Text>
//                   <Text style={s.listCount}>{activeCount}</Text>
//                 </TouchableOpacity>

//                 {/* delete button (like MyListScreen) */}
//                 <TouchableOpacity onPress={() => deleteList(item.id)} style={{ paddingHorizontal: 8 }}>
//                   <Ionicons name="trash" size={20} color="#f87171" />
//                 </TouchableOpacity>
//               </View>
//             );
//           }}
//         />
//       </ScrollView>

//       {/* Two actions: new reminder + new list */}
//       <View style={s.fabRow}>
//         <TouchableOpacity
//           style={[s.fab, { backgroundColor: '#4f46e5' }]}
//           onPress={() => router.push('/todo/new')}
//         >
//           <Text style={s.fabText}>New Reminder</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[s.fab, { backgroundColor: '#2563eb' }]}
//           onPress={() => setListModalOpen(true)}
//         >
//           <Text style={s.fabText}>New List</Text>
//         </TouchableOpacity>
//       </View>

//       <CreateListModal visible={listModalOpen} onClose={() => setListModalOpen(false)} />
//     </View>
//   );
// }

// function DashCard({
//   label,
//   count,
//   href,
// }: {
//   label: string;
//   count: number;
//   href: any;
// }) {
//   return (
//     <Link href={href} asChild>
//       <TouchableOpacity style={s.card}>
//         <Text style={s.cardTitle}>{label}</Text>
//         <Text style={s.cardCount}>{count}</Text>
//       </TouchableOpacity>
//     </Link>
//   );
// }

// const s = StyleSheet.create({
//   title: { fontSize: 24, fontWeight: '800', color: '#3f51d1', marginBottom: 12 },
//   grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
//   card: {
//     width: '48%',
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     shadowColor: '#222',
//     shadowOpacity: 0.06,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   cardTitle: { color: '#374151', fontWeight: '700', marginBottom: 10 },
//   cardCount: { color: '#3f51d1', fontSize: 28, fontWeight: '800' },

//   sectionHeader: { marginTop: 18, marginBottom: 10, paddingRight: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   sectionTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },

//   listRowOuter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 14,
//     paddingRight: 8,
//   },
//   listRow: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//   },
//   listIconCircle: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   listName: { fontSize: 18, color: '#111827', flex: 1 },
//   listCount: {
//     minWidth: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: '#eef2ff',
//     color: '#3f51d1',
//     textAlign: 'center',
//     lineHeight: 28,
//     fontWeight: '800',
//   },

//   fabRow: {
//     position: 'absolute',
//     right: 16,
//     bottom: 24,
//     gap: 10,
//   },
//   fab: {
//     paddingHorizontal: 18,
//     paddingVertical: 14,
//     borderRadius: 30,
//   },
//   fabText: { color: 'white', fontWeight: '800' },
// });






// app/(tabs)/todo/index.tsx
import CreateListModal from '@/components/CreateListModal';
import { useListContext } from '@/context/ListContext';
import { useTodoContext } from '@/context/TodoContext';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';

export default function TodoDashboard() {
  const { todos } = useTodoContext();
  const { lists, deleteList } = useListContext();

  // --- derived counts for the cards ---
  const counts = useMemo(() => {
    const all = todos.length;
    const scheduled = todos.filter(t => !!t.dueDate && !t.done).length;
    const completed = todos.filter(t => t.done).length;
    const favorites = todos.filter(t => t.favorite).length;
    const priority = todos.filter(t => t.priority === 'high').length;
    const listCountsMap: Record<string, number> = {};
    lists.forEach(l => {
      listCountsMap[l.id] = todos.filter(t => t.listId === l.id && !t.done).length;
    });
    return {
      all, scheduled, completed, favorites, priority,
      lists: lists.length,
      perList: listCountsMap,
    };
  }, [todos, lists]);

  const [listModalOpen, setListModalOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f8ff', padding: 16 }}>
      <Text style={s.title}>To‑Do</Text>

      {/* Cards grid */}
      <View style={s.grid}>
        <DashCard label="All"        count={counts.all}        href="/(tabs)/all" />
        <DashCard label="Scheduled"  count={counts.scheduled}  href="/(tabs)/scheduled" />
        <DashCard label="Completed"  count={counts.completed}  href="/(tabs)/completed" />
        <DashCard label="Favorites"  count={counts.favorites}  href="/(tabs)/favorite" />
        <DashCard label="Priority"   count={counts.priority}   href="/(tabs)/priority" />
        <DashCard label="Lists"      count={counts.lists}      href="/(tabs)/todo/lists" />
      </View>

      {/* My Lists header */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>My Lists</Text>
      </View>

      {/* Swipeable list rows (no extra scrolling; page scroll handled by outer view) */}
      <SwipeListView
        data={lists}
        keyExtractor={l => l.id}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 140, rowGap: 10 }}
        renderItem={({ item }) => {
          const activeCount = counts.perList[item.id] ?? 0;
          return (
            <View style={s.rowWrapper}>
              <TouchableOpacity
                style={s.listRow}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({ pathname: '/todo/[listId]', params: { listId: item.id } })
                }
              >
                <View style={[s.listIconCircle, { backgroundColor: item.color || '#e5e7eb' }]}>
                  {!!item.icon && <Ionicons name={item.icon as any} size={18} color="#fff" />}
                </View>
                <Text style={s.listName}>{item.name}</Text>
                <Text style={s.listCount}>{activeCount}</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        renderHiddenItem={({ item }) => (
          <View style={s.rowBack}>
            {/* Right-side delete */}
            <TouchableOpacity
              style={s.deleteAction}
              onPress={() => deleteList(item.id)}
            >
              <Ionicons name="trash" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        rightOpenValue={-84}
        leftOpenValue={0}
        disableRightSwipe={false}
        disableLeftSwipe={true}
        friction={12}
        tension={80}
        swipeToOpenPercent={20}
        swipeToClosePercent={20}
        previewRowKey={lists[0]?.id}
        previewOpenDelay={Platform.select({ ios: 800, android: 1200 })}
        previewOpenValue={-50}
      />

      {/* Two actions: new reminder + new list */}
      <View style={s.fabRow}>
        <TouchableOpacity
          style={[s.fab, { backgroundColor: '#4f46e5' }]}
          onPress={() => router.push('/todo/new')}
        >
          <Text style={s.fabText}>New Reminder</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.fab, { backgroundColor: '#2563eb' }]}
          onPress={() => setListModalOpen(true)}
        >
          <Text style={s.fabText}>New List</Text>
        </TouchableOpacity>
      </View>

      <CreateListModal
        visible={listModalOpen}
        onClose={() => setListModalOpen(false)}
      />
    </View>
  );
}

function DashCard({
  label,
  count,
  href,
}: {
  label: string;
  count: number;
  href: any;
}) {
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
  title: { fontSize: 24, fontWeight: '800', color: '#3f51d1', marginBottom: 12 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#222',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { color: '#374151', fontWeight: '700', marginBottom: 10 },
  cardCount: { color: '#3f51d1', fontSize: 28, fontWeight: '800' },

  sectionHeader: { marginTop: 2, marginBottom: 10, paddingRight: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },

  rowWrapper: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  listIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listName: { fontSize: 18, color: '#111827', flex: 1 },
  listCount: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eef2ff',
    color: '#3f51d1',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '800',
  },

  // Hidden row (right)
  rowBack: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    paddingRight: 6,
    marginTop: 0,
  },
  deleteAction: {
    width: 78,
    height: '90%',
    backgroundColor: '#f87171',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    // subtle shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },

  fabRow: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    gap: 10,
  },
  fab: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 30,
  },
  fabText: { color: 'white', fontWeight: '800' },
});
