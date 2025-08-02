// import React from 'react';
// import { Dimensions, StyleSheet, View } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';
// import TodaysCard, { DayType } from '../components/TodaysCard';

// const SLIDER_WIDTH = Dimensions.get('window').width;
// const ITEM_WIDTH = SLIDER_WIDTH * 0.90;

// const days: DayType[] = [
//   {
//     date: "SUNDAY 11 JUNE",
//     schedule: [{ title: "Dinner with Priya", time: "6:30 PM → 7:30 PM" }],
//     weather: {
//       temp: "14°",
//       icon: require('../assets/sun.png'),
//       desc: "96% humidity and light wind in Kingston with no rain"
//     },
//     onThisDay: "1770 Captain Cook discovers the Great Barrier Reef when his ship runs aground.",
//     actions: [
//       { id: 1, text: "Get new bicycle tyre 🚲" },
//       { id: 2, text: "Buy cheeses 🧀" }
//     ]
//   }
// ]

// export default function HomeScreen() {
//   return (
//     <View style={styles.container}>
//       <Carousel
//         width={ITEM_WIDTH}
//         height={600}
//         data={days}
//         renderItem={({ item }) => <TodaysCard day={item} />}
//         style={{ alignSelf: 'center' }}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f5f6fa', justifyContent: 'center' }
// });

// import * as Location from 'expo-location';
// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';
// import TodaysCard, { DayType } from '../components/TodaysCard';

// const SLIDER_WIDTH = Dimensions.get('window').width;
// const ITEM_WIDTH = SLIDER_WIDTH * 0.92;

// export default function HomeScreen() {
//   const [weather, setWeather] = useState<{ temp: string; iconUrl: string; desc: string; city: string } | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         setWeather({ temp: '--', iconUrl: '', desc: 'Location denied', city: '' });
//         setLoading(false);
//         return;
//       }
//       let location = await Location.getCurrentPositionAsync({});
//       const { latitude, longitude } = location.coords;

//       // Use your API key here!
//       const apiKey = '88c65e45d00c940fe57758308ed099bd';
//       const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`;
//       try {
//         const resp = await fetch(url);
//         const data = await resp.json();
//         setWeather({
//           temp: `${Math.round(data.main.temp)}°`,
//           iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
//           desc: data.weather[0].description,
//           city: data.name,
//         });
//       } catch (err) {
//         setWeather({ temp: '--', iconUrl: '', desc: 'Could not fetch weather', city: '' });
//       }
//       setLoading(false);
//     })();
//   }, []);

//   const days: DayType[] = [
//     {
//       date: "SUNDAY 11 JUNE",
//       schedule: [{ title: "Dinner with Priya", time: "6:30 PM → 7:30 PM" }],
//       weather: weather || { temp: '--', iconUrl: '', desc: 'Loading...', city: '' },
//       onThisDay: "1770 Captain Cook discovers the Great Barrier Reef when his ship runs aground.",
//       actions: [
//         { id: 1, text: "Get new bicycle tyre 🚲" },
//         { id: 2, text: "Buy cheeses 🧀" }
//       ]
//     }
//     // ...other days can be added here
//   ];

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#96547c" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Carousel
//         width={ITEM_WIDTH}
//         height={600}
//         data={days}
//         renderItem={({ item }: { item: DayType }) => <TodaysCard day={item} />}
//         style={{ alignSelf: 'center' }}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f5f6fa', paddingTop: 50 },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6fa' }
// });





import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import AddEventScreen, { EventType } from '../components/AddEventScreen';
import TodaysCard, { DayType } from '../components/TodaysCard';
import { getDateString, getDaysAroundToday } from '../utils/calendarUtils';

const SLIDER_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = SLIDER_WIDTH * 0.92;
const STORAGE_KEY = '@user_events';

export default function HomeScreen() {
  const [weather, setWeather] = useState<{ temp: string; iconUrl: string; desc: string; city: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Range of days: 7 before, today, 7 after
  const NUM_DAYS_AROUND = 7;
  const daysArray = getDaysAroundToday(NUM_DAYS_AROUND);

  // Load/save events (unchanged)
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(json => {
      if (json) {
        try {
          const loaded = JSON.parse(json).map((ev: any) => ({
            ...ev,
            startDate: new Date(ev.startDate),
            endDate: new Date(ev.endDate),
          }));
          setEvents(loaded);
        } catch (e) {}
      }
    });
  }, []);
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setWeather({ temp: '--', iconUrl: '', desc: 'Location denied', city: '' });
        setLoading(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const apiKey = '88c65e45d00c940fe57758308ed099bd';
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`;
      try {
        const resp = await fetch(url);
        const data = await resp.json();
        setWeather({
          temp: `${Math.round(data.main.temp)}°`,
          iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          desc: data.weather[0].description,
          city: data.name,
        });
      } catch (err) {
        setWeather({ temp: '--', iconUrl: '', desc: 'Could not fetch weather', city: '' });
      }
      setLoading(false);
    })();
  }, []);

  // Helper to check if two dates are the same day
  function isSameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  // Build days for carousel
  const days: DayType[] = daysArray.map((dateObj, idx) => {
    const isToday =
      dateObj.toDateString() === new Date().toDateString();
    const dayEvents = events
      .map((ev, i) => ({ ...ev, index: i }))
      .filter(ev => isSameDay(new Date(ev.startDate), dateObj))
      .map(ev => ({
        title: ev.title,
        time: `${ev.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → ${ev.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        originalEventIndex: ev.index,
      }));
    return {
      date: getDateString(dateObj),
      schedule: dayEvents,
      weather: isToday ? weather || { temp: '--', iconUrl: '', desc: 'Loading...', city: '' }
                        : { temp: '--', iconUrl: '', desc: '', city: '' },
      onThisDay: isToday ? "1770 Captain Cook discovers the Great Barrier Reef when his ship runs aground." : "",
      actions: [], // Hook up your daily actions/todos here if you want!
    };
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#96547c" />
      </View>
    );
  }

  // Handlers for edit and delete (unchanged)
  const handleEditEvent = (eventIndex: number) => {
    setEditIndex(eventIndex);
    setShowModal(true);
  };

  const handleDeleteEvent = (eventIndex: number) => {
    setEvents(events.filter((_, idx) => idx !== eventIndex));
  };

  return (
    <View style={styles.container}>
      <Carousel
        width={ITEM_WIDTH}
        height={600}
        data={days}
        renderItem={({ item }: { item: DayType }) =>
          <TodaysCard
            day={item}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />}
        style={{ alignSelf: 'center' }}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditIndex(null);
          setShowModal(true);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBg}>
          <AddEventScreen
            {...(editIndex !== null ? {
              event: events[editIndex]
            } : {})}
            onSave={ev => {
              if (editIndex !== null) {
                setEvents(events.map((oldEv, idx) => idx === editIndex ? ev : oldEv));
              } else {
                setEvents([...events, ev]);
              }
              setShowModal(false);
              setEditIndex(null);
            }}
            onCancel={() => {
              setShowModal(false);
              setEditIndex(null);
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', paddingTop: 50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6fa' },
  fab: {
    position: 'absolute',
    right: 32,
    bottom: 48,
    backgroundColor: '#96547c',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 5,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(10,10,20,0.10)',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
