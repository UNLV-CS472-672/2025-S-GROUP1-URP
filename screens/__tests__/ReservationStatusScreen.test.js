import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ReservationStatusScreen from "../ReservationStatusScreen";

describe('<ReservationStatusScreen />', () => {
  test('Displays Reservation Status', () => {
    const { getByText } = render(<ReservationStatusScreen />);
    getByText('Reservation Status');
  });

  test('Navigates back when back button is pressed', () => {
    const mockNavigation = { goBack: jest.fn() };
    const { getByTestId } = render(<ReservationStatusScreen navigation={mockNavigation} />);
    
    fireEvent.press(getByTestId('backButton'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  test('Displays Parking Garage label', () => {
    const { getByText } = render(<ReservationStatusScreen />);
    getByText('Parking Garage:');
  });

  test('Displays Parking Spot Number label', () => {
    const { getByText } = render(<ReservationStatusScreen />);
    getByText('Parking Spot Number:');
  });

  test('Triggers alert when Cancel Reservation is pressed', () => {
    global.alert = jest.fn();
    const { getByText } = render(<ReservationStatusScreen />);

    fireEvent.press(getByText('Cancel Reservation'));
    expect(global.alert).toHaveBeenCalledWith('Reservation Canceled');
  });
});
