import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const ReservationStatusScreen = ({ navigation }) => {

  // NEW CODE: Timer State
  const [timeLeft, setTimeLeft] = useState(3600); // Example: 1 hour in seconds

  // NEW: Timer Countdown Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  //NEW: Convert time to MM:SS format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")} : ${String(secs).padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      {/* Title/Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Reservation Status</Text>
      </View>

      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backButton}>Back</Text>
      </TouchableOpacity>

      {/* Parking Details */}
      <Text style={styles.label}>Parking Garage:</Text>
      <View style={styles.infoBox}>
      </View>

      <Text style={styles.label}>Parking Spot Number:</Text>
      <View style={styles.infoBox}>
      </View>

      {/* Timer Title  */}
      <Text style={styles.timerLabel}>Reservation Timer:</Text>

      {/* NEW: Timer Display */}
      <View style={styles.timerBox}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.timerSubtext}>mins secs</Text>
      </View>

      {/* Cancel Reservation Button */}
      <TouchableOpacity onPress={() => alert("Reservation Canceled")}>
        <Text style={styles.cancelButton}>Cancel Reservation</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the screen
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
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  timerBox: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  cancelButton: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    textDecorationLine: "underline",
  },
  timerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
  },
  timerSubtext: {
    fontSize: 20,  
    fontWeight: "bold",  
    color: "white", 
  },
});

export default ReservationStatusScreen;
