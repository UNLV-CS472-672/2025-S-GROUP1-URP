import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ReservationStatusScreen from '../ReservationStatusScreen';
import { deleteDoc, doc, getDocs } from 'firebase/firestore';

jest.mock('../../firebaseConfig', () => ({
  db: {},
  auth: { currentUser: { uid: 'testUser' } },
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
}));

jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  const confirmButton = buttons.find(button => button.text === 'Yes');
  if (confirmButton && confirmButton.onPress) {
    confirmButton.onPress();
  }
});

describe('ReservationStatusScreen', () => {
  it('renders correctly with no reservation', async () => {
    getDocs.mockResolvedValue({ empty: true, docs: [] });
    
    const { getByText } = render(<ReservationStatusScreen navigation={{ goBack: jest.fn() }} />);
    
    await waitFor(() => {
      expect(getByText('No current reservation at this time.')).toBeTruthy();
    });
  });

  it('renders correctly with an active reservation', async () => {
    const mockReservation = {
      id: '123',
      spotId: 'A1',
      startTime: { toDate: () => new Date(Date.now() - 30 * 60 * 1000) }, // Started 30 mins ago
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
  });

  it('handles reservation cancellation', async () => {
    const mockReservation = { id: '123', spotId: 'A1', startTime: { toDate: () => new Date() } };
    getDocs.mockResolvedValue({ empty: false, docs: [{ id: '123', data: () => mockReservation }] });
    deleteDoc.mockResolvedValue();

    const { getByText } = render(<ReservationStatusScreen navigation={{ goBack: jest.fn() }} />);

    await waitFor(() => expect(getByText('Cancel Reservation')).toBeTruthy());

    fireEvent.press(getByText('Cancel Reservation'));

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalledTimes(1);
      expect(deleteDoc).toHaveBeenCalledWith(doc({}, "Reservations", "123"));
    });
  });
});
