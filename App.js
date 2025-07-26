import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddEventScreen from './components/AddEventScreen';
import CalendarScreen from './components/CalendarScreen';
import GoogleSignInScreen from './components/GoogleSignInScreen';
import HomeScreen from './components/HomeScreen';
import ToDoScreen from './components/ToDoScreen';
import ManageEventsScreen from './screens/ManageEventsScreen';

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
