import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig";

// AddVehicleScreen component
export default function AddVehicleScreen({ navigation }) {
    const [make, setMake] = useState(""); // State to store vehicle make
    const [model, setModel] = useState(""); // State to store vehicle model
    const [year, setYear] = useState(""); // State to store vehicle year
    const [licensePlate, setLicensePlate] = useState(""); // State to store vehicle license plate

    // Handle saving vehicle information
    const handleSave = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const docRef = doc(db, "vehicles", user.uid);
                const docSnap = await getDoc(docRef);

                let updatedVehicles = [];
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    updatedVehicles = data.vehicles || [];
                }

                const newVehicle = { make, model, year, licensePlate };
                updatedVehicles.push(newVehicle);

                await setDoc(doc(db, "vehicles", user.uid), { vehicles: updatedVehicles });
                Alert.alert("Vehicle information saved successfully!");
                navigation.navigate("My Account");
            } catch (error) {
                Alert.alert(error.message);
            }
        } else {
            Alert.alert("User not logged in");
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Enter the car information that you would like to register with UNLV Reserve Parking:</Text>
                <Text></Text>
                <TextInput
                    placeholder="Make"
                    value={make}
                    onChangeText={setMake}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Model"
                    value={model}
                    onChangeText={setModel}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Year"
                    value={year}
                    onChangeText={setYear}
                    style={styles.input}
                    keyboardType="numeric"
                />
                <TextInput
                    placeholder="License Plate"
                    value={licensePlate}
                    onChangeText={setLicensePlate}
                    style={styles.input}
                />
                <Button title="Save" onPress={handleSave} color="red" />
            </ScrollView>
            <TouchableOpacity
                style={[styles.backButton, { backgroundColor: "#555", bottom: 80 }]}
                onPress={() => navigation.navigate("Home")}
            >
                <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start', // Align content to the top
    },
    input: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
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