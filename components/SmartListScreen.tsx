import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useTodoContext } from '../context/TodoContext';

export default function SmartListScreen({ filter, title }: { filter: (todo: any) => boolean; title: string }) {
  const { todos, toggleTodo, deleteTodo, addSubTask, toggleSubTask } = useTodoContext();
  const [expandedIds, setExpandedIds] = React.useState<string[]>([]);

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
          <Ionicons name="add-circle-outline" size={22} color="#67c99a" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{title}</Text>
      <SwipeListView
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.todoRow}>
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
                size={24}
                color={item.done ? '#67c99a' : '#aaa'}
                style={{ marginRight: 9 }}
              />
            </TouchableOpacity>
            <Text style={[styles.todoText, item.done && styles.doneText]}>{item.text}</Text>
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
            {isExpanded(item.id) && (
              <View style={styles.subTasksContainer}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 22, backgroundColor: '#f5f8ff' },
  header: { fontSize: 22, fontWeight: 'bold', color: '#556de8', marginBottom: 16, alignSelf: 'center' },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    shadowColor: '#222',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    flexWrap: 'wrap'
  },
  todoText: { fontSize: 16, color: '#222', flex: 1 },
  doneText: { color: '#aaa', textDecorationLine: 'line-through' },
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
    marginTop: 7,
    marginLeft: 36,
    borderLeftWidth: 2,
    borderColor: '#e0e5f2',
    paddingLeft: 11,
    width: '100%',
  },
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
    marginRight: 6,
    flex: 1,
  },
});
