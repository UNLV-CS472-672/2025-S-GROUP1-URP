import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig";

export default function EditVehicleScreen({ route, navigation }) {
  const { vehicle, index } = route.params; // Get vehicle details and index from navigation params
  const [make, setMake] = useState(vehicle.make);
  const [model, setModel] = useState(vehicle.model);
  const [year, setYear] = useState(vehicle.year);
  const [licensePlate, setLicensePlate] = useState(vehicle.licensePlate);

  const handleSave = async () => {
    if (!make.trim() || !model.trim() || !year.trim() || !licensePlate.trim()) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    if (
      isNaN(year) ||
      year.length !== 4 ||
      parseInt(year) < 1886 ||
      parseInt(year) > new Date().getFullYear()
    ) {
      Alert.alert("Error", "Please enter a valid year (e.g., 2025).");
      return;
    }

    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "vehicles", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const updatedVehicles = [...data.vehicles];
          updatedVehicles[index] = { make, model, year, licensePlate }; // Update the selected vehicle

          await setDoc(docRef, { vehicles: updatedVehicles });
          Alert.alert("Vehicle updated successfully!");
          navigation.navigate("My Account"); // Navigate back to MyAccountScreen
        }
      } catch (error) {
        Alert.alert("Error", error.message);
      }
    } else {
      Alert.alert("Error", "User not logged in");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Edit Vehicle Information</Text>
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
      <Button title="Save Changes" onPress={handleSave} color="green" />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("My Account")}
      >
        <Text style={styles.backButtonText}>Back to My Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: "#B0463C",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 5,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
