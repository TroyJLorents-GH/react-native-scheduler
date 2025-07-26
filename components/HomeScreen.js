import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.header}>My Scheduler</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Add Event')}>
          <Text style={styles.buttonText}>Add Event</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('View Calendar')}>
          <Text style={styles.buttonText}>View Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('To-Do List')}>
          <Text style={styles.buttonText}>To-Do List</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f3f7fa',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  header: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#22223b',
    marginBottom: 40,
    letterSpacing: 1.2,
  },
  button: {
    backgroundColor: '#2d6cdf',
    width: '90%',
    maxWidth: 350,
    paddingVertical: 18,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4, // Android shadow
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
