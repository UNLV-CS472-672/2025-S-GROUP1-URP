/**
 * File: ResetPasswordScreen.test.js
 * Purpose: Unit tests for the ResetPasswordScreen component.
 * Tests email input rendering, success/failure of password reset logic,
 * alert feedback, and navigation behavior.
 * Dependencies: React Native Testing Library, Firebase Auth, React Native Alert.
 * Usage: Run using Jest to validate the password reset flow behaves correctly.
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ResetPasswordScreen from "../ResetPasswordScreen";
import { sendPasswordResetEmail } from "firebase/auth";
import { Alert } from "react-native";

// ------------------ MOCKS ------------------

// 🔧 Mock firebaseConfig with a test user
jest.mock("../../firebaseConfig", () => ({
  auth: { currentUser: { email: "test@example.com", uid: "12345" } },
}));

// 🔧 Mock Firebase's sendPasswordResetEmail method
jest.mock("firebase/auth", () => ({
  sendPasswordResetEmail: jest.fn(),
}));

// ✅ Spy on Alert.alert to intercept popups during test
jest.spyOn(Alert, "alert").mockImplementation(() => { });

describe("<ResetPasswordScreen />", () => {
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });
  /**
   * ✅ Test Case: Renders form UI components
   * Checks for presence of email input, send button, and back button.
   */
  it("renders input and buttons correctly", () => {
    const { getByPlaceholderText, getByText } = render(
      <ResetPasswordScreen navigation={mockNavigation} />
    );

    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByText("Send Reset Email")).toBeTruthy();
    expect(getByText("Back")).toBeTruthy();
  });
  /**
   * ✅ Test Case: Sends password reset email and shows success alert
   * Verifies email is sent and user is navigated back on success.
   */
  it("shows alert and navigates back on successful reset", async () => {
    sendPasswordResetEmail.mockResolvedValueOnce();

    const { getByPlaceholderText, getByText } = render(
      <ResetPasswordScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText("Email"), "user@example.com");
    fireEvent.press(getByText("Send Reset Email"));

    await waitFor(() => {
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        "user@example.com"
      );
      expect(Alert.alert).toHaveBeenCalledWith("Password reset email sent!");
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });
  /**
   * ❌ Test Case: Shows error alert if reset fails
   * Simulates a rejected promise and confirms error feedback.
   */
  it("shows error alert if reset fails", async () => {
    sendPasswordResetEmail.mockRejectedValueOnce(new Error("Reset failed"));

    const { getByPlaceholderText, getByText } = render(
      <ResetPasswordScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText("Email"), "fail@example.com");
    fireEvent.press(getByText("Send Reset Email"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Reset failed");
    });
  });
  /**
   * 🔁 Test Case: Navigates back to Login screen
   * Ensures navigation occurs when "Back" is pressed.
   */
  it("navigates to Login when Back is pressed", () => {
    const { getByText } = render(
      <ResetPasswordScreen navigation={mockNavigation} />
    );

    fireEvent.press(getByText("Back"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Login");
  });
});
