import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useListContext } from '../context/ListContext';
import { useTheme } from '../context/ThemeContext';
import { Todo, useTodoContext } from '../context/TodoContext';

export default function SearchScreen() {
  const { todos } = useTodoContext();
  const { lists } = useListContext();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  const listNameMap = useMemo(() => {
    const map = new Map<string, string>();
    lists.forEach(l => map.set(l.id, l.name));
    return map;
  }, [lists]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return [];

    return todos.filter(t => {
      if (t.text.toLowerCase().includes(q)) return true;
      if (t.notes?.toLowerCase().includes(q)) return true;
      if (t.category?.toLowerCase().includes(q)) return true;
      if (t.location?.toLowerCase().includes(q)) return true;
      if (t.tags?.some(tag => tag.toLowerCase().includes(q))) return true;
      const listName = listNameMap.get(t.listId);
      if (listName?.toLowerCase().includes(q)) return true;
      if (t.subTasks?.some(st => st.text.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [query, todos, listNameMap]);

  const getPriorityColor = (p?: string) => {
    switch (p) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.info;
      default: return colors.textTertiary;
    }
  };

  const renderItem = ({ item }: { item: Todo }) => {
    const listName = listNameMap.get(item.listId) || 'Reminders';
    return (
      <TouchableOpacity
        style={[styles.resultRow, { backgroundColor: colors.card }]}
        activeOpacity={0.8}
        onPress={() => {
          if (item.listId === 'focus') {
            router.push({ pathname: '/(tabs)/today', params: { focusTaskId: item.id } });
          } else {
            router.push({ pathname: '/task-details', params: { id: item.id } });
          }
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Ionicons
            name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={item.done ? colors.accent : colors.textTertiary}
            style={{ marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.resultText, { color: colors.text }, item.done && { textDecorationLine: 'line-through', color: colors.textTertiary }]} numberOfLines={1}>
              {item.text}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
              <Text style={[styles.resultMeta, { color: colors.textSecondary }]}>{listName}</Text>
              {item.priority && (
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>{item.priority}</Text>
                </View>
              )}
              {item.repeat && item.repeat !== 'Never' && (
                <Ionicons name="repeat" size={13} color={colors.info} />
              )}
              {item.dueDate && (
                <Text style={[styles.resultMeta, { color: colors.textTertiary }]}>
                  {new Date(item.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </Text>
              )}
            </View>
            {item.notes && (
              <Text style={[styles.resultNotes, { color: colors.textTertiary }]} numberOfLines={1}>{item.notes}</Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Search header */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={[styles.inputWrap, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="search" size={18} color={colors.placeholder} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search tasks, notes, tags..."
            placeholderTextColor={colors.placeholder}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); inputRef.current?.focus(); }}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      {query.trim().length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>Search your tasks</Text>
          <Text style={[styles.emptyHint, { color: colors.textTertiary }]}>
            Find tasks by name, notes, tags, or list
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No results</Text>
          <Text style={[styles.emptyHint, { color: colors.textTertiary }]}>
            No tasks match "{query}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListHeaderComponent={
            <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
              {results.length} result{results.length !== 1 ? 's' : ''}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultMeta: {
    fontSize: 13,
  },
  resultNotes: {
    fontSize: 13,
    marginTop: 2,
    fontStyle: 'italic',
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyHint: {
    fontSize: 14,
    marginTop: 4,
  },
});
