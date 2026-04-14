// app/(tabs)/todo/index.tsx
import CreateListModal from '@/components/CreateListModal';
import { useListContext } from '@/context/ListContext';
import { useTodoContext } from '@/context/TodoContext';
import { getTasksForDate, shouldTaskAppearOnDate, isTaskCompletedForDate } from '@/utils/recurring';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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

  const counts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysTasks = getTasksForDate(todos, today).length;

    const all = todos.filter(t => {
      if (t.done) return false;
      if (t.dueDate) {
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate >= today) return true;
      }
      if (t.repeat && t.repeat !== 'Never') return true;
      return false;
    }).length;

    const completed = todos.filter(t => {
      if (t.repeat && t.repeat !== 'Never') {
        return isTaskCompletedForDate(t, today);
      }
      return t.done;
    }).length;

    const priority = todos.filter(t => t.priority === 'high' && !t.done).length;
    const listCountsMap: Record<string, number> = {};

    const focus = todos.filter(t => {
      if (t.listId !== 'focus') return false;
      if (t.repeat && t.repeat !== 'Never') {
        return shouldTaskAppearOnDate(t, today) && !isTaskCompletedForDate(t, today);
      }
      return !t.done;
    }).length;

    lists.forEach(l => {
      listCountsMap[l.id] = todos.filter(t => t.listId === l.id && !t.done).length;
    });

    // Completion rate for the progress ring
    const totalActive = todaysTasks;
    const todayCompleted = todos.filter(t => {
      if (t.repeat && t.repeat !== 'Never') {
        return shouldTaskAppearOnDate(t, today) && isTaskCompletedForDate(t, today);
      }
      return false;
    }).length;

    return {
      all,
      scheduled: todaysTasks,
      completed,
      todaysTasks,
      todayCompleted,
      priority,
      focus,
      lists: lists.length,
      perList: listCountsMap,
    };
  }, [todos, lists]);

  const [listModalOpen, setListModalOpen] = useState(false);

  // Progress percentage for today
  const todayTotal = counts.scheduled + counts.todayCompleted;
  const progressPct = todayTotal > 0 ? Math.round((counts.todayCompleted / todayTotal) * 100) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.title}>To‑Do</Text>
            <Text style={s.subtitle}>
              {counts.scheduled > 0
                ? `${counts.scheduled} task${counts.scheduled !== 1 ? 's' : ''} today`
                : 'All clear for today'}
            </Text>
          </View>
          <View style={s.headerActions}>
            <TouchableOpacity onPress={() => router.push('/search' as any)} style={s.headerBtn}>
              <Ionicons name="search" size={20} color="#6366f1" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/habits' as any)} style={s.headerBtn}>
              <Ionicons name="flame-outline" size={20} color="#6366f1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Today Progress Banner */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/todo/scheduled')}
        >
          <LinearGradient
            colors={['#6366f1', '#818cf8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.progressBanner}
          >
            <View style={s.progressLeft}>
              <Text style={s.progressLabel}>Today's Progress</Text>
              <Text style={s.progressCount}>
                {counts.todayCompleted}
                <Text style={s.progressTotal}> / {todayTotal} tasks</Text>
              </Text>
              <View style={s.progressBarBg}>
                <View style={[s.progressBarFill, { width: `${progressPct}%` }]} />
              </View>
            </View>
            <View style={s.progressRing}>
              <Text style={s.progressPct}>{progressPct}%</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Filters */}
        <View style={s.filtersRow}>
          <FilterChip
            icon="calendar-outline"
            label="Scheduled"
            count={counts.all}
            color="#4f46e5"
            onPress={() => router.push('/todo/all')}
          />
          <FilterChip
            icon="checkmark-done"
            label="Done"
            count={counts.completed}
            color="#10b981"
            onPress={() => router.push('/todo/completed')}
          />
          <FilterChip
            icon="flag"
            label="Priority"
            count={counts.priority}
            color="#ef4444"
            onPress={() => router.push('/todo/priority')}
          />
          <FilterChip
            icon="flash"
            label="Focus"
            count={counts.focus}
            color="#8b5cf6"
            onPress={() => router.push({ pathname: '/todo/list-items', params: { listId: 'focus' } })}
          />
        </View>

        {/* My Lists */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>My Lists</Text>
          <TouchableOpacity onPress={() => setListModalOpen(true)} style={s.addListBtn}>
            <Ionicons name="add" size={18} color="#6366f1" />
            <Text style={s.addListText}>New</Text>
          </TouchableOpacity>
        </View>

        <SwipeListView
          data={lists}
          keyExtractor={l => l.id}
          scrollEnabled={false}
          contentContainerStyle={{ rowGap: 8 }}
          renderItem={({ item }) => {
            const activeCount = counts.perList[item.id] ?? 0;
            return (
              <View style={s.rowWrapper}>
                <TouchableOpacity
                  style={s.listRow}
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push({ pathname: '/todo/list-items', params: { listId: item.id } })
                  }
                >
                  <View style={[s.listIconCircle, { backgroundColor: item.color || '#e5e7eb' }]}>
                    {!!item.icon && <Ionicons name={item.icon as any} size={16} color="#fff" />}
                  </View>
                  <View style={s.listInfo}>
                    <Text style={s.listName}>{item.name}</Text>
                    <Text style={s.listMeta}>
                      {activeCount} active task{activeCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={s.listCountBadge}>
                    <Text style={s.listCount}>{activeCount}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#c7c7cc" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            );
          }}
          renderHiddenItem={({ item }) => (
            <View style={s.rowBack}>
              <TouchableOpacity
                style={s.deleteAction}
                onPress={() => deleteList(item.id)}
              >
                <Ionicons name="trash" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          rightOpenValue={-76}
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

        {/* Empty state for lists */}
        {lists.length === 0 && (
          <TouchableOpacity style={s.emptyListCard} onPress={() => setListModalOpen(true)}>
            <Ionicons name="folder-open-outline" size={32} color="#a5b4fc" />
            <Text style={s.emptyListTitle}>No lists yet</Text>
            <Text style={s.emptyListHint}>Tap to create your first list</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        activeOpacity={0.9}
        onPress={() => router.push('/todo/new')}
      >
        <LinearGradient
          colors={['#6366f1', '#4f46e5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.fabGradient}
        >
          <Ionicons name="add" size={26} color="#fff" />
          <Text style={s.fabText}>New Task</Text>
        </LinearGradient>
      </TouchableOpacity>

      <CreateListModal
        visible={listModalOpen}
        onClose={() => setListModalOpen(false)}
      />
    </SafeAreaView>
  );
}

function FilterChip({
  icon,
  label,
  count,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  count: number;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.filterChip} activeOpacity={0.8} onPress={onPress}>
      <View style={[s.filterIconWrap, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={s.filterCount}>{count}</Text>
      <Text style={s.filterLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e1b4b',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Progress banner
  progressBanner: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#6366f1',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  progressLeft: {
    flex: 1,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  progressCount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  progressTotal: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 3,
    minWidth: 6,
  },
  progressRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  progressPct: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },

  // Filter chips
  filtersRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  filterChip: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  filterIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  filterCount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e1b4b',
  },
  filterLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 1,
    fontWeight: '600',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e1b4b',
  },
  addListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addListText: {
    color: '#6366f1',
    fontWeight: '700',
    fontSize: 13,
  },

  // List rows
  rowWrapper: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  listIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e1b4b',
  },
  listMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 1,
  },
  listCountBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  listCount: {
    color: '#6366f1',
    fontSize: 13,
    fontWeight: '800',
  },

  // Swipe delete
  rowBack: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    paddingRight: 4,
  },
  deleteAction: {
    width: 70,
    height: '88%',
    backgroundColor: '#ef4444',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },

  // Empty state
  emptyListCard: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e0e7ff',
    borderStyle: 'dashed',
  },
  emptyListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366f1',
    marginTop: 8,
  },
  emptyListHint: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 28,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 6,
  },
  fabText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
