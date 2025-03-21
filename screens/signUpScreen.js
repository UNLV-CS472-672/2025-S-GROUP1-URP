/**
 * SignUpScreen Component
 * 
 * This screen allows users to create a new account by providing their email and password.
 * It uses Firebase Authentication to create a new user account.
 * 
 * Features:
 * - Input fields for email and password.
 * - Button to create a new account.
 * - Navigation option to go back to the login screen.
 * 
 * @param {Object} navigation - React Navigation prop used to navigate between screens.
 */
import { useState } from "react";
import { View, TextInput, Text, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

const SignUpScreen = ({ navigation }) => {
  // State to store the user's email and password inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * handleSignUp Function
   * 
   * Creates a new user account using Firebase Authentication with the provided email and password.
   * Displays a success message if the account is created successfully, or an error message if it fails.
   * Navigates to the Login screen after successful account creation.
   */
  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Account created successfully!"); // Success message
      navigation.navigate("Login"); // Navigate to the Login screen
    } catch (error) {
      Alert.alert(error.message); // Display error message if something goes wrong
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>UNLV Reserved Parking{"\n"}Create an Account</Text>

      {/* Email Input Field */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      {/* Password Input Field */}
      <Text style={styles.label}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
        style={styles.input}
      />

      {/* Button to Create Account */}
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      {/* Back to Login Navigation */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for SignUpScreen
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginBottom: 20,
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    textShadowColor: "black",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    textShadowColor: "black",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    backgroundColor: "#d3d3d3",
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  checkboxText: {
    fontSize: 14,
    marginLeft: 5,
    flexShrink: 1, // Ensure text wraps correctly
  },
  button: {
    width: "100%",
    backgroundColor: "#CC0000",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#000", // Border to match the image
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signInContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  signInText: {
    fontSize: 14,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: "bold",
    color: "red",
  },
});

export default SignUpScreen;