/**
 * ReportScreen Component
 * 
 * This screen allows users to report a parking violation by providing details about the vehicle.
 * The submitted report is stored in Firestore, and the logged-in user's ID and a timestamp are automatically included.
 * 
 * Features:
 * - Header with the title "Report Violation".
 * - Input fields for license plate number, vehicle color, make/model, and optional comments.
 * - Validation to ensure required fields are filled.
 * - Submission to Firestore with user ID and timestamp.
 * - Success or error alerts based on the submission result.
 * 
 * Dependencies:
 * - Firebase Firestore for storing reports.
 * - Firebase Authentication for identifying the logged-in user.
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Button, Alert } from "react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; // Import serverTimestamp
import { db, auth } from "../firebaseConfig"; // Import Firestore and Auth

export default function ReportScreen() {
  const [licensePlate, setLicensePlate] = useState("");
  const [color, setColor] = useState("");
  const [makeModel, setMakeModel] = useState("");
  const [comments, setComments] = useState("");

  /**
   * handleSubmit Function
   * 
   * Validates the input fields and submits the report to Firestore.
   * Includes the logged-in user's ID and a timestamp automatically.
   * Displays success or error alerts based on the submission result.
   */
  
  const handleSubmit = async () => {
    if (!licensePlate || !color || !makeModel) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in to submit a report.");
        return;
      }

      await addDoc(collection(db, "reports"), {
        licensePlate,
        color,
        makeModel,
        comments,
        userId: user.uid, // Automatically assign the logged-in user’s ID
        timestamp: serverTimestamp(), // Automatically generate a timestamp
      });

      Alert.alert("Success", "Report submitted successfully!");
      setLicensePlate("");
      setColor("");
      setMakeModel("");
      setComments("");
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert("Error", "Failed to submit report.");
    }
  };


  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Report Violation</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
         {/* Vehicle Number Section */}
         <Text style={styles.label}>License Plate Number:</Text>

        {/* License Plate # input Section */}
         <TextInput 
          style={styles.input}
          placeholder="Enter license plate"
          value={licensePlate}
          onChangeText={setLicensePlate}
        />

         {/* Vehicle Color Section */}
         <Text style={styles.label}>Color:</Text>

        {/* Vechicle Color input Section */}
         <TextInput 
          style={styles.input}
          placeholder="Enter vehicle color"
          value={color}
          onChangeText={setColor}
        />

         {/* Make/Model Section */}
         <Text style={styles.label}>Make/Model:</Text>

        {/* Make/Model Section input*/}
         <TextInput 
          style={styles.input}
          placeholder="Enter vehicle make and model"
          value={makeModel}
          onChangeText={setMakeModel}
        />
         {/* Comments Section*/}
         <Text style={styles.label}>Comments:</Text>

        {/* Comments input*/}
         <TextInput 
          style={[styles.input, styles.commentInput]}
          placeholder="Additional comments (optional)"
          value={comments}
          onChangeText={setComments}
          multiline
        />

        <Button title="Submit Report" onPress={handleSubmit} color="red" />
      </View>
    </View>
  );
}

// the following is the title for report page

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    height: 150, // Adjust height as needed
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30, // Optional for styling
    borderBottomRightRadius: 30, // Optional for styling
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    // Text Outline Effect
    textShadowColor: "black",
    textShadowOffset: { width: 3, height: 1 }, // Offset to create the outline
    textShadowRadius: 10, // Controls the thickness of the outline
  },
   content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  commentInput: {
    height: 80,
    textAlignVertical: "top",
  },
});