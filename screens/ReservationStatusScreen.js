/**
 * File: ReservationStatusScreen.js
 * Purpose: Displays the status of the user's current parking reservation, including a timer and reservation details.
 * Dependencies:
 *   - React and React Native components for UI rendering.
 *   - Firebase Firestore for managing reservation data.
 *   - Firebase Auth for user authentication.
 * Usage:
 *   - Displays the parking garage name, spot number, and a countdown timer for the reservation.
 *   - Allows users to cancel their reservation.
 */

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

const TIMER_DURATION_MINUTES = 30; // Duration of the reservation timer in minutes

// Detect test environment
const isTestEnv = process.env.NODE_ENV === "test";

/**
 * ReservationStatusScreen Component
 *
 * This component displays the status of the user's current parking reservation, including details
 * such as the parking garage name, spot number, and a countdown timer. It also provides an option
 * to cancel the reservation.
 *
 * @param {object} navigation - React Navigation prop for navigating between screens.
 * @returns {JSX.Element} - The rendered ReservationStatusScreen component.
 */
export default function ReservationStatusScreen({ navigation }) {
  const [reservation, setReservation] = useState(null); // Current reservation details
  const [timeLeft, setTimeLeft] = useState(null); // Time left on the reservation timer
  const [loading, setLoading] = useState(true); // Loading state
  const [timerExpired, setTimerExpired] = useState(false); // Timer expiration state
  const [garageName, setGarageName] = useState("Loading..."); // Name of the parking garage

  /**
   * Fetches the user's current reservation from Firestore.
   */
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
        const q = query(
          reservationsRef,
          where("userID", "==", user.uid),
          where("status", "==", "held")
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const resDoc = querySnapshot.docs[0];
          const resData = resDoc.data();
          setReservation({ id: resDoc.id, ...resData });

          const startTime = resData.startTime.toDate();
          const endTime = new Date(
            startTime.getTime() + TIMER_DURATION_MINUTES * 60 * 1000
          );
          updateTimer(endTime);

          // Determine the garage name based on the spot ID
          const spotId = resData.spotId;
          const collections = [
            { name: "parkingSpotsTrop", displayName: "Tropicana Garage" },
            { name: "parkingSpotsGateway", displayName: "Gateway Garage" },
            {
              name: "parkingSpotsCottage",
              displayName: "Cottage Grove Garage",
            },
          ];

          for (const col of collections) {
            try {
              const spotRef = doc(db, col.name, spotId);
              const spotSnap = await getDoc(spotRef);
              if (spotSnap.exists()) {
                setGarageName(col.displayName);
                break;
              }
            } catch (error) {
              console.error(`Error checking collection ${col.name}:`, error);
            }
          }
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

  /**
   * Updates the reservation timer and handles expiration.
   * @param {Date} endTime - The end time of the reservation.
   */
  const updateTimer = async (endTime) => {
    const now = new Date();
    const diff = endTime - now;

    if (diff <= 0) {
      if (!timerExpired && reservation) {
        setTimerExpired(true);
        setTimeLeft({ minutes: "00", seconds: "00", expired: true });

        try {
          await deleteDoc(doc(db, "Reservations", reservation.id));
          setReservation(null);
          console.log("Expired reservation auto-deleted");
        } catch (error) {
          console.error("Error auto-deleting expired reservation:", error);
        }
      }
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        minutes: minutes < 10 ? `0${minutes}` : `${minutes}`,
        seconds: seconds < 10 ? `0${seconds}` : `${seconds}`,
        expired: false,
      });
    }
  };

  /**
   * Cancels the user's current reservation.
   */
  const handleCancel = () => {
    if (timerExpired || !reservation) {
      console.log("Reservation already expired or does not exist.");
      return;
    }

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
              await deleteDoc(doc(db, "Reservations", reservation.id));
              setReservation(null);
              console.log("Reservation canceled and deleted");
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
          <View style={styles.inputBox}>
            <Text>{garageName}</Text>
          </View>

          <Text style={styles.label}>Parking Spot Number:</Text>
          <View style={styles.inputBox}>
            <Text>{reservation.spotId}</Text>
          </View>

          <Text style={styles.timerLabel}>Reservation Timer:</Text>
          {timeLeft ? (
            <View
              style={[
                styles.timerBox,
                timeLeft.expired && styles.expiredTimerBox,
              ]}
            >
              <Text
                style={[
                  styles.timerText,
                  timeLeft.expired && styles.expiredTimerText,
                ]}
              >
                {timeLeft.minutes} : {timeLeft.seconds}
              </Text>
              <Text style={styles.dateText}>
                {reservation.startTime.toDate().toDateString()}
              </Text>
            </View>
          ) : (
            <View style={styles.timerBox}>
              <Text style={styles.timerText}>Loading...</Text>
            </View>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel Reservation</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.noReservationText}>
          No current reservation at this time.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  header: {
    width: '100%',
    backgroundColor: 'red',
    paddingVertical: 50,
    alignItems: 'center',
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
