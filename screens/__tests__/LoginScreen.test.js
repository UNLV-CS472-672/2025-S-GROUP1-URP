// LoginScreen.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';  // Update with correct path if necessary
import { auth } from '../../__mocks__/firebase';  // Correct path to your mock file
import { getAuth } from 'firebase/auth'; // Import if needed for test assertions

// Mocking the navigation prop
const mockNavigation = { navigate: jest.fn() };

// Mock Firebase authentication functions
jest.mock('firebase/auth', () => require('../../__mocks__/firebase')); // Adjust path to mock file
jest.mock('firebase/firestore', () => require('../../__mocks__/firebase')); // If needed

describe('LoginScreen', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('handles login with correct credentials', async () => {
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    // Find the email and password fields
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    
    // Fill in the form with mock credentials
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    // Simulate pressing the login button
    fireEvent.press(getByText('Sign In'));

    // Wait for the login action to be completed
    await waitFor(() => {
      expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
    });
  });

  it('shows error on failed login', async () => {
    // Mock the failed login scenario
    auth.signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Invalid credentials'));

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    
    // Fill in the form with mock credentials
    fireEvent.changeText(emailInput, 'wrong@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');

    // Simulate pressing the login button
    fireEvent.press(getByText('Sign In'));

    // Wait for the error to be shown
    await waitFor(() => {
      expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        'wrong@example.com',
        'wrongpassword'
      );
    });
  });
});
