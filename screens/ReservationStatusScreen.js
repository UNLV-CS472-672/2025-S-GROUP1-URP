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
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
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
          const resDoc = querySnapshot.docs[0];
          const resData = resDoc.data();
          setReservation({ id: resDoc.id, ...resData });

          const startTime = resData.startTime.toDate();
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour
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

  useEffect(() => {
    if (!reservation) return;
    const interval = setInterval(() => {
      const startTime = reservation.startTime.toDate();
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour
      updateTimer(endTime);
    }, 1000);

    return () => clearInterval(interval); // Clear interval on cleanup
  }, [reservation]);

  const updateTimer = (endTime) => {
    const now = new Date();
    const diff = endTime - now;
    if (diff <= 0) {
      // Timer expired, delete the reservation
      setTimeLeft({ minutes: 0, seconds: 0, expired: true });

      // Delete reservation from Firebase
      handleCancel();
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Format minutes and seconds with zero-padding
      const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

      setTimeLeft({ minutes: formattedMinutes, seconds: formattedSeconds, expired: false });
    }
  };

  // Handle reservation cancellation with confirmation popup
  const handleCancel = () => {
    Alert.alert(
      "Cancel Reservation",
      "Are you sure you want to cancel your current reservation?",
      [
        {
          text: "No",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              if (reservation) {
                await deleteDoc(doc(db, "Reservations", reservation.id));
                setReservation(null); // Update UI after deletion
                console.log("Reservation canceled and deleted");
              }
            } catch (error) {
              console.error("Error canceling reservation:", error);
            }
          },
        },
      ],
      { cancelable: false }
    );
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
          <View style={[styles.timerBox, timeLeft?.expired && styles.expiredTimerBox]}>
            <Text style={[styles.timerText, timeLeft?.expired && styles.expiredTimerText]}>
              {timeLeft.minutes} : {timeLeft.seconds}
            </Text>
            <Text style={styles.dateText}>{reservation.startTime.toDate().toDateString()}</Text>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
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
  expiredTimerBox: {
    backgroundColor: "red",
  },
  timerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  expiredTimerText: {
    color: "yellow",
  },
  dateText: {
    color: "white",
    marginTop: 5,
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
