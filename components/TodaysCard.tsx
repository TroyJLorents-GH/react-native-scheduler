// import React from 'react';
// import { StyleSheet, Text, View } from 'react-native';

// export type DayType = {
//   date: string;
//   schedule: Array<{ title: string; time: string }>;
//   actions: Array<{ id: number; text: string }>;
// };

// type TodaysCardProps = {
//   day: DayType;
// };

// export default function TodaysCard({ day }: TodaysCardProps) {
//   return (
//     <View style={styles.card}>
//       <Text style={styles.title}>{day.date}</Text>
//       <Text style={styles.section}>Schedule:</Text>
//       {day.schedule.length === 0 ? (
//         <Text style={styles.empty}>No events today.</Text>
//       ) : (
//         day.schedule.map((ev, idx) => (
//           <Text key={idx} style={styles.item}>{ev.time} — {ev.title}</Text>
//         ))
//       )}
//       <Text style={styles.section}>Actions:</Text>
//       {day.actions.length === 0 ? (
//         <Text style={styles.empty}>No actions for today.</Text>
//       ) : (
//         day.actions.map(a => (
//           <Text key={a.id} style={styles.item}>• {a.text}</Text>
//         ))
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, margin: 10, elevation: 3 },
//   title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
//   section: { fontWeight: 'bold', marginTop: 18, marginBottom: 6 },
//   item: { fontSize: 16, marginLeft: 8, marginBottom: 4 },
//   empty: { color: '#888', fontStyle: 'italic', marginLeft: 8, marginBottom: 4 },
// });


// import { LinearGradient } from 'expo-linear-gradient';
// import React from 'react';
// import { Image, StyleSheet, Text, View } from 'react-native';

// export type DayType = {
//   date: string; // "SUNDAY 11 JUNE"
//   schedule: Array<{ title: string; time: string }>;
//   weather: { temp: string; icon: any; desc: string };
//   onThisDay: string;
//   actions: Array<{ id: number; text: string }>;
// };

// type Props = { day: DayType };

// export default function TodaysCard({ day }: Props) {
//   return (
//     <LinearGradient
//       colors={['#607cb1ff', '#dbb3ccff']}
//       style={styles.card}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 1, y: 1 }}
//     >
//       <Text style={styles.day}>{day.date.split(' ')[0]}</Text>
//       <Text style={styles.date}>{day.date.split(' ').slice(1).join(' ')}</Text>

//       {/* SCHEDULE */}
//       <Text style={styles.section}>SCHEDULE</Text>
//       {day.schedule.map((ev, idx) => (
//         <View style={styles.itemCard} key={idx}>
//           <View style={styles.eventAccent} />
//           <Text style={styles.itemTitle}>{ev.title}</Text>
//           <Text style={styles.itemTime}>{ev.time}</Text>
//         </View>
//       ))}

//       {/* WEATHER */}
//       <Text style={styles.section}>WEATHER</Text>
//       <View style={styles.itemCard}>
//         <Image source={require('../assets/sun.png')} style={styles.weatherIcon} />
//         <Text style={styles.weatherTemp}>{day.weather.temp}</Text>
//         <Text style={styles.weatherDesc}>{day.weather.desc}</Text>
//       </View>

//       {/* ON THIS DAY */}
//       <Text style={styles.section}>ON THIS DAY</Text>
//       <View style={styles.itemCard}>
//         <Text style={styles.onThisDayText}>{day.onThisDay}</Text>
//       </View>

//       {/* ACTIONS */}
//       <Text style={styles.section}>ACTIONS</Text>
//       {day.actions.map(a => (
//         <View style={styles.actionPill} key={a.id}>
//           <Text style={styles.actionText}>{a.text}</Text>
//         </View>
//       ))}
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     borderRadius: 30,
//     padding: 24,
//     margin: 8,
//     width: '100%',
//     minHeight: 500,
//     justifyContent: 'flex-start',
//     shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 6,
//   },
//   day: {
//     color: "#fff",
//     fontSize: 28,
//     fontWeight: "bold",
//     letterSpacing: 1,
//   },
//   date: {
//     color: "#fbeee0",
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 16,
//   },
//   section: {
//     color: "#fff",
//     marginTop: 15,
//     marginBottom: 5,
//     fontWeight: "bold",
//     fontSize: 13,
//     letterSpacing: 1,
//   },
//   itemCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(238, 221, 221, 0.1)",
//     borderRadius: 14,
//     padding: 10,
//     marginBottom: 8,
//   },
//   eventAccent: {
//     width: 6,
//     height: 38,
//     borderRadius: 4,
//     backgroundColor: "#FFAC33",
//     marginRight: 12,
//   },
//   itemTitle: { color: "#fff", fontWeight: "600", fontSize: 16, flex: 1 },
//   itemTime: { color: "#fff", fontSize: 14 },
//   weatherIcon: { width: 34, height: 34, marginRight: 8 },
//   weatherTemp: { color: "#fff", fontWeight: "bold", fontSize: 19, marginRight: 7 },
//   weatherDesc: { color: "#fff", fontSize: 14, flex: 1 },
//   onThisDayText: { color: "#fff", fontSize: 15, fontStyle: "italic" },
//   actionPill: {
//     backgroundColor: "rgba(255,255,255,0.18)",
//     borderRadius: 12,
//     paddingVertical: 8,
//     paddingHorizontal: 18,
//     marginBottom: 7,
//     alignSelf: "flex-start",
//   },
//   actionText: { color: "#fff", fontSize: 16 },
// });


