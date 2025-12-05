import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import moment from 'moment';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useTodoContext } from '../../context/TodoContext';

const repeatOptions = ['Never', 'Daily', 'Weekdays', 'Weekends', 'Weekly', 'Biweekly', 'Monthly', 'Yearly'];

export default function NewFocusTaskScreen() {
  const { addTodo } = useTodoContext();
  const [taskName, setTaskName] = useState('');
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [duration, setDuration] = useState('25');
  const [repeat, setRepeat] = useState('Never');
  const [showRepeatModal, setShowRepeatModal] = useState(false);

  const handleSave = () => {
    if (!taskName.trim() || !selectedTime) return;

    // Create a focus task with pomodoro enabled
    const newTodo = {
      id: `focus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID
      text: taskName.trim(),
      done: false,
      dueDate: selectedTime,
      createdAt: new Date(),
      repeat: repeat !== 'Never' ? repeat : undefined,
      pomodoro: {
        enabled: true,
        workTime: parseInt(duration) || 25,
        workUnit: 'min' as const,
        breakTime: 5,
        breakUnit: 'min' as const,
        sessions: 1,
      },
      notes: 'Focus session',
      priority: 'medium' as const,
      listId: 'focus', // Special list for focus tasks
    };

    addTodo(newTodo);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const formatTime = (date: Date) => {
    return moment(date).format('h:mm A');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Focus Time</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveBtn, (!taskName.trim() || !selectedTime) && styles.saveBtnDisabled]}
          disabled={!taskName.trim() || !selectedTime}
        >
          <Text style={[styles.saveBtnText, (!taskName.trim() || !selectedTime) && styles.saveBtnTextDisabled]}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.inputSection}>
            <Text style={styles.label}>What do you want to focus on?</Text>
            <TextInput
              style={styles.taskInput}
              placeholder="e.g., Reading, Coding, Writing..."
              placeholderTextColor="#999"
              value={taskName}
              onChangeText={setTaskName}
              autoFocus
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>When do you want to start?</Text>
            <TouchableOpacity 
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color="#67c99a" />
              <Text style={styles.timeButtonText}>
                {selectedTime ? formatTime(selectedTime) : 'Select time'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput
              style={styles.taskInput}
              placeholder="25"
              placeholderTextColor="#999"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Repeat</Text>
            <TouchableOpacity 
              style={styles.timeButton}
              onPress={() => setShowRepeatModal(true)}
            >
              <Ionicons name="repeat" size={20} color={repeat !== 'Never' ? '#67c99a' : '#999'} />
              <Text style={[styles.timeButtonText, repeat !== 'Never' && { color: '#67c99a' }]}>
                {repeat}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#67c99a" />
            <Text style={styles.infoText}>
              This will create a {duration || '25'}-minute focus session that appears in your Today's Tasks. 
              Tap the play button to start your focus timer.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <DateTimePickerModal
        isVisible={showTimePicker}
        mode="time"
        onConfirm={(time) => {
          setSelectedTime(time);
          setShowTimePicker(false);
        }}
        onCancel={() => setShowTimePicker(false)}
        minimumDate={new Date()}
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
                <Text style={[styles.modalOptionText, repeat === option && styles.modalOptionSelected]}>
                  {option}
                </Text>
                {repeat === option && (
                  <Ionicons name="checkmark" size={20} color="#67c99a" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cancelBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveBtn: {
    backgroundColor: '#67c99a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnDisabled: {
    backgroundColor: '#e9ecef',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  saveBtnTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  taskInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  timeButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#67c99a',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#67c99a',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionSelected: {
    color: '#67c99a',
    fontWeight: '600',
  },
});
