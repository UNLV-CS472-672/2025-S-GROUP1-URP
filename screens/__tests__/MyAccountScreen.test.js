import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MyAccountScreen from "../MyAccountScreen";

// Mock Firebase auth and Firestore
jest.mock("firebase/firestore", () => {
  return {
    doc: jest.fn(),
    getDoc: jest.fn(() =>
      Promise.resolve({
        exists: () => true,
        data: () => ({
          vehicles: [
            { make: "Toyota", model: "Camry", year: "2022", licensePlate: "XYZ123" }
          ]
        })
      })
    ),
  };
});

jest.mock("../../firebaseConfig", () => ({
  auth: { currentUser: { email: "test@example.com", uid: "12345" } },
  db: {},
}));

describe("<MyAccountScreen />", () => {
  const mockNavigation = { navigate: jest.fn() };

  test("Displays user email", async () => {
    const { findByText } = render(<MyAccountScreen navigation={mockNavigation} />);
    await findByText("User Information:");
    await findByText("Email: test@example.com");
  });

  test("Navigates to AddVehicle when 'Add Another Vehicle' is pressed", async () => {
    const { findByText } = render(<MyAccountScreen navigation={mockNavigation} />);
    const button = await findByText("Add Another Vehicle");
    fireEvent.press(button);
    expect(mockNavigation.navigate).toHaveBeenCalledWith("AddVehicle");
  });

  test("Navigates to RemoveVehicle when 'Remove a Vehicle' is pressed", async () => {
    const { findByText } = render(<MyAccountScreen navigation={mockNavigation} />);
    const button = await findByText("Remove a Vehicle");
    fireEvent.press(button);
    expect(mockNavigation.navigate).toHaveBeenCalledWith("RemoveVehicle", expect.any(Object));
  });
});
