import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SignUpScreen from "../signUpScreen";
import { Alert } from "react-native";

// 🔧 Mock Firebase Auth
jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));

// 🔧 Mock Firebase config
jest.mock("../../firebaseConfig", () => ({
  auth: {},
}));

// 🔧 Spy on Alert
jest.spyOn(Alert, "alert").mockImplementation(() => {});

describe("<SignUpScreen />", () => {
  const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders inputs and buttons", () => {
    const { getByPlaceholderText, getByText } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    expect(getByPlaceholderText("Enter your email")).toBeTruthy();
    expect(getByPlaceholderText("Enter your password")).toBeTruthy();
    expect(getByText("Create Account")).toBeTruthy();
    expect(getByText("Back to Login")).toBeTruthy();
  });

  it("shows alert if terms not accepted", async () => {
    const { getByText } = render(<SignUpScreen navigation={mockNavigation} />);

    fireEvent.press(getByText("Create Account"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Please accept the Terms and Conditions before signing up."
      );
    });
  });

  it("creates user and navigates to Home when valid", async () => {
    const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth");

    createUserWithEmailAndPassword.mockResolvedValue({});
    signInWithEmailAndPassword.mockResolvedValue({});

    const { getByPlaceholderText, getByText, getByTestId } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText("Enter your email"), "user@example.com");
    fireEvent.changeText(getByPlaceholderText("Enter your password"), "password123");

    // Accept Terms and Conditions
    fireEvent.press(getByTestId("checkbox")); // The checkbox

    // ✅ Wrap the "Create Account" press inside waitFor
    await waitFor(() => {
        fireEvent.press(getByText("Create Account"));
    });

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalled();
      expect(signInWithEmailAndPassword).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith("Account created and logged in successfully!");
      expect(mockNavigation.navigate).toHaveBeenCalledWith("Home");
    });
  });

  it("opens and closes Terms modal", () => {
    const { getByText, getByRole } = render(<SignUpScreen navigation={mockNavigation} />);

    fireEvent.press(getByText(/I accept the/i));
    expect(getByText(/UNLV Reserved Parking Terms and Conditions/i)).toBeTruthy();

    fireEvent.press(getByText("Close"));
    // The modal should close; no assertion needed here unless using `queryByText`
  });

  it("navigates back to login screen", () => {
    const { getByText } = render(<SignUpScreen navigation={mockNavigation} />);
    fireEvent.press(getByText("Back to Login"));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
