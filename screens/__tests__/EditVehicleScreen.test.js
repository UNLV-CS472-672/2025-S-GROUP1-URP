import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import EditVehicleScreen from "../EditVehicleScreen";
import { Alert } from "react-native";

// 🔧 Mock Firestore
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({
      vehicles: [
        { make: "Toyota", model: "Camry", year: "2020", licensePlate: "XYZ123", imageUrl: null }
      ]
    })
  })),
  setDoc: jest.fn(() => Promise.resolve())
}));

// 🔧 Mock Firebase Auth
jest.mock("../../firebaseConfig", () => ({
  db: {},
  auth: { currentUser: { uid: "test-user-id" } }
}));

// 🔧 Mock Firebase Storage
jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(() => ({
    app: { options: { storageBucket: "test-bucket" } }
  })),
  ref: jest.fn(),
  deleteObject: jest.fn(() => Promise.resolve())
}));

// 🔧 Mock Image Picker and FileSystem
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  MediaTypeOptions: { Images: "Images" }
}));

jest.mock("expo-file-system", () => ({
  getInfoAsync: jest.fn(() => Promise.resolve({ size: 1000 })),
  uploadAsync: jest.fn(() => Promise.resolve({ status: 200 }))
}));

jest.spyOn(Alert, "alert").mockImplementation(() => {});

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
        imageUrl: null
      }
    }
  };

  it("renders inputs with prefilled values and updates vehicle info", async () => {
    const { getByPlaceholderText, getByText } = render(
      <EditVehicleScreen route={mockRoute} navigation={mockNavigation} />
    );

    const makeInput = getByPlaceholderText("Make");
    const modelInput = getByPlaceholderText("Model");
    const yearInput = getByPlaceholderText("Year");
    const plateInput = getByPlaceholderText("License Plate");

    // Simulate input changes
    fireEvent.changeText(makeInput, "Honda");
    fireEvent.changeText(modelInput, "Civic");
    fireEvent.changeText(yearInput, "2022");
    fireEvent.changeText(plateInput, "ABC789");

    const saveButton = getByText("Save Changes");

    await act(async () => {
      fireEvent.press(saveButton);
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Vehicle updated successfully!");
      expect(mockNavigation.navigate).toHaveBeenCalledWith("My Account");
    });
  });

  it("shows error alert for invalid year", async () => {
    const { getByPlaceholderText, getByText } = render(
      <EditVehicleScreen route={mockRoute} navigation={mockNavigation} />
    );

    const yearInput = getByPlaceholderText("Year");
    fireEvent.changeText(yearInput, "abcd");

    const saveButton = getByText("Save Changes");

    await act(async () => {
      fireEvent.press(saveButton);
    });

    expect(Alert.alert).toHaveBeenCalledWith("Error", "Please enter a valid year (e.g., 2025).");
  });

  it("shows error alert when fields are empty", async () => {
    const { getByPlaceholderText, getByText } = render(
      <EditVehicleScreen route={mockRoute} navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText("Make"), "");
    fireEvent.changeText(getByPlaceholderText("Model"), "");
    fireEvent.changeText(getByPlaceholderText("Year"), "");
    fireEvent.changeText(getByPlaceholderText("License Plate"), "");

    const saveButton = getByText("Save Changes");

    await act(async () => {
      fireEvent.press(saveButton);
    });

    expect(Alert.alert).toHaveBeenCalledWith("Error", "All fields are required.");
  });
});
