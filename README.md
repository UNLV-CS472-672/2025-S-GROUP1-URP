# 2025-S-GROUP1-URP
## Overview

This project is a parking reservation app designed for students. The app allows students to reserve a parking spot in one of three parking garages: Tropicana, Cottage Grove, or Gateway. 

## Features

- **User Authentication**: Secure login and registration using Firebase Authentication.
- **Parking Reservation**: Reserve a parking spot in any of the three available parking garages.
- **Reservation Timer**: Students have 20 minutes to reach the reserved spot, or the reservation will be canceled.
- **Vehicle Management**: Add, view, and remove vehicles associated with the user's account.
- **Report Violations**: Report parking violations directly through the app.
- **Camera-Based Availability Detection**: Detect and update parking spot status in real-time using a webcam and machine learning model.

## Usage

1. **Sign Up/Login**: Create an account or log in using your credentials.
2. **Reserve a Spot**: Choose a parking garage and reserve a spot.
3. **Timer**: A 20-minute timer starts once the reservation is made. Ensure you reach the spot within this time.
4. **Manage Vehicles**: Add or remove vehicles from your account.
5. **Report**: Report any parking violations you encounter.
6. **Camera System**: Launch the detection script to start monitoring spot occupancy in real-time.

## Technologies Used

- **React Native**: For building the mobile application.
- **Firebase**: For authentication, database, and analytics.
- **Expo**: For development and build tools.
- **OpenCV**: For real-time object detection and polygon-based spatial analysis.
- **SSD MobileNet V3**: For detecting cars and trucks in the video feed.
- **Python**: For implementing the camera detection logic and Firebase sync.

## Camera-Based Parking Spot Detection

This feature monitors parking spot availability in real time using a webcam
and updates spot status in Firestore accordingly.

## How It Works

- **parking_detection.py**: Uses OpenCV with a pre-trained SSD MobileNet model to detect cars and trucks in the camera feed.
- **draw_polygons.py**: A utility to interactively define parking spots in the camera frame using mouse clicks.
- **parking_spots.json**: Stores the polygon coordinates for each spot.
- The system checks if a vehicle’s center lies inside any defined polygon and applies history smoothing to reduce false positives.
- Detected status is synced with Firestore and visually shown on the live video feed.

## Running the System

**Install dependencies:**

`pip install firebase-admin`

**To start detection:**

`python camera/parking_detection.py`

**To label parking spots:**

`python camera/draw_polygons.py`


## Unit Testing

The app includes unit tests for core components using Jest and React Native Testing Library. These tests verify UI behavior and component logic.

**Tested Screens**

- AddVehicleScreen
- RemoveVehicleScreen
- MyAccountScreen
- ReportScreen
- ReservationStatusScreen

**To run tests:**

`npm install`
`npm test`

## Static Assets
The app uses images for each parking garage on the dashboard. Assets are stored in the assets/ folder and include:

- CottageGrove-ParkingGarage.jpg
- Tropicana-ParkingGarage.jpg
- Gateway-ParkingGarage.jpg