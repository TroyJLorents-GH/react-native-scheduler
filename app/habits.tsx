import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Todo, useTodoContext } from '../context/TodoContext';
import { getHabitCalendar, getHabitCompletionRate, getHabitStreak, getHabitTasks, isTaskCompletedForDate } from '../utils/recurring';

export default function HabitsScreen() {
  const { todos, toggleTodo } = useTodoContext();
  const { colors, isDark } = useTheme();

  const habits = useMemo(() => {
    const habitTasks = getHabitTasks(todos);
    return habitTasks.map(t => ({
      task: t,
      streak: getHabitStreak(t),
      rate: getHabitCompletionRate(t, 30),
      calendar: getHabitCalendar(t, 28), // 4 weeks
      completedToday: isTaskCompletedForDate(t, new Date()),
    })).sort((a, b) => b.streak - a.streak); // highest streak first
  }, [todos]);

  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
  const avgRate = habits.length > 0 ? Math.round(habits.reduce((s, h) => s + h.rate, 0) / habits.length * 100) : 0;
  const completedToday = habits.filter(h => h.completedToday).length;

  const renderHabit = ({ item }: { item: typeof habits[0] }) => {
    const { task, streak, rate, calendar, completedToday: done } = item;

    return (
      <View style={[styles.habitCard, { backgroundColor: colors.card }]}>
        {/* Header row */}
        <View style={styles.habitHeader}>
          <TouchableOpacity
            onPress={() => toggleTodo(task.id, new Date())}
            style={{ marginRight: 10 }}
          >
            <Ionicons
              name={done ? 'checkmark-circle' : 'ellipse-outline'}
              size={26}
              color={done ? colors.accent : colors.textTertiary}
            />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.habitName, { color: colors.text }]} numberOfLines={1}>{task.text}</Text>
            <Text style={[styles.habitRepeat, { color: colors.textSecondary }]}>
              {task.repeat} {task.dueTime ? `at ${new Date(task.dueTime).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}` : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/task-details', params: { id: task.id } })}
            style={{ padding: 4 }}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="fire" size={18} color="#ff9a62" />
            <Text style={[styles.statNum, { color: colors.text }]}>{streak}</Text>
            <Text style={[styles.statUnit, { color: colors.textTertiary }]}>streak</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Ionicons name="pie-chart-outline" size={16} color="#556de8" />
            <Text style={[styles.statNum, { color: colors.text }]}>{Math.round(rate * 100)}%</Text>
            <Text style={[styles.statUnit, { color: colors.textTertiary }]}>30d rate</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Ionicons name="checkmark-done" size={16} color={colors.accent} />
            <Text style={[styles.statNum, { color: colors.text }]}>{task.completedDates?.length || 0}</Text>
            <Text style={[styles.statUnit, { color: colors.textTertiary }]}>total</Text>
          </View>
        </View>

        {/* Mini calendar heatmap (4 weeks) */}
        <View style={styles.calendarWrap}>
          {calendar.map((day, i) => {
            let bgColor: string;
            if (day.completed) {
              bgColor = colors.accent;
            } else if (day.scheduled) {
              bgColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
            } else {
              bgColor = 'transparent';
            }
            return (
              <View
                key={day.date}
                style={[
                  styles.calendarDot,
                  {
                    backgroundColor: bgColor,
                    borderWidth: day.scheduled && !day.completed ? 1 : 0,
                    borderColor: colors.border,
                  },
                ]}
              />
            );
          })}
        </View>
        <View style={styles.calendarLabels}>
          <Text style={[styles.calendarLabelText, { color: colors.textTertiary }]}>4 weeks ago</Text>
          <Text style={[styles.calendarLabelText, { color: colors.textTertiary }]}>Today</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: colors.text }]}>Habits</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="fire" size={22} color="#ff9a62" />
          <Text style={[styles.summaryValue, { color: colors.text }]}>{bestStreak}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Best Streak</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Ionicons name="pie-chart-outline" size={22} color="#556de8" />
          <Text style={[styles.summaryValue, { color: colors.text }]}>{avgRate}%</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Avg Rate</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Ionicons name="today-outline" size={22} color={colors.accent} />
          <Text style={[styles.summaryValue, { color: colors.text }]}>{completedToday}/{habits.length}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Today</Text>
        </View>
      </View>

      {/* Habit list */}
      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="repeat" size={48} color={colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No habits yet</Text>
          <Text style={[styles.emptyHint, { color: colors.textTertiary }]}>
            Create a recurring task to start tracking habits
          </Text>
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/todo/new')}
          >
            <Text style={styles.createBtnText}>Create Task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={item => item.task.id}
          renderItem={renderHabit}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  header: { fontSize: 22, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 16 },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryValue: { fontSize: 20, fontWeight: '800', marginTop: 6 },
  summaryLabel: { fontSize: 11, marginTop: 2 },
  habitCard: {
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  habitHeader: { flexDirection: 'row', alignItems: 'center' },
  habitName: { fontSize: 16, fontWeight: '700' },
  habitRepeat: { fontSize: 13, marginTop: 1 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  statNum: { fontSize: 16, fontWeight: '800' },
  statUnit: { fontSize: 11 },
  statDivider: { width: 1, height: 24 },
  calendarWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 14,
    justifyContent: 'flex-start',
  },
  calendarDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  calendarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  calendarLabelText: { fontSize: 10 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptyHint: { fontSize: 14, marginTop: 4, textAlign: 'center', paddingHorizontal: 40 },
  createBtn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  createBtnText: { color: '#0b0b0c', fontWeight: '700', fontSize: 15 },
});
