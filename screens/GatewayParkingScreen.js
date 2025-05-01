/**
 * GatewayParkingScreen
 * ---------------------
 * This screen displays a gesture-enabled interactive parking map for the Gateway Parking lot.
 * 
 * Features:
 * - Pinch-to-zoom and pan functionality using gestures
 * - Real-time parking spot updates from Firestore
 * - Ability to filter by spot type (student, staff, accessible)
 * - Manual and random parking spot reservation with 30-minute holds
 * - Spot status indicators (available, held, occupied, selected)
 * 
 * Users can:
 * - Visually select an available spot on the map
 * - View the map with animated scale/position changes
 * - Reserve a spot or assign one randomly
 * 
 * The layout is rendered dynamically based on predefined spot coordinates and Firestore data.
 */

import React, { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Dimensions, ImageBackground
} from 'react-native'
import {
  getFirestore, doc, updateDoc, setDoc, Timestamp,
  collection, onSnapshot, query, where, getDocs
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { useNavigation } from '@react-navigation/native'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated'
import gatewayMap from '../assets/gatewayPark.png' // your uploaded blueprint
import { getDoc } from "firebase/firestore";

const db = getFirestore()
const auth = getAuth()
const screenWidth = Dimensions.get('window').width
const baseWidth = 300
const ScreenScale = screenWidth / baseWidth

// Original image dimensions
const imageOriginalWidth = 996
const imageOriginalHeight = 1890
const aspectRatio = 7701 / 4250
const imageHeight = screenWidth * aspectRatio
const ImageScaleX = screenWidth / 4250
const ImageScaleY = imageHeight / 7701

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

const ParkingMap = ({ parkingLot = 'Gateway Parking' }) => {
  const navigation = useNavigation()
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [parkingSpaces, setParkingSpaces] = useState([])
  const [filter, setFilter] = useState('student')

  const scale = useSharedValue(1)
  const startScale = useSharedValue(1)
  const translationX = useSharedValue(0)
  const translationY = useSharedValue(0)
  const prevTranslationX = useSharedValue(0)
  const prevTranslationY = useSharedValue(0)

  const pinch = Gesture.Pinch().onStart(() => {
    startScale.value = scale.value
  }).onUpdate((e) => {
    scale.value = clamp(startScale.value * e.scale, 1, 5)
  }).runOnJS(true)

  const pan = Gesture.Pan().onStart(() => {
    prevTranslationX.value = translationX.value
    prevTranslationY.value = translationY.value
  }).onUpdate((e) => {
    const maxPanX = screenWidth * (scale.value - 1) / 2
    const maxPanY = imageHeight * (scale.value - 1) / 2
    translationX.value = clamp(prevTranslationX.value + e.translationX, -maxPanX, maxPanX)
    translationY.value = clamp(prevTranslationY.value + e.translationY, -maxPanY, maxPanY)
  }).runOnJS(true)

  const composedGesture = Gesture.Simultaneous(pinch, pan)
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translationX.value },
      { translateY: translationY.value }
    ]
  }))

  const statusColors = {
    available: 'green',
    held: 'yellow',
    occupied: 'red'
  }

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'parkingSpotsGateway'), async (snapshot) => {
      const now = Timestamp.now()
      const spots = []

      for (const docSnap of snapshot.docs) {
        const spot = { id: docSnap.id, ...docSnap.data() }
        if (spot.status === 'held' && spot.holdExpiresAt?.toMillis() < now.toMillis()) {
          await updateDoc(doc(db, 'parkingSpotsGateway', spot.id), {
            status: 'available', heldBy: '', holdExpiresAt: null
          })
          spot.status = 'available'
        }
        spots.push(spot)
      }

      setParkingSpaces(spots.sort((a, b) => a.location - b.location))
    })

    return () => unsubscribe()
  }, [])

  const userHasVehicles = async () => {
    const user = auth.currentUser;
    if (!user) return false;

    const vehicleDocRef = doc(db, "vehicles", user.uid);
    const vehicleSnap = await getDoc(vehicleDocRef);
    if (vehicleSnap.exists()) {
      const data = vehicleSnap.data();
      return data.vehicles && data.vehicles.length > 0;
    }
    return false;
  };

  const handleReserve = async () => {
    const hasVehicles = await userHasVehicles();
    if (!hasVehicles) {
      Alert.alert(
        "No Vehicle Found",
        "Please add a vehicle before reserving a parking spot.",
        [
          {
            text: "Add Vehicle",
            onPress: () => navigation.navigate("AddVehicle"),
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }

    if (!selectedSpot) return Alert.alert('No spot selected', 'Please select one.')
    try {
      const user = auth.currentUser
      if (!user) return Alert.alert('Not signed in', 'Please log in.')

      const existing = await getDocs(query(
        collection(db, 'Reservations'),
        where('userID', '==', user.uid),
        where('status', '==', 'held')
      ))
      if (!existing.empty) return Alert.alert('You already have an active reservation.')

      const now = Timestamp.now()
      const holdExpires = Timestamp.fromDate(new Date(Date.now() + 30 * 60000))
      await updateDoc(doc(db, 'parkingSpotsGateway', selectedSpot), {
        status: 'held',
        heldBy: user.uid,
        holdExpiresAt: holdExpires
      })

      const reservationId = `${user.uid}_${selectedSpot}_${Date.now()}`
      await setDoc(doc(db, 'Reservations', reservationId), {
        userID: user.uid,
        spotId: selectedSpot,
        garage: parkingLot,
        status: 'held',
        startTime: now,
        endTime: holdExpires,
        createdAt: now
      })

      Alert.alert('Reserved!', `Spot ${selectedSpot} held for 30 minutes.`)
      setSelectedSpot(null)
    } catch (err) {
      console.error(err)
      Alert.alert('Error', 'Could not reserve spot.')
    }
  }

  const handleReserveRandomSpot = async () => {
    try {
      const available = parkingSpaces.filter(s => s.status === 'available' && s.type === filter)
      if (available.length === 0) return Alert.alert('No spots available.')

      const randomSpot = available[Math.floor(Math.random() * available.length)]
      const user = auth.currentUser
      if (!user) return Alert.alert('Not signed in', 'Please log in.')

      const existing = await getDocs(query(
        collection(db, 'Reservations'),
        where('userID', '==', user.uid),
        where('status', '==', 'held')
      ))
      if (!existing.empty) return Alert.alert('Already reserved.', 'Cancel it first.')

      const now = Timestamp.now()
      const holdExpires = Timestamp.fromDate(new Date(Date.now() + 30 * 60000))

      await updateDoc(doc(db, 'parkingSpotsGateway', randomSpot.id), {
        status: 'held',
        heldBy: user.uid,
        holdExpiresAt: holdExpires
      })

      const reservationId = `${user.uid}_${randomSpot.id}_${Date.now()}`
      await setDoc(doc(db, 'Reservations', reservationId), {
        userID: user.uid,
        spotId: randomSpot.id,
        status: 'held',
        startTime: now,
        endTime: holdExpires,
        createdAt: now
      })

      Alert.alert('Reserved!', `Spot ${randomSpot.location} held.`)
    } catch (err) {
      console.error(err)
      Alert.alert('Error', 'Could not reserve spot.')
    }
  }

  // Layout coordinates – fill this with the actual spot positions later
  const layoutMap = {
    spot1: { top: 190, left: 228, rotate: '0deg' },
    spot2: { top: 400, left: 228, rotate: '0deg' },
    spot3: { top: 610, left: 228, rotate: '0deg' },
    spot4: { top: 820, left: 228, rotate: '0deg' },
    spot5: { top: 1030, left: 228, rotate: '0deg' },
    spot6: { top: 1240, left: 228, rotate: '0deg' },
    spot7: { top: 1450, left: 228, rotate: '0deg' },
    spot8: { top: 1660, left: 228, rotate: '0deg' },
    spot9: { top: 1870, left: 228, rotate: '0deg' },
    spot10: { top: 2080, left: 228, rotate: '0deg' },
    spot10: { top: 2080, left: 228, rotate: '0deg' },
    spot11: { top: 2290, left: 228, rotate: '0deg' },
    spot12: { top: 2500, left: 228, rotate: '0deg' },
    spot13: { top: 2710, left: 228, rotate: '0deg' },
    spot14: { top: 2920, left: 228, rotate: '0deg' },
    spot15: { top: 3130, left: 228, rotate: '0deg' },
    spot16: { top: 3340, left: 228, rotate: '0deg' },
    spot17: { top: 3550, left: 228, rotate: '0deg' },
    spot18: { top: 3760, left: 228, rotate: '0deg' },
    spot19: { top: 3970, left: 228, rotate: '0deg' },
    spot20: { top: 4180, left: 228, rotate: '0deg' },
    spot21: { top: 4390, left: 228, rotate: '0deg' },
    spot22: { top: 4600, left: 228, rotate: '0deg' },
    spot23: { top: 4810, left: 228, rotate: '0deg' },
    spot24: { top: 5020, left: 228, rotate: '0deg' },
    spot25: { top: 5230, left: 228, rotate: '0deg' },
    spot26: { top: 5440, left: 228, rotate: '0deg' },
    spot27: { top: 5650, left: 228, rotate: '0deg' },
    spot28: { top: 5860, left: 228, rotate: '0deg' },
    spot29: { top: 6070, left: 228, rotate: '0deg' },
    spot30: { top: 6280, left: 228, rotate: '0deg' },
    spot31: { top: 6490, left: 228, rotate: '0deg' },
    spot32: { top: 6700, left: 228, rotate: '0deg' },
    spot33: { top: 6910, left: 228, rotate: '0deg' },
    spot34: { top: 7120, left: 228, rotate: '0deg' },

    //right side
  
    spot35: { top: 190, left: 3600, rotate: '0deg' },
    spot36: { top: 400, left: 3600, rotate: '0deg' },
    spot37: { top: 610, left: 3600, rotate: '0deg' },
    spot38: { top: 820, left: 3600, rotate: '0deg' },
    spot39: { top: 1030, left: 3600, rotate: '0deg' },
    spot40: { top: 1240, left: 3600, rotate: '0deg' },
    spot41: { top: 1450, left: 3600, rotate: '0deg' },
    spot42: { top: 1660, left: 3600, rotate: '0deg' },
    spot43: { top: 1870, left: 3600, rotate: '0deg' },
    spot44: { top: 2080, left: 3600, rotate: '0deg' },
    spot45: { top: 2080, left: 3600, rotate: '0deg' },
    spot46: { top: 2290, left: 3600, rotate: '0deg' },
    spot47: { top: 2500, left: 3600, rotate: '0deg' },
    spot48: { top: 2710, left: 3600, rotate: '0deg' },
    spot49: { top: 2920, left: 3600, rotate: '0deg' },
    spot50: { top: 3130, left: 3600, rotate: '0deg' },
    spot51: { top: 3340, left: 3600, rotate: '0deg' },
    spot52: { top: 3550, left: 3600, rotate: '0deg' },
    spot53: { top: 3760, left: 3600, rotate: '0deg' },
    spot54: { top: 3970, left: 3600, rotate: '0deg' },
    spot55: { top: 4180, left: 3600, rotate: '0deg' },
    spot56: { top: 4390, left: 3600, rotate: '0deg' },
    spot57: { top: 4600, left: 3600, rotate: '0deg' },
    spot58: { top: 4810, left: 3600, rotate: '0deg' },
    spot59: { top: 5020, left: 3600, rotate: '0deg' },
    spot60: { top: 5230, left: 3600, rotate: '0deg' },
    spot61: { top: 5440, left: 3600, rotate: '0deg' },
    spot62: { top: 5650, left: 3600, rotate: '0deg' },
    spot63: { top: 5860, left: 3600, rotate: '0deg' },
    spot64: { top: 6070, left: 3600, rotate: '0deg' },
    spot65: { top: 6280, left: 3600, rotate: '0deg' },
    spot66: { top: 6490, left: 3600, rotate: '0deg' },
    spot67: { top: 6700, left: 3600, rotate: '0deg' },
    spot68: { top: 6910, left: 3600, rotate: '0deg' },
    spot69: { top: 7120, left: 3600, rotate: '0deg' },

    //middle 

    spot70: { top: 1130, left: 2320, rotate: '0deg' },
    spot71: { top: 1340, left: 2320, rotate: '0deg' },
    spot72: { top: 1550, left: 2320, rotate: '0deg' },
    spot73: { top: 1760, left: 2320, rotate: '0deg' },
    spot74: { top: 1970, left: 2320, rotate: '0deg' },
    spot75: { top: 2180, left: 2320, rotate: '0deg' },
    spot76: { top: 2390, left: 2320, rotate: '0deg' },
    spot77: { top: 2600, left: 2320, rotate: '0deg' },
    spot78: { top: 2810, left: 2320, rotate: '0deg' },
    spot79: { top: 3020, left: 2320, rotate: '0deg' },
    spot80: { top: 3230, left: 2320, rotate: '0deg' },
    spot81: { top: 3440, left: 2320, rotate: '0deg' },
    spot82: { top: 3650, left: 2320, rotate: '0deg' },
    spot83: { top: 3860, left: 2320, rotate: '0deg' },
    spot84: { top: 4070, left: 2320, rotate: '0deg' },
    spot85: { top: 4280, left: 2320, rotate: '0deg' },
    spot86: { top: 4490, left: 2320, rotate: '0deg' },
    spot87: { top: 4700, left: 2320, rotate: '0deg' },
    spot88: { top: 4910, left: 2320, rotate: '0deg' },
    spot89: { top: 5120, left: 2320, rotate: '0deg' },
    spot90: { top: 5330, left: 2320, rotate: '0deg' },
    spot91: { top: 5540, left: 2320, rotate: '0deg' },
    spot92: { top: 5750, left: 2320, rotate: '0deg' },
    spot93: { top: 5960, left: 2320, rotate: '0deg' },
    spot94: { top: 6170, left: 2320, rotate: '0deg' },
    spot95: { top: 6380, left: 2320, rotate: '0deg' },
  }

  const filteredSpaces = parkingSpaces.filter(s => s.type === filter)

  return (
    <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerText}>{parkingLot}</Text>
    </View>

    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backWrapper}>
      <Text style={styles.backText}>← Back</Text>
    </TouchableOpacity>


      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.filterContainer}>
          {['student', 'staff', 'accessible'].map(type => (
            <TouchableOpacity key={type} style={styles.filterOption} onPress={() => setFilter(type)}>
              <Text style={styles.checkbox}>{filter === type ? '☑' : '☐'}</Text>
              <Text style={styles.filterLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.legendContainer}>
          {['green', 'yellow'].map((color, i) => (
            <View style={styles.legendItem} key={i}>
              <View style={[styles.legendBox, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{['Open', 'Reserved'][i]}</Text>
            </View>
          ))}
        </View>
        <View style={styles.legendContainer}>
          {['red', 'blue'].map((color, i) => (
            <View style={styles.legendItem} key={i + 2}>
              <View style={[styles.legendBox, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{['Occupied', 'Selected'][i]}</Text>
            </View>
          ))}
        </View>

        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.mapWrapper, animatedStyles]}>
            <ImageBackground source={gatewayMap} style={styles.mapImage}>
              {filteredSpaces.map(space => {
                const coords = layoutMap[space.id]
                if (!coords) return null

                const isSelected = selectedSpot === space.id
                const color = isSelected ? 'blue' : statusColors[space.status] || 'gray'

                return (
                  <TouchableOpacity
                    key={space.id}
                    onPress={() => space.status === 'available' && setSelectedSpot(space.id)}
                    style={[
                      styles.spotButton,
                      {
                        top: coords.top * ImageScaleY,
                        left: coords.left * ImageScaleX,
                        transform: [{ rotate: coords.rotate }],
                        backgroundColor: color
                      }
                    ]}
                  >
                    <Text style={styles.spotText}>{space.location}</Text>
                  </TouchableOpacity>
                )
              })}
            </ImageBackground>
          </Animated.View>
        </GestureDetector>

        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Steps:</Text>
          <Text style={styles.stepsText}>1. Click a green spot</Text>
          <Text style={styles.stepsText}>2. Tap Reserve</Text>
          <Text style={styles.stepsText}>3. Arrive in 30 mins</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.reserveButton} onPress={handleReserve}>
            <Text style={styles.reserveText}>Reserve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reserveButton, { backgroundColor: '#2196F3', marginLeft: 10 }]}
            onPress={handleReserveRandomSpot}
          >
            <Text style={styles.reserveText}>Random Spot</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingTop: 50 },
  scrollContent: { alignItems: 'center' },
  mapWrapper: {
    width: screenWidth,
    height: imageHeight,
    position: 'relative',
    marginBottom: 20
  },
  mapImage: { width: '100%', height: '100%', resizeMode: 'contain', position: 'relative' },
  spotButton: {
    position: 'absolute',
    width: 30 * ScreenScale,
    height: 15 * ScreenScale,
    justifyContent: 'center',
    alignItems: 'center'
  },
  spotText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 5 * ScreenScale
  },
  stepsContainer: { alignItems: 'center', padding: 5 },
  stepsTitle: { fontSize: 18, fontWeight: 'bold' },
  stepsText: { fontSize: 16 },
  reserveButton: {
    backgroundColor: 'red',
    padding: 12,
    marginTop: 10,
    borderRadius: 5,
    alignSelf: 'center',
    width: 140,
    alignItems: 'center'
  },
  reserveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  buttonRow: { flexDirection: 'row', marginBottom: 60 },
  filterContainer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginVertical: 10 },
  filterOption: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  checkbox: { fontSize: 20, marginRight: 5 },
  filterLabel: { fontSize: 16 },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 2,
    width: '50%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    flex: 1,
    justifyContent: 'center',
  },
  legendBox: { width: 20, height: 20, marginRight: 5 },
  legendText: { fontSize: 16, fontWeight: 'bold' },
  header: {
    width: '100%',
    height: 80,
    backgroundColor: '#CC0000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerText: {
    fontSize: 27,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'black',
    textShadowOffset: { width: 3, height: 1 },
    textShadowRadius: 5
  },
  backWrapper: {
    alignSelf: 'flex-start',
    marginTop: 10,
    marginLeft: 15,
    marginBottom: 5,
  },
  backText: {
    fontSize: 16,
    color: '#CC0000',
  },
  
})

export default ParkingMap
