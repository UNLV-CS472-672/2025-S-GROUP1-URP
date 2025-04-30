import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import EditVehicleScreen from "../EditVehicleScreen";
import { Alert } from "react-native";

// 🔧 Mock Firebase Firestore
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(() =>
    Promise.resolve({
      exists: () => true,
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
  setDoc: jest.fn(() => Promise.resolve()),
}));

// 🔧 Mock Firebase Auth
jest.mock("../../firebaseConfig", () => ({
  db: {},
  auth: { currentUser: { uid: "test-user-id" } },
}));

// 🔧 Mock Firebase Storage
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

// 🔧 Mock Alert
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
        imageUrl: null,
      },
    },
  };

  it(
    "updates vehicle info successfully",
    async () => {
      const { getByPlaceholderText, getByText } = render(
        <EditVehicleScreen route={mockRoute} navigation={mockNavigation} />
      );

      fireEvent.changeText(getByPlaceholderText("Enter Make"), "Honda");
      fireEvent.changeText(getByPlaceholderText("Enter Model"), "Civic");
      fireEvent.changeText(getByPlaceholderText("Enter Year"), "2022");
      fireEvent.changeText(getByPlaceholderText("Enter License Plate"), "ABC789");

      await act(async () => {
        fireEvent.press(getByText("Save Changes"));
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Vehicle updated successfully!");
        expect(mockNavigation.navigate).toHaveBeenCalledWith("My Account");
      });
    },
    10000 // Increase timeout from default 5s to 10s
  );

  it("shows error alert for invalid year", async () => {
    const { getByPlaceholderText, getByText } = render(
      <EditVehicleScreen route={mockRoute} navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText("Enter Year"), "abcd");

    await act(async () => {
      fireEvent.press(getByText("Save Changes"));
    });

    expect(Alert.alert).toHaveBeenCalledWith("Error", "Please enter a valid year (e.g., 2025).");
  });

  it("shows error alert when fields are empty", async () => {
    const { getByPlaceholderText, getByText } = render(
      <EditVehicleScreen route={mockRoute} navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText("Enter Make"), "");
    fireEvent.changeText(getByPlaceholderText("Enter Model"), "");
    fireEvent.changeText(getByPlaceholderText("Enter Year"), "");
    fireEvent.changeText(getByPlaceholderText("Enter License Plate"), "");

    await act(async () => {
      fireEvent.press(getByText("Save Changes"));
    });

    expect(Alert.alert).toHaveBeenCalledWith("Error", "All fields are required.");
  });
});
