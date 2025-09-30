// app/(tabs)/todo/index.tsx
import CreateListModal from '@/components/CreateListModal';
import { useListContext } from '@/context/ListContext';
import { useTodoContext } from '@/context/TodoContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import moment from 'moment';
import { useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeListView } from 'react-native-swipe-list-view';

export default function TodoDashboard() {
  const { todos } = useTodoContext();
  const { lists, deleteList } = useListContext();
  
  console.log('=== TODO DASHBOARD RENDERED ===');
  console.log('TodoDashboard - todos:', todos.length, 'lists:', lists.length);

  // --- derived counts for the cards ---
  const counts = useMemo(() => {
    const startOfToday = moment().startOf('day');
    // All: active tasks due today or later (with a due date)
    const all = todos.filter(t => !!t.dueDate && !t.done && moment(t.dueDate).isSameOrAfter(startOfToday)).length;
    // Today's Tasks: active tasks due today only
    const scheduled = todos.filter(t => !!t.dueDate && !t.done && moment(t.dueDate).isSame(startOfToday, 'day')).length;
    const completed = todos.filter(t => t.done).length;
    const todaysTasks = todos.filter(t => {
      if (t.done) return false; // Skip completed todos
      if (!t.dueDate) return false; // Skip todos without due dates
      return moment(t.dueDate).isSame(moment(), 'day'); // Check if due today
    }).length;
    const priority = todos.filter(t => t.priority === 'high' && !t.done).length; // Only active high priority
    const listCountsMap: Record<string, number> = {};
    // Focus-only (special list)
    const focus = todos.filter(t => t.listId === 'focus' && !t.done).length;
    lists.forEach(l => {
      listCountsMap[l.id] = todos.filter(t => t.listId === l.id && !t.done).length;
    });
    return {
      all, scheduled, completed, todaysTasks, priority, focus,
      lists: lists.length,
      perList: listCountsMap,
    };
  }, [todos, lists]);

  const [listModalOpen, setListModalOpen] = useState(false);
  const [completedSheetOpen, setCompletedSheetOpen] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>To‑Do</Text>

        {/* Cards grid */}
        <View style={s.grid}>
          <DashCard label="Scheduled"        count={counts.all}        href="/todo/all" />
          <DashCard label="Today's Tasks"  count={counts.scheduled}  href="/todo/scheduled" />
          <DashCard label="Completed"  count={counts.completed}  href="/todo/completed" />
          <DashCard label="Priority"   count={counts.priority}   href="/todo/priority" />
          <DashCard label="Focus Sessions" count={counts.focus} href={{ pathname: '/todo/list-items', params: { listId: 'focus' } }} />
        </View>

        {/* (Removed: View Completed button for dashboard) */}

        {/* My Lists header */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>My Lists</Text>
        </View>

        {/* Swipeable list rows */}
        <SwipeListView
          data={lists}
          keyExtractor={l => l.id}
          scrollEnabled={false}
          contentContainerStyle={{ rowGap: 10 }}
          renderItem={({ item }) => {
            const activeCount = counts.perList[item.id] ?? 0;
            return (
              <View style={s.rowWrapper}>
                <TouchableOpacity
                  style={s.listRow}
                  activeOpacity={0.9}
                  onPress={() =>
                    router.push({ pathname: '/todo/list-items', params: { listId: item.id } })
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
          disableRightSwipe={true}
          disableLeftSwipe={false}
          friction={12}
          tension={80}
          swipeToOpenPercent={20}
          swipeToClosePercent={20}
          previewRowKey={lists[0]?.id}
          previewOpenDelay={Platform.select({ ios: 800, android: 1200 })}
          previewOpenValue={-50}
        />
      </ScrollView>

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

      {/* Completed Tasks Bottom Sheet (removed for index dashboard per request) */}
      {/* (sheet removed) */}
    </SafeAreaView>
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
  const getGradient = (
    name: string
  ): { colors: [string, string]; locations?: [number, number] } => {
    switch (name) {
      case 'Priority':
        // to left, #f01919 -> #f6b5b5
        return { colors: ['#f01919', '#f6b5b5'] };
      case "Today's Tasks":
        // to left, #0000ff -> #ffffff
        return { colors: ['#0099cc', '#33ccff'] };
      case 'Scheduled':
        // to left, #666697 (5%) -> #000066 (100%)
        return { colors: ['#666697', '#000066'], locations: [0.35, 1] };
      case 'Completed':
        // to left, #3333cc -> #666699
        return { colors: ['#b8becc', '#666699'] };
      case 'Focus Sessions':
        // to left, #9900cc -> #3366ff
        return { colors: ['#9900cc', '#3366ff'] };
      default:
        return { colors: ['#5a5f69', '#2b2d31'] };
    }
  };
  return (
    <Link href={href} asChild>
      <TouchableOpacity style={s.card} activeOpacity={0.9}>
        {(() => { const cfg = getGradient(label); return (
          <LinearGradient
            colors={cfg.colors}
            locations={cfg.locations}
            // to left: right -> left
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={s.cardInner}
          >
          <Text style={s.cardTitle}>{label}</Text>
          <Text style={s.cardCount}>{count}</Text>
          </LinearGradient>
        ); })()}
      </TouchableOpacity>
    </Link>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: '#3f51d1', marginBottom: 12 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  completedBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#eef2ff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, marginBottom: 12 },
  completedBtnText: { color: '#3f51d1', fontWeight: '700' },
  card: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#222',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardInner: {
    padding: 10,
  },
  cardTitle: { color: '#ffffff', fontWeight: '700', marginBottom: 10 },
  cardCount: { color: '#ffffff', fontSize: 28, fontWeight: '800' },

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

  // Bottom sheet styles
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#ffffff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  sheetHeader: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 10 },
  completedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
  completedTitle: { color: '#111827', fontWeight: '700' },
  completedMeta: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  sheetCloseBtn: { alignSelf: 'flex-end', backgroundColor: '#e5e7eb', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginTop: 8 },
});
