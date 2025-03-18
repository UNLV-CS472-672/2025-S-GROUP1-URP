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
      <Text style={styles.header}>Reset Password</Text>

      <Text style={styles.label}>Enter your email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
        <Text style={styles.buttonText}>Send Reset Email</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back to Login</Text>
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
