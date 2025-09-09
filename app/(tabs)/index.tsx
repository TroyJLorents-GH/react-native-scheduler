import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useListContext } from '../../context/ListContext';
import { Todo, useTodoContext } from '../../context/TodoContext';
import { getCurrentWeather, WeatherData } from '../../services/weatherService';

export default function HomeDashboard() {
  const { todos, toggleTodo } = useTodoContext();
  const { lists } = useListContext();
  // const { user, isAuthenticated, isLoading: authLoading, signIn, signOut } = useGoogleAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const today = moment();
  const startOfToday = today.clone().startOf('day');
  // Today's tasks with rollover from past days (incomplete)
  const todaysTodos = todos.filter(todo => {
    if (todo.done) return false;
    if (!todo.dueDate) return false;
    const due = moment(todo.dueDate);
    // Due today OR incomplete and past due (roll over)
    const isToday = due.isSame(today, 'day') || due.isBefore(startOfToday);
    
    
    return isToday;
  });
  // Daily Goals: match the pool shown in Today's Tasks (due today OR past-due rollovers)
  const todaysPoolAll = todos.filter(todo => {
    if (!todo.dueDate) return false;
    const due = moment(todo.dueDate);
    return due.isSame(today, 'day') || due.isBefore(startOfToday);
  });
  const completedCount = todaysPoolAll.filter(t => t.done).length;
  const totalCount = todaysPoolAll.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  useEffect(() => {
    loadWeather();
  }, []);

  // --- Reorder state for today's list ---
  const [reorderMode, setReorderMode] = useState(false);
  const [manualOrderIds, setManualOrderIds] = useState<string[] | null>(null);

  const orderKey = `home_order_${today.format('YYYY-MM-DD')}`;

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

  const loadWeather = async () => {
    try {
      setLoading(true);
      const weatherData = await getCurrentWeather(); // No parameters needed
      setWeather(weatherData);
    } catch (error) {
      console.error('Error loading weather:', error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: 12 }]}> 


      {/* Weather Card */}
      <View style={styles.card}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffb64f" />
            <Text style={styles.loadingText}>Loading weather...</Text>
          </View>
        ) : weather ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons 
                name={weather.icon as any} 
                size={42} 
                color="#ffb64f" 
                style={{ marginRight: 10 }} 
              />
              <View>
                <Text style={styles.weatherCity}>{weather.city}</Text>
                <Text style={styles.weatherTemp}>{weather.temp}</Text>
              </View>
            </View>
            <Text style={styles.weatherDesc}>{weather.desc}</Text>
            
            {/* Additional weather details */}
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetail}>
                <Text style={styles.weatherDetailLabel}>Feels like</Text>
                <Text style={styles.weatherDetailValue}>{weather.feelsLike}</Text>
              </View>
              <View style={styles.weatherDetail}>
                <Text style={styles.weatherDetailLabel}>Humidity</Text>
                <Text style={styles.weatherDetailValue}>{weather.humidity}%</Text>
              </View>
              <View style={styles.weatherDetail}>
                <Text style={styles.weatherDetailLabel}>Wind</Text>
                <Text style={styles.weatherDetailValue}>{weather.windSpeed} mph</Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.errorText}>Unable to load weather data</Text>
        )}
      </View>

      {/* Daily Goals */}
      <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => router.push('/todo/todays-tasks')}>
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

      {/* Today's Tasks */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.sectionTitle}>
          <MaterialCommunityIcons name="check-circle-outline" size={21} color="#67c99a" />  Today's Tasks
          </Text>
          {displayTodos.length > 0 && (
            <TouchableOpacity onPress={() => setReorderMode(!reorderMode)}>
              <Text style={{ color: '#556de8', fontWeight: '600' }}>{reorderMode ? 'Done' : 'Reorder'}</Text>
            </TouchableOpacity>
          )}
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
                  // Check if this is a focus task (in Focus list)
                  if (item.listId === 'focus') {
                    // Navigate to Focus tab with task pre-loaded using ID
                    router.push({ pathname: '/(tabs)/today', params: { focusTaskId: item.id } });
                  } else {
                    // Regular task - go to task details
                    router.push({ pathname: '/todo/task-details', params: { id: item.id } });
                  }
                }}
              >
                <TouchableOpacity onPress={() => toggleTodo(item.id)} style={{ marginRight: 8, marginTop: 2 }}>
                  <Ionicons name={item.done ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={item.done ? '#67c99a' : '#bbb'} />
                </TouchableOpacity>
                <View style={styles.todoContent}>
                  <Text style={[styles.todoText, item.done && { textDecorationLine: 'line-through', color: '#aaa' }]}>
                    {item.text}
                  </Text>
                  <Text style={styles.todoNotes}>
                    {lists.find(l => l.id === item.listId)?.name || 'Reminders'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => {
                  // Check if this is a focus task (in Focus list)
                  if (item.listId === 'focus') {
                    // Navigate to Focus tab with task pre-loaded using ID
                    router.push({ pathname: '/(tabs)/today', params: { focusTaskId: item.id } });
                  } else {
                    // Regular task - go to task details
                    router.push({ pathname: '/todo/task-details', params: { id: item.id, autostart: '1' } });
                  }
                }}>
                  <Ionicons name={'play-circle'} size={22} color={'#67c99a'} style={{ marginLeft: 9 }} />
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
});
