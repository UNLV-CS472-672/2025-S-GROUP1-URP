/**
 * ParkingScreen Component
 * 
 * This screen displays a map of the parking garage using the `ParkingMap` component.
 * It includes a title at the top of the screen and renders the map below it.
 * 
 * Features:
 * - Displays a title: "Parking Garage Map".
 * - Renders the `ParkingMap` component to show the parking garage layout.
 * 
 * Dependencies:
 * - `ParkingMap` component: Handles the rendering and functionality of the parking garage map.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ParkingMap from "../components/ParkingMap/ParkingMap";

const ParkingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parking Garage Map</Text>
      <ParkingMap parkingLot="Parking Garage" navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginTop: 20,
  },
});

export default ParkingScreen;
