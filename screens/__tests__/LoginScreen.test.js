// LoginScreen.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';  // Update with correct path if necessary


describe("LoginScreen", () => {
	test("renders the component", () => {
		render(<LoginScreen />);

		expect(screen.getByText("UNLV")).toBeInTheDocument();
		expect(
			screen.getByAltText(
				"UNLV"
			)
		).toBeInTheDocument();
	});
});