import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import moment from 'moment';
import React from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useTodoContext } from '../context/TodoContext';

export default function SmartListScreen({ filter, title }: { filter: (todo: any) => boolean; title: string }) {
  const pathname = usePathname();
  const { todos, toggleTodo, deleteTodo, addSubTask, toggleSubTask } = useTodoContext();
  const [expandedIds, setExpandedIds] = React.useState<string[]>([]);
  const [showCompletedSheet, setShowCompletedSheet] = React.useState(false);

  const filtered = todos.filter(filter);

  const isExpanded = (id: string) => expandedIds.includes(id);
  const toggleExpand = (id: string) =>
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );

  function AddSubtaskInput({ parentId }: { parentId: string }) {
    const [subInput, setSubInput] = React.useState('');
    const handleAddSub = () => {
      if (!subInput.trim()) return;
      addSubTask(parentId, subInput.trim());
      setSubInput('');
    };
    return (
      <View style={styles.subTaskInputRow}>
        <TextInput
          style={styles.subTaskInput}
          placeholder="Add subtask"
          value={subInput}
          onChangeText={setSubInput}
          onSubmitEditing={handleAddSub}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={handleAddSub}>
          <Ionicons name="add-circle-outline" size={22} color="#67c99a" style={{ marginRight: 25 }} />
        </TouchableOpacity>
      </View>
    );
  }

  // Sort by due date ascending where available
  const sorted = React.useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ad = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bd = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return ad - bd;
    });
  }, [filtered]);

  // Build a completed list matching current view scope (heuristic by pathname)
  const completedForView = React.useMemo(() => {
    const todayKey = new Date().toDateString();
    if (pathname?.endsWith('/priority')) {
      return todos.filter(t => t.priority === 'high' && t.done);
    }
    if (pathname?.endsWith('/all')) {
      const start = new Date(); start.setHours(0,0,0,0);
      return todos.filter(t => t.done && !!t.dueDate && new Date(t.dueDate) >= start);
    }
    if (pathname?.endsWith('/scheduled')) {
      return todos.filter(t => t.done && !!t.dueDate && new Date(t.dueDate).toDateString() === todayKey);
    }
    return todos.filter(t => t.done);
  }, [todos, pathname]);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.header}>{title}</Text>}
      <SwipeListView
        data={sorted}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 22 }}
        renderItem={({ item }) => (
          <View style={styles.todoRow}>
            {/* Header row keeps icons/text on one line */}
            <View style={styles.headerRow}>
              {item.favorite && (
                <Ionicons name="star" size={22} color="#ffd700" style={{ marginRight: 4 }} />
              )}
              <View style={{
                backgroundColor: item.priority === 'high' ? '#ff8882'
                  : item.priority === 'medium' ? '#ffdf6d'
                  : '#9ad0f5',
                borderRadius: 6, width: 12, height: 12, marginRight: 6,
              }} />
              <TouchableOpacity onPress={() => toggleTodo(item.id)}>
                <Ionicons
                  name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={item.done ? '#67c99a' : '#aaa'}
                  style={{ marginRight: 9 }}
                />
              </TouchableOpacity>
              {item.pomodoro?.enabled && (
                <Ionicons 
                  name="timer-outline" 
                  size={16} 
                  color="#FF6B6B" 
                  style={{ marginRight: 6 }}
                />
              )}
              <TouchableOpacity 
                style={{ flex: 1, minWidth: 0 }}
                onPress={() => router.push({ pathname: '/task-details', params: { id: item.id, from: pathname || '/todo' } })}
              >
                <Text style={styles.todoText} numberOfLines={1}>{item.text}</Text>
                {item.notes && (
                  <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
                )}
              </TouchableOpacity>
              {item.dueDate && (
                <View style={{ marginLeft: 6, flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="calendar-outline" size={17} color="#9ad0f5" style={{ marginRight: 2 }} />
                  <Text style={{ fontSize: 13, color: '#9ad0f5' }}>{moment(item.dueDate).format('MMM D')}</Text>
                </View>
              )}
              {item.category && (
                <View style={{
                  backgroundColor: '#e9f4fa',
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  marginLeft: 7,
                }}>
                  <Text style={{ color: '#3d61b2', fontSize: 12 }}>{item.category}</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => toggleExpand(item.id)} style={{ marginLeft: 6 }}>
                <Ionicons
                  name={isExpanded(item.id) ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color="#67c99a"
                />
              </TouchableOpacity>
            </View>
            {isExpanded(item.id) && (
              <View style={[styles.subTasksContainer, { paddingRight: 6 }]}>
                {item.subTasks?.map(sub => (
                  <TouchableOpacity
                    key={sub.id}
                    style={styles.subTaskRow}
                    onPress={() => toggleSubTask(item.id, sub.id)}
                  >
                    <Ionicons
                      name={sub.done ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={sub.done ? '#67c99a' : '#bbb'}
                      style={{ marginRight: 7 }}
                    />
                    <Text style={[
                      styles.subTaskText,
                      sub.done && { textDecorationLine: 'line-through', color: '#aaa' }
                    ]}>
                      {sub.text}
                    </Text>
                  </TouchableOpacity>
                ))}
                <AddSubtaskInput parentId={item.id} />
              </View>
            )}
          </View>
        )}
        renderHiddenItem={({ item }) => (
          <View style={styles.rowBack}>
            <TouchableOpacity style={styles.completeAction} onPress={() => toggleTodo(item.id)}>
              <Ionicons name="checkmark-done" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteAction} onPress={() => deleteTodo(item.id)}>
              <MaterialCommunityIcons name="trash-can-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        rightOpenValue={-85}
        leftOpenValue={75}
        disableRightSwipe={false}
        disableLeftSwipe={false}
      />

      {filtered.length === 0 && (
        <Text style={{ color: '#aaa', marginTop: 40, alignSelf: 'center' }}>No to-dos found.</Text>
      )}

      {/* View Completed button */}
      {completedForView.length > 0 && (
        <TouchableOpacity style={styles.viewCompletedBtn} onPress={() => setShowCompletedSheet(true)}>
          <Text style={styles.viewCompletedText}>View Completed ({completedForView.length})</Text>
        </TouchableOpacity>
      )}

      {/* Completed Bottom Sheet */}
      <Modal transparent visible={showCompletedSheet} animationType="slide" onRequestClose={() => setShowCompletedSheet(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowCompletedSheet(false)} />
          <View style={styles.sheetContainer}>
            <Text style={styles.sheetTitle}>Completed</Text>
            <FlatList
              data={[...completedForView].sort((a,b)=>{
                const ad=a.dueDate?new Date(a.dueDate).getTime():0; const bd=b.dueDate?new Date(b.dueDate).getTime():0; return bd-ad;})}
              keyExtractor={i=>i.id}
              renderItem={({item})=> (
                <View style={styles.completedRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#67c99a" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.completedTitle}>{item.text}</Text>
                    <Text style={styles.completedMeta}>
                      {item.dueDate ? moment(item.dueDate).format('MMM D, h:mm A') : 'No date'}
                    </Text>
                  </View>
                </View>
              )}
              style={{ maxHeight: 320 }}
              showsVerticalScrollIndicator={false}
            />
            <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setShowCompletedSheet(false)}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8ff' },
  header: { fontSize: 22, fontWeight: 'bold', color: '#556de8', marginBottom: 16, alignSelf: 'center' },
  todoRow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: '#fff',
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    shadowColor: '#222',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  todoText: { fontSize: 16, color: '#222', flex: 1 },
  doneText: { color: '#aaa', textDecorationLine: 'line-through' },
  notesText: { fontSize: 14, color: '#666', marginTop: 4, fontStyle: 'italic' },
  rowBack: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  deleteAction: {
    backgroundColor: '#f87e7b',
    justifyContent: 'center',
    alignItems: 'center',
    width: 85,
    height: '100%',
    borderRadius: 12,
  },
  completeAction: {
    backgroundColor: '#67c99a',
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    height: '100%',
    borderRadius: 12,
  },
  subTasksContainer: {
    marginTop: 6,
    marginLeft: 32,
    borderLeftWidth: 2,
    borderColor: '#e0e5f2',
    paddingLeft: 11,
    width: '100%',
    paddingBottom: 8,
  },
  viewCompletedBtn: {
    alignSelf: 'center',
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#f1f5ff',
    borderRadius: 16,
  },
  viewCompletedText: { color: '#3f51d1', fontWeight: '700' },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  sheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#111827' },
  completedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  completedTitle: { color: '#111827', fontSize: 14, fontWeight: '600' },
  completedMeta: { color: '#6b7280', fontSize: 12 },
  sheetCloseBtn: { alignSelf: 'center', marginTop: 10, backgroundColor: '#3f51d1', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 16 },
  subTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  subTaskText: {
    fontSize: 15,
    color: '#555',
  },
  subTaskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    marginBottom: 2,
  },
  subTaskInput: {
    backgroundColor: '#f4f4f8',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e5f2',
    marginRight: 18,
    flex: 1,
  },
});
