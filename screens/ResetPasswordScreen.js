/**
 * ResetPasswordScreen Component
 * 
 * This screen allows users to reset their password by entering their email address.
 * It uses Firebase Authentication to send a password reset email to the provided email address.
 * 
 * Features:
 * - Input field for the user's email.
 * - Button to trigger the password reset process.
 * - Navigation option to go back to the login screen.
 * 
 */
import { useState } from "react";
import { View, TextInput, Text, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";

const ResetPasswordScreen = ({ navigation }) => {
  // State to store the user's email input
  const [email, setEmail] = useState("");

  /**
   * handlePasswordReset Function
   * 
   * Sends a password reset email to the provided email address using Firebase Authentication.
   * Displays a success message if the email is sent successfully, or an error message if it fails.
   */
  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Password reset email sent!"); // Success message
      navigation.goBack(); // Navigate back to the previous screen
    } catch (error) {
      Alert.alert(error.message); // Display error message if something goes wrong
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Reset Password</Text>

      {/* Email Input Field */}
      <Text style={styles.label}>Enter your email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      {/* Button to Send Reset Email */}
      <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
        <Text style={styles.buttonText}>Send Reset Email</Text>
      </TouchableOpacity>

      {/* Back to Login Navigation */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the ResetPasswordScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    backgroundColor: "#d3d3d3",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  button: {
    width: "100%",
    backgroundColor: "#B0463C",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backText: {
    color: "red",
    fontSize: 14,
    marginTop: 10,
  },
});

export default ResetPasswordScreen;