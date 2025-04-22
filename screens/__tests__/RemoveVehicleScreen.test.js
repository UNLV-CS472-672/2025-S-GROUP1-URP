import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import RemoveVehicleScreen from "../RemoveVehicleScreen";

// Mock Firebase auth and Firestore
jest.mock("firebase/firestore", () => {
    return {
        doc: jest.fn(),
        setDoc: jest.fn(() => Promise.resolve()),
    };
});

jest.mock("../../firebaseConfig", () => ({
    auth: { currentUser: { email: "test@example.com", uid: "12345" } },
    db: {},
}));

jest.mock("firebase/storage", () => ({
    getStorage: jest.fn(() => ({
      app: {
        options: {
          storageBucket: "mock-bucket",
        },
      },
    })),
    ref: jest.fn(),
    deleteObject: jest.fn(() => Promise.resolve()),
  }));

describe("<RemoveVehicleScreen />", () => {
    const mockNavigation = { navigate: jest.fn() };
    const mockRoute = {
        params: {
            vehicles: [
                { make: "Toyota", model: "Camry", year: "2022", licensePlate: "XYZ123" },
                { make: "Honda", model: "Civic", year: "2021", licensePlate: "ABC789" },
            ],
        },
    };

    test("Displays list of vehicles", async () => {
        const { findByText } = render(
            <RemoveVehicleScreen route={mockRoute} navigation={mockNavigation} />
        );

        await findByText("Make: Toyota");
        await findByText("Make: Honda");
    }, 10000);

    test("Selects a vehicle and confirms removal", async () => {
        const { getAllByText, getByText } = render(
            <RemoveVehicleScreen route={mockRoute} navigation={mockNavigation} />
        );

        const selectButtons = getAllByText("Select");
        fireEvent.press(selectButtons[0]);

        const confirmButton = getByText("Confirm");
        fireEvent.press(confirmButton);

        await waitFor(() => expect(mockNavigation.navigate).toHaveBeenCalledWith("My Account"));
    }, 10000);

    test("Cancels vehicle removal", async () => {
        const { getAllByText, getByText } = render(
            <RemoveVehicleScreen route={mockRoute} navigation={mockNavigation} />
        );

        const selectButtons = getAllByText("Select");
        fireEvent.press(selectButtons[0]);

        const cancelButton = getByText("Cancel");
        fireEvent.press(cancelButton);

        expect(getAllByText("Select").length).toBeGreaterThan(0); // Ensure selection remains possible
    }, 10000);
});