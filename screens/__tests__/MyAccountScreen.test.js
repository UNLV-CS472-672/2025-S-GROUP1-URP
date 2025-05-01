/**
 * File: MyAccountScreen.test.js
 * Purpose: Unit tests for the MyAccountScreen component.
 * Verifies correct display of user/vehicle data, navigation to AddVehicle, and redirect logic
 * based on Firestore data conditions.
 * Dependencies: React Native Testing Library, Firebase Firestore, Firebase Auth, React Navigation.
 * Usage: Run with Jest to validate the behavior of MyAccountScreen under various data conditions.
 */

import React from "react";
import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
import MyAccountScreen from "../MyAccountScreen";

// ------------------ FIREBASE MOCKS ------------------

// Create reusable Firestore mock functions
const mockGetDoc = jest.fn();
const mockUpdateDoc = jest.fn();

jest.mock("firebase/firestore", () => {
  const doc = jest.fn((_, collection, docId) => ({
    path: `${collection}/${docId}`,
  }));

  return {
    doc,
    getDoc: (...args) => mockGetDoc(...args),
    updateDoc: (...args) => mockUpdateDoc(...args),
  };
});

jest.mock('../../firebaseConfig', () => ({
  auth: { currentUser: { email: 'test@example.com', uid: '12345' } },
  db: {}
}));

// ------------------ ICON MOCKS ------------------

// Mock vector icons with text replacements for test compatibility
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  const MockIcon = (props) => <Text>{props.name}</Text>;
  return {
    Ionicons: MockIcon,
    FontAwesome: MockIcon,
  };
});

// ------------------ JEST TIMER MANAGEMENT ------------------
beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});
// ------------------ TEST CASES ------------------
describe("<MyAccountScreen />", () => {
  let defaultNavigation;

  beforeEach(() => {
    jest.clearAllMocks();

    defaultNavigation = {
      navigate: jest.fn(),
      replace: jest.fn(),
      goBack: jest.fn(), // ✅ added for back button test
      canGoBack: jest.fn(() => false),
    };
    // Default Firestore mock data (user + 1 vehicle)
    mockGetDoc.mockImplementation((ref) => {
      if (ref.path === "vehicles/12345") {
        return Promise.resolve({
          exists: () => true,
          data: () => ({
            vehicles: [
              { make: "Toyota", model: "Camry", year: "2022", licensePlate: "XYZ123" },
            ],
          }),
        });
      } else if (ref.path === "users/12345") {
        return Promise.resolve({
          exists: () => true,
          data: () => ({
            name: "Test User",
            profilePicture: null,
          }),
        });
      }
      return Promise.resolve({ exists: () => false });
    });
  });
  /**
    * ✅ Displays the authenticated user's email address
    */
  test("Displays user email", async () => {
    const { findByText } = render(<MyAccountScreen navigation={defaultNavigation} />);
    await findByText("test@example.com");
  }, 20000);
  /**
    * ✅ Displays vehicle information from Firestore
    */
  test("Displays vehicle information", async () => {
    const { findByText } = render(<MyAccountScreen navigation={defaultNavigation} />);
    await findByText("Make: Toyota");
    await findByText("Model: Camry");
    await findByText("Year: 2022");
    await findByText("License: XYZ123");
  }, 20000);
  /**
  * ✅ Navigates to AddVehicle screen when 'Add Vehicle' button is clicked
  */
  test("Navigates to AddVehicle when 'Add Vehicle' is pressed", async () => {
    const { findByText } = render(<MyAccountScreen navigation={defaultNavigation} />);
    const button = await findByText("Add Vehicle");
    fireEvent.press(button);
    expect(defaultNavigation.navigate).toHaveBeenCalledWith("AddVehicle");
  }, 20000);
  /**
     * ✅ Triggers navigation.goBack when ← Back button is pressed
     */
  test("Goes back when back button is pressed", async () => {
    const { getByText } = render(<MyAccountScreen navigation={defaultNavigation} />);

    await waitFor(() => {
      expect(getByText("← Back")).toBeTruthy();
    });

    fireEvent.press(getByText("← Back"));
    expect(defaultNavigation.goBack).toHaveBeenCalled(); // ✅ checks goBack now
  });
  /**
    * ✅ Redirects to AddVehicle screen when vehicle list is empty
    */
  test("Redirects to AddVehicle when no vehicles are found", async () => {
    const mockNavigation = {
      navigate: jest.fn(),
      replace: jest.fn(),
      goBack: jest.fn(),
      canGoBack: jest.fn(() => false),
    };
    // Mock no vehicles in Firestore
    mockGetDoc.mockImplementation((ref) => {
      if (ref.path === "vehicles/12345") {
        return Promise.resolve({
          exists: () => true,
          data: () => ({ vehicles: [] }),
        });
      } else if (ref.path === "users/12345") {
        return Promise.resolve({
          exists: () => true,
          data: () => ({ name: "", profilePicture: null }),
        });
      }
      return Promise.resolve({ exists: () => false });
    });

    render(<MyAccountScreen navigation={mockNavigation} />);

    await act(async () => {
      jest.advanceTimersByTime(1100);
    });

    await waitFor(() =>
      expect(mockNavigation.replace).toHaveBeenCalledWith("AddVehicle")
    );
  }, 20000);
  /**
    * ✅ Redirects to AddVehicle when vehicle document does not exist
    */
  test("Redirects to AddVehicle when vehicle document does not exist", async () => {
    const mockNavigation = {
      navigate: jest.fn(),
      replace: jest.fn(),
      goBack: jest.fn(),
      canGoBack: jest.fn(() => false),
    };
    // Simulate missing vehicles doc
    mockGetDoc.mockImplementation((ref) => {
      if (ref.path === "vehicles/12345") {
        return Promise.resolve({ exists: () => false });
      } else if (ref.path === "users/12345") {
        return Promise.resolve({
          exists: () => true,
          data: () => ({ name: "Test User", profilePicture: null }),
        });
      }
      return Promise.resolve({ exists: () => false });
    });

    render(<MyAccountScreen navigation={mockNavigation} />);

    await act(async () => {
      jest.advanceTimersByTime(1100);
    });

    await waitFor(() =>
      expect(mockNavigation.replace).toHaveBeenCalledWith("AddVehicle")
    );
  }, 20000);
});
