import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'
import ReportScreen from '../ReportScreen'

// ✅ Mock Alert.alert
import { Alert } from 'react-native'

// ✅ Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: '12345' }
  }))
}))

// ✅ Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve()),
  serverTimestamp: jest.fn(() => 'mockedTimestamp')
}))

// ✅ Mock Firebase Storage
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

// ✅ Mock firebaseConfig.js
jest.mock('../../firebaseConfig', () => ({
  auth: { currentUser: { uid: '12345' } },
  db: {}
}))
jest.spyOn(Alert, 'alert').mockImplementation(() => {})

describe('<ReportScreen />', () => {
  const mockNavigation = { navigate: jest.fn() }

  it('displays validation alert when required fields are missing', async () => {
    const { getByText } = render(<ReportScreen navigation={mockNavigation} />)
    const submitButton = getByText('Submit Report')

    fireEvent.press(submitButton)

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Missing Info', 'Please fill out all required fields.')
    })
  })

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

  it('navigates to Home when Back button is pressed', () => {
    const { getByText } = render(<ReportScreen navigation={mockNavigation} />)
    const backButton = getByText('Back')

    fireEvent.press(backButton)

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Home')
  })
})
