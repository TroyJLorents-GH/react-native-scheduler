import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useFocusContext } from '../../context/FocusContext';
import { useListContext } from '../../context/ListContext';
import { Todo, useTodoContext } from '../../context/TodoContext';
import { getTasksForDate, getTasksDueTomorrow, isTaskOverdue, isTaskCompletedForDate, shouldTaskAppearOnDate } from '../../utils/recurring';
import { getFocusMinutesSince } from '../../utils/stats';

export default function HomeDashboard() {
  const { todos, toggleTodo } = useTodoContext();
  const { startTaskSession } = useFocusContext();
  const { lists } = useListContext();
  // const { user, isAuthenticated, isLoading: authLoading, signIn, signOut } = useGoogleAuth();
  
  // Greeting pulls username from Settings
  const [username, setUsername] = useState('');
  const [weeklyMin, setWeeklyMin] = useState<number>(0);
  const [weeklyGoalMin, setWeeklyGoalMin] = useState<number>(300);
  const refreshWeekly = useCallback(async () => {
    setWeeklyMin(await getFocusMinutesSince(7));
    try {
      const raw = await AsyncStorage.getItem('scheduler.settings.v1');
      if (raw) {
        const s = JSON.parse(raw);
        const daily = Number(s?.dailyFocusGoalMin) || 0;
        setWeeklyGoalMin(daily > 0 ? daily * 7 : 300);
      } else {
        setWeeklyGoalMin(300);
      }
    } catch { setWeeklyGoalMin(300); }
  }, []);
  useEffect(() => { refreshWeekly(); }, [refreshWeekly]);
  useFocusEffect(useCallback(() => { refreshWeekly(); }, [refreshWeekly]));
  const loadUsername = useCallback(async () => {
    try { const u = await AsyncStorage.getItem('account.username'); setUsername(u || ''); } catch {}
  }, []);
  useEffect(() => { loadUsername(); }, [loadUsername]);
  useFocusEffect(useCallback(() => { loadUsername(); }, [loadUsername]));

  // Create stable date references using useMemo
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  
  const tomorrow = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d;
  }, [today]);
  
  // Today's tasks - using recurring logic to include tasks that repeat today
  const todaysTodos = useMemo(() => getTasksForDate(todos, today), [todos, today]);
  
  // Tomorrow's tasks - using recurring logic
  const tomorrowTodos = useMemo(() => getTasksDueTomorrow(todos), [todos]);
  
  // Overdue tasks - only non-recurring tasks that are past due
  const overdueTodos = useMemo(() => todos.filter(t => isTaskOverdue(t)), [todos]);
  
  // Upcoming tasks - tasks with due dates after tomorrow (non-recurring only for this view)
  const upcomingTodos = useMemo(() => todos.filter(t => {
    if (t.done || !t.dueDate) return false;
    if (t.repeat && t.repeat !== 'Never') return false; // Recurring tasks show on their scheduled days
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate > tomorrow;
  }), [todos, tomorrow]);
  
  // Daily Goals: only tasks due today (no overdue rollovers) - includes recurring
  const todaysPoolAll = useMemo(() => {
    // Get all tasks that should appear today (including recurring)
    const tasksForToday = getTasksForDate(todos, today);
    // Also include completed recurring tasks for today
    const completedRecurringToday = todos.filter(todo => {
      if (!todo.repeat || todo.repeat === 'Never') return false;
      return isTaskCompletedForDate(todo, today) && shouldTaskAppearOnDate(todo, today);
    });
    // Also include completed non-recurring tasks that were due today
    const completedNonRecurringToday = todos.filter(todo => {
      if (todo.repeat && todo.repeat !== 'Never') return false;
      if (!todo.done || !todo.dueDate) return false;
      const dueDate = new Date(todo.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });
    // Combine and deduplicate
    const allIds = new Set([
      ...tasksForToday.map(t => t.id), 
      ...completedRecurringToday.map(t => t.id),
      ...completedNonRecurringToday.map(t => t.id)
    ]);
    return todos.filter(t => allIds.has(t.id));
  }, [todos, today]);
  const completedCount = todaysPoolAll.filter(t => t.done).length;
  const totalCount = todaysPoolAll.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // state for collapsible sections
  const [showTomorrow, setShowTomorrow] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [showOverdue, setShowOverdue] = useState(false);

  // Reordering only; no cross-day move from Home

  // --- Reorder state for today's list ---
  const [reorderMode, setReorderMode] = useState(false);
  const [manualOrderIds, setManualOrderIds] = useState<string[] | null>(null);

  const orderKey = `home_order_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(orderKey);
        if (saved) setManualOrderIds(JSON.parse(saved));
        else setManualOrderIds(null);
      } catch {}
    })();
  }, [orderKey]);

  const saveOrder = async (ids: string[]) => {
    try {
      await AsyncStorage.setItem(orderKey, JSON.stringify(ids));
    } catch {}
  };

  const moveItem = (id: string, direction: 'up'|'down', renderedIds: string[]) => {
    const current = manualOrderIds ?? renderedIds;
    const list = [...current];
    const idx = list.indexOf(id);
    if (idx < 0) return;
    const swapWith = direction === 'up' ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= renderedIds.length) return;
    // Ensure both ids exist in list; if not, seed from renderedIds
    renderedIds.forEach(rid => { if (!list.includes(rid)) list.push(rid); });
    const temp = list[idx];
    list[idx] = list[swapWith];
    list[swapWith] = temp;
    setManualOrderIds(list);
    saveOrder(list);
  };

  const displayTodos = useMemo(() => {
    // Build default order by time-of-day to seed new tasks
    const timeKey = (d?: Date) => {
      if (!d) return Number.POSITIVE_INFINITY;
      const dt = new Date(d);
      return dt.getHours() * 60 + dt.getMinutes();
    };
    const defaultSorted = [...todaysTodos].sort((a,b) => timeKey(a.dueDate as Date) - timeKey(b.dueDate as Date));
    const idToTodo = new Map(defaultSorted.map(t => [t.id, t] as const));
    const baseIds = defaultSorted.map(t => t.id);
    const order = (manualOrderIds ?? []).filter(id => idToTodo.has(id));
    // Append any new tasks not in saved order
    baseIds.forEach(id => { if (!order.includes(id)) order.push(id); });
    return order.map(id => idToTodo.get(id)!).filter(Boolean);
  }, [todaysTodos, manualOrderIds]);

  // Duration helpers
  const getDurationMin = (t: Todo) => {
    if (t.pomodoro?.enabled) {
      const w = t.pomodoro.workTime || 25;
      const unit = t.pomodoro.workUnit || 'min';
      return Math.max(15, unit === 'hour' ? w * 60 : w);
    }
    return Math.max(15, t.durationMinutes || 60);
  };
  const fmtHours = (mins: number) => `${(mins / 60).toFixed(1)}h`;
  const todaySummary = fmtHours(todaysTodos.reduce((sum, t) => sum + getDurationMin(t), 0));
  const tomorrowSummary = fmtHours(tomorrowTodos.reduce((sum, t) => sum + getDurationMin(t), 0));
  const upcomingSummary = fmtHours(upcomingTodos.reduce((sum, t) => sum + getDurationMin(t), 0));
  const overdueSummary = fmtHours(overdueTodos.reduce((sum, t) => sum + getDurationMin(t), 0));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: 12 }]}> 

      {/* Greeting */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#323447', fontSize: 28, fontWeight: '800' }}>
          Hello{username ? `, ${username}` : ''}
        </Text>
      </View>

      {/* Account Info moved to Settings */}

      {/* Daily Goals */}
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.85} 
        onPress={() => router.push('/todays-tasks')}
        accessibilityLabel={`Daily Goals: ${completionPct}% complete, ${completedCount} of ${totalCount} tasks done`}
        accessibilityRole="button"
      >
        <Text style={styles.sectionTitle}>
          <MaterialCommunityIcons name="target" size={21} color="#ff9a62" />  Daily Goals
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#323447', fontSize: 22, fontWeight: 'bold' }}>{completionPct}%</Text>
            <Text style={{ color: '#7a7c96' }}>{completedCount} of {totalCount} completed</Text>
          </View>
          <View style={{ width: 140, height: 10, backgroundColor: '#f0f1f6', borderRadius: 6, overflow: 'hidden' }}>
            <View style={{ width: `${completionPct}%`, height: '100%', backgroundColor: '#67c99a' }} />
          </View>
            </View>
        </TouchableOpacity>

      {/* Today's Schedule removed */}

      {/* Weekly Focus (no nav to Stats for now) */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.sectionTitle}><MaterialCommunityIcons name="timer-sand" size={21} color="#556de8" />  Weekly Focus</Text>
          <Text style={{ color: '#7a7c96', fontWeight: '600' }}>{Math.floor(weeklyMin/60)}h {weeklyMin%60}m</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          {(() => {
            const g = Math.max(1, weeklyGoalMin || 300); // default if not set
            const pct = Math.min(1, weeklyMin / g);
            const size = 64; const r = 26; const cx = size/2; const cy = size/2; const C = 2*Math.PI*r; const dash = `${(pct*C).toFixed(1)} ${C.toFixed(1)}`;
            return (
              <View style={{ width: size, height: size, marginRight: 12 }}>
                <Svg width={size} height={size}>
                  <Circle cx={cx} cy={cy} r={r} stroke="#e5e7f3" strokeWidth={8} fill="none" />
                  <Circle cx={cx} cy={cy} r={r} stroke="#556de8" strokeWidth={8} strokeDasharray={dash} strokeLinecap="round" fill="none" transform={`rotate(-90 ${cx} ${cy})`} />
                </Svg>
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#556de8', fontWeight: '700' }}>{Math.round(pct*100)}%</Text>
                </View>
              </View>
            );
          })()}
          <View>
            <Text style={{ color: '#323447', fontWeight: '700' }}>Last 7 days</Text>
            <Text style={{ color: '#7a7c96' }}>{weeklyMin} min • Goal {weeklyGoalMin} min</Text>
          </View>
        </View>
      </View>

      {/* Today's Tasks */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="check-circle-outline" size={21} color="#67c99a" />
            <Text style={[styles.sectionTitle, { marginLeft: 6 }]}>Today's Tasks</Text>
          </View>
          <Text style={styles.metricsText}>{todaySummary}  {todaysTodos.length}</Text>
        </View>
        {todaysTodos.length === 0 ? (
          <Text style={styles.emptyText}>No to-dos for today.</Text>
        ) : (
          <DraggableFlatList<Todo>
            data={displayTodos}
            keyExtractor={(item: Todo) => item.id}
            scrollEnabled={false}
            containerStyle={{}}
            onDragBegin={() => setReorderMode(true)}
            onDragEnd={({ data }: { data: Todo[] }) => {
              const subsetIds = data.map(t => t.id);
              const baseAllIds = (manualOrderIds ?? displayTodos.map(t=>t.id)).filter(id => displayTodos.some(t=>t.id===id));
              const others = baseAllIds.filter(id => !subsetIds.includes(id));
              const newIds = subsetIds.concat(others);
              setManualOrderIds(newIds);
              saveOrder(newIds);
              setReorderMode(false);
            }}
            renderItem={({ item, drag, isActive }: { item: Todo; drag: () => void; isActive: boolean }) => (
              <TouchableOpacity 
                style={[styles.todoItem, isActive && { opacity: 0.9 }]} 
                onLongPress={drag}
                activeOpacity={0.8}
                onPress={() => {
                  if (item.listId === 'focus') {
                    router.push({ pathname: '/(tabs)/today', params: { focusTaskId: item.id } });
                  } else {
                    router.push({ pathname: '/task-details', params: { id: item.id } });
                  }
                }}
                accessibilityLabel={`Task: ${item.text}${item.done ? ', completed' : ''}${item.priority ? `, ${item.priority} priority` : ''}`}
                accessibilityRole="button"
                accessibilityHint="Double tap to view details, long press to reorder"
              >
                {(() => {
                // Check completion status for today specifically (for recurring tasks)
                const isCompletedToday = item.repeat && item.repeat !== 'Never'
                  ? isTaskCompletedForDate(item, today)
                  : item.done;
                return (
                  <>
                    <TouchableOpacity 
                      onPress={() => toggleTodo(item.id, today)} 
                      style={{ marginRight: 8, marginTop: 2 }}
                      accessibilityLabel={isCompletedToday ? 'Mark task as incomplete' : 'Mark task as complete'}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isCompletedToday }}
                    >
                      <Ionicons name={isCompletedToday ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={isCompletedToday ? '#67c99a' : '#bbb'} />
                    </TouchableOpacity>
                    <View style={styles.todoContent}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.todoText, isCompletedToday && { textDecorationLine: 'line-through', color: '#aaa' }]}>
                          {item.text}
                        </Text>
                        {item.repeat && item.repeat !== 'Never' && (
                          <Ionicons name="repeat" size={14} color="#007AFF" />
                        )}
                      </View>
                      <Text style={styles.todoNotes}>
                        {lists.find(l => l.id === item.listId)?.name || 'Reminders'}
                      </Text>
                    </View>
                  </>
                );
              })()}
                <TouchableOpacity 
                  onPress={() => {
                    // Start focus session immediately
                    const workMinutes = item.pomodoro?.workTime || 25;
                    startTaskSession({ id: item.id, title: item.text, workMinutes });
                  }}
                  accessibilityLabel={`Start focus session for ${item.text}`}
                  accessibilityRole="button"
                >
                  <Ionicons name={'play-circle'} size={26} color={'#67c99a'} style={{ marginLeft: 9 }} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}
        <View style={styles.addButtonsRow}>
          <TouchableOpacity style={[styles.addBtn, styles.addBtnHalf]} onPress={() => router.push('/todo/new')}>
            <Ionicons name="add-circle" size={24} color="#67c99a" />
          <Text style={styles.addBtnText}>Add To-Do</Text>
        </TouchableOpacity>
          <TouchableOpacity style={[styles.addBtn, styles.addBtnHalf]} onPress={() => router.push('/focus/new')}>
            <Ionicons name="timer-outline" size={24} color="#67c99a" />
            <Text style={styles.addBtnText}>Add Focus Time</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tomorrow (collapsible) */}
      <View style={styles.card}>
        <TouchableOpacity onPress={() => setShowTomorrow(!showTomorrow)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="weather-sunset" size={21} color="#f59e0b" />
            <Text style={[styles.sectionTitle, { marginLeft: 6 }]}>Tomorrow</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.metricsText}>{tomorrowSummary}  {tomorrowTodos.length}</Text>
            <Ionicons name={showTomorrow ? 'chevron-up' : 'chevron-down'} size={20} color="#7a7c96" style={{ marginLeft: 8 }} />
          </View>
        </TouchableOpacity>
        {showTomorrow && (
          tomorrowTodos.length === 0 ? <Text style={styles.emptyText}>No tasks for tomorrow.</Text> :
          tomorrowTodos.map(item => (
            <HomeRow key={item.id} item={item} listsName={lists.find(l=>l.id===item.listId)?.name} onToggle={() => toggleTodo(item.id, tomorrow)} forDate={tomorrow} />
          ))
        )}
      </View>

      {/* Upcoming (collapsible) */}
      <View style={styles.card}>
        <TouchableOpacity onPress={() => setShowUpcoming(!showUpcoming)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="calendar-outline" size={21} color="#3b82f6" />
            <Text style={[styles.sectionTitle, { marginLeft: 6 }]}>Upcoming</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.metricsText}>{upcomingSummary}  {upcomingTodos.length}</Text>
            <Ionicons name={showUpcoming ? 'chevron-up' : 'chevron-down'} size={20} color="#7a7c96" style={{ marginLeft: 8 }} />
          </View>
        </TouchableOpacity>
        {showUpcoming && (
          upcomingTodos.length === 0 ? <Text style={styles.emptyText}>No upcoming tasks.</Text> :
          upcomingTodos.map(item => (
            <HomeRow key={item.id} item={item} listsName={lists.find(l=>l.id===item.listId)?.name} onToggle={() => toggleTodo(item.id)} />
          ))
        )}
      </View>

      {/* Overdue (collapsible) */}
      <View style={styles.card}>
        <TouchableOpacity onPress={() => setShowOverdue(!showOverdue)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="alert-circle-outline" size={21} color="#ef4444" />
            <Text style={[styles.sectionTitle, { marginLeft: 6 }]}>Overdue</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.metricsText}>{overdueSummary}  {overdueTodos.length}</Text>
            <Ionicons name={showOverdue ? 'chevron-up' : 'chevron-down'} size={20} color="#7a7c96" style={{ marginLeft: 8 }} />
          </View>
        </TouchableOpacity>
        {showOverdue && (
          overdueTodos.length === 0 ? <Text style={styles.emptyText}>Nothing overdue. Nicely done!</Text> :
          overdueTodos.map(item => (
            <HomeRow key={item.id} item={item} listsName={lists.find(l=>l.id===item.listId)?.name} onToggle={() => toggleTodo(item.id)} />
          ))
        )}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    paddingBottom: 80,
    backgroundColor: '#f5f8ff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 26,
    shadowColor: '#222',
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 3,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#a4a4a4',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#323447',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#a4a4a4',
    marginBottom: 12,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  signOutButton: {
    backgroundColor: '#f1f3f4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  signOutButtonText: {
    color: '#5f6368',
    fontSize: 14,
    fontWeight: '500',
  },
  weatherCity: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#323447' 
  },
  weatherTemp: { 
    fontSize: 27, 
    fontWeight: 'bold', 
    color: '#ffb64f' 
  },
  weatherDesc: { 
    color: '#a4a4a4', 
    fontSize: 16, 
    marginTop: 5,
    textTransform: 'capitalize',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  weatherDetail: {
    alignItems: 'center',
  },
  weatherDetailLabel: {
    color: '#a4a4a4',
    fontSize: 12,
    marginBottom: 2,
  },
  weatherDetailValue: {
    color: '#323447',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: { 
    fontSize: 19, 
    fontWeight: 'bold', 
    marginBottom: 12, 
    color: '#323447', 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  emptyText: { 
    color: '#a7aac6', 
    fontSize: 16, 
    fontStyle: 'italic', 
    marginTop: 6 
  },
  eventItem: { 
    marginBottom: 12 
  },
  eventTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#3d61b2' 
  },
  eventTime: { 
    color: '#7a7c96', 
    fontSize: 14 
  },
  eventLoc: { 
    color: '#8cc1b8', 
    fontSize: 13 
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 5,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    color: '#222',
    marginBottom: 2,
  },
  todoNotes: {
    fontSize: 14,
    color: '#a4a4a4',
    fontStyle: 'italic',
  },
  moreText: {
    color: '#67c99a',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  addButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  addBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  addBtnHalf: {
    flex: 1,
  },
  addBtnText: { 
    color: '#67c99a', 
    fontWeight: '600', 
    marginLeft: 6, 
    fontSize: 14 
  },
  inputLabel: { color: '#7a7c96', marginTop: 6, marginBottom: 4 },
  input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#e9ecef', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#222' },
  metricsText: { color: '#7a7c96', fontWeight: '600' },
});

function HomeRow({ item, listsName, onToggle, forDate }: { item: Todo; listsName?: string; onToggle: () => void; forDate?: Date }) {
  // For recurring tasks, check completion for the specific date
  const isCompleted = item.repeat && item.repeat !== 'Never' && forDate
    ? isTaskCompletedForDate(item, forDate)
    : item.done;
    
  return (
    <TouchableOpacity 
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 5,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: '#f8f9fa',
      }}
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/task-details', params: { id: item.id } })}
    >
      <TouchableOpacity onPress={onToggle} style={{ marginRight: 8, marginTop: 2 }}>
        <Ionicons name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={isCompleted ? '#67c99a' : '#bbb'} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[{ fontSize: 16, color: '#222', marginBottom: 2 }, isCompleted && { textDecorationLine: 'line-through', color: '#aaa' }]} numberOfLines={1}>{item.text}</Text>
          {item.repeat && item.repeat !== 'Never' && (
            <Ionicons name="repeat" size={14} color="#007AFF" />
          )}
        </View>
        <Text style={{ fontSize: 14, color: '#a4a4a4', fontStyle: 'italic' }} numberOfLines={1}>{listsName || 'Reminders'}</Text>
      </View>
      <Ionicons name={'play-circle'} size={26} color={'#67c99a'} style={{ marginLeft: 9 }} />
    </TouchableOpacity>
  );
}
