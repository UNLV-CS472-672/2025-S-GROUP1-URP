import React, { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import LoginScreen from "./LoginScreen";
import ReportScreen from "./screens/ReportScreen"; // Import the Report Page
import MyAccountScreen from "./screens/MyAccountScreen";
import ParkingMap from "./src/components/ParkingMap/ParkingMap"; 
import ReservationStatusScreen from "./screens/ReservationStatusScreen";

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
          <Button
            title="Logout"
            onPress={() => {
              signOut(auth);
              navigation.navigate("Login");
            }}
          />
          <Button title="My Account" onPress={() => navigation.navigate("My Account")} />
          <Button title="Tropicana Parking" onPress={() => navigation.navigate("Tropicana Parking")} />
          <Button title="Cottage Grove Parking" onPress={() => navigation.navigate("Cottage Grove Parking")} />
          <Button title="Gateway Parking" onPress={() => navigation.navigate("Gateway Parking")} />
          <Button title="Reservation Status" onPress={() => navigation.navigate("Reservation Status")} />
          <Button title="Report" onPress={() => navigation.navigate("Report")} />
        </>
      ) : (
        <LoginScreen />
      )}
    </View>
  );
}


function TropicanaScreen() {
  return <ParkingMap parkingLot="Tropicana Parking" />;
}

function CottageGroveParkingScreen() {
  return <ParkingMap parkingLot="Cottage Grove Parking" />;
}

function GatewayParkingScreen() {
  return <ParkingMap parkingLot="Gateway Parking" />;
}


//function ReportScreen() {
  //return (
    //<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      //<Text>Report</Text>
    //</View>
 // );
//}

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
        <Stack.Screen name="Reservation Status" component={ReservationStatusScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
//ai-gen end
