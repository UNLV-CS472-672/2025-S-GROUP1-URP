import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable
} from "react-native";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

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
const SignUpScreen = ({ navigation }) => {
  // State to store the user's email and password inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [termsAccepted, setTermsAccepted] = useState(false); // New: state for checkbox
  const [showModal, setShowModal] = useState(false); // New: state for terms modal

  const termsText = `
UNLV Reserved Parking Terms and Conditions
Effective Date: 04/21/2025

Welcome to URP! These Terms and Conditions ("Terms") govern your use of our mobile application (the "App") provided by URP Inc ("we", "us", or "our"). By using the App, you agree to these Terms. If you do not agree, please do not use the App.

1. Do Not Use While Driving
Safety First: You must not interact with or use the App while operating a vehicle. Distracted driving is dangerous and may be illegal. By using this App, you acknowledge that it is your responsibility to comply with all traffic laws. We are not liable for any accidents, injuries, citations, or damages that result from using the App while driving.

2. Parking Reservation System
The App provides a reservation service for parking spots at participating garages. Reservations are not guaranteed in cases of technical failures, user error, or third-party interference. The availability of spots and services is subject to change without notice.

3. User Responsibilities
By using the App, you agree to:
Provide accurate, current, and complete information.


Keep your login credentials secure.


Use the App only for lawful and intended purposes.


Not misuse or attempt to reverse-engineer the App’s systems.


4. Garage-Specific Rules
Each garage location may have its own policies, such as:
Time Limits: Reservations may expire after a set duration. Your spot is not guaranteed after expiration.


Vehicle Requirements: Some spots may be designated for compact cars, electric vehicles, or ADA-accessible vehicles only.


Enforcement: Violations of garage rules (e.g., overstaying, parking in the wrong spot) may result in fines, towing, or bans from future reservations.


Please refer to signage and instructions provided at each garage.

5. Data Privacy
We value your privacy. By using the App, you consent to the collection and use of your information as outlined below:
We collect data such as your name, email, reservation history, and parking activity.


Your data is used to provide services, improve the App, and support customer service.


We do not sell your personal information to third parties.


We may share data with trusted partners who help us operate the App, under strict confidentiality agreements.


You can request to view, edit, or delete your data by contacting us.


Please see our full [Privacy Policy] for detailed information.

6. Limitation of Liability
To the maximum extent allowed by law, we are not liable for any:
Loss of reservation due to app errors or outages.


Parking violations, tickets, or towing.


Indirect, incidental, or consequential damages from using the App.


7. Changes to Terms
We reserve the right to modify these Terms at any time. Continued use of the App constitutes acceptance of the revised Terms. Check this page periodically for updates.

8. Termination
We may suspend or terminate your account without notice if you violate these Terms, misuse the App, or engage in behavior that disrupts service to others.


Please review and accept the Terms and Conditions before creating an account.
  `;

  /**
   * handleSignUp Function
   * 
   * Creates a new user account using Firebase Authentication with the provided email and password.
   * After successful account creation, auto-log the user in and navigate to the Home screen.
   */
  const handleSignUp = async () => {
    // Check if the Terms and Conditions are accepted
    if (!termsAccepted) {
      Alert.alert("Please accept the Terms and Conditions before signing up.");
      return;
    }

    try {
      // Create the new user account
      await createUserWithEmailAndPassword(auth, email, password);

      // EDIT: Auto-login after account creation
      await signInWithEmailAndPassword(auth, email, password); // Auto-login after sign-up
      
      // EDIT: Alert to indicate successful login
      Alert.alert("Account created and logged in successfully!"); // Notify user of successful login

      // Navigate to the Home screen after successful login
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert(error.message); // Display error message if something goes wrong
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust behavior for iOS/Android
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
        <View style={styles.passwordContainer}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={!showPassword} // Toggle password visibility
            style={styles.passwordInput}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.showPassword}>{showPassword ? "HIDE" : "SHOW"}</Text>
          </TouchableOpacity>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsRow}>
          <TouchableOpacity onPress={() => setTermsAccepted(!termsAccepted)} testID="checkbox">
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
          <Pressable onPress={() => setShowModal(true)}>
            <Text style={styles.termsText}>
              I accept the <Text style={styles.linkText}>Terms and Conditions</Text>
            </Text>
          </Pressable>
        </View>

        {/* Button to Create Account */}
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        {/* Back to Login Navigation */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>

        {/* Terms Modal */}
        <Modal visible={showModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <ScrollView>
                <Text style={styles.modalText}>{termsText}</Text>
              </ScrollView>
              <Pressable style={styles.closeButton} onPress={() => setShowModal(false)}>
                <Text style={styles.buttonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Styles for SignUpScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 60, // Added space to the bottom to avoid cover by the keyboard
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
    borderWidth: 1, // Added border for consistency
    borderColor: "#d3d3d3", // Match the background color for a cleaner look
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#d3d3d3",
    borderRadius: 5,
    paddingHorizontal: 10,
    borderWidth: 1, // Added border to match input field style
    borderColor: "#d3d3d3", // Match the background color for consistency
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1, // Makes the input take up most of the space
    paddingVertical: 10,
  },
  showPassword: {
    color: "#CC0000",
    fontWeight: "bold",
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
    marginTop: 20, // Added marginTop to move the button down
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backText: {
    color: "#6495ED",
    marginTop: 10,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  termsText: {
    marginLeft: 5,
    fontSize: 13,
  },
  linkText: {
    color: "#CC0000",
    textDecorationLine: "underline",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#CC0000",
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#CC0000",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "70%",
  },
  modalText: {
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    backgroundColor: "#CC0000",
    marginTop: 15,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});

export default SignUpScreen;
