/**
 * initParkingData.js
 * ------------------
 * This script initializes Firestore collections for parking spot data.
 * It sets up each spot with default properties like location number, status,
 * access type (student, staff, accessible), and availability metadata.
 *
 * Collections Initialized:
 * - parkingSpotsCottage: 11 spots
 * - parkingSpotsGateway: 10 spots
 * (Tropicana is commented out but can be enabled as needed.)
 *
 * Spot Data Fields:
 * - location: Number (1-based spot number)
 * - status: 'available' (default)
 * - heldBy: '' (no user initially)
 * - holdExpiresAt: null
 * - type: 'student', 'staff', or 'accessible' (based on index logic)
 *
 * Usage:
 * Call `initializeParkingCollections()` to populate Firestore with parking spot documents.
 */

import { doc, setDoc, getFirestore } from 'firebase/firestore'

const db = getFirestore()

const initializeParkingCollections = async () => {
  const collections = {
    // parkingSpotsTrop: 20,
    parkingSpotsCottage: 11,
    parkingSpotsGateway: 10
  }

  try {
    for (const [collectionName, spotCount] of Object.entries(collections)) {
      for (let i = 1; i <= spotCount; i++) {
        const spotRef = doc(db, collectionName, `spot${i}`)
        await setDoc(spotRef, {
          location: i,
          status: 'available',
          heldBy: '',
          holdExpiresAt: null,
          type: i % 5 === 0 ? 'accessible' : i % 2 === 0 ? 'staff' : 'student'
        })
      }
    }

    console.log('✅ Parking collections initialized successfully.')
    return true
  } catch (error) {
    console.error('❌ Error initializing parking collections:', error)
    return false
  }
}

export default initializeParkingCollections
