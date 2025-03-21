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
