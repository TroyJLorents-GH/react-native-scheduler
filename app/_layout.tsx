// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { useFonts } from 'expo-font';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/useColorScheme';

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const [loaded] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

//   if (!loaded) {
//     return null;
//   }

//   return (
//     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//       <Stack>
//         {/* All your pages/screens in app/ are available here */}
//         <Stack.Screen name="+not-found" />
//       </Stack>
//       <StatusBar style="auto" />
//     </ThemeProvider>
//   );
// }

// // import { Slot } from 'expo-router';
// // import React from 'react';

// // export default function RootLayout() {
// //   return <Slot />;
// // }


import { Slot } from 'expo-router';
import React from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import GlobalFocusBanner from '../components/GlobalFocusBanner';
import { EventProvider } from '../context/EventContext';
import { FocusProvider } from '../context/FocusContext';
import { ListProvider } from '../context/ListContext';
import { TempDetailsProvider } from '../context/TempDetailsContext';
import { TodoProvider } from '../context/TodoContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <EventProvider>
        <ListProvider>
          <TodoProvider>
            <FocusProvider>
              <TempDetailsProvider>
                <GlobalFocusBanner />
                <Slot />
              </TempDetailsProvider>
            </FocusProvider>
          </TodoProvider>
        </ListProvider>
      </EventProvider>
    </GestureHandlerRootView>
  );
}
