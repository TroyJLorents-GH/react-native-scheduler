import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ToDoScreen() {
  const [task, setTask] = useState('');
  const [todos, setTodos] = useState([
    { id: '1', task: 'Finish math homework' },
    { id: '2', task: 'Buy groceries' },
  ]);

  const addTask = () => {
    if (!task.trim()) return;
    setTodos([...todos, { id: Date.now().toString(), task }]);
    setTask('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>To-Do List</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={task}
          onChangeText={setTask}
          placeholder="Add a new task"
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={todos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <Text style={styles.todoText}>• {item.task}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 22 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  inputRow: { flexDirection: 'row', marginBottom: 18 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16 },
  addButton: { backgroundColor: '#007bff', borderRadius: 8, marginLeft: 10, paddingHorizontal: 18, justifyContent: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  todoItem: { marginBottom: 8 },
  todoText: { fontSize: 15, color: '#343a40' },
});
