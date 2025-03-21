import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import ReportScreen from "../ReportScreen";

// Mock Firebase dependencies
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve()),
  serverTimestamp: jest.fn(() => "mockedTimestamp"),
}));

jest.mock("../../firebaseConfig", () => ({
  auth: { currentUser: { uid: "12345" } },
  db: {},
}));

// Mock Alert.alert
import { Alert } from "react-native";
jest.spyOn(Alert, "alert").mockImplementation(() => {});

describe("<ReportScreen />", () => {
  const mockNavigation = { navigate: jest.fn() };

  it("displays validation alert when required fields are missing", async () => {
    const { getByText } = render(<ReportScreen navigation={mockNavigation} />);
    const submitButton = getByText("Submit Report");

    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "Please fill in all required fields.");
    });
  });

  it("submits the report when all required fields are filled", async () => {
    const { getByPlaceholderText, getByText } = render(<ReportScreen navigation={mockNavigation} />);
    
    fireEvent.changeText(getByPlaceholderText("Enter license plate"), "ABC123");
    fireEvent.changeText(getByPlaceholderText("Enter vehicle color"), "Blue");
    fireEvent.changeText(getByPlaceholderText("Enter vehicle make and model"), "Honda Civic");
    fireEvent.changeText(getByPlaceholderText("Additional comments (optional)"), "Parked illegally.");

    const submitButton = getByText("Submit Report");
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Success", "Report submitted successfully!");
    });
  });

  it("navigates to Home when Back button is pressed", () => {
    const { getByText } = render(<ReportScreen navigation={mockNavigation} />);
    const backButton = getByText("Back");

    fireEvent.press(backButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith("Home");
  });
});

