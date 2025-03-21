import { useState } from "react";
import { View, TextInput, Text, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
/**
 * LoginScreen Component
 * 
 * This component provides a user interface for logging into the application.
 * It includes input fields for email and password, a login button, and navigation options
 * for signing up or resetting a forgotten password.
 * 
 * @param {Object} navigation - React Navigation prop used to navigate between screens.
 */
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Login function
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Alert.alert("Login successful!");
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Login failed", "Invalid email or password. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>UNLV</Text>
        <Text style={styles.headerText}>Reserved Parking</Text>
      </View>

      <Text style={styles.label}>Username</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder=""
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder=""
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.showPassword}>SHOW</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
        <Text style={styles.signupText}>Don’t have an account?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("ResetPassword")}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
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
    fontSize: 24,
    fontWeight: "bold",
    textShadowColor: "black", 
    textShadowOffset: { width: 2, height: 2 }, 
    textShadowRadius: 3, 
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#d3d3d3",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1, // Makes the input take up most of the space
    paddingVertical: 10,
  },
  showPassword: {
    color: "#CC0000",
    fontWeight: "bold",
  },
  signupText: {
    color: "#6495ED",
    marginBottom: 20,
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
  forgotText: {
    color: "red",
    fontSize: 14,
    marginTop: 10,
  },
});

export default LoginScreen;
