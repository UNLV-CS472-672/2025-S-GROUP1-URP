import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig";

export default function MyAccountScreen({ navigation }) {
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState("");
    const [licensePlate, setLicensePlate] = useState("");
    const [existingData, setExistingData] = useState(null);

    useEffect(() => {
        const fetchVehicleInfo = async () => {
            const user = auth.currentUser;
            if (user) {
                const docRef = doc(db, "vehicles", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setExistingData(data); // Display information as text
                }
            }
        };
        fetchVehicleInfo();
    }, []);

    const handleSave = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                await setDoc(doc(db, "vehicles", user.uid), {
                    make,
                    model,
                    year,
                    licensePlate,
                });
                Alert.alert("Vehicle information saved successfully!");
                navigation.navigate("Home");
            } catch (error) {
                Alert.alert(error.message);
            }
        } else {
            Alert.alert("User not logged in");
        }
    };

    return (
        <View style={styles.container}>
            {existingData ? (
                <View style={styles.infoContainer}>
                    <Text style = {{fontSize: 18, fontWeight: 'bold'}}>User Information:</Text>
                    <Text>Email: {auth.currentUser.email}</Text>
                    <Text></Text>
                    <Text style = {{fontSize: 18, fontWeight: 'bold'}}>Vehicle Information:</Text>
                    <Text>Make: {existingData.make}</Text>
                    <Text>Model: {existingData.model}</Text>
                    <Text>Year: {existingData.year}</Text>
                    <Text>License Plate: {existingData.licensePlate}</Text>
                </View>
            ) : (
                <View>
                    <Text style = {{fontSize: 16, fontWeight: 'bold'}}>Enter the car information that you would like to register with UNLV Reserve Parking:</Text>
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
                    <Button title="Save" onPress={handleSave} color="red"/>
                    <Text></Text>
                    <Text style = {{fontSize: 12}}>This information will be saved under <Text style = {{fontSize: 14, fontWeight: 'bold'}}>{auth.currentUser.email}</Text></Text>
                </View>
            )}
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
    infoContainer: {
        marginBottom: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: "red",
        backgroundColor: "#f0f0f0",
    },
});
