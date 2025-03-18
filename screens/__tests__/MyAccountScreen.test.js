// Unit tests for MyAccountScreen component
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import MyAccountScreen from '../MyAccountScreen';
import { auth } from '../firebaseConfig';
import { getDoc } from 'firebase/firestore';

// Mock dependencies
jest.mock('../firebaseConfig', () => ({
    db: {},
    auth: {
        currentUser: { uid: 'test-user', email: 'testuser@example.com' },
    },
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
}));

// Test Suite
describe('MyAccountScreen', () => {
    const mockNavigation = { navigate: jest.fn() };

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test for rendering user info and vehicles
    test('renders user info and vehicles if data exists', async () => {
        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({
                vehicles: [
                    { make: 'Toyota', model: 'Corolla', year: 2020, licensePlate: 'ABC123' },
                ],
            }),
        });

        render(<MyAccountScreen navigation={mockNavigation} />);

        await waitFor(() => {
            expect(screen.getByText(/User Information:/)).toBeTruthy();
            expect(screen.getByText(/Email: testuser@example.com/)).toBeTruthy();
            expect(screen.getByText(/Make: Toyota/)).toBeTruthy();
        });
    });

    // Test for navigation to AddVehicle screen when no vehicles are found
    test('navigates to AddVehicle screen if no vehicles are found', async () => {
        getDoc.mockResolvedValue({ exists: () => true, data: () => ({ vehicles: [] }) });

        render(<MyAccountScreen navigation={mockNavigation} />);

        await waitFor(() => {
            expect(mockNavigation.navigate).toHaveBeenCalledWith('AddVehicle');
        });
    });

    // Test for navigation to AddVehicle screen when no document is found
    test('navigates to AddVehicle screen if no document is found', async () => {
        getDoc.mockResolvedValue({ exists: () => false });

        render(<MyAccountScreen navigation={mockNavigation} />);

        await waitFor(() => {
            expect(mockNavigation.navigate).toHaveBeenCalledWith('AddVehicle');
        });
    });
});
