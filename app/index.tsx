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

import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import TodaysCard, { DayType } from '../components/TodaysCard';

const SLIDER_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = SLIDER_WIDTH * 0.92;

export default function HomeScreen() {
  const [weather, setWeather] = useState<{ temp: string; iconUrl: string; desc: string; city: string } | null>(null);
  const [loading, setLoading] = useState(true);

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

      // Use your API key here!
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

  const days: DayType[] = [
    {
      date: "SUNDAY 11 JUNE",
      schedule: [{ title: "Dinner with Priya", time: "6:30 PM → 7:30 PM" }],
      weather: weather || { temp: '--', iconUrl: '', desc: 'Loading...', city: '' },
      onThisDay: "1770 Captain Cook discovers the Great Barrier Reef when his ship runs aground.",
      actions: [
        { id: 1, text: "Get new bicycle tyre 🚲" },
        { id: 2, text: "Buy cheeses 🧀" }
      ]
    }
    // ...other days can be added here
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#96547c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Carousel
        width={ITEM_WIDTH}
        height={600}
        data={days}
        renderItem={({ item }: { item: DayType }) => <TodaysCard day={item} />}
        style={{ alignSelf: 'center' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', paddingTop: 50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6fa' }
});
