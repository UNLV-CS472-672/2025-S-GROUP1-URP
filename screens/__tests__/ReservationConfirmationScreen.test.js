import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ReservationConfirmationScreen from "../ReservationConfirmationScreen";

// 🔧 Mock useNavigation from react-navigation
const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe("<ReservationConfirmationScreen />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders confirmation title and message", () => {
    const { getByText } = render(<ReservationConfirmationScreen />);

    expect(getByText("Reservation Confirmed")).toBeTruthy();
    expect(
      getByText("You have 1 hour to park in your reserved spot before it is lost.")
    ).toBeTruthy();
  });

  it("navigates to Home when button is pressed", () => {
    const { getByText } = render(<ReservationConfirmationScreen />);
    fireEvent.press(getByText("Back to Home"));
    expect(mockNavigate).toHaveBeenCalledWith("Home");
  });
});
