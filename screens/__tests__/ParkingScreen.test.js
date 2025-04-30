import React from "react";
import { render } from "@testing-library/react-native";
import ParkingScreen from "../ParkingScreen";

// Mock ParkingMap correctly
jest.mock("../../src/components/ParkingMap/ParkingMap", () => {
  return jest.fn(() => <></>);
});

import ParkingMap from "../../src/components/ParkingMap/ParkingMap";

describe("<ParkingScreen />", () => {
  const mockNavigation = { navigate: jest.fn() };

  it("renders the title and ParkingMap component", () => {
    const { getByText } = render(<ParkingScreen navigation={mockNavigation} />);

    expect(getByText("Parking Garage Map")).toBeTruthy();
    expect(ParkingMap).toHaveBeenCalledWith(
      expect.objectContaining({
        parkingLot: "Parking Garage",
        navigation: mockNavigation,
      }),
      {}
    );
  });
});
