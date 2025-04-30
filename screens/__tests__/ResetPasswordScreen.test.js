import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ResetPasswordScreen from "../ResetPasswordScreen";
import { sendPasswordResetEmail } from "firebase/auth";
import { Alert } from "react-native";

// firebaseConfig and navigation
jest.mock("../../firebaseConfig", () => ({
  auth: { currentUser: { email: "test@example.com", uid: "12345" } },
}));

// sendPasswordResetEmail from Firebase
jest.mock("firebase/auth", () => ({
  sendPasswordResetEmail: jest.fn(),
}));

// Alert
jest.spyOn(Alert, "alert").mockImplementation(() => {});

describe("<ResetPasswordScreen />", () => {
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders input and buttons correctly", () => {
    const { getByPlaceholderText, getByText } = render(
      <ResetPasswordScreen navigation={mockNavigation} />
    );

    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByText("Send Reset Email")).toBeTruthy();
    expect(getByText("Back")).toBeTruthy();
  });

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

  it("navigates to Login when Back is pressed", () => {
    const { getByText } = render(
      <ResetPasswordScreen navigation={mockNavigation} />
    );

    fireEvent.press(getByText("Back"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Login");
  });
});
