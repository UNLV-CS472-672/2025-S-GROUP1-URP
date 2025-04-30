import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import ReservationStatusScreen from "../ReservationStatusScreen";
import { deleteDoc, doc, getDocs } from "firebase/firestore";

// Mock Firebase config
jest.mock("../../firebaseConfig", () => ({
  db: {},
  auth: { currentUser: { uid: "testUser" } },
}));

// Mock Firestore functions
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

jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
  const yes = buttons.find(b => b.text === "Yes");
  if (yes?.onPress) yes.onPress();
});

describe("ReservationStatusScreen", () => {
  it("renders with no reservation", async () => {
    getDocs.mockResolvedValue({ empty: true, docs: [] });

    const { getByText } = render(<ReservationStatusScreen navigation={{ goBack: jest.fn() }} />);
    await waitFor(() => {
      expect(getByText("No current reservation at this time.")).toBeTruthy();
    });
  });

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
    await waitFor(() => fireEvent.press(getByText("Cancel Reservation")));

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});
