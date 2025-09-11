import PomodoroSettings from '@/components/PomodoroSettings';
import { useListContext } from '@/context/ListContext';
import { useTodoContext } from '@/context/TodoContext';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function NewReminder() {
  console.log('=== NEW REMINDER RENDERED ===');
  
  const { addTodo, updateTodo, todos } = useTodoContext();
  const { lists } = useListContext();
  const params = useLocalSearchParams();
  const titleInputRef = useRef<TextInput>(null);

  
  const editId = params.editId as string;
  const isEditing = !!editId;
  const existingTodo = isEditing ? todos.find(t => t.id === editId) : null;
  
  const [title, setTitle] = useState(existingTodo?.text || '');
  const [notes, setNotes] = useState(existingTodo?.notes || '');
  const [selectedListId, setSelectedListId] = useState(existingTodo?.listId || String(params.preSelectedListId) || lists[0]?.id || '1');
  
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
      // Restore Pomodoro settings
      if (params.pomodoroEnabled) setPomodoroEnabled(params.pomodoroEnabled === 'true');
      if (params.workTime) setWorkTime(Number(params.workTime));
      if (params.workUnit) setWorkUnit(String(params.workUnit) as 'min' | 'hour');
      if (params.breakTime) setBreakTime(Number(params.breakTime));
      if (params.breakUnit) setBreakUnit(String(params.breakUnit) as 'min' | 'hour');
      // Restore additional details
      if (params.earlyReminder) setEarlyReminder(String(params.earlyReminder));
      if (params.repeat) setRepeat(String(params.repeat));
      if (params.location) setLocation(String(params.location));
      if (params.url) setUrl(String(params.url));
    }
    
    // Restore form data when returning from details page
    if (params.detailsSaved === 'true') {
      if (params.title) setTitle(String(params.title));
      if (params.notes) setNotes(String(params.notes));
      if (params.listId) setSelectedListId(String(params.listId));
      if (params.subtasks) {
        try {
          const parsedSubtasks = JSON.parse(String(params.subtasks));
          setSubtasks(parsedSubtasks);
        } catch (e) {
          // If parsing fails, keep current subtasks
        }
      }
      // Restore details data
      if (params.dueDate) {
        const date = new Date(String(params.dueDate));
        if (params.dueTime) {
          // Combine date and time if both are set
          const time = new Date(String(params.dueTime));
          date.setHours(time.getHours(), time.getMinutes(), 0, 0);
        }
        setSelectedDate(date);
      }
      if (params.priority && params.priority !== 'None') setPriority(String(params.priority) as 'high' | 'medium' | 'low');
      if (params.earlyReminder) setEarlyReminder(String(params.earlyReminder));
      if (params.repeat) setRepeat(String(params.repeat));
      if (params.location) setLocation(String(params.location));
      if (params.url) setUrl(String(params.url));
      // Restore edit context if editing
      if (params.editId) {
        // This ensures we stay in edit mode
        // The editId will be handled by the existing logic at the top of the component
      }
      // Restore Pomodoro settings
      if (params.pomodoroEnabled) setPomodoroEnabled(params.pomodoroEnabled === 'true');
      if (params.workTime) setWorkTime(Number(params.workTime));
      if (params.workUnit) setWorkUnit(String(params.workUnit) as 'min' | 'hour');
      if (params.breakTime) setBreakTime(Number(params.breakTime));
      if (params.breakUnit) setBreakUnit(String(params.breakUnit) as 'min' | 'hour');
    }
  }, [params.preSelectedListId, params.fromListPicker, params.detailsSaved, params.editId, params.title, params.notes, params.priority, params.dueDate, params.dueTime, params.subtasks, params.earlyReminder, params.repeat, params.location, params.url, params.pomodoroEnabled, params.workTime, params.workUnit, params.breakTime, params.breakUnit]);

  const [subtasks, setSubtasks] = useState<Array<{id: string, text: string, done: boolean, listId: string, createdAt: Date}>>(existingTodo?.subTasks || []);
  const [subInput, setSubInput] = useState('');
  
  // Date picker state
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(existingTodo?.dueDate ? new Date(existingTodo.dueDate) : null);
  
  // Priority picker state
  const [priorityPickerVisible, setPriorityPickerVisible] = useState(false);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(existingTodo?.priority || 'medium');

  // Additional details state
  const [earlyReminder, setEarlyReminder] = useState(existingTodo?.earlyReminder || 'None');
  const [repeat, setRepeat] = useState(existingTodo?.repeat || 'Never');
  const [location, setLocation] = useState(existingTodo?.location || '');
  const [locationCoords, setLocationCoords] = useState(existingTodo?.locationCoords || '');
  const [url, setUrl] = useState(existingTodo?.url || '');
  const [images, setImages] = useState<string[]>(existingTodo?.images || []);
  
  // Pomodoro state
  const [pomodoroEnabled, setPomodoroEnabled] = useState(existingTodo?.pomodoro?.enabled || false);
  const [workTime, setWorkTime] = useState(existingTodo?.pomodoro?.workTime || 25);
  const [workUnit, setWorkUnit] = useState<'min' | 'hour'>(existingTodo?.pomodoro?.workUnit || 'min');
  const [breakTime, setBreakTime] = useState(existingTodo?.pomodoro?.breakTime || 5);
  const [breakUnit, setBreakUnit] = useState<'min' | 'hour'>(existingTodo?.pomodoro?.breakUnit || 'min');

  const selectedList = lists.find(list => list.id === selectedListId);
  const [showDateChips, setShowDateChips] = useState(false);

  const save = () => {
    if (!title.trim()) return;
    
    if (isEditing && existingTodo) {
      // Update existing todo
      updateTodo(existingTodo.id, {
        text: title.trim(),
        notes: notes.trim() || undefined,
        listId: selectedListId,
        subTasks: subtasks.length > 0 ? subtasks : undefined,
        priority,
        dueDate: selectedDate || undefined,
        earlyReminder: earlyReminder !== 'None' ? earlyReminder : undefined,
        repeat: repeat !== 'Never' ? repeat : undefined,
        location: location || undefined,
        locationCoords: locationCoords || undefined,
        url: url || undefined,
        images: images.length ? images : undefined,
        pomodoro: pomodoroEnabled ? {
          enabled: true,
          workTime,
          workUnit,
          breakTime,
          breakUnit,
        } : undefined,
      });
    } else {
      // Create new todo
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
        earlyReminder: earlyReminder !== 'None' ? earlyReminder : undefined,
        repeat: repeat !== 'Never' ? repeat : undefined,
        location: location || undefined,
        locationCoords: locationCoords || undefined,
        url: url || undefined,
        images: images.length ? images : undefined,
        pomodoro: pomodoroEnabled ? {
          enabled: true,
          workTime,
          workUnit,
          breakTime,
          breakUnit,
        } : undefined,
      });
    }
    // Clear the form and navigate to the list items page
    setTitle('');
    setNotes('');
    setSubtasks([]);
    setSubInput('');
    setSelectedDate(null);
    setPriority('medium');
    setPomodoroEnabled(false);
    setWorkTime(25);
    setWorkUnit('min');
    setBreakTime(5);
    setBreakUnit('min');
    setEarlyReminder('None');
    setRepeat('Never');
    setLocation('');
    setLocationCoords('');
    setUrl('');
    setImages([]);
    
    // Navigate back to task details if editing, otherwise to list items
    if (isEditing) {
      router.push({ pathname: '/task-details', params: { id: editId } });
    } else {
      router.push({
        pathname: '/todo/list-items',
        params: { listId: selectedListId }
      });
    }
  };

  const navigateToDetails = (options?: { openLocation?: boolean }) => {
    // Navigate to details page with the current todo data
    router.push({
      pathname: '/todo/details',
      params: {
        title: title,
        notes: notes,
        listId: selectedListId,
        isNew: isEditing ? 'false' : 'true',
        editId: isEditing ? editId : undefined,
        // Pass current Pomodoro settings
        pomodoroEnabled: pomodoroEnabled.toString(),
        workTime: workTime.toString(),
        workUnit: workUnit,
        breakTime: breakTime.toString(),
        breakUnit: breakUnit,
        // Pass current subtasks
        subtasks: JSON.stringify(subtasks),
        // Pass current priority and due date
        priority: priority,
        dueDate: selectedDate ? selectedDate.toISOString() : '',
        dueTime: selectedDate ? selectedDate.toISOString() : '', // Add dueTime parameter
        // Pass current additional details
        earlyReminder: earlyReminder,
        repeat: repeat,
        location: location,
        url: url,
        ...(options?.openLocation ? { openLocation: 'true' } : {}),
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
        dueDate: selectedDate ? selectedDate.toISOString() : '',
        pomodoroEnabled: pomodoroEnabled.toString(),
        workTime: workTime.toString(),
        workUnit: workUnit,
        breakTime: breakTime.toString(),
        breakUnit: breakUnit,
        // Preserve edit context
        editId: editId,
        isEditing: isEditing.toString(),
        // Preserve additional details
        earlyReminder: earlyReminder,
        repeat: repeat,
        location: location,
        url: url
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
    setShowDateChips(false);
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 0, 0);
    setSelectedDate(tomorrow);
    setShowDateChips(false);
  };

  const setThisWeekend = () => {
    const today = new Date();
    const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + daysUntilSaturday);
    saturday.setHours(23, 59, 0, 0);
    setSelectedDate(saturday);
    setShowDateChips(false);
  };

  const setNextWeek = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(23, 59, 0, 0);
    setSelectedDate(nextWeek);
    setShowDateChips(false);
  };

  const showQuickDateOptions = () => setShowDateChips(prev => !prev);

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

  // Photo accessory handlers
  const ensureMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow Photos access to pick images.');
      return false;
    }
    return true;
  };

  const ensureCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow Camera access to take photos.');
      return false;
    }
    return true;
  };

  const pickFromLibrary = async () => {
    const ok = await ensureMediaLibraryPermission();
    if (!ok) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        selectionLimit: 5,
      });
      if (!result.canceled) {
        const uris = result.assets?.map(a => a.uri).filter(Boolean) as string[];
        setImages(prev => Array.from(new Set([...prev, ...uris])));
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open photo library.');
    }
  };

  const takePhoto = async () => {
    const ok = await ensureCameraPermission();
    if (!ok) return;
    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.9,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const src = result.assets![0]!.uri;
        // Ensure app photos directory exists
        const photosDir = FileSystem.documentDirectory + 'photos/';
        try { await FileSystem.makeDirectoryAsync(photosDir, { intermediates: true }); } catch {}
        const dest = photosDir + `photo_${Date.now()}.jpg`;
        try {
          await FileSystem.copyAsync({ from: src, to: dest });
          setImages(prev => Array.from(new Set([...prev, dest])));
        } catch (e) {
          // Fall back to original uri if copy fails
          setImages(prev => Array.from(new Set([...prev, src])));
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Add Photo',
      undefined,
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const removeImage = async (uri: string) => {
    setImages(prev => prev.filter(u => u !== uri));
    // Attempt to delete file if it's stored in our documents directory
    if (uri.startsWith(FileSystem.documentDirectory || '')) {
      try { await FileSystem.deleteAsync(uri, { idempotent: true }); } catch {}
    }
  };

  return (
    <SafeAreaView style={styles.container}>
    <KeyboardAwareScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
      extraHeight={Platform.OS === 'ios' ? 100 : 0}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          // Navigate directly to the todo dashboard
          router.push('/todo');
        }}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? 'Edit Task' : 'New Reminder'}</Text>
        <TouchableOpacity onPress={save} disabled={!title.trim()}>
          <Text style={[styles.addButton, !title.trim() && styles.addButtonDisabled]}>
            {isEditing ? 'Save' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Title and Notes Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.titleRow}
            activeOpacity={1}
            onPress={() => titleInputRef.current?.focus()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <TextInput
              ref={titleInputRef}
              style={[styles.titleInput, {borderColor: "#bababa"}]}
              placeholder="Title"
              placeholderTextColor={"#bababa"}
              value={title}
              onChangeText={setTitle}
              multiline
              returnKeyType="next"
            />
          </TouchableOpacity>
          <TextInput
            style={styles.notesInput}
            placeholder="Notes"
            placeholderTextColor={"#bababa"}
            value={notes}
            onChangeText={setNotes}
            multiline
            returnKeyType="default"
          />
          {/* Subtasks: Input row always visible, list appears below */}
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
          {subtasks.length > 0 && (
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
            </View>
          )}
        </View>

        {/* Details Row */}
        <TouchableOpacity style={styles.detailRow} onPress={() => navigateToDetails()}>
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

      {/* Pomodoro Settings */}
      <PomodoroSettings
        enabled={pomodoroEnabled}
        onToggle={setPomodoroEnabled}
        workTime={workTime}
        onWorkTimeChange={setWorkTime}
        workUnit={workUnit}
        onWorkUnitChange={setWorkUnit}
        breakTime={breakTime}
        onBreakTimeChange={setBreakTime}
        breakUnit={breakUnit}
        onBreakUnitChange={setBreakUnit}
      />

      {/* Keyboard Accessories */}
      <View style={styles.keyboardAccessories}>
        <TouchableOpacity style={styles.accessoryButton} onPress={showDatePicker}>
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
        {/* Tags accessory removed for simpler UX */}
        <TouchableOpacity style={styles.accessoryButton} onPress={() => navigateToDetails({ openLocation: true })}>
          <Ionicons name="location" size={20} color="#007AFF" />
          <Text style={styles.accessoryText}>Location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accessoryButton} onPress={showPhotoOptions}>
          <Ionicons name="camera" size={20} color="#34C759" />
          <Text style={styles.accessoryText}>Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accessoryButton} onPress={navigateToListPicker}>
          <Ionicons name="list" size={20} color="#AF52DE" />
          <Text style={styles.accessoryText}>Lists</Text>
        </TouchableOpacity>
      </View>

      {/* Inline Date Chips removed per request */}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <View style={styles.imagesGrid}>
          {images.map((uri) => (
            <View key={uri} style={styles.imageItem}>
              <Image source={{ uri }} style={styles.imageThumb} />
              <TouchableOpacity style={styles.imageRemove} onPress={() => removeImage(uri)}>
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={datePickerVisible}
        mode="datetime"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />
    </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
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
    padding: 12,
    marginBottom: 12,
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
  dateChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#1c1c1e',
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383a',
  },
  dateChip: {
    backgroundColor: '#2c2c2e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  dateChipText: {
    color: '#fff',
    fontSize: 14,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  imageItem: {
    width: 72,
    height: 72,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1c1c1e',
  },
  imageThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 48,
    paddingVertical: 6,
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
