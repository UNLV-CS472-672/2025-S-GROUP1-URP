/**
 * File: LoginScreen.test.js
 * Purpose: Unit tests for the LoginScreen component.
 * Validates form rendering, navigation to other screens (SignUp and ResetPassword),
 * login functionality using Firebase Auth, and error handling via alerts.
 * Dependencies: React Native Testing Library, Firebase Auth, React Native Alert.
 * Usage: Run using Jest to verify that login screen functionality works correctly.
 */
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../LoginScreen";
import { Alert } from "react-native";

// ------------------ MOCKS ------------------

// 🔧 Mock Firebase sign-in method
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

// 🔧 Mock firebaseConfig to simulate unauthenticated user
jest.mock("../../firebaseConfig", () => ({
  auth: { currentUser: null },
}));

// 🔧 Spy on Alert.alert to suppress pop-ups and allow verification
jest.spyOn(Alert, "alert").mockImplementation(() => { });

describe("<LoginScreen />", () => {
  const mockNavigation = {
    navigate: jest.fn(), // Reset mocks before each test
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });
  /**
    * ✅ Test Case: Renders all login inputs and navigation buttons
    * Ensures all required fields and texts are present.
    */
  it("renders login inputs and buttons correctly", () => {
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );
    // Fill in valid email and password
    expect(getByPlaceholderText("Enter your email")).toBeTruthy();
    expect(getByPlaceholderText("Enter your password")).toBeTruthy();
    // Simulate button press
    expect(getByText("Sign In")).toBeTruthy();
    expect(getByText("Don’t have an account?")).toBeTruthy();
    expect(getByText("Forgot Password?")).toBeTruthy();
  });
  /**
   * 🔁 Test Case: Navigates to SignUp screen when user clicks link
   */
  it("navigates to SignUp screen", () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);
    fireEvent.press(getByText("Don’t have an account?"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith("SignUp");
  });
  /**
   * 🔁 Test Case: Navigates to ResetPassword screen when user clicks link
   */
  it("navigates to ResetPassword screen", () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);
    fireEvent.press(getByText("Forgot Password?"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith("ResetPassword");
  });
  /**
     * ✅ Test Case: Successful login with valid credentials
     * Mocks Firebase signIn and expects navigation to Home on success.
     */
  it("logs in and navigates to Home on valid credentials", async () => {
    const { signInWithEmailAndPassword } = require("firebase/auth");
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: "123" } });

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );
    // Fill in valid email and password
    fireEvent.changeText(getByPlaceholderText("Enter your email"), "user@example.com");
    fireEvent.changeText(getByPlaceholderText("Enter your password"), "password123");

    await waitFor(() => fireEvent.press(getByText("Sign In")));
    // Check that login API was called with correct arguments
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "user@example.com",
      "password123"
    );
    // Expect navigation to home screen after login
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Home");
  });
  /**
   * ❌ Test Case: Shows alert when Firebase sign-in fails
   * Simulates an error and checks that alert displays the correct message.
   */
  it("shows alert on failed login", async () => {
    const { signInWithEmailAndPassword } = require("firebase/auth");
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error("Invalid credentials"));

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );
    // Provide invalid login credentials
    fireEvent.changeText(getByPlaceholderText("Enter your email"), "bad@example.com");
    fireEvent.changeText(getByPlaceholderText("Enter your password"), "wrongpass");
    // Attempt login
    await waitFor(() => fireEvent.press(getByText("Sign In")));
    // Expect error alert to be shown
    expect(Alert.alert).toHaveBeenCalledWith(
      "Login failed",
      "Invalid email or password. Please try again."
    );
  });
});
