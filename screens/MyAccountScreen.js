import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig";

export default function MyAccountScreen({ navigation }) {
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        const fetchVehicleInfo = async () => {
            const user = auth.currentUser;
            if (user) {
                const docRef = doc(db, "vehicles", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const userVehicles = data.vehicles || [];
                    setVehicles(userVehicles);

                    if (userVehicles.length === 0) {
                        navigation.navigate("AddVehicle");
                    }
                } else {
                    navigation.navigate("AddVehicle");
                }
            }
        };
        fetchVehicleInfo();
    }, [navigation]);

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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
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
