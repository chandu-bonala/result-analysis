import { View, Text, Button, StyleSheet } from 'react-native';
import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Results Dashboard</Text>
      <Button title="View Result" onPress={() => navigation.navigate('Result')} />
      <Button title="UploCad PDF" onPress={() => navigation.navigate('Upload')} />
      <Button title="Check CGPA" onPress={() => navigation.navigate('CGPA')} />
      <Button title="Notifications" onPress={() => navigation.navigate('Notifications')} />
      <Button title="Admin Panel" onPress={() => navigation.navigate('Admin')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});
