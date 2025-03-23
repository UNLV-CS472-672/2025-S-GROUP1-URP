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
  const [email, setEmail] = useState("");

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Password reset email sent!");
      navigation.goBack();
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with red box */}
      <View style={styles.header}>
        <Text style={styles.headerText}>UNLV Reserved Parking{"\n"}Reset Password</Text>
      </View>

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

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for ResetPasswordScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  header: {
    width: "100%",
    backgroundColor: "#CC0000",
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 30,
  },
  headerText: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "bold",
    textShadowColor: "black",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    alignContent: "center",
    justifyContent: "center",
    textAlign: "center", 
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
    backgroundColor: "#CC0000",
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

export default ResetPasswordScreen;