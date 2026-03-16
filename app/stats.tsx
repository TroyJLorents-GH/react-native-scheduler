import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { DailyCompletionEntry, DailyFocusEntry, getDailyCompletions, getDailyFocusBreakdown, getTotalStats } from '../utils/stats';

type RangeOption = 7 | 14 | 30;

export default function StatsScreen() {
  const { colors, isDark } = useTheme();
  const [range, setRange] = useState<RangeOption>(7);
  const [focusData, setFocusData] = useState<DailyFocusEntry[]>([]);
  const [completionData, setCompletionData] = useState<DailyCompletionEntry[]>([]);
  const [totals, setTotals] = useState({
    totalFocusMin: 0,
    totalSessions: 0,
    totalCompleted: 0,
    avgDailyFocusMin: 0,
    avgDailyCompleted: 0,
    focusStreak: 0,
  });

  const loadData = useCallback(async () => {
    const [focus, completions, stats] = await Promise.all([
      getDailyFocusBreakdown(range),
      getDailyCompletions(range),
      getTotalStats(),
    ]);
    setFocusData(focus);
    setCompletionData(completions);
    setTotals(stats);
  }, [range]);

  useEffect(() => { loadData(); }, [loadData]);

  const totalFocusInRange = focusData.reduce((s, d) => s + d.minutes, 0);
  const totalSessionsInRange = focusData.reduce((s, d) => s + d.sessions, 0);
  const totalCompletedInRange = completionData.reduce((s, d) => s + d.count, 0);

  const maxFocusMin = Math.max(1, ...focusData.map(d => d.minutes));
  const maxCompletions = Math.max(1, ...completionData.map(d => d.count));

  const dayLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2);
  };

  const chartW = 320;
  const chartH = 120;
  const barGap = range <= 7 ? 6 : range <= 14 ? 3 : 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.header, { color: colors.text }]}>Statistics</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Range selector */}
        <View style={styles.rangeRow}>
          {([7, 14, 30] as RangeOption[]).map(r => (
            <TouchableOpacity
              key={r}
              onPress={() => setRange(r)}
              style={[
                styles.rangeChip,
                { backgroundColor: range === r ? colors.accentLight : colors.surface, borderColor: range === r ? colors.accent : colors.border },
              ]}
            >
              <Text style={{ color: range === r ? colors.accent : colors.textSecondary, fontWeight: '600', fontSize: 14 }}>
                {r}d
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <MaterialCommunityIcons name="fire" size={22} color="#ff9a62" />
            <Text style={[styles.statValue, { color: colors.text }]}>{totals.focusStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <MaterialCommunityIcons name="timer-sand" size={22} color="#556de8" />
            <Text style={[styles.statValue, { color: colors.text }]}>{formatMinutes(totalFocusInRange)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Focus Time</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <MaterialCommunityIcons name="check-circle-outline" size={22} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.text }]}>{totalCompletedInRange}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
          </View>
        </View>

        {/* Focus Time Chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Focus Time</Text>
          <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
            {totalSessionsInRange} sessions • {formatMinutes(totalFocusInRange)} total
          </Text>
          <View style={styles.chartWrap}>
            <Svg width={chartW} height={chartH + 20} viewBox={`0 0 ${chartW} ${chartH + 20}`}>
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map(pct => (
                <Line
                  key={pct}
                  x1={0} y1={chartH * (1 - pct)}
                  x2={chartW} y2={chartH * (1 - pct)}
                  stroke={colors.border}
                  strokeWidth={0.5}
                />
              ))}
              {/* Bars */}
              {focusData.map((entry, i) => {
                const barW = Math.max(2, (chartW - barGap * focusData.length) / focusData.length);
                const x = i * (barW + barGap);
                const h = (entry.minutes / maxFocusMin) * chartH;
                return (
                  <Rect
                    key={entry.date}
                    x={x}
                    y={chartH - h}
                    width={barW}
                    height={Math.max(1, h)}
                    rx={3}
                    fill="#556de8"
                    opacity={0.85}
                  />
                );
              })}
            </Svg>
            {range <= 7 && (
              <View style={styles.xLabels}>
                {focusData.map(entry => (
                  <Text key={entry.date} style={[styles.xLabel, { color: colors.textTertiary }]}>{dayLabel(entry.date)}</Text>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Tasks Completed Chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Tasks Completed</Text>
          <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
            {totalCompletedInRange} tasks in {range} days
          </Text>
          <View style={styles.chartWrap}>
            <Svg width={chartW} height={chartH + 20} viewBox={`0 0 ${chartW} ${chartH + 20}`}>
              {[0, 0.25, 0.5, 0.75, 1].map(pct => (
                <Line
                  key={pct}
                  x1={0} y1={chartH * (1 - pct)}
                  x2={chartW} y2={chartH * (1 - pct)}
                  stroke={colors.border}
                  strokeWidth={0.5}
                />
              ))}
              {completionData.map((entry, i) => {
                const barW = Math.max(2, (chartW - barGap * completionData.length) / completionData.length);
                const x = i * (barW + barGap);
                const h = (entry.count / maxCompletions) * chartH;
                return (
                  <Rect
                    key={entry.date}
                    x={x}
                    y={chartH - h}
                    width={barW}
                    height={Math.max(1, h)}
                    rx={3}
                    fill={colors.accent}
                    opacity={0.85}
                  />
                );
              })}
            </Svg>
            {range <= 7 && (
              <View style={styles.xLabels}>
                {completionData.map(entry => (
                  <Text key={entry.date} style={[styles.xLabel, { color: colors.textTertiary }]}>{dayLabel(entry.date)}</Text>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* All-time Stats */}
        <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>All-Time</Text>
          <View style={styles.allTimeGrid}>
            <AllTimeStat icon="timer-outline" label="Total Focus" value={formatMinutes(totals.totalFocusMin)} color="#556de8" colors={colors} />
            <AllTimeStat icon="flash-outline" label="Sessions" value={String(totals.totalSessions)} color="#ff9a62" colors={colors} />
            <AllTimeStat icon="checkmark-done-outline" label="Completed" value={String(totals.totalCompleted)} color={colors.accent} colors={colors} />
            <AllTimeStat icon="trending-up-outline" label="Avg Focus/Day" value={`${totals.avgDailyFocusMin}m`} color="#a855f7" colors={colors} />
            <AllTimeStat icon="list-outline" label="Avg Tasks/Day" value={String(totals.avgDailyCompleted)} color="#3b82f6" colors={colors} />
            <AllTimeStat icon="flame-outline" label="Streak" value={`${totals.focusStreak}d`} color="#ef4444" colors={colors} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function AllTimeStat({ icon, label, value, color, colors }: { icon: string; label: string; value: string; color: string; colors: any }) {
  return (
    <View style={styles.allTimeStat}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={[styles.allTimeValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.allTimeLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  header: { fontSize: 22, fontWeight: '800' },
  rangeRow: { flexDirection: 'row', gap: 10, marginBottom: 20, justifyContent: 'center' },
  rangeChip: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 16, borderWidth: 1.5 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: '800', marginTop: 6 },
  statLabel: { fontSize: 12, marginTop: 2 },
  chartCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
  chartSubtitle: { fontSize: 13, marginBottom: 14 },
  chartWrap: { alignItems: 'center' },
  xLabels: { flexDirection: 'row', justifyContent: 'space-around', width: 320, marginTop: 4 },
  xLabel: { fontSize: 11, fontWeight: '500' },
  allTimeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  allTimeStat: { width: '30%', alignItems: 'center', paddingVertical: 10 },
  allTimeValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  allTimeLabel: { fontSize: 11, marginTop: 2, textAlign: 'center' },
});
