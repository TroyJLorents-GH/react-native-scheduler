import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddEventScreen from './screens/AddEventScreen';
import CalendarScreen from './screens/CalendarScreen';
import GoogleSignInScreen from './screens/GoogleSignInScreen';
import HomeScreen from './screens/HomeScreen';
import ManageEventsScreen from './screens/ManageEventsScreen';
import ToDoScreen from './screens/ToDoScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Add Event" component={AddEventScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="To-Do List" component={ToDoScreen} />  
        <Stack.Screen name="Manage Events" component={ManageEventsScreen} />
        <Stack.Screen name="Google Sign In" component={GoogleSignInScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
