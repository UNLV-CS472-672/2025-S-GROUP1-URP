/**
 * File: ParkingScreen.test.js
 * Purpose: Unit test for the ParkingScreen component.
 * Ensures that the screen renders the expected title and integrates the ParkingMap component with correct props.
 * Dependencies: React Native Testing Library, React Navigation, mocked ParkingMap component.
 * Usage: Run using Jest to confirm the ParkingScreen renders correctly and communicates with ParkingMap as intended.
 */
import React from "react";
import { render } from "@testing-library/react-native";
import ParkingScreen from "../ParkingScreen";

// ------------------ MOCK COMPONENTS ------------------

// 🔧 Mock the ParkingMap component to avoid rendering the actual map
jest.mock("../../src/components/ParkingMap/ParkingMap", () => {
  return jest.fn(() => <></>);
});
// Import mocked ParkingMap so we can verify prop usage
import ParkingMap from "../../src/components/ParkingMap/ParkingMap";
// ------------------ TEST CASE ------------------
describe("<ParkingScreen />", () => {
  const mockNavigation = { navigate: jest.fn() };
  /**
   * ✅ Test Case: Renders ParkingScreen with title and ParkingMap
   * Verifies static UI content and checks ParkingMap is rendered with correct props.
   */
  it("renders the title and ParkingMap component", () => {
    const { getByText } = render(<ParkingScreen navigation={mockNavigation} />);
    // Verify that ParkingMap was called with correct props
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
