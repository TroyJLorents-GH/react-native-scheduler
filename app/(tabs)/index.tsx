import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTodoContext } from '../../context/TodoContext';
import { getCurrentWeather, WeatherData } from '../../services/weatherService';

export default function HomeDashboard() {
  const { todos } = useTodoContext();
  // const { user, isAuthenticated, isLoading: authLoading, signIn, signOut } = useGoogleAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const today = moment();
  // Get today's todos (not completed)
  const todaysTodos = todos.filter(todo => {
    if (todo.done) return false; // Skip completed todos
    if (!todo.dueDate) return false;
    return moment(todo.dueDate).isSame(today, 'day');
  });
  // Completion stats
  const todaysTodosAll = todos.filter(todo => todo.dueDate && moment(todo.dueDate).isSame(today, 'day'));
  const completedCount = todaysTodosAll.filter(t => t.done).length;
  const totalCount = todaysTodosAll.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  useEffect(() => {
    loadWeather();
  }, []);

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
    <ScrollView contentContainerStyle={styles.container}>


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
      <View style={styles.card}>
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
      </View>

      {/* Today's Schedule removed */}

      {/* Today's To-Dos */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          <MaterialCommunityIcons name="check-circle-outline" size={21} color="#67c99a" />  Today's To-Do
        </Text>
        {todaysTodos.length === 0 ? (
          <Text style={styles.emptyText}>No to-dos for today.</Text>
        ) : (
          todaysTodos.slice(0, 5).map(todo => ( // Show only first 5 todos
            <TouchableOpacity 
              key={todo.id} 
              style={styles.todoItem}
              onPress={() => router.push({ pathname: '/todo/task-details', params: { id: todo.id } })}
              activeOpacity={0.7}
            >
              <Ionicons
                name={todo.done ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={todo.done ? '#67c99a' : '#aaa'}
                style={{ marginRight: 9 }}
              />
              <View style={styles.todoContent}>
                <Text style={[
                  styles.todoText,
                  todo.done && { textDecorationLine: 'line-through', color: '#aaa' }
                ]}>
                  {todo.text}
                </Text>
                {todo.notes && (
                  <Text style={styles.todoNotes}>{todo.notes}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
        {todaysTodos.length > 5 && (
          <Text style={styles.moreText}>+{todaysTodos.length - 5} more to-dos</Text>
        )}
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/todo/new')}>
          <Ionicons name="add-circle" size={28} color="#67c99a" />
          <Text style={styles.addBtnText}>Add To-Do</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  addBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10 
  },
  addBtnText: { 
    color: '#556de8', 
    fontWeight: 'bold', 
    marginLeft: 7, 
    fontSize: 16 
  },
});
