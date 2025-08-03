import React from 'react';
import { View } from 'react-native';
import TodaysCard, { DayType } from '../../components/TodaysCard';

const dummyDay: DayType = {
  date: 'SUNDAY 11 JUNE',
  schedule: [
    { title: 'Meeting with team', time: '10:00 AM', originalEventIndex: 0 },
    { title: 'Lunch', time: '12:30 PM', originalEventIndex: 1 },
  ],
  weather: {
    temp: '22°C',
    iconUrl: 'https://openweathermap.org/img/wn/01d@2x.png',
    desc: 'Sunny',
    city: 'Phoenix',
  },
  onThisDay: 'Some historical event',
  actions: [
    { id: 1, text: 'Drink Water' },
    { id: 2, text: 'Take Break' },
  ],
};

export default function TodayScreen() {
  return (
    <View style={{ flex: 1 }}>
      <TodaysCard day={dummyDay} />
    </View>
  );
}
