/**
 * ParkingScreen Component
 *
 * Displays a map of a parking garage using the `ParkingMap` component.
 * Includes a screen title and renders the interactive parking layout.
 *
 * Features:
 * - Title: "Parking Garage Map"
 * - Uses `ParkingMap` to show layout and status of parking spots.
 *
 * Props:
 * - navigation: Passed from React Navigation for screen transitions.
 *
 * Dependencies:
 * - ParkingMap: Custom component that renders the garage layout and handles user interaction.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ParkingMap from "../src/components/ParkingMap/ParkingMap";

const ParkingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parking Garage Map</Text>
      <ParkingMap parkingLot='Parking Garage' navigation={navigation} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 20
  }
})

export default ParkingScreen
