import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../LoginScreen"; // Adjust the import path according to your file structure

// Mock Firebase authentication
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

describe("LoginScreen", () => {
  it("should render correctly", () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    expect(getByText("UNLV")).toBeTruthy();
    expect(getByText("Reserved Parking")).toBeTruthy();
    expect(getByText("Sign In")).toBeTruthy();
  });

  it("should update email state when typing in the email input", () => {
    const { getByPlaceholderText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText("Email Address");
    fireEvent.changeText(emailInput, "test@example.com");

    expect(emailInput.props.value).toBe("test@example.com");
  });

  it("should update password state when typing in the password input", () => {
    const { getByPlaceholderText } = render(<LoginScreen />);

    const passwordInput = getByPlaceholderText("Password");
    fireEvent.changeText(passwordInput, "password123");

    expect(passwordInput.props.value).toBe("password123");
  });

  it("should toggle password visibility when SHOW is pressed", () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    const passwordInput = getByPlaceholderText("Password");
    const showPasswordButton = getByText("SHOW");

    fireEvent.press(showPasswordButton);
    expect(passwordInput.props.secureTextEntry).toBe(false);

    fireEvent.press(showPasswordButton);
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it("should navigate to the Home screen when login is successful", async () => {
    // Mock navigation prop
    const mockNavigate = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen navigation={{ navigate: mockNavigate }} />
    );

    // Mock successful login response
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { email: "test@example.com" } });

    fireEvent.changeText(getByPlaceholderText("Email Address"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");

    fireEvent.press(getByText("Sign In"));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("Home"));
  });

  it("should show an error message if login fails", async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    // Mock failed login response
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error("Login failed"));

    fireEvent.changeText(getByPlaceholderText("Email Address"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");

    fireEvent.press(getByText("Sign In"));

    await waitFor(() => expect(getByText("Login failed")).toBeTruthy());
  });

  it("should navigate to the SignUp screen when 'Don’t have an account?' is pressed", () => {
    const mockNavigate = jest.fn();
    const { getByText } = render(
      <LoginScreen navigation={{ navigate: mockNavigate }} />
    );

    fireEvent.press(getByText("Don’t have an account?"));
    expect(mockNavigate).toHaveBeenCalledWith("SignUp");
  });

  it("should navigate to the ResetPassword screen when 'Forgot Password?' is pressed", () => {
    const mockNavigate = jest.fn();
    const { getByText } = render(
      <LoginScreen navigation={{ navigate: mockNavigate }} />
    );

    fireEvent.press(getByText("Forgot Password?"));
    expect(mockNavigate).toHaveBeenCalledWith("ResetPassword");
  });
});
