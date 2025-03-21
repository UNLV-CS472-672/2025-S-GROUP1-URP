/**
 * ReservationStatusScreen Component
 * 
 * This screen displays the current reservation status for a parking spot.
 * It includes details such as the parking garage, spot number, and a timer (placeholder).
 * Users can also cancel their reservation from this screen.
 * 
 * Features:
 * - Header with the title "Reservation Status".
 * - Back button to navigate to the previous screen.
 * - Placeholder sections for parking garage and spot number details.
 * - Placeholder for a reservation timer (no logic implemented).
 * - Cancel reservation button with an alert confirmation.
 * 
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const ReservationStatusScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Title/Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Reservation Status</Text>
      </View>

      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} testID="backButton">
      <Text style={styles.backButton}>Back</Text>
      </TouchableOpacity>

      {/* Parking Details */}
      <Text style={styles.label}>Parking Garage:</Text>
      <View style={styles.infoBox}>
      </View>

      <Text style={styles.label}>Parking Spot Number:</Text>
      <View style={styles.infoBox}>
      </View>

      {/* Timer Title (Without Timer Logic) */}
      <Text style={styles.timerLabel}>Reservation Timer:</Text>

      {/* Cancel Reservation Button */}
      <TouchableOpacity onPress={() => alert("Reservation Canceled")}>
        <Text style={styles.cancelButton}>Cancel Reservation</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the ReservationStatusScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    width: "100%",
    height: 100,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "black",
    textShadowOffset: { width: 3, height: 1 },
    textShadowRadius: 10,
  },
  backButton: {
    color: "red",
    fontSize: 16,
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
  },
  infoBox: {
    height: 40,
    backgroundColor: "#D3D3D3",
    justifyContent: "center",
    paddingLeft: 10,
    marginTop: 5,
    borderRadius: 5,
  },
  infoText: {
    fontSize: 16,
  },
  timerLabel: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  cancelButton: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    textDecorationLine: "underline",
  },
});

export default ReservationStatusScreen;
