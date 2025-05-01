import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MyAccountScreen from "../MyAccountScreen";

// --- Firebase Mocks ---
const mockGetDoc = jest.fn();
const mockUpdateDoc = jest.fn();

jest.mock("firebase/firestore", () => {
  const doc = jest.fn((_, collection, docId) => ({ path: `${collection}/${docId}` }));

  return {
    doc,
    getDoc: (...args) => mockGetDoc(...args),
    updateDoc: (...args) => mockUpdateDoc(...args),
  };
});

jest.mock("../../firebaseConfig", () => ({
  auth: { currentUser: { email: "test@example.com", uid: "12345" } },
  db: {},
}));

// --- Icon Mocks ---
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  const MockIcon = (props) => <Text>{props.name}</Text>;
  return {
    Ionicons: MockIcon,
    FontAwesome: MockIcon,
  };
});

// --- Jest Timer Control ---
beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe("<MyAccountScreen />", () => {
  let defaultNavigation;

  beforeEach(() => {
    jest.clearAllMocks();

    defaultNavigation = {
      navigate: jest.fn(),
      replace: jest.fn(),
      goBack: jest.fn(),
      canGoBack: jest.fn(() => false),
    };

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

  test("Displays user email", async () => {
    const { findByText } = render(<MyAccountScreen navigation={defaultNavigation} />);
    await findByText("test@example.com");
  }, 20000);

  test("Displays vehicle information", async () => {
    const { findByText } = render(<MyAccountScreen navigation={defaultNavigation} />);
    await findByText("Make: Toyota");
    await findByText("Model: Camry");
    await findByText("Year: 2022");
    await findByText("License: XYZ123");
  }, 20000);

  test("Navigates to AddVehicle when 'Add Vehicle' is pressed", async () => {
    const { findByText } = render(<MyAccountScreen navigation={defaultNavigation} />);
    const button = await findByText("Add Vehicle");
    fireEvent.press(button);
    expect(defaultNavigation.navigate).toHaveBeenCalledWith("AddVehicle");
  }, 20000);

  test("Goes back to home when back button is pressed", async () => {
    const mockNavigation = {
      ...defaultNavigation,
      navigate: jest.fn(),
      canGoBack: jest.fn(() => false),
    };

    const { findByText } = render(<MyAccountScreen navigation={mockNavigation} />);
    const backButton = await waitFor(() => findByText("← Back"));
    fireEvent.press(backButton);
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Home");
  });
});
