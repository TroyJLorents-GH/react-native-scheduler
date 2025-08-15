import { useListContext } from '@/context/ListContext';
import { useTodoContext } from '@/context/TodoContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function NewReminder() {
  const { addTodo } = useTodoContext();
  const { lists } = useListContext();
  const params = useLocalSearchParams();
  
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedListId, setSelectedListId] = useState(String(params.preSelectedListId) || lists[0]?.id || '1');
  
  // Update selectedListId when params change (e.g., when returning from list picker)
  React.useEffect(() => {
    if (params.preSelectedListId) {
      setSelectedListId(String(params.preSelectedListId));
    }
    
    // Restore form data when returning from list picker
    if (params.fromListPicker === 'true') {
      if (params.title) setTitle(String(params.title));
      if (params.notes) setNotes(String(params.notes));
      if (params.priority) setPriority(String(params.priority) as 'high' | 'medium' | 'low');
      if (params.dueDate) setSelectedDate(new Date(String(params.dueDate)));
      if (params.subtasks) {
        try {
          const parsedSubtasks = JSON.parse(String(params.subtasks));
          setSubtasks(parsedSubtasks);
        } catch (e) {
          // If parsing fails, keep current subtasks
        }
      }
    }
  }, [params.preSelectedListId, params.fromListPicker, params.title, params.notes, params.priority, params.dueDate, params.subtasks]);

  // Clear form data when screen loses focus (user navigates away)
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // This runs when the screen loses focus (user navigates to another tab/screen)
        // Clear all form data to prevent it from persisting
        setTitle('');
        setNotes('');
        setSubtasks([]);
        setShowSubtasks(false);
        setSubInput('');
        setSelectedDate(null);
        setPriority('medium');
        setSelectedListId(lists[0]?.id || '1');
      };
    }, [lists])
  );
  const [subtasks, setSubtasks] = useState<Array<{id: string, text: string, done: boolean, listId: string, createdAt: Date}>>([]);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [subInput, setSubInput] = useState('');
  
  // Date picker state
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Priority picker state
  const [priorityPickerVisible, setPriorityPickerVisible] = useState(false);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const selectedList = lists.find(list => list.id === selectedListId);

  const save = () => {
    if (!title.trim()) return;
    addTodo({
      id: Date.now().toString(),
      text: title.trim(),
      notes: notes.trim() || undefined,
      listId: selectedListId,
      done: false,
      createdAt: new Date(),
      subTasks: subtasks.length > 0 ? subtasks : undefined,
      priority,
      dueDate: selectedDate || undefined,
    });
    // Clear the form and navigate to the list items page
    setTitle('');
    setNotes('');
    setSubtasks([]);
    setShowSubtasks(false);
    setSubInput('');
    setSelectedDate(null);
    setPriority('medium');
    
    // Navigate to the list items page where the todo was added
    router.push({
      pathname: '/todo/list-items',
      params: { listId: selectedListId }
    });
  };

  const navigateToDetails = () => {
    // Navigate to details page with the current todo data
    router.push({
      pathname: '/todo/details',
      params: {
        title: title,
        notes: notes,
        listId: selectedListId,
        isNew: 'true'
      }
    });
  };

  const navigateToListPicker = () => {
    // Navigate to list picker with current form data
    router.push({
      pathname: '/todo/list-picker',
      params: {
        selectedListId: selectedListId,
        title: title,
        notes: notes,
        subtasks: JSON.stringify(subtasks),
        priority: priority,
        dueDate: selectedDate ? selectedDate.toISOString() : ''
      }
    });
  };

  const addSubtask = () => {
    if (!subInput.trim()) return;
    setSubtasks(prev => [...prev, {
      id: Date.now().toString(),
      text: subInput.trim(),
      done: false,
      listId: selectedListId,
      createdAt: new Date(),
    }]);
    setSubInput('');
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(prev => prev.map(sub => 
      sub.id === id ? { ...sub, done: !sub.done } : sub
    ));
  };

  // Date picker functions
  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);
  const handleDateConfirm = (date: Date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  // Quick date functions
  const setToday = () => {
    const today = new Date();
    today.setHours(23, 59, 0, 0);
    setSelectedDate(today);
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 0, 0);
    setSelectedDate(tomorrow);
  };

  const setThisWeekend = () => {
    const today = new Date();
    const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + daysUntilSaturday);
    saturday.setHours(23, 59, 0, 0);
    setSelectedDate(saturday);
  };

  const setNextWeek = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(23, 59, 0, 0);
    setSelectedDate(nextWeek);
  };

  const showQuickDateOptions = () => {
    Alert.alert(
      'Quick Date',
      'Select a date',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Today', onPress: setToday },
        { text: 'Tomorrow', onPress: setTomorrow },
        { text: 'This Weekend', onPress: setThisWeekend },
        { text: 'Next Week', onPress: setNextWeek },
        { text: 'Custom', onPress: showDatePicker },
      ]
    );
  };

  const showPriorityOptions = () => {
    Alert.alert(
      'Priority',
      'Select priority',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'High', onPress: () => setPriority('high') },
        { text: 'Medium', onPress: () => setPriority('medium') },
        { text: 'Low', onPress: () => setPriority('low') },
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Reminder</Text>
        <TouchableOpacity onPress={save} disabled={!title.trim()}>
          <Text style={[styles.addButton, !title.trim() && styles.addButtonDisabled]}>
            Add
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Title and Notes Input */}
        <View style={styles.inputContainer}>
          <View style={styles.titleRow}>
            <TextInput
              style={[styles.titleInput, {borderBottomWidth: 1, borderBottomColor: "#bababa"}]}
              placeholder="Title"
              placeholderTextColor={"#bababa"}
              value={title}
              onChangeText={setTitle}
              multiline
              returnKeyType="next"
            />
            {title.trim() && (
              <TouchableOpacity 
                onPress={() => setShowSubtasks(!showSubtasks)} 
                style={styles.expandButton}
              >
                <Ionicons
                  name={showSubtasks ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color="#67c99a"
                />
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={styles.notesInput}
            placeholder="Notes"
            placeholderTextColor={"#bababa"}
            value={notes}
            onChangeText={setNotes}
            multiline
            returnKeyType="default"
          />
          
          {/* Subtasks Section */}
          {showSubtasks && (
            <View style={styles.subtasksContainer}>
              {subtasks.map(sub => (
                <TouchableOpacity
                  key={sub.id}
                  style={styles.subtaskRow}
                  onPress={() => toggleSubtask(sub.id)}
                >
                  <Ionicons
                    name={sub.done ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={sub.done ? '#67c99a' : '#bbb'}
                    style={{ marginRight: 7 }}
                  />
                  <Text style={[
                    styles.subtaskText,
                    sub.done && { textDecorationLine: 'line-through', color: '#aaa' }
                  ]}>
                    {sub.text}
                  </Text>
                </TouchableOpacity>
              ))}
              <View style={styles.subtaskInputRow}>
                <TextInput
                  style={styles.subtaskInput}
                  placeholder="Add subtask"
                  placeholderTextColor={"#bababa"}
                  value={subInput}
                  onChangeText={setSubInput}
                  onSubmitEditing={addSubtask}
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={addSubtask}>
                  <Ionicons name="add-circle-outline" size={22} color="#67c99a" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Details Row */}
        <TouchableOpacity style={styles.detailRow} onPress={navigateToDetails}>
          <Text style={styles.detailText}>Details</Text>
          <Ionicons name="chevron-forward" size={20} color="#8e8e93" />
        </TouchableOpacity>

        {/* List Row */}
        <TouchableOpacity style={styles.detailRow} onPress={navigateToListPicker}>
          <View style={styles.listInfo}>
            <View style={[styles.listIcon, { backgroundColor: selectedList?.color || '#007AFF' }]}>
              {selectedList?.icon && (
                <Ionicons name={selectedList.icon as any} size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.detailText}>List</Text>
          </View>
          <View style={styles.listValue}>
            <Text style={styles.listName}>{selectedList?.name || 'Reminders'}</Text>
            <Ionicons name="chevron-forward" size={20} color="#8e8e93" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Keyboard Accessories */}
      <View style={styles.keyboardAccessories}>
        <TouchableOpacity style={styles.accessoryButton} onPress={showQuickDateOptions}>
          <Ionicons name="calendar" size={20} color={selectedDate ? "#007AFF" : "#8e8e93"} />
          <Text style={[styles.accessoryText, selectedDate && { color: "#007AFF" }]}>
            {selectedDate ? 'Date Set' : 'Date'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accessoryButton} onPress={showPriorityOptions}>
          <Ionicons name="flag" size={20} color={priority === 'high' ? "#FF3B30" : priority === 'medium' ? "#FF9500" : "#8e8e93"} />
          <Text style={[styles.accessoryText, priority !== 'medium' && { color: priority === 'high' ? "#FF3B30" : "#8e8e93" }]}>
            {priority === 'high' ? 'High' : priority === 'medium' ? 'Priority' : 'Low'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accessoryButton}>
          <Ionicons name="pricetag" size={20} color="#8e8e93" />
          <Text style={styles.accessoryText}>#</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accessoryButton}>
          <Ionicons name="location" size={20} color="#007AFF" />
          <Text style={styles.accessoryText}>Location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accessoryButton}>
          <Ionicons name="camera" size={20} color="#34C759" />
          <Text style={styles.accessoryText}>Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accessoryButton} onPress={navigateToListPicker}>
          <Ionicons name="list" size={20} color="#AF52DE" />
          <Text style={styles.accessoryText}>Lists</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={datePickerVisible}
        mode="datetime"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383a',
  },
  cancelButton: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '400',
  },
  title: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  addButton: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  addButtonDisabled: {
    color: '#8e8e93',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inputContainer: {
    backgroundColor: '#1c1c1e',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  titleInput: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '400',
    minHeight: 24,
    marginBottom: 8,
  },
  notesInput: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '400',
    minHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
  },
  detailText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '400',
  },
  listInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listName: {
    color: '#8e8e93',
    fontSize: 17,
    fontWeight: '400',
    marginRight: 8,
  },
  keyboardAccessories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#38383a',
  },
  accessoryButton: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  accessoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '400',
    marginTop: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  expandButton: {
    marginLeft: 8,
    marginTop: 4,
  },
  subtasksContainer: {
    marginTop: 12,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  subtaskText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  subtaskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  subtaskInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});
