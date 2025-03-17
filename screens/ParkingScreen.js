import React from "react";
import { View, Text } from "react-native";
import ParkingMap from "../components/ParkingMap/ParkingMap";

const ParkingScreen = () => {
  return (
    <View>
      <Text style={{ fontSize: 24, textAlign: "center", marginTop: 20 }}>
        Parking Garage Map
      </Text>
      <ParkingMap />
    </View>
  );
};

export default ParkingScreen;
