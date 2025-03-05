import React, { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import LoginScreen from "./LoginScreen";

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return unsubscribe;
  }, []);

    //ai-gen start (ChatGPT-3.5, 2)
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {user ? (
        <>
          <Text>Welcome, {user.email}</Text>
          <Button title="Logout" onPress={() => signOut(auth)} />
          <Button title="My Account" onPress={() => navigation.navigate("My Account")} />
          <Button title="Tropicana Parking" onPress={() => navigation.navigate("Tropicana Parking")} />
          <Button title="Cottage Grove Parking" onPress={() => navigation.navigate("Cottage Grove Parking")} />
          <Button title="Gateway Parking" onPress={() => navigation.navigate("Gateway Parking")} />
          <Button title="Report" onPress={() => navigation.navigate("Report")} />
        </>
      ) : (
        <LoginScreen />
      )}
    </View>
  );
}

function MyAccountScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>My Account</Text>
    </View>
  );
}

function TropicanaScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Tropicana Parking</Text>
    </View>
  );
}

function CottageGroveParkingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Cottage Grove Parking</Text>
    </View>
  );
}

function GatewayParkingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Gateway Parking</Text>
    </View>
  );
}

function ReportScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Report</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="My Account" component={MyAccountScreen} />
        <Stack.Screen name="Tropicana Parking" component={TropicanaScreen} />
        <Stack.Screen name="Cottage Grove Parking" component={CottageGroveParkingScreen} />
        <Stack.Screen name="Gateway Parking" component={GatewayParkingScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
//ai-gen end
