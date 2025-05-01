/**
 * File: ReservationConfirmationScreen.test.js
 * Purpose: Unit tests for the ReservationConfirmationScreen component.
 * Verifies that the confirmation message renders and that navigation to Home occurs when the button is pressed.
 * Dependencies: React Native Testing Library, React Navigation.
 * Usage: Run using Jest to confirm that reservation confirmation flow behaves as expected.
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ReservationConfirmationScreen from "../ReservationConfirmationScreen";

// ------------------ MOCKS ------------------

// 🔧 Mock navigation function from useNavigation hook
const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));
// ------------------ TEST CASES ------------------

describe("<ReservationConfirmationScreen />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  /**
   * ✅ Test Case: Renders static confirmation text
   * Confirms that the screen displays a title and an instructional message.
   */
  it("renders confirmation title and message", () => {
    const { getByText } = render(<ReservationConfirmationScreen />);
    // Verify static content is present
    expect(getByText("Reservation Confirmed")).toBeTruthy();
    expect(
      getByText("You have 1 hour to park in your reserved spot before it is lost.")
    ).toBeTruthy();
  });
  /**
   * 🔁 Test Case: Navigates back to Home screen
   * Simulates button press and verifies navigation function is called.
   */
  it("navigates to Home when button is pressed", () => {
    const { getByText } = render(<ReservationConfirmationScreen />);
    fireEvent.press(getByText("Back to Home"));
    expect(mockNavigate).toHaveBeenCalledWith("Home");
  });
});
