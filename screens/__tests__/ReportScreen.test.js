/**
 * File: ReportScreen.test.js
 * Purpose: Unit tests for the ReportScreen component.
 * Validates form input behavior, alert triggers, successful submission, and navigation logic.
 * Dependencies: React Native Testing Library, Firebase Firestore, Storage, Auth, and Alert.
 * Usage: Run with Jest to ensure the reporting feature handles both validation and successful submissions correctly.
 */
import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'
import ReportScreen from '../ReportScreen'

// ✅ Mock Alert.alert
import { Alert } from 'react-native'

// ------------------ MOCKS ------------------

// ✅ Mock Firebase Authentication (current user ID)
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: '12345' }
  }))
}))

// ✅ Mock Firestore functions for report submission
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve()),
  serverTimestamp: jest.fn(() => 'mockedTimestamp')
}))

// ✅ Mock Firebase Storage for image uploads
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({
    app: {
      options: {
        storageBucket: 'mock-bucket'
      }
    }
  })),
  ref: jest.fn(),
  uploadBytes: jest.fn(() => Promise.resolve()),
  getDownloadURL: jest.fn(() => Promise.resolve('https://fake.url/image.png'))
}))

// ✅ Mock Firebase config with dummy user
jest.mock('../../firebaseConfig', () => ({
  auth: { currentUser: { uid: '12345' } },
  db: {}
}))
// ✅ Spy on Alert to intercept modal pop-ups during test
jest.spyOn(Alert, 'alert').mockImplementation(() => { })


// ------------------ TEST CASES ------------------
describe('<ReportScreen />', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn()  // Mocking the goBack function
  }
  /**
   * ❌ Test Case: Displays validation alert if form is incomplete
   * Simulates clicking submit with empty fields to trigger error alert.
   */
  it('displays validation alert when required fields are missing', async () => {
    const { getByText } = render(<ReportScreen navigation={mockNavigation} />)
    const submitButton = getByText('Submit Report')

    fireEvent.press(submitButton)

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Missing Info', 'Please fill out all required fields.')
    })
  })
  /**
   * ✅ Test Case: Submits a report when all fields are filled
   * Fills each required input, simulates submission, and verifies success alert.
   */
  it('submits the report when all required fields are filled', async () => {
    const { getByPlaceholderText, getByText } = render(<ReportScreen navigation={mockNavigation} />)

    fireEvent.changeText(getByPlaceholderText('ABC123'), 'ABC123')
    fireEvent.changeText(getByPlaceholderText('Red, Blue, etc'), 'Blue')
    fireEvent.changeText(getByPlaceholderText('e.g. Toyota Camry'), 'Honda Civic')
    fireEvent.changeText(getByPlaceholderText('Additional comments'), 'Parked illegally.')

    const submitButton = getByText('Submit Report')
    await act(async () => {
      fireEvent.press(submitButton)
    })

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Report submitted.')
    })
  })
  /**
   * 🔁 Test Case: Navigates back when Back button is pressed
   * Verifies that navigation.goBack is triggered.
   */
  it('navigates back when Back button is pressed', () => {
    const { getByText } = render(<ReportScreen navigation={mockNavigation} />)
    const backButton = getByText('← Back')

    fireEvent.press(backButton)

    expect(mockNavigation.goBack).toHaveBeenCalled()
  })
})
