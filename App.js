// React imports for managing state and effects
import React, { useState, useEffect } from "react";

// Importing components from React Native
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";

// Navigation-related imports for handling navigation between screens
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Firebase imports for authentication functions
import { auth } from "./firebaseConfig"; // Authentication object
import { onAuthStateChanged, signOut } from "firebase/auth"; // Functions for managing user auth state

// Importing screen components for navigation
import LoginScreen from "./screens/LoginScreen"; // Login screen
import ResetPasswordScreen from "./screens/ResetPasswordScreen"; // Reset password screen
import SignUpScreen from "./screens/signUpScreen"; // Sign-up screen
import ReportScreen from "./screens/ReportScreen"; // Report screen
import MyAccountScreen from "./screens/MyAccountScreen"; // Account management screen
import ParkingMap from "./src/components/ParkingMap/ParkingMap"; // Parking map display component
import ReservationStatusScreen from "./screens/ReservationStatusScreen"; // Reservation status screen
import AddVehicleScreen from "./screens/AddVehicleScreen"; // Add vehicle screen
import RemoveVehicleScreen from "./screens/RemoveVehicleScreen"; // Remove vehicle screen

// Stack navigator creation for screen transitions
const Stack = createStackNavigator();

// HomeScreen component, displays user dashboard and login/logout
function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null); // State to track user authentication status

  // Effect hook to subscribe to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Update user state when auth state changes
    });

    return unsubscribe; // Clean up subscription when component unmounts
  }, []);

  return (
    <View style={styles.container}>
      {/* Displaying the header text */}
      <Text style={styles.header}>UNLV Reserved Parking Dashboard</Text>

      {/* Conditionally render either user dashboard or login screen */}
      {user ? (
        // If user is authenticated, show dashboard with navigation options
        <ScrollView contentContainerStyle={styles.buttonContainer}>
          <Text style={styles.welcomeText}>Welcome, {user.email}</Text>

          {/* Navigation buttons for various screens */}
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("My Account")}>
            <Text style={styles.buttonText}>My Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Tropicana Parking")}>
            <Text style={styles.buttonText}>Tropicana Parking</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Cottage Grove Parking")}>
            <Text style={styles.buttonText}>Cottage Grove Parking</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Gateway Parking")}>
            <Text style={styles.buttonText}>Gateway Parking</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Reservation Status")}>
            <Text style={styles.buttonText}>Reservation Status</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Report")}>
            <Text style={styles.buttonText}>Report</Text>
          </TouchableOpacity>

          {/* Logout button with confirmation alert */}
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={() => {
              Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, Logout",
                  onPress: () => {
                    signOut(auth); // Logs out the user
                    navigation.navigate("Login"); // Navigate to login screen
                  },
                },
              ]);
            }}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        // If user is not authenticated, show login screen
        <LoginScreen />
      )}
    </View>
  );
}

// Screens for different parking lots
function TropicanaScreen() {
  return <ParkingMap parkingLot="Tropicana Parking" />;
}

function CottageGroveParkingScreen() {
  return <ParkingMap parkingLot="Cottage Grove Parking" />;
}

function GatewayParkingScreen() {
  return <ParkingMap parkingLot="Gateway Parking" />;
}

// App component that includes the navigator and stack of screens
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Defining screen routes */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="My Account" component={MyAccountScreen} />
        <Stack.Screen name="Tropicana Parking" component={TropicanaScreen} />
        <Stack.Screen name="Cottage Grove Parking" component={CottageGroveParkingScreen} />
        <Stack.Screen name="Gateway Parking" component={GatewayParkingScreen} />
        <Stack.Screen name="Reservation Status" component={ReservationStatusScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
        <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
        <Stack.Screen name="RemoveVehicle" component={RemoveVehicleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles for the UI components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white", // White background for the main container
    alignItems: "center",
    paddingTop: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white", // White text color for the header
    textAlign: "center",
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#B0463C", // Red background for the header
    borderRadius: 10, // Optional: rounded corners for the header box
    textShadowColor: "black", // Black text shadow for an outline effect
    textShadowOffset: { width: 2, height: 2 }, // Shadow direction
    textShadowRadius: 3, // Spread radius for the shadow
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white", 
    marginBottom: 10,
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  button: {
    backgroundColor: "#B0463C",
    paddingVertical: 15,
    width: 250,
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white", 
  },
  logoutButton: {
    backgroundColor: "#B0463C", 
  },
});