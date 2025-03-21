import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation hook

const ParkingMap = ({ parkingLot }) => {
  const navigation = useNavigation(); // Get navigation context

  // Sample parking data (Replace with dynamic data later)
  const parkingSpaces = [
    { id: 1, status: "open" },
    { id: 2, status: "occupied" },
    { id: 3, status: "reserved" },
    { id: 4, status: "occupied" },
    { id: 5, status: "occupied" },
    { id: 6, status: "open" },
    { id: 7, status: "open" },
    { id: 8, status: "open" },
    { id: 9, status: "open" },
    { id: 10, status: "open" },
    { id: 11, status: "open" },
    { id: 12, status: "open" },
  ];

  // Color map for different parking statuses
  const statusColors = {
    open: "green",
    occupied: "red",
    reserved: "yellow",
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{parkingLot}</Text>

      {/* Parking Key */}
      <View style={styles.keyContainer}>
        <Text style={[styles.keyText, { color: "green" }]}>🟩 Open</Text>
        <Text style={[styles.keyText, { color: "yellow" }]}>🟨 Reserved</Text>
        <Text style={[styles.keyText, { color: "red" }]}>🟥 Occupied</Text>
      </View>

      {/* SVG Parking Lot Map */}
      <ScrollView vertical>
        <ScrollView horizontal>
          <Svg height="1000" viewBox="0 0 300 1000">
            {/* Background */}
            <Rect x="0" y="0" width="300" height="1000" fill="lightgray" />

            {/* Parking Spaces */}
            {parkingSpaces.map((space, i) => (
              <Rect
                key={space.id}
                x="50"
                y={i * 60 + 60}
                width="200"
                height="50"
                fill={statusColors[space.status]}
                stroke="black"
                strokeWidth="2"
              />
            ))}

            {/* Parking Labels */}
            {parkingSpaces.map((space, i) => (
              <SvgText
                key={`label-${space.id}`}
                x="150"
                y={i * 60 + 90}
                fontSize="20"
                fill="black"
                textAnchor="middle"
              >
                {`P${space.id}`}
              </SvgText>
            ))}
          </Svg>
        </ScrollView>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reserveButton}>
          <Text style={styles.reserveButtonText}>Reserve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  keyContainer: {
    flexDirection: "row",
    marginBottom: 10,
    justifyContent: "center",
  },
  keyText: {
    textShadowColor: "black",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  backButton: {
    width: "45%",
    backgroundColor: "#B0463C",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 5,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  reserveButton: {
    width: "45%",
    backgroundColor: "red",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 5,
  },
  reserveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ParkingMap;
