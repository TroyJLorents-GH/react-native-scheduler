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
import { useTodoContext } from '../../context/TodoContext';

const STATS_KEY_PREFIX = 'focus.stats.'; // focus.stats.YYYY-MM-DD
const FOCUS_TITLE_COLOR_KEY = 'focus.title.color';
const FOCUS_BG_URI_KEY = 'focus.bg.uri';

type Subtask = {
  id: string;
  text: string;
  done: boolean;
};

export default function FocusTab() {
  const { startFocusSession, session: globalSession, pause: globalPause, resume: globalResume, stop: globalStop } = useFocusContext();
  const { focusTask, focusTaskId } = useLocalSearchParams();
  const { todos, updateTodo, addTodo } = useTodoContext();
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

  // Check if we're synced to global session
  const isSyncedToGlobal = !!globalSession;

  // Timer state (pomodoro) - synced from global when active
  const [phase, setPhase] = useState<'idle'|'work'|'break'|'paused'>('idle');
  const [seconds, setSeconds] = useState(25 * 60);
  const [workLenSec, setWorkLenSec] = useState(25 * 60);
  const [breakLenSec, setBreakLenSec] = useState(5 * 60);
  const [totalSessions, setTotalSessions] = useState(1);
  const [sessionsLeft, setSessionsLeft] = useState(1);
  const [editingTime, setEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState('25');
  const [breakInput, setBreakInput] = useState('5');
  const [sessionsInput, setSessionsInput] = useState('1');
  const [repeat, setRepeat] = useState<string>('Never');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const repeatOptions = ['Never', 'Daily', 'Weekdays', 'Weekends', 'Weekly', 'Biweekly', 'Monthly', 'Yearly'];

  // Sync local state with global session when it exists
  useEffect(() => {
    if (globalSession) {
      setTitle(globalSession.title);
      setSeconds(globalSession.remainingSec);
      setWorkLenSec(globalSession.totalSec);
      setPhase(globalSession.phase);
    }
  }, [globalSession, globalSession?.remainingSec, globalSession?.phase]);
  const todayKey = useMemo(() => {
    const d = new Date();
    return `${STATS_KEY_PREFIX}${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }, []);
  const [todayFocusSeconds, setTodayFocusSeconds] = useState(0);

  const loadStats = async () => {
    try {
      const raw = await AsyncStorage.getItem(todayKey);
      setTodayFocusSeconds(raw ? Number(raw) || 0 : 0);
    } catch {}
  };
  useEffect(() => { loadStats(); }, [todayKey]);

  // Load saved title color
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
        setSessionsLeft((pomo as any).sessions || 1);
        if (phase === 'idle') {
          setSeconds((pomo.workTime || 25) * 60);
        }
      }
    } else if (focusTask) {
      // Fallback for old focusTask parameter
      setTitle(String(focusTask));
    }
  }, [focusTaskId, focusTask, todos]);

  // Close subtasks sheet when keyboard dismissed (for smoother UX)
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidHide', () => {
      if (subtasksSheetOpen) setSubtasksSheetOpen(false);
    });
    return () => sub.remove();
  }, [subtasksSheetOpen]);

  const persistStats = async (secs: number) => {
    try { await AsyncStorage.setItem(todayKey, String(secs)); } catch {}
  };

  const fmt = (s: number) => {
    const m = Math.floor(s/60); const ss = s%60; return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  };

  // When seconds change, reflect in input if not actively editing
  useEffect(() => {
    if (!editingTime) setTimeInput(fmt(seconds));
  }, [seconds, editingTime]);

  const parseTime = (v: string) => {
    const t = v.trim();
    // Support: "5" (minutes), "5:30" (mm:ss), "1:30:45" (hh:mm:ss)
    if (/^\d{1,3}$/.test(t)) return parseInt(t, 10) * 60;
    if (/^\d{1,3}:\d{2}$/.test(t)) { 
      const [m,s] = t.split(':'); 
      return parseInt(m,10)*60 + parseInt(s,10); 
    }
    if (/^\d{1,3}:\d{2}:\d{2}$/.test(t)) {
      const [h,m,s] = t.split(':');
      return parseInt(h,10)*3600 + parseInt(m,10)*60 + parseInt(s,10);
    }
    return 0;
  };
  const commitTimeInput = () => {
    const total = parseTime(timeInput);
    if (total > 0) { setSeconds(total); setWorkLenSec(total); }
    setEditingTime(false);
  };
  const commitTimerSettings = () => {
    const w = parseTime(timeInput);
    const b = parseTime(breakInput);
    const ses = Math.max(1, parseInt(sessionsInput || '1', 10));
    if (w > 0) { setWorkLenSec(w); if (phase==='idle') setSeconds(w); }
    if (b > 0) setBreakLenSec(b);
    setTotalSessions(ses); setSessionsLeft(ses);
    
    // Update the focus task in todos if it exists
    if (focusTaskId) {
      const focusTodo = todos.find(t => t.id === focusTaskId);
      if (focusTodo) {
        updateTodo(focusTodo.id, {
          repeat: repeat !== 'Never' ? repeat : undefined,
          pomodoro: {
            enabled: true,
            workTime: Math.floor(w / 60),
            workUnit: 'min' as const,
            breakTime: Math.floor(b / 60),
            breakUnit: 'min' as const,
            sessions: ses,
          } as any
        });
      }
    }
    
    // If repeat is set and we have a title, auto-save as a recurring focus task
    if (repeat !== 'Never' && title.trim() && !focusTaskId) {
      const dueDate = new Date();
      const newTodo = {
        id: `focus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: title.trim(),
        done: false,
        dueDate: dueDate,
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
          id: s.id,
          text: s.text,
          done: s.done,
          listId: 'focus',
          createdAt: new Date(),
        })) : undefined,
      };
      
      addTodo(newTodo);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Saved!', 
        `"${title}" will repeat ${repeat.toLowerCase()}. You can find it in your Focus list.`,
        [{ text: 'OK' }]
      );
    }
  };

  const start = () => {
    if (phase === 'idle') { setSessionsLeft(totalSessions); setSeconds(workLenSec); }
    setPhase('work');
  };
  const pause = () => setPhase('paused');
  const stop = () => { setPhase('idle'); setSeconds(workLenSec); setSessionsLeft(totalSessions); };

  // Save current focus session as a task
  const saveAsTask = () => {
    if (!title.trim()) {
      Alert.alert('Enter a title', 'Please enter what you want to focus on before saving.');
      return;
    }
    
    // Create a due date for now (or you could let user pick)
    const dueDate = new Date();
    
    const newTodo = {
      id: `focus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: title.trim(),
      done: false,
      dueDate: dueDate,
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
        id: s.id,
        text: s.text,
        done: s.done,
        listId: 'focus',
        createdAt: new Date(),
      })) : undefined,
    };
    
    addTodo(newTodo);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Saved!', `"${title}" has been saved to your Focus list.`, [
      { text: 'OK' }
    ]);
  };

  useEffect(() => {
    if (phase === 'work' || phase === 'break') {
      intervalRef.current && clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            // Timer finished - vibrate to alert user!
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            
            if (phase === 'work') {
              const ns = todayFocusSeconds + workLenSec;
              setTodayFocusSeconds(ns); persistStats(ns);
              const remaining = sessionsLeft - 1;
              setSessionsLeft(remaining);
              if (remaining > 0) { 
                // Work session done, starting break
                Alert.alert('Focus Complete!', 'Great work! Time for a break.', [{ text: 'OK' }]);
                setPhase('break'); 
                return breakLenSec; 
              }
              // All sessions complete
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('All Sessions Complete!', `You've completed ${totalSessions} focus session${totalSessions > 1 ? 's' : ''}. Well done!`, [{ text: 'OK' }]);
              setPhase('idle'); 
              return workLenSec;
            } else {
              // Break done, starting next work session
              Alert.alert('Break Over', 'Ready for the next focus session?', [{ text: 'Let\'s Go!' }]);
              setPhase('work'); 
              return workLenSec;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (phase === 'paused' || phase === 'idle') {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [phase]);

  const addSubtask = () => {
    if (!input.trim()) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
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

  return (
    <SafeAreaView style={styles.container}>
      {bgUri ? (
        <ImageBackground source={{ uri: bgUri }} style={StyleSheet.absoluteFillObject as any} imageStyle={styles.bgImage} />
      ) : null}
      <TouchableOpacity onPress={() => router.back?.()} style={{ position: 'absolute', left: 16, top: 16, zIndex: 10, padding: 8 }}>
        <Ionicons name="arrow-back" size={22} color="#e7e7ea" />
      </TouchableOpacity>
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
                onSubmitEditing={() => { 
                  if (titleDraft.trim().length) setTitle(titleDraft.trim()); 
                  setEditingTitle(false); 
                }}
                onBlur={() => {
                  if (titleDraft.trim().length) setTitle(titleDraft.trim());
                  setEditingTitle(false);
                }}
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
        {/* Center Timer */}
        <View style={[styles.timerPane, bgUri && { opacity: 0.9 }]}>
          <View style={[styles.timerRing, bgUri && { backgroundColor: 'rgba(0,0,0,0.12)', borderColor: 'rgba(46,49,58,0.25)' }]}>
            <Svg width={280} height={280} style={{ position: 'absolute' }}>
              <Circle cx={140} cy={140} r={130} stroke="#1f2230" strokeWidth={10} fill="none" opacity={bgUri ? 0.45 : 1} />
              <Circle
                cx={140}
                cy={140}
                r={130}
                stroke={titleColor}
                strokeOpacity={bgUri ? 0.65 : 0.35}
                strokeWidth={10}
                strokeDasharray={`${((1 - (seconds / (phase==='work'?workLenSec:breakLenSec))) * 2 * Math.PI * 130).toFixed(2)} ${(2 * Math.PI * 130).toFixed(2)}`}
                strokeLinecap="round"
                fill="none"
                transform="rotate(-90 140 140)"
              />
              {(() => {
                const total = phase==='work' ? workLenSec : breakLenSec;
                const progress = 1 - (seconds / Math.max(1,total));
                const angle = -Math.PI/2 + progress * 2 * Math.PI; // start at top
                const r = 130;
                const x = 140 + r * Math.cos(angle);
                const y = 140 + r * Math.sin(angle);
                return <Circle cx={x} cy={y} r={7} fill={titleColor} stroke="#fff" strokeWidth={2} />
              })()}
            </Svg>
            {editingTime ? (
              <TextInput
                style={styles.timeInput}
                value={timeInput}
                onChangeText={setTimeInput}
                onSubmitEditing={commitTimeInput}
                keyboardType="number-pad"
                autoFocus
                onBlur={commitTimeInput}
                placeholder="25:00"
                placeholderTextColor="#5a5f6b"
              />
            ) : (
              <TouchableOpacity activeOpacity={0.8} onPress={() => { setTimeInput(''); setTimerSheetOpen(true); }}>
                <Text style={[styles.timeText, bgUri && { color: 'rgba(255,255,255,0.92)' }]}>{fmt(seconds)}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.controlsRow}>
            {/* Left: Set Timer */}
            <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: '#2e313a' }]} onPress={() => { setTimeInput(''); setEditingTime(true); setTimerSheetOpen(true); }}>
              <Text style={[styles.ctrlTxt, { color: '#e7e7ea' }]}>Set Timer</Text>
            </TouchableOpacity>

            {/* Middle: Dynamic action(s) - use global controls when synced */}
            {phase === 'idle' && (
              <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: titleColor }]} onPress={() => { start(); startFocusSession({ title, workMinutes: Math.max(1, Math.floor(workLenSec/60)) }); }}>
                <Text style={styles.ctrlTxt}>Start to Focus</Text>
              </TouchableOpacity>
            )}
            {phase === 'work' && (
              <>
                <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: '#ffb64f' }]} onPress={isSyncedToGlobal ? globalPause : pause}><Text style={styles.ctrlTxt}>Pause</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: '#f87171' }]} onPress={() => { if (isSyncedToGlobal) globalStop(); stop(); }}><Text style={styles.ctrlTxt}>Stop</Text></TouchableOpacity>
              </>
            )}
            {phase === 'paused' && (
              <>
                <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: '#67c99a' }]} onPress={isSyncedToGlobal ? globalResume : start}><Text style={styles.ctrlTxt}>Resume</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: '#f87171' }]} onPress={() => { if (isSyncedToGlobal) globalStop(); stop(); }}><Text style={styles.ctrlTxt}>Stop</Text></TouchableOpacity>
              </>
            )}
            {phase === 'break' && (
              <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: '#67c99a' }]} onPress={() => setPhase('work')}><Text style={styles.ctrlTxt}>Start Next</Text></TouchableOpacity>
            )}

            {/* Right: Subtasks */}
            <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: '#2e313a' }]} onPress={() => setSubtasksSheetOpen(true)}>
              <Text style={[styles.ctrlTxt, { color: '#e7e7ea' }]}>Subtasks</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.sessionDotsRow, bgUri && styles.sessionPillOverBg]}>
            {Array.from({ length: totalSessions }).map((_, i) => {
              const progressIndex = Math.max(0, totalSessions - sessionsLeft); // 0-based current session index
              const isActive = (phase === 'work' || phase === 'break' || phase === 'paused') && progressIndex === i;
              const isCompleted = progressIndex > i;
              const baseColor = bgUri ? '#ffffff' : titleColor;
              const opacity = isCompleted ? 0.95 : isActive ? 0.95 : 0.55; // pending sessions dimmed but visible
              return (
                <View
                  key={i}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: baseColor,
                    opacity,
                  }}
                />
              );
            })}
          </View>
          <Text style={styles.statsText}>Session {Math.max(1, totalSessions - sessionsLeft + (phase==='idle'?0:1))}/{totalSessions} • Focus today: {Math.floor(todayFocusSeconds/60)}m</Text>
        </View>
      </View>

      

      {/* Subtasks Bottom Sheet */}
      <Modal transparent visible={subtasksSheetOpen} animationType="slide" onRequestClose={() => setSubtasksSheetOpen(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setSubtasksSheetOpen(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.sheetContainer}>
              <Text style={styles.sideHeader}>Subtasks</Text>
              <ScrollView style={{ maxHeight: 260 }} contentContainerStyle={{ paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
                {subtasks.map((s) => (
                  <TouchableOpacity key={s.id} style={[styles.subtaskItem, { flexDirection: 'row', alignItems: 'center' }]}
                    onPress={() => toggleSubtask(s.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={s.done ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={s.done ? '#67c99a' : '#bbb'} style={{ marginRight: 10 }} />
                    <Text style={[styles.subtaskLabel, s.done && { textDecorationLine: 'line-through', color: '#8e8e93' }]}>{s.text}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.subtaskInputRow}>
                <TextInput
                  style={styles.subtaskInput}
                  placeholder="Add subtask"
                  placeholderTextColor="#8e8e93"
                  value={input}
                  onChangeText={setInput}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={() => { addSubtask(); Keyboard.dismiss(); setSubtasksSheetOpen(false); }}
                />
                <TouchableOpacity onPress={() => { addSubtask(); Keyboard.dismiss(); setSubtasksSheetOpen(false); }}><Text style={styles.addBtn}>Add</Text></TouchableOpacity>
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
            <View style={styles.sheetContainer}>
              <Text style={styles.sideHeader}>Choose Title Color</Text>
              {/* Color wheel simulation with expanded palette */}
              <View style={styles.colorWheelContainer}>
                <View style={styles.colorWheel}>
                  {[
                    '#5b47a8', '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7',
                    '#64748b', '#14b8a6', '#67c99a', '#556de8', '#ff6b6b', '#4ecdc4',
                    '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd',
                    '#00d2d3', '#ff9f43', '#10ac84', '#ee5a24', '#0984e3', '#6c5ce7'
                  ].map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => setTitleColor(color)}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        titleColor === color && styles.selectedSwatch
                      ]}
                    />
                  ))}
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <TouchableOpacity style={styles.applyBtn} onPress={async () => { await AsyncStorage.setItem(FOCUS_TITLE_COLOR_KEY, titleColor).catch(()=>{}); setColorSheetOpen(false); }}>
                  <Text style={{ color: '#0b0b0c', fontWeight: '700' }}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Timer Edit Bottom Sheet */}
      <Modal transparent visible={timerSheetOpen} animationType="slide" onRequestClose={() => { setTimerSheetOpen(false); setEditingTime(false); }}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => { setTimerSheetOpen(false); setEditingTime(false); }} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ maxHeight: '80%' }}>
            <View style={styles.sheetContainer}>
              <Text style={styles.sideHeader}>Timer Settings</Text>
              <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.sheetLabel}>Focus time (minutes)</Text>
                <TextInput 
                  style={[styles.subtaskInput, styles.timerInputField]} 
                  placeholder="25" 
                  placeholderTextColor="#8e8e93" 
                  value={timeInput} 
                  onChangeText={setTimeInput} 
                  onFocus={() => { if (timeInput === '25' || timeInput === String(Math.floor(workLenSec/60))) setTimeInput(''); }}
                  keyboardType="number-pad" 
                  autoCapitalize="none" 
                  autoCorrect={false} 
                  selectionColor="#67c99a"
                  textContentType="none"
                  autoComplete="off"
                  returnKeyType="done"
                />
                <Text style={[styles.sheetLabel, { marginTop: 10 }]}>Break time (minutes)</Text>
                <TextInput 
                  style={[styles.subtaskInput, styles.timerInputField]} 
                  placeholder="5" 
                  placeholderTextColor="#8e8e93" 
                  value={breakInput} 
                  onChangeText={setBreakInput} 
                  onFocus={() => { if (breakInput === '5' || breakInput === String(Math.floor(breakLenSec/60))) setBreakInput(''); }}
                  keyboardType="number-pad" 
                  autoCapitalize="none" 
                  autoCorrect={false} 
                  selectionColor="#67c99a"
                  textContentType="none"
                  autoComplete="off"
                  returnKeyType="done"
                />
                <Text style={[styles.sheetLabel, { marginTop: 10 }]}>Sections / intervals</Text>
                <TextInput 
                  style={[styles.subtaskInput, styles.timerInputField]} 
                  placeholder="1" 
                  placeholderTextColor="#8e8e93" 
                  value={sessionsInput} 
                  onChangeText={setSessionsInput} 
                  onFocus={() => { if (sessionsInput === '1' || sessionsInput === String(totalSessions)) setSessionsInput(''); }}
                  keyboardType="number-pad" 
                  returnKeyType="done"
                />
                
                {/* Repeat Option - inline picker */}
                <Text style={[styles.sheetLabel, { marginTop: 10 }]}>Repeat</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  {repeatOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.repeatChip,
                        repeat === option && styles.repeatChipSelected
                      ]}
                      onPress={() => setRepeat(option)}
                    >
                      <Text style={[
                        styles.repeatChipText,
                        repeat === option && styles.repeatChipTextSelected
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </ScrollView>
              
              {/* Always visible Apply button - outside scroll view */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#2e313a' }}>
                <TouchableOpacity style={[styles.applyBtn, { backgroundColor: '#2e313a' }]} onPress={() => { Keyboard.dismiss(); setTimerSheetOpen(false); setEditingTime(false); }}>
                  <Text style={{ color: '#e7e7ea', fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyBtn} onPress={() => { Keyboard.dismiss(); commitTimerSettings(); setTimerSheetOpen(false); setEditingTime(false); }}>
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
  container: { flex: 1, backgroundColor: '#f5f8ff', padding: 16 },
  bgImage: { resizeMode: 'cover' },
  titlePill: { alignItems: 'center', marginBottom: 16, marginTop: 40, paddingHorizontal: 16 },
  titleBox: { width: '100%', backgroundColor: '#5b47a8', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleContent: { flex: 1, marginRight: 8 },
  titleLabel: { color: '#fff', fontSize: 17, fontWeight: '600' },
  titlePlaceholder: { color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', fontWeight: '400' },
  titleEditInput: { color: '#fff', fontSize: 17, minWidth: 120 },
  titleIcons: { flexDirection: 'row', alignItems: 'center' },
  titleIcon: { marginLeft: 12, padding: 4 },
  mainRow: { flex: 1, flexDirection: 'row', gap: 16, alignItems: 'center', justifyContent: 'center' },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  timerPane: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  timerRing: { width: 260, height: 260, borderRadius: 130, borderWidth: 2, borderColor: '#2e313a', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f1116' },
  timeText: { color: '#e7e7ea', fontSize: 56, fontWeight: '800', letterSpacing: 1 },
  timeInput: { color: '#e7e7ea', fontSize: 48, fontWeight: '800', letterSpacing: 1, textAlign: 'center', minWidth: 160 },
  controlsRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  ctrlBtn: { borderRadius: 22, paddingHorizontal: 18, paddingVertical: 10 },
  ctrlTxt: { color: '#0b0b0c', fontWeight: '700' },
  statsText: { color: '#8e8e93', marginTop: 10 },
  sidePane: { width: 320, alignSelf: 'flex-end', backgroundColor: '#121317', borderRadius: 12, padding: 12 },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#121317', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  sessionDotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  sessionPillOverBg: { backgroundColor: 'rgba(17,17,17,0.35)' },
  pill: { backgroundColor: '#1a1b21', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14 },
  sideHeader: { color: '#fff', fontWeight: '700', marginBottom: 10 },
  subtaskItem: { backgroundColor: '#1a1b21', padding: 10, borderRadius: 8, marginBottom: 8 },
  subtaskLabel: { color: '#fff' },
  subtaskInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  subtaskInput: { flex: 1, color: '#fff', backgroundColor: '#101216', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  addBtn: { color: '#67c99a', fontWeight: '700' },
  timerInputField: { color: '#fff', backgroundColor: '#101216', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, borderWidth: 1, borderColor: '#2e313a', minHeight: 44 },
  applyBtn: { backgroundColor: '#67c99a', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  sheetLabel: { color: '#8e8e93', fontSize: 12, marginTop: 4 },
  colorWheelContainer: { marginVertical: 8 },
  colorWheel: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  colorSwatch: { width: 40, height: 40, borderRadius: 20, margin: 4 },
  selectedSwatch: { borderWidth: 3, borderColor: '#fff', transform: [{ scale: 1.1 }] },
  repeatChip: { 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderRadius: 20, 
    backgroundColor: '#1a1b21', 
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2e313a',
  },
  repeatChipSelected: { 
    backgroundColor: 'rgba(103, 201, 154, 0.2)', 
    borderColor: '#67c99a',
  },
  repeatChipText: { 
    color: '#8e8e93', 
    fontSize: 14, 
    fontWeight: '500',
  },
  repeatChipTextSelected: { 
    color: '#67c99a', 
    fontWeight: '600',
  },
});
