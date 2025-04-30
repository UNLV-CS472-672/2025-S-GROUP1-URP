import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../LoginScreen";
import { Alert } from "react-native";

// 🔧 Mock Firebase Authentication
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

// 🔧 Mock firebaseConfig.js
jest.mock("../../firebaseConfig", () => ({
  auth: { currentUser: null },
}));

// 🔧 Spy on Alert
jest.spyOn(Alert, "alert").mockImplementation(() => {});

describe("<LoginScreen />", () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login inputs and buttons correctly", () => {
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    expect(getByPlaceholderText("Enter your email")).toBeTruthy();
    expect(getByPlaceholderText("Enter your password")).toBeTruthy();
    expect(getByText("Sign In")).toBeTruthy();
    expect(getByText("Don’t have an account?")).toBeTruthy();
    expect(getByText("Forgot Password?")).toBeTruthy();
  });

  it("navigates to SignUp screen", () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);
    fireEvent.press(getByText("Don’t have an account?"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith("SignUp");
  });

  it("navigates to ResetPassword screen", () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);
    fireEvent.press(getByText("Forgot Password?"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith("ResetPassword");
  });

  it("logs in and navigates to Home on valid credentials", async () => {
    const { signInWithEmailAndPassword } = require("firebase/auth");
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: "123" } });

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText("Enter your email"), "user@example.com");
    fireEvent.changeText(getByPlaceholderText("Enter your password"), "password123");

    await waitFor(() => fireEvent.press(getByText("Sign In")));

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "user@example.com",
      "password123"
    );
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Home");
  });

  it("shows alert on failed login", async () => {
    const { signInWithEmailAndPassword } = require("firebase/auth");
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error("Invalid credentials"));

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText("Enter your email"), "bad@example.com");
    fireEvent.changeText(getByPlaceholderText("Enter your password"), "wrongpass");

    await waitFor(() => fireEvent.press(getByText("Sign In")));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Login failed",
      "Invalid email or password. Please try again."
    );
  });
});
