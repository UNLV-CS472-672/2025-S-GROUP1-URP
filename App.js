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
 * - TropicanaParkingScreen, CottageGroveParkingScreen, GatewayParkingScreen: Displays parking maps for respective lots.
 * - ReservationStatusScreen: Shows the status of the user's reservation.
 * - ReportScreen: Allows users to report parking violations.
 * - AddVehicleScreen: Adds a vehicle to the user's account.
 * - RemoveVehicleScreen: Removes a vehicle from the user's account.
 */

// React imports for managing state and effects
import React, { useState, useEffect } from 'react'

// Importing components from React Native
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from "react-native";

// Navigation-related imports for handling navigation between screens
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { auth } from './firebaseConfig'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import LoginScreen from './screens/LoginScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen'
import SignUpScreen from './screens/signUpScreen'
import ReportScreen from './screens/ReportScreen' // Import the Report Page
import MyAccountScreen from './screens/MyAccountScreen'
// import ParkingMap from './src/components/ParkingMap/ParkingMap'
import TropicanaParkingScreen from './screens/TropicanaParkingScreen'
import CottageGroveParkingScreen from './screens/CottageGroveParkingScreen'
import GatewayParkingScreen from './screens/GatewayParkingScreen'
import ReservationStatusScreen from './screens/ReservationStatusScreen'
import AddVehicleScreen from './screens/AddVehicleScreen'
import RemoveVehicleScreen from './screens/RemoveVehicleScreen'
// import ReservationConfirmationScreen from './screens/ReservationConfirmationScreen'
import EditVehicleScreen from './screens/EditVehicleScreen' // Import the Edit Vehicle Screen
// import initializeParkingCollections from './src/components/ParkingMap/initParkingData'

//Imports for the tutorial screen
import AsyncStorage from '@react-native-async-storage/async-storage';
import TutorialScreen from './screens/TutorialScreen';


// Stack navigator creation for screen transitions
const Stack = createStackNavigator()

/**
 * HomeScreen Component
 *
 * Displays the user dashboard if authenticated, otherwise shows the login screen.
 *
 * @param {Object} navigation - React Navigation prop for navigating between screens.
 */
function HomeScreen ({ navigation }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // 🔄 Tutorial Feature: track loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      // 🔄 Tutorial Feature: check if tutorial has been seen
      if (user) {
        try {
          const hasSeenTutorial = await AsyncStorage.getItem('hasSeenTutorial');
          if (hasSeenTutorial) {

            // await AsyncStorage.setItem('hasSeenTutorial', 'true');
            navigation.navigate("Tutorial");
          }
        } catch (e) {
          console.error("Error accessing AsyncStorage:", e);
        }
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  return (
    <View style={styles.container}>
      {/* Displaying the header text */}
      <Text style={styles.header}>
        UNLV Reserved Parking{'\n'}Dashboard
      </Text>
      {/* Conditionally render either user dashboard or login screen */}
      {user ? (
        <>
          {/*If user is authenticated, show dashboard with navigation options */}
          <ScrollView contentContainerStyle={styles.buttonContainer}>
            <Text style={styles.welcomeText}>Welcome, {user.email}</Text>

            {/* Navigation buttons for various screens */}
            <TouchableOpacity onPress={() => navigation.navigate("Cottage Grove Parking")}>
              <View style={styles.parkingCard}>
                <Image
                  source={require("./assets/CottageGrove-ParkingGarage.jpg")}
                  style={styles.parkingImage}
                />
                <Text style={styles.parkingText}>Cottage Grove Parking</Text>
              </View>
            </TouchableOpacity>


            <TouchableOpacity onPress={() => navigation.navigate("Tropicana Parking")}>
              <View style={styles.parkingCard}>
                <Image
                  source={require("./assets/Tropicana-ParkingGarage.jpg")}
                  style={styles.parkingImage}
                />
                <Text style={styles.parkingText}>Tropicana Parking</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Gateway Parking")}>
              <View style={styles.parkingCard}>
                <Image
                  source={require("./assets/Gateway-ParkingGarage.jpg")}
                  style={styles.parkingImage}
                />
                <Text style={styles.parkingText}>Gateway Parking</Text>
              </View>
            </TouchableOpacity>

          </ScrollView>

          {/* 🟥 REPLACED: bottomNav emoji icons */}
          {/* ✅ NEW: Custom icon images */}
          <View style={styles.bottomNav}>
            <TouchableOpacity
              onPress={() => navigation.navigate("My Account")}
              style={{ alignItems: "center" }}
            >
              <Image source={require('./assets/icons/account.png')} style={styles.navIconImage} />
              <Text style={styles.navLabel}>Account</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Reservation Status")}
              style={{ alignItems: "center" }}
            >
              <Image source={require('./assets/icons/parking.png')} style={styles.navIconImage} />
              <Text style={styles.navLabel}>Reservation</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Report")}
              style={{ alignItems: "center" }}
            >
              <Image source={require('./assets/icons/report.png')} style={styles.navIconImage} />
              <Text style={styles.navLabel}>Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Yes, Logout",
                    onPress: () => {
                      signOut(auth);
                      navigation.navigate("Login");
                    },
                  },
                ]);
              }}
            >
              <Image source={require('./assets/icons/logout.png')} style={styles.navIconImage} />
              <Text style={styles.navLabel}>Logout</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <LoginScreen />
      )}
    </View>
  )
}

