/**
 * MyAccountScreen Component
 * 
 * This screen displays the user's account information, including their email and registered vehicles.
 * If no vehicles are found, the user is automatically redirected to the "AddVehicle" screen after a short delay.
 * Users can also navigate to the "AddVehicle" or "RemoveVehicle" screens manually.
 * 
 * Features:
 * - Displays the user's email and registered vehicles.
 * - Automatically redirects to the "AddVehicle" screen if no vehicles are found.
 * - Provides buttons to add another vehicle or remove an existing vehicle.
 * 
 * Dependencies:
 * - Firebase Firestore to fetch the user's vehicle information.
 * - Firebase Authentication to identify the logged-in user.
 * 
 */

import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig";

// MyAccountScreen component
export default function MyAccountScreen({ navigation }) {
    const [vehicles, setVehicles] = useState([]); // State to store user's vehicles

    /**
     * useEffect Hook
     * 
     * Fetches the user's vehicle information from Firestore when the component mounts.
     * If no vehicles are found, the user is redirected to the "AddVehicle" screen after a 1-second delay.
     */


    useEffect(() => {
        // Fetch vehicle information when the component mounts
        const fetchVehicleInfo = async () => {
            const user = auth.currentUser;
            if (user) {
                const docRef = doc(db, "vehicles", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const userVehicles = data.vehicles || [];
                    setVehicles(userVehicles);

                    // Navigate to AddVehicle screen if no vehicles are found
                    if (userVehicles.length === 0) {
                        setTimeout(() => {
                            navigation.replace("AddVehicle"); // changing from navigate function to replace function
                        }, 1000); // 1 second delay
                    }
                } else {
                    // Navigate to AddVehicle screen if no document is found
                    setTimeout(() => {
                        navigation.replace("AddVehicle"); // changing from navigate function to replace function
                    }, 1000); // 1 second delay
                }
            }
        };
        fetchVehicleInfo();
    }, [navigation]);

    /**
     * handleAddAnotherVehicle Function
     * 
     * Navigates to the "AddVehicle" screen when the user presses the "Add Another Vehicle" button.
     */
    const handleAddAnotherVehicle = () => {
        navigation.navigate("AddVehicle");
    };

    return (
        <View style={styles.container}>
            {vehicles.length > 0 ? (
                <View style={styles.infoContainer}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>User Information:</Text>
                    <Text>Email: {auth.currentUser.email}</Text>
                    <Text></Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Vehicle(s) Information:</Text>
                    {vehicles.map((vehicle, index) => (
                        <View key={index} style={styles.vehicleContainer}>
                            <Text>Make: {vehicle.make}</Text>
                            <Text>Model: {vehicle.model}</Text>
                            <Text>Year: {vehicle.year}</Text>
                            <Text>License Plate: {vehicle.licensePlate}</Text>
                        </View>
                    ))}
                    <Button title="Add Another Vehicle" onPress={handleAddAnotherVehicle} color="blue" />
                    <Button title="Remove a Vehicle" onPress={() => navigation.navigate("RemoveVehicle", { vehicles })} color="red" />
                </View>
            ) : (
                <View>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>No vehicles found. Redirecting to add vehicle screen...</Text>
                </View>
            )}
            {vehicles.length > 0 && (
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Home")}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

// Styles for the MyAccountScreen component
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between', // Ensure the back button is at the bottom
    },
    backButton: {
        width: "50%", // Half the width of the screen
        backgroundColor: "#B0463C",
        paddingVertical: 15,
        alignItems: "center",
        borderRadius: 5,
        position: 'absolute',
        bottom: 20, // Position it at the bottom
        left: 20, // Position it at the left
    },
    backButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    infoContainer: {
        marginBottom: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: "red",
        backgroundColor: "#f0f0f0",
    },
    vehicleContainer: {
        marginBottom: 10,
    },
});
