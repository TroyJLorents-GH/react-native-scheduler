import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function DetailsScreen() {
  const params = useLocalSearchParams();
  const { title, notes, listId, isNew } = params;

  // State for reminder settings
  const [dateEnabled, setDateEnabled] = useState(false);
  const [timeEnabled, setTimeEnabled] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [earlyReminder, setEarlyReminder] = useState('None');
  const [repeat, setRepeat] = useState('Never');
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [flagEnabled, setFlagEnabled] = useState(false);
  const [priority, setPriority] = useState('None');
  const [tags, setTags] = useState<string[]>([]);

  // Modal states
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showEarlyReminderModal, setShowEarlyReminderModal] = useState(false);

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
    // Here you would save all the details to your todo context
    // For now, just show a success message and go back
    Alert.alert('Success', 'Details saved successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const repeatOptions = ['Never', 'Daily', 'Weekdays', 'Weekends', 'Weekly', 'Biweekly', 'Monthly', 'Yearly'];
  const priorityOptions = ['None', 'Low', 'Medium', 'High'];
  const earlyReminderOptions = ['None', '5 minutes before', '15 minutes before', '1 hour before', '1 day before'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.addButton}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
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

        {/* Tags */}
        <TouchableOpacity style={styles.section} onPress={() => setShowTagsModal(true)}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="pricetag" size={24} color="#8e8e93" />
              <Text style={styles.rowTitle}>Tags</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{tags.length > 0 ? `${tags.length} tag${tags.length > 1 ? 's' : ''}` : 'Add tags'}</Text>
              <Ionicons name="chevron-forward" size={20} color="#8e8e93" />
            </View>
          </View>
        </TouchableOpacity>

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
            <Text style={styles.locationNote}>Location services will be implemented with Google Maps API</Text>
          )}
        </View>

        {/* Flag */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="flag" size={24} color="#FF9500" />
              <Text style={styles.rowTitle}>Flag</Text>
            </View>
            <Switch
              value={flagEnabled}
              onValueChange={setFlagEnabled}
              trackColor={{ false: '#38383a', true: '#34C759' }}
              thumbColor="#fff"
            />
          </View>
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
      </ScrollView>

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
        transparent
        animationType="slide"
        onRequestClose={() => setShowRepeatModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Repeat</Text>
              <TouchableOpacity onPress={() => setShowRepeatModal(false)}>
                <Text style={styles.modalDone}>Done</Text>
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
                <Text style={styles.modalOptionText}>{option}</Text>
                {repeat === option && (
                  <Ionicons name="checkmark" size={24} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Priority Modal */}
      <Modal
        visible={showPriorityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPriorityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Priority</Text>
              <TouchableOpacity onPress={() => setShowPriorityModal(false)}>
                <Text style={styles.modalDone}>Done</Text>
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
                <Text style={styles.modalOptionText}>{option}</Text>
                {priority === option && (
                  <Ionicons name="checkmark" size={24} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Early Reminder Modal */}
      <Modal
        visible={showEarlyReminderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEarlyReminderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Early Reminder</Text>
              <TouchableOpacity onPress={() => setShowEarlyReminderModal(false)}>
                <Text style={styles.modalDone}>Done</Text>
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
                <Text style={styles.modalOptionText}>{option}</Text>
                {earlyReminder === option && (
                  <Ionicons name="checkmark" size={24} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Tags Modal */}
      <Modal
        visible={showTagsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTagsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tags</Text>
              <TouchableOpacity onPress={() => setShowTagsModal(false)}>
                <Text style={styles.modalDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalNote}>Tag functionality will be implemented with a proper tag management system</Text>
          </View>
        </View>
      </Modal>
    </View>
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
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  addButton: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#1c1c1e',
    marginBottom: 1,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '400',
    marginTop: 2,
  },
  rowDescription: {
    color: '#8e8e93',
    fontSize: 15,
    fontWeight: '400',
    marginTop: 2,
    lineHeight: 20,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    color: '#8e8e93',
    fontSize: 17,
    fontWeight: '400',
    marginRight: 8,
  },
  datePickerButton: {
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#38383a',
  },
  datePickerText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '400',
  },
  addImageText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '400',
    paddingVertical: 12,
  },
  urlText: {
    color: '#8e8e93',
    fontSize: 17,
    fontWeight: '400',
    paddingVertical: 12,
  },
  locationNote: {
    color: '#8e8e93',
    fontSize: 14,
    fontWeight: '400',
    paddingVertical: 8,
    paddingTop: 0,
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
    paddingBottom: 50,
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
  modalDone: {
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
  modalNote: {
    color: '#8e8e93',
    fontSize: 15,
    fontWeight: '400',
    padding: 16,
    textAlign: 'center',
  },
});
