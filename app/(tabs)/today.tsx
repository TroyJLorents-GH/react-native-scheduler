// import React from 'react';
// import { Text, View } from 'react-native';

// export default function TodayScreen() {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Today Tab</Text>
//     </View>
//   );
// }

// import React from 'react';
// import { ScrollView, Text, View } from 'react-native';
// import { useEventContext } from '../../context/EventContext';

// // Optionally, import TodaysCard if you want to show a summary card above the list
// // import TodaysCard from '../../components/TodaysCard';

// const todayISO = new Date().toISOString().slice(0, 10);

// export default function TodayTab() {
//   const { events } = useEventContext();
//   const todaysEvents = events.filter(e => e.date === todayISO);

//   return (
//     <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', padding: 16 }}>
//       <Text style={{ fontSize: 22, marginBottom: 10 }}>Today's Events</Text>
//       {/* Optionally show a summary card here */}
//       {/* <TodaysCard ... /> */}
//       {todaysEvents.length === 0 && (
//         <Text>No events for today.</Text>
//       )}
//       {todaysEvents.map(event => (
//         <View
//           key={event.id}
//           style={{
//             marginVertical: 8,
//             padding: 16,
//             borderRadius: 12,
//             backgroundColor: '#f3f3f3',
//             width: 320,
//             shadowColor: '#000',
//             shadowOpacity: 0.2,
//             shadowRadius: 4,
//           }}
//         >
//           <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{event.title}</Text>
//           <Text>{event.time ? event.time : ''}</Text>
//           {event.description ? <Text>{event.description}</Text> : null}
//         </View>
//       ))}
//     </ScrollView>
//   );
// }



import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTodoContext } from '../../context/TodoContext';

const STATS_KEY_PREFIX = 'focus.stats.'; // focus.stats.YYYY-MM-DD
const FOCUS_TITLE_COLOR_KEY = 'focus.title.color';

