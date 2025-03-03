import { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig"; 


// chat helped with login screen
const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign up function
  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Account created successfully!");
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  // Login function
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Login successful!");
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Email:</Text>
      <TextInput 
        value={email} 
        onChangeText={setEmail} 
        placeholder="Enter email" 
        keyboardType="email-address" 
        autoCapitalize="none" 
      />

      <Text>Password:</Text>
      <TextInput 
        value={password} 
        onChangeText={setPassword} 
        placeholder="Enter password" 
        secureTextEntry 
      />

      <Button title="Sign Up" onPress={handleSignUp} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;
