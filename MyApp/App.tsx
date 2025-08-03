import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types/types'; // adjust path as needed
import HomeScreen from './screens/HomeScreen'; // adjust path as needed
import NotificationScreen from './screens/NotificationScreen'; // adjust path as needed
import SplashScreen from './screens/SplashScreen'; // adjust path as needed
// adjust path as needed

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="splash"screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
         <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name="splash" component={SplashScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
