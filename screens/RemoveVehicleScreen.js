import React, { useState } from "react";
import { View, Text, Button, Alert, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig";

// RemoveVehicleScreen component
export default function RemoveVehicleScreen({ route, navigation }) {
    const { vehicles } = route.params; // Retrieve vehicles from navigation parameters
    const [selectedVehicle, setSelectedVehicle] = useState(null); // State to store selected vehicle
    const user = auth.currentUser;

    // Handle vehicle removal
    const handleRemove = async () => {
        if (selectedVehicle && user) {
            try {
                const updatedVehicles = vehicles.filter(vehicle => vehicle !== selectedVehicle);
                await setDoc(doc(db, "vehicles", user.uid), { vehicles: updatedVehicles });
                Alert.alert("Vehicle removed successfully!");
                navigation.navigate("My Account");
            } catch (error) {
                Alert.alert(error.message);
            }
        } else {
            Alert.alert("No vehicle selected or user not logged in");
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Select a vehicle to remove:</Text>
                {vehicles.map((vehicle, index) => (
                    <View
                        key={index}
                        style={[
                            styles.vehicleContainer,
                            selectedVehicle === vehicle && styles.selectedVehicleContainer
                        ]}
                    >
                        <Text>Make: {vehicle.make}</Text>
                        <Text>Model: {vehicle.model}</Text>
                        <Text>Year: {vehicle.year}</Text>
                        <Text>License Plate: {vehicle.licensePlate}</Text>
                        <Button title="Select" onPress={() => setSelectedVehicle(vehicle)} />
                    </View>
                ))}
                {selectedVehicle && (
                    <View style={styles.confirmContainer}>
                        <Text>Are you sure you want to remove this vehicle?</Text>
                        <Button title="Confirm" onPress={handleRemove} color="red" />
                        <Button title="Cancel" onPress={() => setSelectedVehicle(null)} color="blue" />
                    </View>
                )}
            </ScrollView>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("My Account")}>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start', // Align content to the top
    },
    vehicleContainer: {
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: "gray",
    },
    selectedVehicleContainer: {
        borderColor: "red",
        backgroundColor: "#ffe6e6",
    },
    confirmContainer: {
        marginTop: 20,
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
});