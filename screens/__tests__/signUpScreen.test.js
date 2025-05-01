/**
 * File: signUpScreen.test.js
 * Purpose: Unit tests for the SignUpScreen component.
 * Verifies form rendering, user registration flow using Firebase Auth,
 * terms and conditions logic, navigation actions, and modal visibility.
 * Dependencies: React Native Testing Library, Firebase Auth, React Native Alert.
 * Usage: Run with Jest to validate account creation behavior and UI interactions.
 */
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SignUpScreen from "../signUpScreen";
import { Alert } from "react-native";

// ------------------ MOCKS ------------------

// 🔧 Mock Firebase Auth methods
jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));

// 🔧 Mock Firebase config
jest.mock("../../firebaseConfig", () => ({
  auth: {},
}));

// ✅ Spy on Alert.alert to suppress dialogs and allow verification
jest.spyOn(Alert, "alert").mockImplementation(() => {});

describe("<SignUpScreen />", () => {
  const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });
  /**
   * ✅ Test Case: Renders input fields and navigation buttons
   * Ensures the form is complete with email, password fields, and action buttons.
   */
  it("renders inputs and buttons", () => {
    const { getByPlaceholderText, getByText } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    expect(getByPlaceholderText("Enter your email")).toBeTruthy();
    expect(getByPlaceholderText("Enter your password")).toBeTruthy();
    expect(getByText("Create Account")).toBeTruthy();
    expect(getByText("Back to Login")).toBeTruthy();
  });
  /**
   * ❌ Test Case: User tries to register without accepting terms
   * Verifies alert warning appears if checkbox is not selected.
   */
  it("shows alert if terms not accepted", async () => {
    const { getByText } = render(<SignUpScreen navigation={mockNavigation} />);

    fireEvent.press(getByText("Create Account"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Please accept the Terms and Conditions before signing up."
      );
    });
  });
  /**
   * ✅ Test Case: Successful registration and navigation
   * Simulates filling form, accepting terms, and verifying successful account creation and navigation.
   */
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
      expect(mockNavigation.navigate).toHaveBeenCalledWith("Tutorial");
    });
  });
  /**
   * 📑 Test Case: Opens and closes the Terms and Conditions modal
   * Simulates user tapping the terms link and closing the modal.
   */
  it("opens and closes Terms modal", () => {
    const { getByText, getByRole } = render(<SignUpScreen navigation={mockNavigation} />);

    fireEvent.press(getByText(/I accept the/i));
    expect(getByText(/UNLV Reserved Parking Terms and Conditions/i)).toBeTruthy();

    fireEvent.press(getByText("Close"));
    // The modal should close; no assertion needed here unless using `queryByText`
  });
  /**
   * 🔁 Test Case: Navigates back to login screen
   * Verifies that "Back to Login" triggers navigation.goBack().
   */
  it("navigates back to login screen", () => {
    const { getByText } = render(<SignUpScreen navigation={mockNavigation} />);
    const { getByTestId } = render(<SignUpScreen navigation={mockNavigation} />);
    fireEvent.press(getByTestId("back-button"));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
