import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ImageBackground, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useFocusContext } from '../../context/FocusContext';
import { useTheme } from '../../context/ThemeContext';
import { useTodoContext } from '../../context/TodoContext';

const FOCUS_TITLE_COLOR_KEY = 'focus.title.color';
const FOCUS_BG_URI_KEY = 'focus.bg.uri';

type Subtask = {
  id: string;
  text: string;
  done: boolean;
};

export default function FocusTab() {
  const { startFocusSession, session, pause, resume, stop, skipToNext } = useFocusContext();
  const { focusTask, focusTaskId } = useLocalSearchParams();
  const { todos, updateTodo, addTodo } = useTodoContext();
  const { colors, isDark } = useTheme();

  // UI-only state
  const [title, setTitle] = useState('');
  const [titleDraft, setTitleDraft] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [input, setInput] = useState('');
  const [subtasksSheetOpen, setSubtasksSheetOpen] = useState(false);
  const [timerSheetOpen, setTimerSheetOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const titleInputRef = useRef<TextInput>(null);
  const [titleColor, setTitleColor] = useState<string>('#5b47a8');
  const [colorSheetOpen, setColorSheetOpen] = useState(false);
  const [bgUri, setBgUri] = useState<string | null>(null);

  // Timer configuration (used to start sessions)
  const [workLenSec, setWorkLenSec] = useState(25 * 60);
  const [breakLenSec, setBreakLenSec] = useState(5 * 60);
  const [totalSessions, setTotalSessions] = useState(1);
  const [timeInput, setTimeInput] = useState('25');
  const [breakInput, setBreakInput] = useState('5');
  const [sessionsInput, setSessionsInput] = useState('1');
  const [repeat, setRepeat] = useState<string>('Never');
  const repeatOptions = ['Never', 'Daily', 'Weekdays', 'Weekends', 'Weekly', 'Biweekly', 'Monthly', 'Yearly'];

  // Derive display values from global session when active
  const phase = session?.phase ?? 'idle';
  const seconds = session?.remainingSec ?? workLenSec;
  const sessionsLeft = session?.sessionsLeft ?? totalSessions;
  const displayTotalSessions = session?.totalSessions ?? totalSessions;
  const displayWorkLen = session?.workDurationSec ?? workLenSec;
  const displayBreakLen = session?.breakDurationSec ?? breakLenSec;

  // Load saved title color and background
  useEffect(() => {
    (async () => {
      try {
        const c = await AsyncStorage.getItem(FOCUS_TITLE_COLOR_KEY);
        if (c) setTitleColor(c);
        const savedBg = await AsyncStorage.getItem(FOCUS_BG_URI_KEY);
        if (savedBg) setBgUri(savedBg);
      } catch {}
    })();
  }, []);

  // Load focus task settings when focusTaskId changes
  useEffect(() => {
    if (focusTaskId) {
      const focusTodo = todos.find(t => t.id === focusTaskId);
      if (focusTodo?.pomodoro) {
        const pomo = focusTodo.pomodoro;
        setTitle(focusTodo.text);
        setWorkLenSec((pomo.workTime || 25) * 60);
        setBreakLenSec((pomo.breakTime || 5) * 60);
        setTotalSessions((pomo as any).sessions || 1);
      }
    } else if (focusTask) {
      setTitle(String(focusTask));
    }
  }, [focusTaskId, focusTask, todos]);

  // Sync title from global session
  useEffect(() => {
    if (session) setTitle(session.title);
  }, [session?.title]);

  // Close subtasks sheet when keyboard dismissed
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidHide', () => {
      if (subtasksSheetOpen) setSubtasksSheetOpen(false);
    });
    return () => sub.remove();
  }, [subtasksSheetOpen]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  const parseTime = (v: string) => {
    const t = v.trim();
    if (/^\d{1,3}$/.test(t)) return parseInt(t, 10) * 60;
    if (/^\d{1,3}:\d{2}$/.test(t)) {
      const [m, s] = t.split(':');
      return parseInt(m, 10) * 60 + parseInt(s, 10);
    }
    if (/^\d{1,3}:\d{2}:\d{2}$/.test(t)) {
      const [h, m, s] = t.split(':');
      return parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseInt(s, 10);
    }
    return 0;
  };

  const commitTimerSettings = () => {
    const w = parseTime(timeInput);
    const b = parseTime(breakInput);
    const ses = Math.max(1, parseInt(sessionsInput || '1', 10));
    if (w > 0) setWorkLenSec(w);
    if (b > 0) setBreakLenSec(b);
    setTotalSessions(ses);

    // Update the focus task in todos if it exists
    if (focusTaskId) {
      const focusTodo = todos.find(t => t.id === focusTaskId);
      if (focusTodo) {
        updateTodo(focusTodo.id, {
          repeat: repeat !== 'Never' ? repeat : undefined,
          pomodoro: {
            enabled: true,
            workTime: Math.floor((w > 0 ? w : workLenSec) / 60),
            workUnit: 'min' as const,
            breakTime: Math.floor((b > 0 ? b : breakLenSec) / 60),
            breakUnit: 'min' as const,
            sessions: ses,
          } as any,
        });
      }
    }

    // Auto-save as recurring focus task if repeat is set
    if (repeat !== 'Never' && title.trim() && !focusTaskId) {
      const newTodo = {
        id: `focus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: title.trim(),
        done: false,
        dueDate: new Date(),
        createdAt: new Date(),
        repeat: repeat,
        pomodoro: {
          enabled: true,
          workTime: Math.floor((w > 0 ? w : workLenSec) / 60),
          workUnit: 'min' as const,
          breakTime: Math.floor((b > 0 ? b : breakLenSec) / 60),
          breakUnit: 'min' as const,
          sessions: ses,
        },
        notes: 'Focus session',
        priority: 'medium' as const,
        listId: 'focus',
        subTasks: subtasks.length > 0 ? subtasks.map(s => ({
          id: s.id, text: s.text, done: s.done, listId: 'focus', createdAt: new Date(),
        })) : undefined,
      };
      addTodo(newTodo);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved!', `"${title}" will repeat ${repeat.toLowerCase()}. You can find it in your Focus list.`, [{ text: 'OK' }]);
    }
  };

  const handleStart = () => {
    startFocusSession({
      title: title || 'Focus Session',
      workMinutes: Math.max(1, Math.floor(workLenSec / 60)),
      breakMinutes: Math.max(0.5, Math.floor(breakLenSec / 60)),
      sessions: totalSessions,
    });
  };

  const saveAsTask = () => {
    if (!title.trim()) {
      Alert.alert('Enter a title', 'Please enter what you want to focus on before saving.');
      return;
    }
    const newTodo = {
      id: `focus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: title.trim(),
      done: false,
      dueDate: new Date(),
      createdAt: new Date(),
      repeat: repeat !== 'Never' ? repeat : undefined,
      pomodoro: {
        enabled: true,
        workTime: Math.floor(workLenSec / 60),
        workUnit: 'min' as const,
        breakTime: Math.floor(breakLenSec / 60),
        breakUnit: 'min' as const,
        sessions: totalSessions,
      },
      notes: 'Focus session',
      priority: 'medium' as const,
      listId: 'focus',
      subTasks: subtasks.length > 0 ? subtasks.map(s => ({
        id: s.id, text: s.text, done: s.done, listId: 'focus', createdAt: new Date(),
      })) : undefined,
    };
    addTodo(newTodo);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Saved!', `"${title}" has been saved to your Focus list.`, [{ text: 'OK' }]);
  };

  const addSubtask = () => {
    if (!input.trim()) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setSubtasks(prev => [...prev, { id, text: input.trim(), done: false }]);
    setInput('');
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  const pickBackgroundImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setBgUri(uri);
      try { await AsyncStorage.setItem(FOCUS_BG_URI_KEY, uri); } catch {}
    }
  };

  const clearBackgroundImage = async () => {
    setBgUri(null);
    try { await AsyncStorage.removeItem(FOCUS_BG_URI_KEY); } catch {}
  };

  // Progress for the circular ring
  const currentTotal = phase === 'break' ? displayBreakLen : displayWorkLen;
  const progress = currentTotal > 0 ? 1 - (seconds / currentTotal) : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {bgUri ? (
        <ImageBackground source={{ uri: bgUri }} style={StyleSheet.absoluteFillObject as any} imageStyle={styles.bgImage} />
      ) : null}
      {focusTaskId ? (
        <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', left: 16, top: 16, zIndex: 10, padding: 8 }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
      ) : null}

      {/* Title bar */}
      <View style={styles.titlePill}>
        <TouchableOpacity
          style={[styles.titleBox, { backgroundColor: titleColor }]}
          activeOpacity={0.9}
          onPress={() => {
            if (!editingTitle) {
              setTitleDraft(title);
              setEditingTitle(true);
              setTimeout(() => titleInputRef.current?.focus(), 0);
            }
          }}
        >
          <View style={styles.titleContent}>
            {editingTitle ? (
              <TextInput
                ref={titleInputRef}
                style={styles.titleEditInput}
                placeholder="What are you focusing on?"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={titleDraft}
                onChangeText={setTitleDraft}
                returnKeyType="done"
                onSubmitEditing={() => { if (titleDraft.trim().length) setTitle(titleDraft.trim()); setEditingTitle(false); }}
                onBlur={() => { if (titleDraft.trim().length) setTitle(titleDraft.trim()); setEditingTitle(false); }}
              />
            ) : (
              <Text style={styles.titleLabel} numberOfLines={1}>
                {title ? title : <Text style={styles.titlePlaceholder}>Tap to set focus task...</Text>}
              </Text>
            )}
          </View>
          <View style={styles.titleIcons}>
            <TouchableOpacity
              onPress={() => {
                if (editingTitle) { setEditingTitle(false); }
                else { setTitleDraft(title); setEditingTitle(true); setTimeout(() => titleInputRef.current?.focus(), 0); }
              }}
              style={styles.titleIcon}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={pickBackgroundImage} style={styles.titleIcon}>
              <Ionicons name="image-outline" size={20} color="#fff" />
            </TouchableOpacity>
            {bgUri && (
              <TouchableOpacity onPress={clearBackgroundImage} style={styles.titleIcon}>
                <Ionicons name="trash-outline" size={20} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setColorSheetOpen(true)} style={styles.titleIcon}>
              <Ionicons name="color-palette-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.centerWrap}>
        <View style={[styles.timerPane, bgUri && { opacity: 0.9 }]}>
          <View style={[styles.timerRing, { backgroundColor: isDark ? '#0f1116' : '#e8eaf0', borderColor: isDark ? '#2e313a' : '#d0d3dc' }, bgUri && { backgroundColor: 'rgba(0,0,0,0.12)', borderColor: 'rgba(46,49,58,0.25)' }]}>
            <Svg width={280} height={280} style={{ position: 'absolute' }}>
              <Circle cx={140} cy={140} r={130} stroke={isDark ? '#1f2230' : '#d0d3dc'} strokeWidth={10} fill="none" opacity={bgUri ? 0.45 : 1} />
              <Circle
                cx={140} cy={140} r={130}
                stroke={titleColor}
                strokeOpacity={bgUri ? 0.65 : 0.35}
                strokeWidth={10}
                strokeDasharray={`${(progress * 2 * Math.PI * 130).toFixed(2)} ${(2 * Math.PI * 130).toFixed(2)}`}
                strokeLinecap="round"
                fill="none"
                transform="rotate(-90 140 140)"
              />
              {(() => {
                const angle = -Math.PI / 2 + progress * 2 * Math.PI;
                const r = 130;
                const x = 140 + r * Math.cos(angle);
                const y = 140 + r * Math.sin(angle);
                return <Circle cx={x} cy={y} r={7} fill={titleColor} stroke="#fff" strokeWidth={2} />;
              })()}
            </Svg>
            <TouchableOpacity activeOpacity={0.8} onPress={() => { if (phase === 'idle') { setTimeInput(''); setTimerSheetOpen(true); } }}>
              <Text style={[styles.timeText, { color: colors.text }, bgUri && { color: 'rgba(255,255,255,0.92)' }]}>{fmt(seconds)}</Text>
            </TouchableOpacity>
            {phase === 'break' && <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '600', marginTop: 4 }}>Break</Text>}
          </View>

          <View style={styles.controlsRow}>
            <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: colors.surfaceElevated }]} onPress={() => { setTimeInput(''); setTimerSheetOpen(true); }}>
              <Text style={[styles.ctrlTxt, { color: colors.text }]}>Set Timer</Text>
            </TouchableOpacity>

            {phase === 'idle' && (
              <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: titleColor }]} onPress={handleStart}>
                <Text style={styles.ctrlTxt}>Start to Focus</Text>
              </TouchableOpacity>
            )}
            {phase === 'work' && (
              <>
                <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: '#ffb64f' }]} onPress={pause}><Text style={styles.ctrlTxt}>Pause</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: '#f87171' }]} onPress={stop}><Text style={styles.ctrlTxt}>Stop</Text></TouchableOpacity>
              </>
            )}
            {phase === 'paused' && (
              <>
                <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: colors.accent }]} onPress={resume}><Text style={styles.ctrlTxt}>Resume</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: '#f87171' }]} onPress={stop}><Text style={styles.ctrlTxt}>Stop</Text></TouchableOpacity>
              </>
            )}
            {phase === 'break' && (
              <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: colors.accent }]} onPress={skipToNext}><Text style={styles.ctrlTxt}>Start Next</Text></TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: colors.surfaceElevated }]} onPress={() => setSubtasksSheetOpen(true)}>
              <Text style={[styles.ctrlTxt, { color: colors.text }]}>Subtasks</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.sessionDotsRow, bgUri && styles.sessionPillOverBg]}>
            {Array.from({ length: displayTotalSessions }).map((_, i) => {
              const progressIndex = Math.max(0, displayTotalSessions - sessionsLeft);
              const isActive = (phase === 'work' || phase === 'break' || phase === 'paused') && progressIndex === i;
              const isCompleted = progressIndex > i;
              const baseColor = bgUri ? '#ffffff' : titleColor;
              const opacity = isCompleted ? 0.95 : isActive ? 0.95 : 0.55;
              return (
                <View key={i} style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: baseColor, opacity }} />
              );
            })}
          </View>
          <Text style={[styles.statsText, { color: colors.textSecondary }]}>
            Session {Math.max(1, displayTotalSessions - sessionsLeft + (phase === 'idle' ? 0 : 1))}/{displayTotalSessions}
          </Text>
        </View>
      </View>

      {/* Subtasks Bottom Sheet */}
      <Modal transparent visible={subtasksSheetOpen} animationType="slide" onRequestClose={() => setSubtasksSheetOpen(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setSubtasksSheetOpen(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={[styles.sheetContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sideHeader, { color: colors.text }]}>Subtasks</Text>
              <ScrollView style={{ maxHeight: 260 }} contentContainerStyle={{ paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
                {subtasks.map((s) => (
                  <TouchableOpacity key={s.id} style={[styles.subtaskItem, { backgroundColor: colors.surfaceElevated, flexDirection: 'row', alignItems: 'center' }]}
                    onPress={() => toggleSubtask(s.id)} activeOpacity={0.8}
                  >
                    <Ionicons name={s.done ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={s.done ? colors.accent : colors.textTertiary} style={{ marginRight: 10 }} />
                    <Text style={[styles.subtaskLabel, { color: colors.text }, s.done && { textDecorationLine: 'line-through', color: colors.textSecondary }]}>{s.text}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.subtaskInputRow}>
                <TextInput
                  style={[styles.subtaskInput, { color: colors.text, backgroundColor: colors.inputBg }]}
                  placeholder="Add subtask"
                  placeholderTextColor={colors.placeholder}
                  value={input}
                  onChangeText={setInput}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={() => { addSubtask(); Keyboard.dismiss(); setSubtasksSheetOpen(false); }}
                />
                <TouchableOpacity onPress={() => { addSubtask(); Keyboard.dismiss(); setSubtasksSheetOpen(false); }}><Text style={[styles.addBtn, { color: colors.accent }]}>Add</Text></TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Title Color Picker Bottom Sheet */}
      <Modal transparent visible={colorSheetOpen} animationType="slide" onRequestClose={() => setColorSheetOpen(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setColorSheetOpen(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={[styles.sheetContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sideHeader, { color: colors.text }]}>Choose Title Color</Text>
              <View style={styles.colorWheelContainer}>
                <View style={styles.colorWheel}>
                  {[
                    '#5b47a8', '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7',
                    '#64748b', '#14b8a6', '#67c99a', '#556de8', '#ff6b6b', '#4ecdc4',
                    '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd',
                    '#00d2d3', '#ff9f43', '#10ac84', '#ee5a24', '#0984e3', '#6c5ce7',
                  ].map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => setTitleColor(color)}
                      style={[styles.colorSwatch, { backgroundColor: color }, titleColor === color && styles.selectedSwatch]}
                    />
                  ))}
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <TouchableOpacity style={[styles.applyBtn, { backgroundColor: colors.accent }]} onPress={async () => { await AsyncStorage.setItem(FOCUS_TITLE_COLOR_KEY, titleColor).catch(() => {}); setColorSheetOpen(false); }}>
                  <Text style={{ color: '#0b0b0c', fontWeight: '700' }}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Timer Edit Bottom Sheet */}
      <Modal transparent visible={timerSheetOpen} animationType="slide" onRequestClose={() => setTimerSheetOpen(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setTimerSheetOpen(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ maxHeight: '80%' }}>
            <View style={[styles.sheetContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sideHeader, { color: colors.text }]}>Timer Settings</Text>
              <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={[styles.sheetLabel, { color: colors.textSecondary }]}>Focus time (minutes)</Text>
                <TextInput
                  style={[styles.timerInputField, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                  placeholder="25"
                  placeholderTextColor={colors.placeholder}
                  value={timeInput}
                  onChangeText={setTimeInput}
                  onFocus={() => { if (timeInput === '25' || timeInput === String(Math.floor(workLenSec / 60))) setTimeInput(''); }}
                  keyboardType="number-pad"
                  returnKeyType="done"
                />
                <Text style={[styles.sheetLabel, { marginTop: 10, color: colors.textSecondary }]}>Break time (minutes)</Text>
                <TextInput
                  style={[styles.timerInputField, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                  placeholder="5"
                  placeholderTextColor={colors.placeholder}
                  value={breakInput}
                  onChangeText={setBreakInput}
                  onFocus={() => { if (breakInput === '5' || breakInput === String(Math.floor(breakLenSec / 60))) setBreakInput(''); }}
                  keyboardType="number-pad"
                  returnKeyType="done"
                />
                <Text style={[styles.sheetLabel, { marginTop: 10, color: colors.textSecondary }]}>Sessions / intervals</Text>
                <TextInput
                  style={[styles.timerInputField, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                  placeholder="1"
                  placeholderTextColor={colors.placeholder}
                  value={sessionsInput}
                  onChangeText={setSessionsInput}
                  onFocus={() => { if (sessionsInput === '1' || sessionsInput === String(totalSessions)) setSessionsInput(''); }}
                  keyboardType="number-pad"
                  returnKeyType="done"
                />

                <Text style={[styles.sheetLabel, { marginTop: 10, color: colors.textSecondary }]}>Repeat</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  {repeatOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.repeatChip, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }, repeat === option && { backgroundColor: colors.accentLight, borderColor: colors.accent }]}
                      onPress={() => setRepeat(option)}
                    >
                      <Text style={[styles.repeatChipText, { color: colors.textSecondary }, repeat === option && { color: colors.accent, fontWeight: '600' }]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </ScrollView>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
                <TouchableOpacity style={[styles.applyBtn, { backgroundColor: colors.surfaceElevated }]} onPress={() => { Keyboard.dismiss(); setTimerSheetOpen(false); }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.applyBtn, { backgroundColor: colors.accent }]} onPress={() => { Keyboard.dismiss(); commitTimerSettings(); setTimerSheetOpen(false); }}>
                  <Text style={{ color: '#0b0b0c', fontWeight: '700' }}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  bgImage: { resizeMode: 'cover' },
  titlePill: { alignItems: 'center', marginBottom: 16, marginTop: 40, paddingHorizontal: 16 },
  titleBox: { width: '100%', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleContent: { flex: 1, marginRight: 8 },
  titleLabel: { color: '#fff', fontSize: 17, fontWeight: '600' },
  titlePlaceholder: { color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', fontWeight: '400' },
  titleEditInput: { color: '#fff', fontSize: 17, minWidth: 120 },
  titleIcons: { flexDirection: 'row', alignItems: 'center' },
  titleIcon: { marginLeft: 12, padding: 4 },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  timerPane: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  timerRing: { width: 260, height: 260, borderRadius: 130, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  timeText: { fontSize: 56, fontWeight: '800', letterSpacing: 1 },
  controlsRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  ctrlBtn: { borderRadius: 22, paddingHorizontal: 18, paddingVertical: 10 },
  ctrlTxt: { color: '#0b0b0c', fontWeight: '700' },
  statsText: { marginTop: 10 },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetContainer: { padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  sessionDotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  sessionPillOverBg: { backgroundColor: 'rgba(17,17,17,0.35)' },
  sideHeader: { fontWeight: '700', marginBottom: 10 },
  subtaskItem: { padding: 10, borderRadius: 8, marginBottom: 8 },
  subtaskLabel: {},
  subtaskInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  subtaskInput: { flex: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  addBtn: { fontWeight: '700' },
  timerInputField: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, borderWidth: 1, minHeight: 44 },
  applyBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  sheetLabel: { fontSize: 12, marginTop: 4 },
  colorWheelContainer: { marginVertical: 8 },
  colorWheel: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  colorSwatch: { width: 40, height: 40, borderRadius: 20, margin: 4 },
  selectedSwatch: { borderWidth: 3, borderColor: '#fff', transform: [{ scale: 1.1 }] },
  repeatChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  repeatChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
