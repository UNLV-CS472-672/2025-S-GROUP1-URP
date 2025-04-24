/**
 * File: ReservationConfirmationScreen.js
 * Purpose: Displays a confirmation message to the user after successfully reserving a parking spot.
 * Dependencies:
 *   - React and React Native components for UI rendering.
 *   - React Navigation for navigating between screens.
 * Usage:
 *   - This screen is displayed after a user successfully reserves a parking spot.
 *   - Provides a button to navigate back to the home screen.
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

/**
 * ReservationConfirmationScreen Component
 *
 * This component displays a confirmation message to the user after a successful parking reservation.
 * It includes a button to navigate back to the home screen.
 *
 * @returns {JSX.Element} - The rendered ReservationConfirmationScreen component.
 */
const ReservationConfirmationScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reservation Confirmed</Text>
      <Text style={styles.message}>
        You have 1 hour to park in your reserved spot before it is lost.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "black",
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    color: "black",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ReservationConfirmationScreen;
