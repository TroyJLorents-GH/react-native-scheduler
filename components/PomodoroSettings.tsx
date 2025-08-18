import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface PomodoroSettingsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  workTime: number;
  onWorkTimeChange: (time: number) => void;
  workUnit: 'min' | 'hour';
  onWorkUnitChange: (unit: 'min' | 'hour') => void;
  breakTime: number;
  onBreakTimeChange: (time: number) => void;
  breakUnit: 'min' | 'hour';
  onBreakUnitChange: (unit: 'min' | 'hour') => void;
}

export default function PomodoroSettings({
  enabled,
  onToggle,
  workTime,
  onWorkTimeChange,
  workUnit,
  onWorkUnitChange,
  breakTime,
  onBreakTimeChange,
  breakUnit,
  onBreakUnitChange,
}: PomodoroSettingsProps) {
  const [showWorkDropdown, setShowWorkDropdown] = useState(false);
  const [showBreakDropdown, setShowBreakDropdown] = useState(false);
  const [workInputValue, setWorkInputValue] = useState(workTime.toString());
  const [breakInputValue, setBreakInputValue] = useState(breakTime.toString());
  const workInputRef = useRef<TextInput>(null);
  const breakInputRef = useRef<TextInput>(null);

  // Update input values when props change
  useEffect(() => {
    setWorkInputValue(workTime.toString());
  }, [workTime]);

  useEffect(() => {
    setBreakInputValue(breakTime.toString());
  }, [breakTime]);

  const TimeUnitDropdown = ({ 
    value, 
    onValueChange, 
    isVisible, 
    onToggle 
  }: { 
    value: 'min' | 'hour'; 
    onValueChange: (value: 'min' | 'hour') => void; 
    isVisible: boolean; 
    onToggle: () => void; 
  }) => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity style={styles.dropdownButton} onPress={onToggle}>
        <Text style={styles.dropdownText}>{value}</Text>
        <Ionicons 
          name={isVisible ? 'chevron-up' : 'chevron-down'} 
          size={16} 
          color="#fff" 
        />
      </TouchableOpacity>
      {isVisible && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity 
            style={styles.dropdownItem} 
            onPress={() => {
              onValueChange('min');
              onToggle();
            }}
          >
            <Text style={styles.dropdownItemText}>min</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.dropdownItem} 
            onPress={() => {
              onValueChange('hour');
              onToggle();
            }}
          >
            <Text style={styles.dropdownItemText}>hour</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with toggle */}
      <View style={styles.header}>
        <Text style={styles.title}>Pomodoros</Text>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: '#767577', true: '#4CAF50' }}
          thumbColor={enabled ? '#fff' : '#f4f3f4'}
        />
      </View>

      {/* Settings (only show if enabled) */}
      {enabled && (
        <View style={styles.settings}>
          {/* Work Sprint */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>Work sprint</Text>
            <View style={styles.inputContainer}>
              <TextInput
                ref={workInputRef}
                style={styles.numberInput}
                value={workInputValue}
                onChangeText={(text) => {
                  setWorkInputValue(text);
                  const num = parseInt(text);
                  if (!isNaN(num) && num > 0 && num <= 999) {
                    onWorkTimeChange(num);
                  }
                }}
                onFocus={() => {
                  // Clear the input when focused
                  setWorkInputValue('');
                }}
                onBlur={() => {
                  // Restore the value if input is empty
                  if (workInputValue === '') {
                    setWorkInputValue(workTime.toString());
                  }
                }}
                keyboardType="numeric"
                maxLength={3}
                textAlign="center"
              />
              <TimeUnitDropdown
                value={workUnit}
                onValueChange={onWorkUnitChange}
                isVisible={showWorkDropdown}
                onToggle={() => setShowWorkDropdown(!showWorkDropdown)}
              />
            </View>
          </View>

          {/* Break */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>Break</Text>
            <View style={styles.inputContainer}>
              <TextInput
                ref={breakInputRef}
                style={styles.numberInput}
                value={breakInputValue}
                onChangeText={(text) => {
                  setBreakInputValue(text);
                  const num = parseInt(text);
                  if (!isNaN(num) && num > 0 && num <= 999) {
                    onBreakTimeChange(num);
                  }
                }}
                onFocus={() => {
                  // Clear the input when focused
                  setBreakInputValue('');
                }}
                onBlur={() => {
                  // Restore the value if input is empty
                  if (breakInputValue === '') {
                    setBreakInputValue(breakTime.toString());
                  }
                }}
                keyboardType="numeric"
                maxLength={3}
                textAlign="center"
              />
              <TimeUnitDropdown
                value={breakUnit}
                onValueChange={onBreakUnitChange}
                isVisible={showBreakDropdown}
                onToggle={() => setShowBreakDropdown(!showBreakDropdown)}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  settings: {
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  numberInput: {
    backgroundColor: '#2c2c2e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  numberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownButton: {
    backgroundColor: '#2c2c2e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 60,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#2c2c2e',
    borderRadius: 8,
    marginTop: 4,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3c3c3e',
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
  },
});
