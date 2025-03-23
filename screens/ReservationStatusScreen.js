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
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

export default function ReservationStatusScreen({ navigation }) {
  const [reservation, setReservation] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservation = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const reservationsRef = collection(db, "Reservations");
        const q = query(reservationsRef, where("userID", "==", user.uid), where("status", "==", "held"));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const resData = querySnapshot.docs[0].data();
          setReservation(resData);

          // Calculate the countdown timer
          const startTime = resData.startTime.toDate(); // Convert Firestore timestamp to Date
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour
          updateTimer(endTime);
        } else {
          setReservation(null);
        }
      } catch (error) {
        console.error("Error fetching reservation:", error);
      }
      setLoading(false);
    };

    fetchReservation();
  }, []);

  // Timer updater
  useEffect(() => {
    if (!reservation) return;
    const interval = setInterval(() => {
      const startTime = reservation.startTime.toDate();
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
      updateTimer(endTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  const updateTimer = (endTime) => {
    const now = new Date();
    const diff = endTime - now;
    if (diff <= 0) {
      setTimeLeft(null);
      setReservation(null);
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ minutes, seconds });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Reservation Status</Text>
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backButton}>Back</Text>
      </TouchableOpacity>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : reservation ? (
        <>
          <Text style={styles.label}>Parking Garage:</Text>
          <View style={styles.inputBox}><Text>{reservation.spotId}</Text></View>

          <Text style={styles.label}>Parking Spot Number:</Text>
          <View style={styles.inputBox}><Text>{reservation.spotId}</Text></View>

          <Text style={styles.timerLabel}>Reservation Timer:</Text>
          {timeLeft ? (
            <View style={styles.timerBox}>
              <Text style={styles.timerText}>{timeLeft.minutes} : {timeLeft.seconds}</Text>
              <Text style={styles.dateText}>{reservation.startTime.toDate().toDateString()}</Text>
            </View>
          ) : (
            <Text style={styles.expiredText}>Reservation expired</Text>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={() => setReservation(null)}>
            <Text style={styles.cancelButtonText}>Cancel Reservation</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.noReservationText}>No current reservation at this time.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
  },
  header: {
    width: "100%",
    backgroundColor: "red",
    paddingVertical: 20,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "black",
    textShadowOffset: { width: 3, height: 1 },
    textShadowRadius: 5,
  },
  backButton: {
    color: "red",
    fontSize: 16,
    textDecorationLine: "underline",
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
  },
  inputBox: {
    width: "90%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
  },
  timerLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 30,
  },
  timerBox: {
    width: 150,
    height: 80,
    backgroundColor: "gray",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginTop: 10,
  },
  timerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  dateText: {
    color: "white",
    marginTop: 5,
  },
  expiredText: {
    fontSize: 16,
    color: "red",
    marginTop: 10,
  },
  cancelButton: {
    marginTop: 20,
  },
  cancelButtonText: {
    color: "red",
    textDecorationLine: "underline",
    fontSize: 16,
  },
  noReservationText: {
    fontSize: 16,
    color: "gray",
    marginTop: 50,
  },
  loadingText: {
    fontSize: 16,
    color: "gray",
    marginTop: 50,
  },
});