// Screens for different parking lots
function TropicanaScreen() {
  return <TropicanaParkingScreen parkingLot='Tropicana Parking' />
}

function CottageGroveScreen() {
  return <CottageGroveParkingScreen parkingLot='Cottage Grove Parking' />
}

function GatewayScreen() {
  return <GatewayParkingScreen parkingLot='Gateway Parking' />
}

// App component that includes the navigator and stack of screens
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login'>
        {/* Defining screen routes */}
        <Stack.Screen
          name='Login'
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name='SignUp' component={SignUpScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name='ResetPassword'
          component={ResetPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='Home'
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='My Account'
          component={MyAccountScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='Tropicana Parking'
          component={TropicanaScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='Cottage Grove Parking'
          component={CottageGroveScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='Gateway Parking'
          component={GatewayScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='Reservation Status'
          component={ReservationStatusScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='Report'
          component={ReportScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='AddVehicle'
          component={AddVehicleScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='RemoveVehicle'
          component={RemoveVehicleScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='EditVehicle'
          component={EditVehicleScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Tutorial"
          component={TutorialScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Align items to the top
    margin: 0 // Remove margin to allow full-width header
  },
  header: {
    fontSize: 25, // Larger font size
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    padding: 20, // Padding inside the header
    backgroundColor: '#CC0000',
    width: '100%', // Span the entire width of the screen
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    height: 100, // Fixed height for the header
    justifyContent: 'center', // Center text vertically
    alignItems: 'center', // Center text horizontally
    marginTop: 50,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 20 // Add padding to the button container
  },
  button: {
    backgroundColor: '#CC0000',
    paddingVertical: 15,
    borderColor: 'black',
    borderWidth: 3,
    width: 250,
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 8
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white'
  },
  logoutButton: {
    backgroundColor: "#CC0000",
  },
  parkingContainer: {
    alignItems: "center",
    paddingBottom: 100,
  },
  parkingCard: {
    width: 215,
    backgroundColor: "#CC0000",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
    alignItems: "center",
    elevation: 3,
  },
  parkingImage: {
    width: 200,
    height: 120,
    resizeMode: "cover",
    borderRadius: 5,
    marginTop: 15,
  },
  parkingText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    paddingVertical: 10,
    textAlign: "center",
    textShadowColor: "black",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  logoutButton: {
    backgroundColor: "#CC0000",
    borderWidth: 0,
    width: 180,
    alignItems: "center",
    borderRadius: 4,
    paddingVertical: 8,
    marginTop: 1,
  },
  parkingLabel: {
    backgroundColor: "#CC0000",
    color: "black",
    fontWeight: "bold",
    fontSize: 25,
    width: 200,
    textAlign: "center",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 80,
    backgroundColor: "#CC0000",
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  navIcon: {
    fontSize: 30,
    color: "black",
    textAlign: "center",
  },
  navIconImage: {
    width: 45,
    height: 35,
    resizeMode: "contain",
    marginBottom: 3.7,
    tintColor: "white", // change color icons
  },
  navLabel: {
    fontSize: 12,
    color: "black",
    textAlign: "center",
  }
});
