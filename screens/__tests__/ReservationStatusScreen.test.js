import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ReservationStatusScreen from '../ReservationStatusScreen';
import { deleteDoc, doc, getDocs } from 'firebase/firestore';

// Mocking Firebase authentication and database to prevent actual API calls
jest.mock('../../firebaseConfig', () => ({
  db: {},
  auth: { currentUser: { uid: 'testUser' } }, // Simulating a logged-in user
}));

// Mocking Firebase Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(), // Mocked function to return test data
  deleteDoc: jest.fn(),
  doc: jest.fn(),
}));

// Mocking Alert behavior to simulate user confirmation
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  const confirmButton = buttons.find(button => button.text === 'Yes');
  if (confirmButton && confirmButton.onPress) {
    confirmButton.onPress();
  }
});

describe('ReservationStatusScreen', () => {
  it('renders correctly with no reservation', async () => {
    getDocs.mockResolvedValue({ empty: true, docs: [] }); // Simulating no reservations
    
    const { getByText } = render(<ReservationStatusScreen navigation={{ goBack: jest.fn() }} />);
    
    await waitFor(() => {
      expect(getByText('No current reservation at this time.')).toBeTruthy(); // Verifying empty state message
    });
  }, 10000); // 10 seconds timeout

  it('renders correctly with an active reservation', async () => {
    const mockReservation = {
      id: '123',
      spotId: 'A1',
      startTime: { toDate: () => new Date(Date.now() - 30 * 60 * 1000) }, // Reservation started 30 minutes ago
    };
    
    getDocs.mockResolvedValue({
      empty: false,
      docs: [{ id: '123', data: () => mockReservation }],
    });

    const { getByText } = render(<ReservationStatusScreen navigation={{ goBack: jest.fn() }} />);
    
    await waitFor(() => {
      expect(getByText('Parking Garage:')).toBeTruthy();
      expect(getByText('Parking Spot Number:')).toBeTruthy();
      expect(getByText('Reservation Timer:')).toBeTruthy();
    });
  }, 10000); // 10 seconds timeout

  it('handles reservation cancellation', async () => {
    const mockReservation = { id: '123', spotId: 'A1', startTime: { toDate: () => new Date() } };
    getDocs.mockResolvedValue({ empty: false, docs: [{ id: '123', data: () => mockReservation }] });
    deleteDoc.mockResolvedValue(); // Simulating successful document deletion

    const { getByText } = render(<ReservationStatusScreen navigation={{ goBack: jest.fn() }} />);

    await waitFor(() => expect(getByText('Cancel Reservation')).toBeTruthy());

    fireEvent.press(getByText('Cancel Reservation')); // Simulating user cancel action

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalledTimes(1); // Ensuring deleteDoc was called once
      expect(deleteDoc).toHaveBeenCalledWith(doc({}, "Reservations", "123")); // Verifying correct deletion
    });
  }, 10000); // 10 seconds timeout
});
