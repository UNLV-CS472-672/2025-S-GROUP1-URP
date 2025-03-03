import { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import LoginScreen from "./LoginScreen"; // Keep only one import

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return unsubscribe;
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {user ? (
        <>
          <Text>Welcome, {user.email}</Text>
          <Button title="Logout" onPress={() => signOut(auth)} />
        </>
      ) : (
        <LoginScreen />
      )}
    </View>
  );
}
