/**
 * File: AddVehicleScreen.test.js
 * Purpose: Unit tests for the AddVehicleScreen component to verify correct rendering,
 *          data handling, Firestore integration, and navigation behavior.
 * Dependencies: React Native Testing Library, Firebase Firestore, Firebase Auth,
 *               Expo Image Picker, Expo File System, Firebase Storage.
 * Usage: Run using Jest to validate AddVehicleScreen functionality in isolation.
 */
import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'
import AddVehicleScreen from '../AddVehicleScreen'
import { setDoc, getDoc, doc } from 'firebase/firestore'

// ------------------ MOCKS ------------------

// Mock Firebase config and authentication
jest.mock('../../firebaseConfig', () => ({
  db: {},
  auth: {
    currentUser: { uid: 'testUser' } // Simulates an authenticated user
  }
}))

// Mock Firestore functions used in the component
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(), // Mock document reference
  setDoc: jest.fn(() => Promise.resolve()), // Ensuring setDoc is properly mocked
  getDoc: jest.fn(() =>
    Promise.resolve({
      exists: () => false, // Simulates new user with no vehicles
      data: () => ({ vehicles: [] }) // Mock vehicle data response
    })
  )
}))

// Mock Expo Image Picker functionality
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: true })),
  launchCameraAsync: jest.fn(() => Promise.resolve({ canceled: true })),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  MediaTypeOptions: { Images: "Images" },
}));

// Mock Expo File System functionality
jest.mock("expo-file-system", () => ({
  getInfoAsync: jest.fn(() => Promise.resolve({ size: 1024 })),
  uploadAsync: jest.fn(() => Promise.resolve({ status: 200 })),
  FileSystemUploadType: { BINARY_CONTENT: "binary" },
}));

// Mock Firebase Storage for image uploads
jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(() => ({
    app: {
      options: {
        storageBucket: "mock-bucket",
      },
    },
  })),
}));

// ------------------ TEST CASES ------------------
describe("AddVehicleScreen", () => {
  /**
   * Test Case: Renders expected input fields and a Save button.
   * Verifies the presence of form elements needed to input vehicle details.
   */
  it("renders input fields and save button", () => {
    const { getByPlaceholderText, getByText } = render(
      <AddVehicleScreen navigation={{ navigate: jest.fn() }} />
    )
    // Check all input fields and Save button exist
    expect(getByPlaceholderText('Make')).toBeTruthy()
    expect(getByPlaceholderText('Model')).toBeTruthy()
    expect(getByPlaceholderText('Year')).toBeTruthy()
    expect(getByPlaceholderText('License Plate')).toBeTruthy()
    expect(getByText('Save')).toBeTruthy()
  })
  /**
     * Test Case: Successfully saves vehicle data.
     * Simulates user input and checks Firestore interaction and navigation.
     */
  it('saves vehicle data on button press', async () => {
    const mockNavigate = jest.fn()
    const { getByPlaceholderText, getByText } = render(
      <AddVehicleScreen navigation={{ navigate: mockNavigate }} />
    )

    // Fill out vehicle form fields
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Make'), 'Toyota')
      fireEvent.changeText(getByPlaceholderText('Model'), 'Camry')
      fireEvent.changeText(getByPlaceholderText('Year'), '2022')
      fireEvent.changeText(getByPlaceholderText('License Plate'), 'ABC123')
    })

    // Press Save and trigger form submission
    await act(async () => {
      fireEvent.press(getByText('Save'))
    })

    // Confirm setDoc was called to store vehicle info in Firestore
    await waitFor(() => expect(setDoc).toHaveBeenCalledTimes(1))

    // Confirm navigation occurs to My Account screen after saving
    expect(mockNavigate).toHaveBeenCalledWith('My Account')
  })
})