export default function FocusTab() {
  const { focusTask, focusTaskId } = useLocalSearchParams();
  const { todos, updateTodo } = useTodoContext();
  const [title, setTitle] = useState('Reading');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [subtasksSheetOpen, setSubtasksSheetOpen] = useState(false);
  const [timerSheetOpen, setTimerSheetOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const titleInputRef = useRef<TextInput>(null);
  const [titleColor, setTitleColor] = useState<string>('#5b47a8');
  const [colorSheetOpen, setColorSheetOpen] = useState(false);

  // Timer state (pomodoro)
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
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
  };

  const start = () => {
    if (phase === 'idle') { setSessionsLeft(totalSessions); setSeconds(workLenSec); }
    setPhase('work');
  };
  const pause = () => setPhase('paused');
  const stop = () => { setPhase('idle'); setSeconds(workLenSec); setSessionsLeft(totalSessions); };

  useEffect(() => {
    if (phase === 'work' || phase === 'break') {
      intervalRef.current && clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            if (phase === 'work') {
              const ns = todayFocusSeconds + workLenSec;
              setTodayFocusSeconds(ns); persistStats(ns);
              const remaining = sessionsLeft - 1;
              setSessionsLeft(remaining);
              if (remaining > 0) { setPhase('break'); return breakLenSec; }
              setPhase('idle'); return workLenSec;
            } else {
              setPhase('work'); return workLenSec;
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
    setSubtasks(prev => [...prev, input.trim()]);
    setInput('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Title pill */}
      <View style={styles.titlePill}>
        <View style={[styles.titleBox, { backgroundColor: titleColor }]}>
          <View style={styles.titleContent}>
            {editingTitle ? (
              <TextInput
                ref={titleInputRef}
                style={styles.titleEditInput}
                placeholder="Task name"
                placeholderTextColor="#e9dcff"
                value={title}
                onChangeText={setTitle}
                returnKeyType="done"
                onSubmitEditing={() => setEditingTitle(false)}
              />
            ) : (
              <Text style={styles.titleLabel}>Task: <Text style={styles.titleValue}>{title}</Text></Text>
            )}
          </View>
          <View style={styles.titleIcons}>
            <TouchableOpacity
              onPress={() => {
                if (editingTitle) { setEditingTitle(false); }
                else { setEditingTitle(true); setTimeout(() => titleInputRef.current?.focus(), 0); }
              }}
              style={styles.titleIcon}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setColorSheetOpen(true)} style={styles.titleIcon}>
              <Ionicons name="color-palette-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.centerWrap}>
        {/* Center Timer */}
        <View style={styles.timerPane}>
          <View style={styles.timerRing}>
            <Svg width={280} height={280} style={{ position: 'absolute' }}>
              <Circle cx={140} cy={140} r={130} stroke="#1f2230" strokeWidth={10} fill="none" />
              <Circle
                cx={140}
                cy={140}
                r={130}
                stroke={titleColor}
                strokeOpacity={0.35}
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
                placeholder="25"
                placeholderTextColor="#5a5f6b"
              />
            ) : (
              <TouchableOpacity activeOpacity={0.8} onPress={() => { setTimeInput(''); setTimerSheetOpen(true); }}>
                <Text style={styles.timeText}>{fmt(seconds)}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.controlsRow}>
            {phase === 'idle' && (
              <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: titleColor }]} onPress={start}>
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
                <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: '#67c99a' }]} onPress={start}><Text style={styles.ctrlTxt}>Resume</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: '#f87171' }]} onPress={stop}><Text style={styles.ctrlTxt}>Stop</Text></TouchableOpacity>
              </>
            )}
            {phase === 'break' && (
              <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: '#67c99a' }]} onPress={() => setPhase('work')}><Text style={styles.ctrlTxt}>Start Next</Text></TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: '#2e313a' }]} onPress={() => { setTimeInput(''); setEditingTime(true); setTimerSheetOpen(true); }}>
              <Text style={[styles.ctrlTxt, { color: '#e7e7ea' }]}>Set Timer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: '#2e313a' }]} onPress={() => setSubtasksSheetOpen(true)}>
              <Text style={[styles.ctrlTxt, { color: '#e7e7ea' }]}>Subtasks</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 12 }}>
            {Array.from({ length: totalSessions }).map((_, i) => {
              const completed = totalSessions - sessionsLeft > i;
              const active = totalSessions - sessionsLeft === i && phase !== 'idle';
              return (
                <View key={i} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: completed ? titleColor : active ? '#e7e7ea' : '#3a3f4b', opacity: active ? 0.95 : 1 }} />
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
                {subtasks.map((s, i) => (
                  <View key={i} style={styles.subtaskItem}><Text style={styles.subtaskLabel}>{s}</Text></View>
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
              <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.sheetLabel}>Focus time (minutes)</Text>
                <TextInput 
                  style={[styles.subtaskInput, styles.timerInputField]} 
                  placeholder="25" 
                  placeholderTextColor="#8e8e93" 
                  value={timeInput} 
                  onChangeText={setTimeInput} 
                  onFocus={() => setTimeInput('')}
                  autoFocus 
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
                  onFocus={() => setBreakInput('')}
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
                  onFocus={() => setSessionsInput('')}
                  keyboardType="number-pad" 
                  returnKeyType="done"
                />
              </ScrollView>
              
              {/* Always visible Apply button - outside scroll view */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#2e313a' }}>
                <TouchableOpacity style={[styles.applyBtn, { backgroundColor: '#2e313a' }]} onPress={() => { setTimerSheetOpen(false); setEditingTime(false); }}>
                  <Text style={{ color: '#e7e7ea', fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyBtn} onPress={() => { commitTimerSettings(); setTimerSheetOpen(false); setEditingTime(false); }}>
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
  titlePill: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  titleBox: { width: '90%', backgroundColor: '#5b47a8', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleContent: { flex: 1 },
  titleLabel: { color: '#fff', fontSize: 18, fontWeight: '600' },
  titleValue: { color: '#f1eaff', fontWeight: '700' },
  titleEditInput: { color: '#fff', fontSize: 18, minWidth: 120 },
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
});