import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export type DayType = {
  date: string;
  schedule: Array<{ title: string; time: string }>;
  weather: { temp: string; iconUrl: string; desc: string; city: string };
  onThisDay: string;
  actions: Array<{ id: number; text: string }>;
};

type Props = { day: DayType };

export default function TodaysCard({ day }: Props) {
  return (
    <LinearGradient
        colors={['#607cb1ff', '#dbb3ccff']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        >
        
        <Text style={styles.day}>{day.date.split(' ')[0]}</Text>
        <Text style={styles.date}>{day.date.split(' ').slice(1).join(' ')}</Text>

        {/* SCHEDULE */}
        <Text style={styles.section}>SCHEDULE</Text>
        {day.schedule.length === 0 ? (
            <View style={styles.itemCard}>
            <Text style={styles.empty}>No events today.</Text>
            </View>
        ) : (
            day.schedule.map((ev, idx) => (
            <View style={styles.itemCard} key={idx}>
                <View style={styles.eventAccent} />
                <Text style={styles.itemTitle}>{ev.title}</Text>
                <Text style={styles.itemTime}>{ev.time}</Text>
            </View>
            ))
        )}

        {/* WEATHER */}
        <Text style={styles.section}>WEATHER</Text>
        <View style={styles.itemCard}>
            {day.weather.iconUrl ? (
            <Image source={{ uri: day.weather.iconUrl }} style={styles.weatherIcon} />
            ) : null}
            <View>
            <Text style={styles.weatherTemp}>{day.weather.temp}</Text>
            <Text style={styles.weatherDesc}>
                {day.weather.city ? `${day.weather.city} - ` : ''}
                {day.weather.desc}
            </Text>
            </View>
        </View>

        {/* ON THIS DAY */}
        <Text style={styles.section}>ON THIS DAY</Text>
        <View style={styles.itemCard}>
            <Text style={styles.onThisDayText}>{day.onThisDay || 'No historical event'}</Text>
        </View>

        {/* ACTIONS */}
        <Text style={styles.section}>ACTIONS</Text>
        {day.actions.length === 0 ? (
            <View style={styles.actionPill}>
            <Text style={styles.empty}>No actions for today.</Text>
            </View>
        ) : (
            day.actions.map(a => (
            <View style={styles.actionPill} key={a.id}>
                <Text style={styles.actionText}>{a.text}</Text>
            </View>
            ))
        )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 30,
    padding: 24,
    margin: 8,
    width: '100%',
    minHeight: 500,
    backgroundColor: "#96547c",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 6,
    justifyContent: 'flex-start',
  },
  day: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  date: {
    color: "#fbeee0",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  section: {
    color: "#fff",
    marginTop: 22,
    marginBottom: 5,
    fontWeight: "bold",
    fontSize: 13,
    letterSpacing: 1,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
  },
  eventAccent: {
    width: 6,
    height: 38,
    borderRadius: 4,
    backgroundColor: "#FFAC33",
    marginRight: 12,
  },
  itemTitle: { color: "#fff", fontWeight: "600", fontSize: 16, flex: 1 },
  itemTime: { color: "#fff", fontSize: 14 },
  weatherIcon: { width: 48, height: 48, marginRight: 12 },
  weatherTemp: { color: "#fff", fontWeight: "bold", fontSize: 19 },
  weatherDesc: { color: "#fff", fontSize: 14 },
  onThisDayText: { color: "#fff", fontSize: 15, fontStyle: "italic" },
  actionPill: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 7,
    alignSelf: "flex-start",
  },
  actionText: { color: "#fff", fontSize: 16 },
  empty: { color: "#fff", opacity: 0.7, fontStyle: 'italic' },
});
