import React from "react";
import { render } from "@testing-library/react-native";
import ReservationStatusScreen, {CustomText} from "../ReservationStatusScreen";

describe('<ReservationStatusScreen />', () => {
  test('Displays Reservation Status', () => {
    const { getByText } = render(<ReservationStatusScreen />);

    getByText('Reservation Status');
  });
});