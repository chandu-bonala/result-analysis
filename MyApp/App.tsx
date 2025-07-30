import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types/types'; // adjust path as needed
import HomeScreen from './screens/HomeScreen'; // adjust path as needed
import ResultScreen from './screens/ResultScreen';


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Result">
        <Stack.Screen name="Home" component={HomeScreen} />
         <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Check Result' }} />
      

      </Stack.Navigator>
    </NavigationContainer>
  );
}
