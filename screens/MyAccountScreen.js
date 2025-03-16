import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
import { db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig";

export default function MyAccountScreen({ navigation }) {
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState("");
    const [licensePlate, setLicensePlate] = useState("");
  
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
        <Button title="Save" onPress={handleSave} />
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
