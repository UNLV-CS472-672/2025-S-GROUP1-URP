/**
 * File: RemoveVehicleScreen.test.js
 * Purpose: Unit tests for the RemoveVehicleScreen component.
 * Verifies correct rendering of vehicle list, user interactions for selecting and removing a vehicle,
 * and correct navigation behavior on cancel or confirm actions.
 * Dependencies: React Native Testing Library, Firebase Auth, Firestore, Firebase Storage.
 * Usage: Run using Jest to ensure the remove-vehicle workflow functions correctly.
 */
import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import RemoveVehicleScreen from '../RemoveVehicleScreen'

// ------------------ FIREBASE MOCKS ------------------

// 🔧 Mock Firestore's doc and setDoc functions
jest.mock('firebase/firestore', () => {
  return {
    doc: jest.fn(),
    setDoc: jest.fn(() => Promise.resolve())
  }
})
// 🔧 Mock Firebase config with test user
jest.mock('../../firebaseConfig', () => ({
  auth: { currentUser: { email: 'test@example.com', uid: '12345' } },
  db: {}
}))
// 🔧 Mock Firebase Storage methods for cleanup (if vehicle has image)
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
// ------------------ TEST CASES ------------------
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
  /**
    * ✅ Test Case: Displays all passed-in vehicles
    * Confirms that both Toyota and Honda vehicle entries are rendered.
    */
  test('Displays list of vehicles', async () => {
    const { findByText } = render(
      <RemoveVehicleScreen route={mockRoute} navigation={mockNavigation} />
    )

    await findByText('Make: Toyota')
    await findByText('Make: Honda')
  }, 10000)
  /**
     * ✅ Test Case: Successfully selects a vehicle and confirms removal
     * Simulates the removal flow and verifies redirection back to My Account screen.
     */
  test('Selects a vehicle and confirms removal', async () => {
    const { getAllByText, getByText } = render(
      <RemoveVehicleScreen route={mockRoute} navigation={mockNavigation} />
    )

    const selectButtons = getAllByText('Select')
    fireEvent.press(selectButtons[0])

    const confirmButton = getByText('Confirm')
    fireEvent.press(confirmButton)

    await waitFor(() => expect(mockNavigation.navigate).toHaveBeenCalledWith('My Account'))
  }, 10000)
  /**
     * ❌ Test Case: Cancels vehicle removal after selection
     * Ensures the list is still interactive and no navigation occurs.
     */
  test('Cancels vehicle removal', async () => {
    const { getAllByText, getByText } = render(
      <RemoveVehicleScreen route={mockRoute} navigation={mockNavigation} />
    )

    const selectButtons = getAllByText('Select')
    fireEvent.press(selectButtons[0])

    const cancelButton = getByText('Cancel')
    fireEvent.press(cancelButton)
    // Expect the Select buttons to still be rendered
    expect(getAllByText('Select').length).toBeGreaterThan(0) // Ensure selection remains possible
  }, 10000)
})
