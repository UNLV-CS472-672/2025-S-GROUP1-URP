/**
 * File: EditVehicleScreen.test.js
 * Purpose: Unit tests for the EditVehicleScreen component.
 * Verifies that vehicle details can be updated correctly, validation is enforced,
 * and Firebase interactions and alerts behave as expected.
 * Dependencies: React Native Testing Library, Firebase Firestore, Firebase Auth,
 * Expo modules, and React Native Alert.
 * Usage: Run with Jest to validate vehicle editing functionality.
 */
import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import EditVehicleScreen from "../EditVehicleScreen";
import { Alert } from "react-native";

// ------------------ MOCKS ------------------

// 🔧 Mock Firebase Firestore for getDoc and setDoc calls
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(() =>
    Promise.resolve({
      exists: () => true, // Simulates document exists
      data: () => ({
        vehicles: [
          {
            make: "Toyota",
            model: "Camry",
            year: "2020",
            licensePlate: "XYZ123",
            imageUrl: null,
          },
        ],
      }),
    })
  ),
  setDoc: jest.fn(() => Promise.resolve()), // Mock successful update
}));

// 🔧 Mock Firebase Auth for currentUser
jest.mock("../../firebaseConfig", () => ({
  db: {},
  auth: { currentUser: { uid: "test-user-id" } },
}));

// 🔧 Mock Firebase Storage (for image handling)
jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(() => ({
    app: { options: { storageBucket: "test-bucket" } },
  })),
  ref: jest.fn(),
  deleteObject: jest.fn(() => Promise.resolve()),
}));

// 🔧 Mock Expo Image Picker & File System
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  MediaTypeOptions: { Images: "Images" },
}));

jest.mock("expo-file-system", () => ({
  getInfoAsync: jest.fn(() => Promise.resolve({ size: 1000 })),
  uploadAsync: jest.fn(() => Promise.resolve({ status: 200 })),
}));

// 🔧 Mock Alert to intercept and verify messages
jest.spyOn(Alert, "alert").mockImplementation(() => { }); // Avoid actual popup during tests

// ------------------ TEST CASES ------------------
describe("EditVehicleScreen", () => {
  const mockNavigation = { navigate: jest.fn() };
  const mockRoute = {
    params: {
      index: 0,
      vehicle: {
        make: "Toyota",
        model: "Camry",
        year: "2020",
        licensePlate: "XYZ123",
        imageUrl: null,
      },
    },
  };
  /**
     * ✅ Test Case: Successfully updates vehicle info
     * Simulates editing form inputs and clicking Save,
     * expects Firestore to update and navigation + success alert to trigger.
     */
  it(
    "updates vehicle info successfully",
    async () => {
      const { getByPlaceholderText, getByText } = render(
        <EditVehicleScreen route={mockRoute} navigation={mockNavigation} />
      );
      // Fill in new vehicle info
      fireEvent.changeText(getByPlaceholderText("Enter Make"), "Honda");
      fireEvent.changeText(getByPlaceholderText("Enter Model"), "Civic");
      fireEvent.changeText(getByPlaceholderText("Enter Year"), "2022");
      fireEvent.changeText(getByPlaceholderText("Enter License Plate"), "ABC789");
      // Press Save
      await act(async () => {
        fireEvent.press(getByText("Save Changes"));
      });
      // Verify success alert and navigation
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Vehicle updated successfully!");
        expect(mockNavigation.navigate).toHaveBeenCalledWith("My Account");
      });
    },
    15000 //  Increase timeout to account for async operations
  );
  /**
    * ❌ Test Case: Shows error alert if year is invalid
    * Simulates typing an invalid year and attempts to save.
    */
  it("shows error alert for invalid year", async () => {
    const { getByPlaceholderText, getByText } = render(
      <EditVehicleScreen route={mockRoute} navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText("Enter Year"), "abcd");

    await act(async () => {
      fireEvent.press(getByText("Save Changes"));
    });
    // Expect year validation alert
    expect(Alert.alert).toHaveBeenCalledWith("Error", "Please enter a valid year (e.g., 2025).");
  });
  /**
    * ❌ Test Case: Shows error alert when all fields are empty
    * Clears out all input fields and tries to save.
    */
  it("shows error alert when fields are empty", async () => {
    const { getByPlaceholderText, getByText } = render(
      <EditVehicleScreen route={mockRoute} navigation={mockNavigation} />
    );
    // Empty all fields
    fireEvent.changeText(getByPlaceholderText("Enter Make"), "");
    fireEvent.changeText(getByPlaceholderText("Enter Model"), "");
    fireEvent.changeText(getByPlaceholderText("Enter Year"), "");
    fireEvent.changeText(getByPlaceholderText("Enter License Plate"), "");
    // Expect required fields alert
    await act(async () => {
      fireEvent.press(getByText("Save Changes"));
    });

    expect(Alert.alert).toHaveBeenCalledWith("Error", "All fields are required.");
  });
});
