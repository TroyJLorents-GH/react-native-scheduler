import SmartListScreen from '@/components/SmartListScreen';
import { shouldTaskAppearOnDate, isTaskCompletedForDate } from '@/utils/recurring';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScheduledTodosScreen() {
  // Create stable today reference
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  
  // Filter function that uses recurring logic
  const filterToday = useMemo(() => (todo: any) => {
    // Check if task should appear today (including recurring)
    if (!shouldTaskAppearOnDate(todo, today)) return false;
    
    // For recurring tasks, check if completed for today specifically
    if (todo.repeat && todo.repeat !== 'Never') {
      return !isTaskCompletedForDate(todo, today);
    }
    
    // For non-recurring tasks, check done flag
    return !todo.done;
  }, [today]);
  
  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.replace('/todo' as any)} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={s.title}>Today's Tasks</Text>
        <View style={s.placeholder} />
      </View>
      
      <SmartListScreen
        title=""
        filter={filterToday}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f8ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
});
