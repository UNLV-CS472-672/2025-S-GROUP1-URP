/**
 * App Component
 * 
 * This is the main entry point for the UNLV Reserved Parking application.
 * It sets up the navigation structure and integrates Firebase for user authentication.
 * The app includes screens for login, sign-up, password reset, parking management, reporting, and account settings.
 * 
 * Features:
 * - User authentication (login, sign-up, logout, password reset).
 * - Navigation between screens using React Navigation.
 * - Parking management with maps for Tropicana, Cottage Grove, and Gateway parking lots.
 * - Reservation status tracking.
 * - Reporting functionality for parking violations.
 * - Account management for adding/removing vehicles.
 * 
 * Dependencies:
 * - React Navigation for screen transitions.
 * - Firebase Authentication for user management.
 * - Firebase Firestore for storing user and vehicle data.
 * 
 * Screens:
 * - LoginScreen: Handles user login.
 * - SignUpScreen: Handles user registration.
 * - ResetPasswordScreen: Allows users to reset their password.
 * - HomeScreen: Displays the main dashboard with navigation options.
 * - MyAccountScreen: Manages user account and vehicle information.
 * - TropicanaScreen, CottageGroveParkingScreen, GatewayParkingScreen: Displays parking maps for respective lots.
 * - ReservationStatusScreen: Shows the status of the user's reservation.
 * - ReportScreen: Allows users to report parking violations.
 * - AddVehicleScreen: Adds a vehicle to the user's account.
 * - RemoveVehicleScreen: Removes a vehicle from the user's account.
 */


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

/**
 * HomeScreen Component
 * 
 * Displays the user dashboard if authenticated, otherwise shows the login screen.
 * 
 * @param {Object} navigation - React Navigation prop for navigating between screens.
 */
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
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerLeft: null }}/>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerLeft: null }} />
        <Stack.Screen name="My Account" component={MyAccountScreen} options={{ headerLeft: null }} />
        <Stack.Screen name="Tropicana Parking" component={TropicanaScreen} options={{ headerLeft: null }}/>
        <Stack.Screen name="Cottage Grove Parking" component={CottageGroveParkingScreen} options={{ headerLeft: null }} />
        <Stack.Screen name="Gateway Parking" component={GatewayParkingScreen} options={{ headerLeft: null }} />
        <Stack.Screen name="Reservation Status" component={ReservationStatusScreen} options={{ headerLeft: null }}/>
        <Stack.Screen name="Report" component={ReportScreen} options={{ headerLeft: null }}/>
        <Stack.Screen name="AddVehicle" component={AddVehicleScreen} options={{ headerLeft: null }}/>
        <Stack.Screen name="RemoveVehicle" component={RemoveVehicleScreen} options={{ headerLeft: null }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start", // Align items to the top
    margin: 0, // Remove margin to allow full-width header
  },
  header: {
    fontSize: 26, // Larger font size
    fontWeight: "bold",
    color: "white", 
    textAlign: "center",
    padding: 20, // Padding inside the header
    backgroundColor: "#CC0000", 
    width: "100%", // Span the entire width of the screen
    textShadowColor: "black", 
    textShadowOffset: { width: 2, height: 2 }, 
    textShadowRadius: 3, 
    height: 100, // Fixed height for the header
    justifyContent: "center", // Center text vertically
    alignItems: "center", // Center text horizontally
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black", 
    marginBottom: 10,
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: 20, // Add padding to the button container
  },
  button: {
    backgroundColor: "#CC0000",
    paddingVertical: 15,
    borderColor: "black",
    borderWidth: 3,
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
    backgroundColor: "#CC0000", 
  },
});
