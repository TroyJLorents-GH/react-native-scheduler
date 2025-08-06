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



import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useEventContext } from '../../context/EventContext';

// Helper function to compare just the date part (ignoring time)
function isToday(date: Date) {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export default function TodayTab() {
  const { events } = useEventContext();
  const todaysEvents = events.filter(e => isToday(e.startDate));

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', padding: 16 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Today's Events</Text>
      {todaysEvents.length === 0 && (
        <Text>No events for today.</Text>
      )}
      {todaysEvents.map(event => (
        <View
          key={event.id}
          style={{
            marginVertical: 8,
            padding: 16,
            borderRadius: 12,
            backgroundColor: '#f3f3f3',
            width: 320,
            shadowColor: '#000',
            boxShadow: 'inset #7b7feaff -6px 0px 4px 5px',
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{event.title}</Text>
          <Text>
            {event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
            {event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {event.description ? <Text>{event.description}</Text> : null}
        </View>
      ))}
    </ScrollView>
  );
}
