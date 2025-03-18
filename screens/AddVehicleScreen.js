import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    input: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
});