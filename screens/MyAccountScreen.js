/**
 * MyAccountScreen
 * ----------------
 * This screen allows users to view and manage their account information, including:
 * - Profile picture and name (editable)
 * - Email address (read-only)
 * - A list of registered vehicles (up to 3)
 *
 * Features:
 * - Automatically redirects to "AddVehicle" if no vehicles exist
 * - Users can add, edit, or delete vehicles
 * - Profile image can be picked from the device's gallery
 * - Changes are saved to Firebase Firestore
 *
 * Dependencies:
 * - Firebase Authentication for current user info
 * - Firebase Firestore for profile and vehicle data
 * - Expo ImagePicker for profile image upload
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

export default function MyAccountScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const vehicleDocRef = doc(db, "vehicles", user.uid);
        const vehicleSnap = await getDoc(vehicleDocRef);
        if (vehicleSnap.exists()) {
          const data = vehicleSnap.data();
          const userVehicles = data.vehicles || [];
          setVehicles(userVehicles);
        } else {
          setVehicles([]); // Optionally keep this to ensure empty state is handled
        }
        

        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setName(data.name || "");
          setProfilePicture(data.profilePicture || null);
        }
      }
    };
    fetchData();
  }, []);

  const handleProfilePicturePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setProfilePicture(result.uri);
    }
  };

  const handleDeleteVehicle = async (index) => {
    const updatedVehicles = [...vehicles];
    updatedVehicles.splice(index, 1);
    setVehicles(updatedVehicles);

    const userDocRef = doc(db, "vehicles", user.uid);
    await updateDoc(userDocRef, {
      vehicles: updatedVehicles,
    });
  };

  const handleAddAnotherVehicle = () => {
    if (vehicles.length >= 3) {
      Alert.alert("Limit Reached", "You can only register up to 3 vehicles.");
    } else {
      navigation.navigate("AddVehicle");
    }
  };

  const handleSaveProfile = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        await updateDoc(userDocRef, {
          name,
          profilePicture,
        });
      } else {
        await setDoc(userDocRef, {
          name,
          profilePicture,
          email: user.email,
        });
      }

      Alert.alert("Success", "Profile updated!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
      console.error(error);
    }
  };

  const getOrdinalSuffix = (index) => {
    if (index === 0) return "1st";
    if (index === 1) return "2nd";
    if (index === 2) return "3rd";
    return `${index + 1}th`;
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Account</Text>
      </View>

      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.profileHeader}>
            <Text style={styles.headerSection}>Profile Information</Text>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.profileRow}>
              <Text style={styles.label}>Profile Picture</Text>
              <TouchableOpacity onPress={handleProfilePicturePick}>
                <View style={styles.profilePictureContainer}>
                  {profilePicture ? (
                    <Image
                      source={{ uri: profilePicture }}
                      style={styles.profilePicture}
                    />
                  ) : (
                    <Ionicons name="person-circle" size={60} color="gray" />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.profileRow}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
              />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>Save Profile</Text>
            </TouchableOpacity>

            <View style={styles.profileRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.infoText}>{user?.email || "N/A"}</Text>
            </View>
          </View>

          <View style={styles.vehiclesHeader}>
            <Text style={styles.vehicleTitle}>Registered Vehicles</Text>
            <TouchableOpacity onPress={handleAddAnotherVehicle}>
              <Text style={styles.addVehicleText}>Add Vehicle</Text>
            </TouchableOpacity>
          </View>

          {vehicles.map((vehicle, index) => {
            const vehicleLabel = `${getOrdinalSuffix(index)} Vehicle`;
            return (
              <View key={index} style={styles.vehicleCard}>
                <View style={styles.vehicleHeader}>
                  <View style={styles.vehicleLabel}>
                    <FontAwesome name="car" size={20} color="#CC0000" />
                    <Text style={styles.vehicleType}>{vehicleLabel}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteVehicle(index)}>
                    <Ionicons name="trash" size={20} color="gray" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.vehicleInfo}>Make: {vehicle.make}</Text>
                <Text style={styles.vehicleInfo}>Model: {vehicle.model}</Text>
                <Text style={styles.vehicleInfo}>Year: {vehicle.year}</Text>
                <Text style={styles.vehicleInfo}>
                  License: {vehicle.licensePlate}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("EditVehicle", { vehicle, index })
                  }
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    marginTop: 50,
    backgroundColor: "#fff",
  },
  header: {
    width: '100%',
    height: 80,
    backgroundColor: '#CC0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  saveButton: {
    backgroundColor: '#CC0000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerText: {
    fontSize: 27,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'black',
    textShadowOffset: { width: 3, height: 1 },
    textShadowRadius: 5
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 5
  },
  backText: {
    color: '#CC0000',
    fontSize: 16,
  },
  profileHeader: {
    backgroundColor: "#CC0000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  headerSection: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  profileSection: {
    marginBottom: 30,
  },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  label: {
    fontWeight: "bold",
    color: "#444",
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
    flex: 2,
    textAlign: "right",
  },
  input: {
    flex: 2,
    fontSize: 14,
    color: "#555",
    textAlign: "right",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 2,
  },
  profilePictureContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  vehiclesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  vehicleTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#444",
  },
  addVehicleText: {
    color: "#CC0000",
    fontWeight: "500",
  },
  vehicleCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  vehicleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vehicleLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleType: {
    marginLeft: 5,
    fontWeight: "bold",
    color: "#555",
  },
  vehicleInfo: {
    fontSize: 14,
    marginTop: 5,
  },
  editText: {
    marginTop: 10,
    color: "blue",
    fontWeight: "500",
  },
});
