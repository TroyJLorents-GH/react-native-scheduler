import { PomodoroSettings } from '@/context/TodoContext';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useFocusContext } from '../context/FocusContext';

interface PomodoroTimerProps {
  settings: PomodoroSettings;
  onComplete?: () => void;
  autoStart?: boolean;
  onStart?: () => void; // called when entering first work phase
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  taskId?: string;        // when provided, binds to global session for this task
  taskTitle?: string;
}

type TimerState = 'idle' | 'work' | 'break' | 'paused';

export default function PomodoroTimer({ settings, onComplete, autoStart, onStart, onPause, onResume, onStop, taskId, taskTitle }: PomodoroTimerProps) {
  const focus = useFocusContext();
  const isBoundToTask = useMemo(() => !!(taskId && focus.session && focus.session.source==='task' && focus.session.id===taskId), [taskId, focus.session]);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'work' | 'break'>('work');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Convert time to seconds
  const getTimeInSeconds = (time: number, unit: 'min' | 'hour') => {
    return unit === 'hour' ? time * 3600 : time * 60;
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer
  const startTimer = () => {
    if (isBoundToTask) {
      focus.resume();
      try { onResume && onResume(); } catch {}
      return;
    }
    if (timerState === 'idle') {
      const workSeconds = getTimeInSeconds(settings.workTime, settings.workUnit);
      setTimeLeft(workSeconds);
      setCurrentPhase('work');
      setTimerState('work');
      try { onStart && onStart(); } catch {}
    } else if (timerState === 'paused') {
      setTimerState(currentPhase);
      try { onResume && onResume(); } catch {}
    }
  };

  // Pause timer
  const pauseTimer = () => { 
    if (isBoundToTask) { focus.pause(); }
    setTimerState('paused'); 
    try { onPause && onPause(); } catch {} 
  };

  // Stop timer
  const stopTimer = () => {
    if (isBoundToTask) { focus.stop(); }
    setTimerState('idle');
    setTimeLeft(0);
    setCurrentPhase('work');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    try { onStop && onStop(); } catch {}
  };

  // Handle timer completion
  const handleTimerComplete = () => {
    if (currentPhase === 'work') {
      // Work session completed, start break
      const breakSeconds = getTimeInSeconds(settings.breakTime, settings.breakUnit);
      setTimeLeft(breakSeconds);
      setCurrentPhase('break');
      setTimerState('break');
      
      Alert.alert(
        'Work Session Complete!',
        'Great job! Time for a break.',
        [{ text: 'OK' }]
      );
    } else {
      // Break completed
      setTimerState('idle');
      setTimeLeft(0);
      setCurrentPhase('work');
      
      Alert.alert(
        'Break Complete!',
        'Ready for the next work session?',
        [
          { text: 'Start Next Session', onPress: startTimer },
          { text: 'Done', onPress: onComplete }
        ]
      );
    }
  };

  // Timer effect
  useEffect(() => {
    if (isBoundToTask) return; // external session drives time
    if (timerState === 'work' || timerState === 'break') {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState, currentPhase, isBoundToTask]);

  // Autostart on mount if requested
  useEffect(() => {
    if (isBoundToTask) return; // handled by global session
    if (autoStart && settings.enabled) {
      // Defer to ensure initial render completes
      const id = setTimeout(() => { startTimer(); }, 0);
      return () => clearTimeout(id);
    }
  }, [autoStart, settings.enabled, isBoundToTask]);

  // When bound to global session, mirror its state/time into the UI
  useEffect(() => {
    if (!isBoundToTask) return;
    setTimeLeft(focus.session?.remainingSec || 0);
    const phase: TimerState = focus.session?.phase === 'paused' ? 'paused' : (focus.session?.phase === 'work' ? 'work' : focus.session?.phase === 'break' ? 'break' : 'idle');
    setTimerState(phase);
    setCurrentPhase(focus.session?.phase === 'break' ? 'break' : 'work');
  }, [isBoundToTask, focus.session]);

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'work': return 'Work Session';
      case 'break': return 'Break Time';
      default: return 'Pomodoro Timer';
    }
  };

  const getPhaseColor = () => {
    return currentPhase === 'work' ? '#FF6B6B' : '#4ECDC4';
  };

  const totalSeconds = useMemo(() => {
    const w = getTimeInSeconds(settings.workTime, settings.workUnit);
    const b = getTimeInSeconds(settings.breakTime, settings.breakUnit);
    return currentPhase === 'work' ? w : b;
  }, [settings.workTime, settings.workUnit, settings.breakTime, settings.breakUnit, currentPhase]);

  // Circle ring dims
  const size = 220;
  const r = 100;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(1, totalSeconds ? 1 - (timeLeft / Math.max(1, totalSeconds)) : 0));
  const dash = `${(progress * circumference).toFixed(2)} ${circumference.toFixed(2)}`;
  const dotAngle = -Math.PI / 2 + progress * 2 * Math.PI;
  const dotX = cx + r * Math.cos(dotAngle);
  const dotY = cy + r * Math.sin(dotAngle);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getPhaseText()}</Text>
      <View style={styles.ringWrap}>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r} stroke="#1f2230" strokeWidth={10} fill="none" />
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={getPhaseColor()}
            strokeOpacity={0.6}
            strokeWidth={10}
            strokeDasharray={dash}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
          <Circle cx={dotX} cy={dotY} r={6} fill={getPhaseColor()} stroke="#fff" strokeWidth={2} />
        </Svg>
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
      </View>

      <View style={styles.controls}>
        {timerState === 'idle' && (
          <TouchableOpacity style={styles.playButton} onPress={startTimer}>
            <Ionicons name="play" size={24} color="#fff" />
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        )}

        {(timerState === 'work' || timerState === 'break') && (
          <>
            <TouchableOpacity style={styles.pauseButton} onPress={pauseTimer}>
              <Ionicons name="pause" size={24} color="#fff" />
              <Text style={styles.buttonText}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
              <Ionicons name="stop" size={24} color="#fff" />
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
          </>
        )}

        {timerState === 'paused' && (
          <>
            <TouchableOpacity style={styles.playButton} onPress={startTimer}>
              <Ionicons name="play" size={24} color="#fff" />
              <Text style={styles.buttonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
              <Ionicons name="stop" size={24} color="#fff" />
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.settings}>
        <Text style={styles.settingsText}>
          Work: {settings.workTime} {settings.workUnit} | Break: {settings.breakTime} {settings.breakUnit}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  ringWrap: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  timer: {
    position: 'absolute',
    color: '#e7e7ea',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 1,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  playButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pauseButton: {
    backgroundColor: '#FF9800',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stopButton: {
    backgroundColor: '#F44336',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settings: {
    marginTop: 4,
  },
  settingsText: {
    color: '#8e8e93',
    fontSize: 14,
    textAlign: 'center',
  },
});
