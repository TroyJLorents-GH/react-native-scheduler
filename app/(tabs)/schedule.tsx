import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TodoAgendaScreen from '../../components/TodoAgendaScreen';
import TodoCalendarDayView from '../../components/TodoCalendarDayView';
import { useTheme } from '../../context/ThemeContext';
import { useTodoContext } from '../../context/TodoContext';

export default function ScheduleTab() {
  const { todos } = useTodoContext();
  const { colors, isDark } = useTheme();

  // Include tasks with due dates OR recurring tasks (which may use createdAt as start date)
  const scheduledTodos = todos.filter(t => t.dueDate || (t.repeat && t.repeat !== 'Never'));

  const [viewMode, setViewMode] = useState<'vertical' | 'calendar'>('vertical');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleAddNew = () => {
    router.push('/todo/new');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.toggleBar}>
        <TouchableOpacity onPress={() => setViewMode('vertical')} style={[styles.toggleBtn, { backgroundColor: colors.surface }, viewMode === 'vertical' && { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[styles.toggleText, { color: colors.textSecondary }, viewMode === 'vertical' && { color: colors.text, fontWeight: '600' }]}>Vertical View</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewMode('calendar')} style={[styles.toggleBtn, { backgroundColor: colors.surface }, viewMode === 'calendar' && { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[styles.toggleText, { color: colors.textSecondary }, viewMode === 'calendar' && { color: colors.text, fontWeight: '600' }]}>Calendar View</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'vertical' ? (
        <TodoAgendaScreen todos={scheduledTodos} />
      ) : (
        <TodoCalendarDayView 
          todos={scheduledTodos} 
          date={selectedDate} 
          onDateChange={setSelectedDate} 
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleAddNew}>
        <Ionicons name="add" size={36} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  toggleBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#14151a',
  },
  toggleActive: {
    backgroundColor: '#2a2f38',
  },
  toggleText: {
    color: '#9aa3b2',
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 100, // Raised to clear the floating tab bar
    right: 24,
    backgroundColor: '#556de8',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#556de8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
  },
});