import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import AddVehicleScreen from "../AddVehicleScreen";
import { setDoc, getDoc, doc } from "firebase/firestore";

// Mock Firebase config and authentication
jest.mock("../../firebaseConfig", () => ({
  db: {},
  auth: {
    currentUser: { uid: "testUser" },
  },
}));

// Mock Firestore functions
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  setDoc: jest.fn(() => Promise.resolve()), // Ensuring setDoc is properly mocked
  getDoc: jest.fn(() =>
    Promise.resolve({
      exists: () => false,
      data: () => ({ vehicles: [] }),
    })
  ),
}));

describe("AddVehicleScreen", () => {
  it("renders input fields and save button", () => {
    const { getByPlaceholderText, getByText } = render(
      <AddVehicleScreen navigation={{ navigate: jest.fn() }} />
    );

    expect(getByPlaceholderText("Make")).toBeTruthy();
    expect(getByPlaceholderText("Model")).toBeTruthy();
    expect(getByPlaceholderText("Year")).toBeTruthy();
    expect(getByPlaceholderText("License Plate")).toBeTruthy();
    expect(getByText("Save")).toBeTruthy();
  });

  it("saves vehicle data on button press", async () => {
    const mockNavigate = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <AddVehicleScreen navigation={{ navigate: mockNavigate }} />
    );

    // Simulating user input
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText("Make"), "Toyota");
      fireEvent.changeText(getByPlaceholderText("Model"), "Camry");
      fireEvent.changeText(getByPlaceholderText("Year"), "2022");
      fireEvent.changeText(getByPlaceholderText("License Plate"), "ABC123");
    });

    // Pressing Save button
    await act(async () => {
      fireEvent.press(getByText("Save"));
    });

    // Ensure Firestore function is called correctly
    await waitFor(() => expect(setDoc).toHaveBeenCalledTimes(1));

    // Ensure navigation happens after saving
    expect(mockNavigate).toHaveBeenCalledWith("My Account");
  });
});
