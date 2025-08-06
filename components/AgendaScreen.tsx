import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import React from 'react';
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Event } from '../context/EventContext';

type Props = {
  events: Event[];
  onEditEvent?: (event: Event) => void;
  onDeleteEvent?: (event: Event) => void;
};

function getSectionedEvents(events: Event[]) {
  const grouped: { [date: string]: Event[] } = {};
  events.forEach(event => {
    const dateKey = moment(event.startDate).format('YYYY-MM-DD');
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(event);
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, dayEvents]) => ({
      title: moment(date).format('ddd D MMM YYYY'),
      day: moment(date),
      data: dayEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),
    }));
}

export default function AgendaScreen({ events, onEditEvent, onDeleteEvent }: Props) {
  const sections = getSectionedEvents(events);

  return (
    <SectionList
      sections={sections}
      keyExtractor={item => item.id}
      renderSectionHeader={({ section: { title, day } }) => (
        <View style={styles.sectionHeader}>
          <View style={styles.dateRail}>
            <Text style={styles.dayName}>{day.format('ddd').toUpperCase()}</Text>
            <Text style={styles.dayNum}>{day.format('D')}</Text>
            <Text style={styles.monthYear}>{day.format('MMM')}</Text>
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={styles.eventCard}>
          <View style={[styles.colorDot, { backgroundColor: '#ffb86b' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventTime}>
              {moment(item.startDate).format('h:mm A')}
              {' '}→{' '}
              {moment(item.endDate).format('h:mm A')}
              {item.location ? `   ${item.location}` : ''}
            </Text>
            {item.description ? (
              <Text style={styles.eventDesc}>{item.description}</Text>
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {onEditEvent && (
              <TouchableOpacity onPress={() => onEditEvent(item)} style={{ marginRight: 8 }}>
                <MaterialCommunityIcons name="pencil" size={20} color="#6c93e6" />
              </TouchableOpacity>
            )}
            {onDeleteEvent && (
              <TouchableOpacity onPress={() => onDeleteEvent(item)}>
                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#f87e7b" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={{ paddingBottom: 60 }}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', marginTop: 60 }}>
          <Text style={{ color: '#bbb', fontSize: 19 }}>No events found</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 2,
    marginLeft: 6,
  },
  dateRail: {
    width: 50,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#14151a',
    borderRadius: 17,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 7,
  },
  dayName: { color: '#ffc863', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  dayNum: { color: '#fff', fontWeight: 'bold', fontSize: 22 },
  monthYear: { color: '#ffb86b', fontSize: 13, fontWeight: '600', marginTop: -1 },
  sectionTitle: { color: '#aaa', fontSize: 15, fontWeight: '600', marginLeft: 6 },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 14,
    marginVertical: 8,
    padding: 14,
    borderRadius: 19,
    shadowColor: '#252b34',
    shadowOpacity: 0.09,
    shadowRadius: 7,
    elevation: 3,
  },
  colorDot: {
    width: 8,
    height: 45,
    borderRadius: 5,
    backgroundColor: '#ffb86b',
    marginRight: 11,
  },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  eventTime: { color: '#3d61b2', fontSize: 14, marginTop: 2 },
  eventDesc: { color: '#888', marginTop: 4, fontSize: 13 },
});
