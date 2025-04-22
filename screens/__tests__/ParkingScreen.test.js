import React from "react";
import { render } from "@testing-library/react-native";
import ParkingScreen from "../ParkingScreen";

// Mock ParkingMap component to isolate the test
jest.mock("../../src/components/ParkingMap/ParkingMap", () => {
    return jest.fn(() => {
      return <></>;
    });
});
  
import ParkingMap from "../../src/components/ParkingMap/ParkingMap";

describe("<ParkingScreen />", () => {
  const mockNavigation = { navigate: jest.fn() };

  it("renders the title and ParkingMap component", () => {
    const { getByText } = render(<ParkingScreen navigation={mockNavigation} />);

    // Confirm title is rendered
    expect(getByText("Parking Garage Map")).toBeTruthy();

    // Confirm ParkingMap component is called with correct props
    expect(ParkingMap).toHaveBeenCalledWith(
      expect.objectContaining({
        parkingLot: "Parking Garage",
        navigation: mockNavigation,
      }),
      {}
    );
  });
});
