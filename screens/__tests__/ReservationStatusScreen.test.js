/**
 * File: ReservationStatusScreen.test.js
 * Purpose: Unit tests for the ReservationStatusScreen component.
 * Ensures that reservation data is correctly fetched and displayed, and that
 * users can cancel active reservations through a confirmation dialog.
 * Dependencies: React Native Testing Library, Firebase Firestore, React Native Alert.
 * Usage: Run with Jest to validate reservation viewing and cancellation features.
 */
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import ReservationStatusScreen from "../ReservationStatusScreen";
import { deleteDoc, doc, getDocs } from "firebase/firestore";

// ------------------ MOCKS ------------------

// 🔧 Mock Firebase config with a dummy user
jest.mock("../../firebaseConfig", () => ({
  db: {},
  auth: { currentUser: { uid: "testUser" } },
}));

// 🔧 Mock Firestore functions
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({ id: "A1" }),
  })),
}));
// ✅ Intercept Alert dialog and simulate user pressing "Yes"
jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
  const yes = buttons.find(b => b.text === "Yes");
  if (yes?.onPress) yes.onPress();
});
// ------------------ TEST CASES ------------------

describe("ReservationStatusScreen", () => {
  /**
   * 🟡 Test Case: No active reservations
   * Simulates Firestore returning no reservations and expects UI to reflect that.
   */
  it("renders with no reservation", async () => {
    getDocs.mockResolvedValue({ empty: true, docs: [] });

    const { getByText } = render(<ReservationStatusScreen navigation={{ goBack: jest.fn() }} />);
    await waitFor(() => {
      expect(getByText("No current reservation at this time.")).toBeTruthy();
    });
  });
  /**
     * ✅ Test Case: Active reservation exists
     * Mocks Firestore with an active reservation and checks that UI displays reservation data.
     */
  it("renders with active reservation", async () => {
    getDocs.mockResolvedValue({
      empty: false,
      docs: [{
        id: "123",
        data: () => ({
          spotId: "A1",
          startTime: { toDate: () => new Date(Date.now() - 5 * 60000) },
          endTime: { toDate: () => new Date(Date.now() + 25 * 60000) },
        }),
      }],
    });

    const { getByText } = render(<ReservationStatusScreen navigation={{ goBack: jest.fn() }} />);
    await waitFor(() => {
      expect(getByText("Parking Garage:")).toBeTruthy();
      expect(getByText("Reservation Timer:")).toBeTruthy();
    });
  });
  /**
   * 🔁 Test Case: Cancels a reservation after confirmation
   * Simulates user pressing "Cancel Reservation" and verifies Firestore deletion call.
   */
  it("handles cancel reservation", async () => {
    getDocs.mockResolvedValue({
      empty: false,
      docs: [{
        id: "123",
        data: () => ({
          spotId: "A1",
          startTime: { toDate: () => new Date() },
          endTime: { toDate: () => new Date(Date.now() + 1800000) },
        }),
      }],
    });

    const { getByText } = render(<ReservationStatusScreen navigation={{ goBack: jest.fn() }} />);
    // Simulate button press that triggers alert
    await waitFor(() => fireEvent.press(getByText("Cancel Reservation")));
    // Confirm Firestore deleteDoc was called
    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});
