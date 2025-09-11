import LocationSearchModal from '@/components/LocationSearchModal';
import { useTodoContext } from '@/context/TodoContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Platform, SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function DetailsScreen() {
  const params = useLocalSearchParams();
  const { title, notes, listId, isNew, editId, openLocation } = params as any;
  const isEditing = isNew === 'false';
  const { updateTodo, todos } = useTodoContext();

  // Get existing todo data when editing
  const existingTodo = isEditing && editId ? todos.find(t => t.id === editId) : null;

  // State for reminder settings
  const [dateEnabled, setDateEnabled] = useState(!!(existingTodo?.dueDate || params.dueDate));
  
  // Check if the existing due date has a specific time (not midnight)
  const hasSpecificTime = existingTodo?.dueDate && new Date(existingTodo.dueDate).getHours() !== 0;
  const [timeEnabled, setTimeEnabled] = useState(hasSpecificTime);
  
  const [selectedDate, setSelectedDate] = useState(
    existingTodo?.dueDate ? new Date(existingTodo.dueDate) : 
    params.dueDate ? new Date(String(params.dueDate)) : new Date()
  );
  const [selectedTime, setSelectedTime] = useState(
    hasSpecificTime && existingTodo?.dueDate ? new Date(existingTodo.dueDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [earlyReminder, setEarlyReminder] = useState(existingTodo?.earlyReminder || String(params.earlyReminder || 'None'));
  const [repeat, setRepeat] = useState(existingTodo?.repeat || String(params.repeat || 'Never'));
  const [locationEnabled, setLocationEnabled] = useState(!!existingTodo?.location || !!params.location);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(
    existingTodo?.location ? 
      (() => {
        // Try to parse existing location string for coordinates
        const locationMatch = existingTodo.location.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
        if (locationMatch) {
          const [, lat, lng] = locationMatch;
          return {
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
            address: existingTodo.location
          };
        }
        return null;
      })() : null
  );

  const [priority, setPriority] = useState(String(existingTodo?.priority || params.priority || 'medium'));
  // Tags removed for simplified UX

  // Modal states
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  // Tags modal removed
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showEarlyReminderModal, setShowEarlyReminderModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Update state when parameters change (for when returning from new reminder page)
  React.useEffect(() => {
    // Update date and time settings
    if (params.dueDate) {
      const date = new Date(String(params.dueDate));
      setSelectedDate(date);
      setDateEnabled(true);
      
      // Check if there's a specific time
      if (params.dueTime) {
        const time = new Date(String(params.dueTime));
        setSelectedTime(time);
        setTimeEnabled(true);
      } else {
        // Check if the date has a specific time (not midnight)
        const hasTime = date.getHours() !== 0;
        setTimeEnabled(hasTime);
        if (hasTime) {
          setSelectedTime(date);
        }
      }
    }
    
    // Update other settings - make sure to handle empty strings properly
    if (params.earlyReminder && params.earlyReminder !== '') {
      setEarlyReminder(String(params.earlyReminder));
    }
    if (params.repeat && params.repeat !== '') {
      setRepeat(String(params.repeat));
    }
    if (params.priority && params.priority !== '') {
      setPriority(String(params.priority));
    }
    if (params.location && params.location !== '') {
      setLocationEnabled(true);
    }
    // Auto-open location modal when requested
    if (openLocation === 'true') {
      setLocationEnabled(true);
      setShowLocationModal(true);
    }
  }, [params.dueDate, params.dueTime, params.earlyReminder, params.repeat, params.priority, params.location]);

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSave = () => {
    if (isEditing && editId) {
      // When editing, update the todo directly and navigate to task details page
      let updatedDueDate = undefined;
      if (dateEnabled) {
        updatedDueDate = new Date(selectedDate);
        if (timeEnabled) {
          // Combine date and time
          const time = new Date(selectedTime);
          updatedDueDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
        }
      }
      
      updateTodo(String(editId), {
        dueDate: updatedDueDate,
        priority: priority !== 'None' ? priority as 'high' | 'medium' | 'low' : undefined,
        earlyReminder: earlyReminder !== 'None' ? earlyReminder : undefined,
        repeat: repeat !== 'Never' ? repeat : undefined,
        location: locationEnabled && selectedLocation ? selectedLocation.address : undefined,
        locationCoords: locationEnabled && selectedLocation ? `${selectedLocation.latitude}, ${selectedLocation.longitude}` : undefined,
      });
      
      // Navigate to task details page
      router.push({ pathname: '/task-details', params: { id: editId } });
    } else {
      // When creating new, navigate back with all the details as parameters
      router.replace({
        pathname: '/todo/new',
        params: {
          detailsSaved: 'true',
          // Pass back all the current form data
          title: String(params.title || ''),
          notes: String(params.notes || ''),
          listId: String(params.listId || ''),
          subtasks: String(params.subtasks || ''),
          // Pass back the details that were just set
          dueDate: dateEnabled ? selectedDate.toISOString() : '',
          dueTime: timeEnabled ? selectedTime.toISOString() : '',
          priority: priority,
          earlyReminder: earlyReminder,
          repeat: repeat,
          location: locationEnabled && selectedLocation ? selectedLocation.address : '',
          url: String(params.url || ''),
          // Preserve Pomodoro settings
          pomodoroEnabled: String(params.pomodoroEnabled || ''),
          workTime: String(params.workTime || ''),
          workUnit: String(params.workUnit || ''),
          breakTime: String(params.breakTime || ''),
          breakUnit: String(params.breakUnit || ''),
          // Preserve edit context
          editId: String(params.editId || ''),
          isEditing: String(params.isEditing || 'false'),
        }
      });
    }
  };

  const repeatOptions = ['Never', 'Daily', 'Weekdays', 'Weekends', 'Weekly', 'Biweekly', 'Monthly', 'Yearly'];
  const priorityOptions = ['None', 'low', 'medium', 'high'];
  const earlyReminderOptions = ['None', '5 minutes before', '15 minutes before', '1 hour before', '1 day before'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleSave()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.addButton}>{isEditing ? 'Save' : 'Add'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
        extraHeight={Platform.OS === 'ios' ? 100 : 0}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Section */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="calendar" size={24} color="#FF3B30" />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Date</Text>
                {dateEnabled && (
                  <Text style={styles.rowSubtitle}>{formatDate(selectedDate)}</Text>
                )}
              </View>
            </View>
            <Switch
              value={dateEnabled}
              onValueChange={setDateEnabled}
              trackColor={{ false: '#38383a', true: '#34C759' }}
              thumbColor="#fff"
            />
          </View>
          {dateEnabled && (
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerText}>Select Date</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Time Section */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="time" size={24} color="#007AFF" />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Time</Text>
                {timeEnabled && (
                  <Text style={styles.rowSubtitle}>{formatTime(selectedTime)}</Text>
                )}
              </View>
            </View>
            <Switch
              value={timeEnabled}
              onValueChange={setTimeEnabled}
              trackColor={{ false: '#38383a', true: '#34C759' }}
              thumbColor="#fff"
            />
          </View>
          {timeEnabled && (
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.datePickerText}>Select Time</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Early Reminder */}
        <TouchableOpacity style={styles.section} onPress={() => setShowEarlyReminderModal(true)}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications" size={24} color="#AF52DE" />
              <Text style={styles.rowTitle}>Early Reminder</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{earlyReminder}</Text>
              <Ionicons name="chevron-forward" size={20} color="#8e8e93" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Repeat */}
        <TouchableOpacity style={styles.section} onPress={() => setShowRepeatModal(true)}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="refresh" size={24} color="#8e8e93" />
              <Text style={styles.rowTitle}>Repeat</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{repeat}</Text>
              <Ionicons name="chevron-forward" size={20} color="#8e8e93" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Tags removed */}

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="location" size={24} color="#007AFF" />
              <Text style={styles.rowTitle}>Location</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: '#38383a', true: '#34C759' }}
              thumbColor="#fff"
            />
          </View>
          {locationEnabled && (
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={() => setShowLocationModal(true)}
            >
              <View style={styles.locationContent}>
                <Ionicons name="location" size={20} color="#007AFF" />
                <Text style={styles.locationText}>
                  {selectedLocation ? selectedLocation.address : 'Select Location'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#8e8e93" />
              </View>
            </TouchableOpacity>
          )}
        </View>



        {/* Priority */}
        <TouchableOpacity style={styles.section} onPress={() => setShowPriorityModal(true)}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="warning" size={24} color="#FF3B30" />
              <Text style={styles.rowTitle}>Priority</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{priority}</Text>
              <Ionicons name="chevron-forward" size={20} color="#8e8e93" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Add Image */}
        <TouchableOpacity style={styles.section} onPress={() => Alert.alert('Coming Soon', 'Image functionality will be implemented with expo-camera and expo-media-library')}>
          <Text style={styles.addImageText}>Add Image</Text>
        </TouchableOpacity>

        {/* URL */}
        <View style={styles.section}>
          <Text style={styles.urlText}>URL</Text>
        </View>
      </KeyboardAwareScrollView>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        date={selectedDate}
        onConfirm={(date) => {
          setSelectedDate(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* Time Picker Modal */}
      <DateTimePickerModal
        isVisible={showTimePicker}
        mode="time"
        date={selectedTime}
        onConfirm={(time) => {
          setSelectedTime(time);
          setShowTimePicker(false);
        }}
        onCancel={() => setShowTimePicker(false)}
      />

      {/* Repeat Modal */}
      <Modal
        visible={showRepeatModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRepeatModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Repeat</Text>
              <TouchableOpacity onPress={() => setShowRepeatModal(false)}>
                <Text style={styles.modalDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            {repeatOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  setRepeat(option);
                  setShowRepeatModal(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  repeat === option && styles.modalOptionTextSelected
                ]}>
                  {option}
                </Text>
                {repeat === option && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Priority Modal */}
      <Modal
        visible={showPriorityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPriorityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Priority</Text>
              <TouchableOpacity onPress={() => setShowPriorityModal(false)}>
                <Text style={styles.modalDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            {priorityOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  setPriority(option);
                  setShowPriorityModal(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  priority === option && styles.modalOptionTextSelected
                ]}>
                  {option}
                </Text>
                {priority === option && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Early Reminder Modal */}
      <Modal
        visible={showEarlyReminderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEarlyReminderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Early Reminder</Text>
              <TouchableOpacity onPress={() => setShowEarlyReminderModal(false)}>
                <Text style={styles.modalDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            {earlyReminderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  setEarlyReminder(option);
                  setShowEarlyReminderModal(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  earlyReminder === option && styles.modalOptionTextSelected
                ]}>
                  {option}
                </Text>
                {earlyReminder === option && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Tags modal removed */}

      {/* Location Search Modal */}
      <LocationSearchModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSelect={(location) => {
          try {
            console.log('Location selected in details:', location);
            setSelectedLocation(location);
            // Store both the address and coordinates
            const locationData = {
              address: location.address,
              coordinates: `${location.latitude}, ${location.longitude}`
            };
            // Don't use router.setParams to avoid clearing other state
            // Just update the local state and let the save function handle it
          } catch (error) {
            console.error('Error handling location selection:', error);
            Alert.alert('Error', 'There was an error setting the location. Please try again.');
          }
        }}
        initialLocation={selectedLocation || undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  addButton: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#1c1c1e',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowText: {
    marginLeft: 12,
    flex: 1,
  },
  rowTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '400',
  },
  rowSubtitle: {
    color: '#8e8e93',
    fontSize: 15,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    color: '#8e8e93',
    fontSize: 17,
    marginRight: 8,
  },
  datePickerButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2c2c2e',
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  locationNote: {
    color: '#8e8e93',
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  locationButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2c2c2e',
    borderRadius: 8,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  addImageText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
  },
  urlText: {
    color: '#8e8e93',
    fontSize: 17,
    fontWeight: '400',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1c1c1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383a',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  modalDoneButton: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383a',
  },
  modalOptionText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '400',
  },
  modalOptionTextSelected: {
    color: '#007AFF',
  },
  modalNote: {
    color: '#8e8e93',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
});
