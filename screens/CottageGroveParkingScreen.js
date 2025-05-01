import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  ImageBackground
} from 'react-native'
import {
  getFirestore,
  doc,
  updateDoc,
  setDoc,
  Timestamp,
  collection,
  onSnapshot,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { useNavigation } from '@react-navigation/native'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'

// Replace this with your layout image
import cottageMap from '../assets/cottage_map.png'

const db = getFirestore()
const auth = getAuth()
const screenWidth = Dimensions.get('window').width
const baseWidth = 300 // width of design reference image
const Screenscale = screenWidth / baseWidth

const { width, height } = Dimensions.get('screen')

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

const ParkingMap = ({ parkingLot = 'Tropicana Parking' }) => {
  const navigation = useNavigation()
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [parkingSpaces, setParkingSpaces] = useState([])
  const [filter, setFilter] = useState('student')

  const scale = useSharedValue(1)
  const startScale = useSharedValue(0)

  const translationX = useSharedValue(0)
  const translationY = useSharedValue(0)
  const prevTranslationX = useSharedValue(0)
  const prevTranslationY = useSharedValue(0)

  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value
    })
    .onUpdate((event) => {
      scale.value = clamp(
        startScale.value * event.scale,
        1, 5
      )
    })
    .runOnJS(true)

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translationX.value },
      { translateY: translationY.value }
    ]
  }))

  const pan = Gesture.Pan()
    .minDistance(1)
    .onStart(() => {
      prevTranslationX.value = translationX.value
      prevTranslationY.value = translationY.value
    })
    .onUpdate((event) => {
      const scaledWidth = screenWidth * scale.value
      const scaledHeight = screenWidth * scale.value

      const maxTranslateX = Math.max((scaledWidth - screenWidth) / 2, 0)
      const maxTranslateY = Math.max((scaledHeight - screenWidth) / 2, 0)

      translationX.value = clamp(
        prevTranslationX.value + event.translationX/scale.value,
        -maxTranslateX/scale.value,
        maxTranslateX/scale.value
      )
      translationY.value = clamp(
        prevTranslationY.value + event.translationY/scale.value,
        -maxTranslateY/scale.value,
        maxTranslateY/scale.value
      )
    })
    .runOnJS(true)

  const composedGesture = Gesture.Simultaneous(pinch, pan)

  const statusColors = {
    available: 'green',
    held: 'yellow',
    occupied: 'red'
  }

  const collectionMap = {
    'Tropicana Parking': 'parkingSpotsTrop',
    'Cottage Grove Parking': 'parkingSpotsCottage',
    'Gateway Parking': 'parkingSpotsGateway'
  }

  const collectionName = collectionMap[parkingLot] || 'parkingSpotsTrop'

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      async (snapshot) => {
        const now = Timestamp.now()
        const spots = []

        for (const docSnap of snapshot.docs) {
          const spot = { id: docSnap.id, ...docSnap.data() }

          if (
            spot.status === 'held' &&
            spot.holdExpiresAt &&
            spot.holdExpiresAt.toMillis() < now.toMillis()
          ) {
            await updateDoc(doc(db, collectionName, spot.id), {
              status: 'available',
              heldBy: '',
              holdExpiresAt: null
            })

            spot.status = 'available'
          }

          spots.push(spot)
        }

        setParkingSpaces(spots.sort((a, b) => a.location - b.location))
      }
    )

    return () => unsubscribe()
  }, [collectionName])

  const handleReserve = async () => {
    if (selectedSpot === null) {
      Alert.alert('No Spot Selected', 'Please select an available spot first.');
      return;
    }
  
    const spot = parkingSpaces.find((s) => s.id === selectedSpot);
    if (!spot) {
      Alert.alert('Invalid Spot', 'Selected spot does not exist.');
      return;
    }
  
    Alert.alert(
      'Confirm Reservation',
      `Do you want to reserve spot ${spot.location}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (!user) {
                Alert.alert('Not Signed In', 'Please log in to reserve a spot.');
                return;
              }
  
              const reservationQuery = query(
                collection(db, 'Reservations'),
                where('userID', '==', user.uid),
                where('status', '==', 'held')
              );
              const reservationSnapshot = await getDocs(reservationQuery);
  
              if (!reservationSnapshot.empty) {
                Alert.alert(
                  'Active Reservation Found',
                  'You already have an active reservation. Please cancel it before reserving a new spot.'
                );
                return;
              }
  
              const spotDocRef = doc(db, collectionName, selectedSpot);
              const reservationId = `${user.uid}_${selectedSpot}_${Date.now()}`;
              const now = Timestamp.now();
              const holdExpires = Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000));
  
              await updateDoc(spotDocRef, {
                status: 'held',
                heldBy: user.uid,
                holdExpiresAt: holdExpires
              });
  
              await setDoc(doc(db, 'Reservations', reservationId), {
                userID: user.uid,
                spotId: selectedSpot,
                status: 'held',
                startTime: now,
                endTime: holdExpires,
                createdAt: now
              });
  
              Alert.alert('Success', `Spot ${spot.location} reserved for 30 minutes.`);
              setSelectedSpot(null);
            } catch (error) {
              console.error('Error reserving spot:', error);
              Alert.alert('Error', 'Failed to reserve spot. Please try again.');
            }
          }
        }
      ]
    );
  };
  

  const handleReserveRandomSpot = async () => {
    try {
      // Step 1: Filter available spots
      const availableSpots = parkingSpaces.filter(
        (space) => space.status === "available" && space.type === filter
      );
  
      if (availableSpots.length === 0) {
        Alert.alert(
          "No Available Spots",
          "There are no available spots to reserve."
        );
        return;
      }
  
      // Step 2: Select a random spot
      const randomSpot =
        availableSpots[Math.floor(Math.random() * availableSpots.length)];
  
      // Step 3: Ask for user confirmation
      Alert.alert(
        "Confirm Random Reservation",
        `Do you want to reserve spot ${randomSpot.location}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Confirm",
            onPress: async () => {
              const user = auth.currentUser;
              if (!user) {
                Alert.alert("Not Signed In", "Please log in to reserve a spot.");
                return;
              }
  
              const reservationQuery = query(
                collection(db, "Reservations"),
                where("userID", "==", user.uid),
                where("status", "==", "held")
              );
              const reservationSnapshot = await getDocs(reservationQuery);
  
              if (!reservationSnapshot.empty) {
                Alert.alert(
                  "Active Reservation Found",
                  "You already have an active reservation. You must cancel it before reserving a new spot."
                );
                return;
              }
  
              const spotDocRef = doc(db, collectionName, randomSpot.id);
              const reservationId = `${user.uid}_${randomSpot.id}_${Date.now()}`;
              const now = Timestamp.now();
              const holdExpires = Timestamp.fromDate(
                new Date(Date.now() + 30 * 60 * 1000)
              );
  
              await updateDoc(spotDocRef, {
                status: "held",
                heldBy: user.uid,
                holdExpiresAt: holdExpires,
              });
  
              await setDoc(doc(db, "Reservations", reservationId), {
                userID: user.uid,
                spotId: randomSpot.id,
                status: "held",
                startTime: now,
                endTime: holdExpires,
                createdAt: now,
              });
  
              Alert.alert(
                "Success",
                `Spot ${randomSpot.location} reserved for 30 minutes.`
              );
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error reserving random spot:", error);
      Alert.alert(
        "Error",
        "Failed to reserve a random spot. Please try again."
      );
    }
  };
  

  // Adjust this map to your actual layout
  const layoutMap = {
    spot1: { top: 180, left: 75.3, rotate: '0deg' },
    spot2: { top: 175, left: 75.3, rotate: '0deg' },
    spot3: { top: 170, left: 75.3, rotate: '0deg' },
    spot4: { top: 165, left: 75.3, rotate: '0deg' },
    spot5: { top: 160, left: 75.3, rotate: '0deg' },
    spot6: { top: 155, left: 75.3, rotate: '0deg' },
    spot7: { top: 150, left: 75.3, rotate: '0deg' },
    spot8: { top: 145, left: 75.3, rotate: '0deg' },
    spot9: { top: 140, left: 75.3, rotate: '0deg' },
    spot10: { top: 135, left: 75.3, rotate: '0deg' },
    spot11: { top: 130, left: 75.3, rotate: '0deg' },
    spot12: { top: 125, left: 75.3, rotate: '0deg' },
    spot13: { top: 120, left: 75.3, rotate: '0deg' },
    spot14: { top: 120, left: 101.6, rotate: '0deg' },
    spot15: { top: 125, left: 101.6, rotate: '0deg' },
    spot16: { top: 130, left: 101.6, rotate: '0deg' },
    spot17: { top: 135, left: 101.6, rotate: '0deg' },
    spot18: { top: 140, left: 101.6, rotate: '0deg' },
    spot19: { top: 145, left: 101.6, rotate: '0deg' },
    spot20: { top: 150, left: 101.6, rotate: '0deg' },
    spot21: { top: 155, left: 101.6, rotate: '0deg' },
    spot22: { top: 160, left: 101.6, rotate: '0deg' },
    spot23: { top: 165, left: 101.6, rotate: '0deg' },
    spot24: { top: 170, left: 101.6, rotate: '0deg' },
    spot25: { top: 175, left: 101.6, rotate: '0deg' },
    spot26: { top: 180, left: 101.6, rotate: '0deg' },
    spot27: { top: 185, left: 101.6, rotate: '0deg' },
    spot28: { top: 190, left: 101.6, rotate: '0deg' },
    spot29: { top: 195, left: 101.6, rotate: '0deg' },
    spot30: { top: 200, left: 101.6, rotate: '0deg' },
    spot31: { top: 205, left: 101.6, rotate: '0deg' },
    spot32: { top: 100, left: 101.6, rotate: '0deg' },
    spot33: { top: 95, left: 101.6, rotate: '0deg' },
    spot34: { top: 90, left: 101.6, rotate: '0deg' },
    spot35: { top: 85, left: 101.6, rotate: '0deg' },
    spot36: { top: 80, left: 101.6, rotate: '0deg' },
    spot37: { top: 75, left: 101.6, rotate: '0deg' },
    spot38: { top: 70, left: 101.6, rotate: '0deg' },
    spot39: { top: 65, left: 101.6, rotate: '0deg' },
    spot40: { top: 60, left: 101.6, rotate: '0deg' },
    spot41: { top: 60, left: 75.3, rotate: '0deg' },
    spot42: { top: 65, left: 75.3, rotate: '0deg' },
    spot43: { top: 70, left: 75.3, rotate: '0deg' },
    spot44: { top: 75, left: 75.3, rotate: '0deg' },
    spot45: { top: 80, left: 75.3, rotate: '0deg' },
    spot46: { top: 85, left: 75.3, rotate: '0deg' },
    spot47: { top: 90, left: 75.3, rotate: '0deg' },
    spot48: { top: 95, left: 75.3, rotate: '0deg' },
    spot49: { top: 100, left: 75.3, rotate: '0deg' },
    spot50: { top: 60, left: 113, rotate: '0deg' },
    spot51: { top: 65, left: 113, rotate: '0deg' },
    spot52: { top: 70, left: 113, rotate: '0deg' },
    spot53: { top: 75, left: 113, rotate: '0deg' },
    spot54: { top: 80, left: 113, rotate: '0deg' },
    spot55: { top: 85, left: 113, rotate: '0deg' },
    spot56: { top: 90, left: 113, rotate: '0deg' },
    spot57: { top: 95, left: 113, rotate: '0deg' },
    spot58: { top: 100, left: 113, rotate: '0deg' },
    spot59: { top: 105, left: 113, rotate: '0deg' },
    spot60: { top: 110, left: 113, rotate: '0deg' },
    spot61: { top: 105, left: 113, rotate: '0deg' },
    spot62: { top: 110, left: 113, rotate: '0deg' },
    spot63: { top: 115, left: 113, rotate: '0deg' },
    spot64: { top: 120, left: 113, rotate: '0deg' },
    spot65: { top: 125, left: 113, rotate: '0deg' },
    spot66: { top: 130, left: 113, rotate: '0deg' },
    spot67: { top: 135, left: 113, rotate: '0deg' },
    spot68: { top: 140, left: 113, rotate: '0deg' },
    spot69: { top: 145, left: 113, rotate: '0deg' },
    spot70: { top: 150, left: 113, rotate: '0deg' },
    spot71: { top: 155, left: 113, rotate: '0deg' },
    spot72: { top: 160, left: 113, rotate: '0deg' },
    spot73: { top: 165, left: 113, rotate: '0deg' },
    spot74: { top: 170, left: 113, rotate: '0deg' },
    spot75: { top: 175, left: 113, rotate: '0deg' },
    spot76: { top: 180, left: 113, rotate: '0deg' },
    spot77: { top: 185, left: 113, rotate: '0deg' },
    spot78: { top: 190, left: 113, rotate: '0deg' },
    spot79: { top: 195, left: 113, rotate: '0deg' },
    spot80: { top: 200, left: 113, rotate: '0deg' },
    spot81: { top: 205, left: 113, rotate: '0deg' },
    spot82: { top: 210, left: 113, rotate: '0deg' },
    spot83: { top: 215, left: 113, rotate: '0deg' },
    spot84: { top: 220, left: 113, rotate: '0deg' },
    spot85: { top: 245, left: 132.7, rotate: '0deg' },
    spot86: { top: 240, left: 132.7, rotate: '0deg' },
    spot87: { top: 235, left: 132.7, rotate: '0deg' },
    spot88: { top: 230, left: 132.7, rotate: '0deg' },
    spot89: { top: 225, left: 132.7, rotate: '0deg' },
    spot90: { top: 220, left: 132.7, rotate: '0deg' },
    spot91: { top: 215, left: 132.7, rotate: '0deg' },
    spot92: { top: 210, left: 132.7, rotate: '0deg' },
    spot93: { top: 205, left: 132.7, rotate: '0deg' },
    spot94: { top: 200, left: 132.7, rotate: '0deg' },
    spot95: { top: 195, left: 132.7, rotate: '0deg' },
    spot96: { top: 190, left: 132.7, rotate: '0deg' },
    spot97: { top: 185, left: 132.7, rotate: '0deg' },
    spot98: { top: 180, left: 132.7, rotate: '0deg' },
    spot99: { top: 175, left: 132.7, rotate: '0deg' },
    spot100: { top: 170, left: 132.7, rotate: '0deg' },
    spot101: { top: 165, left: 132.7, rotate: '0deg' },
    spot102: { top: 160, left: 132.7, rotate: '0deg' },
    spot103: { top: 155, left: 132.7, rotate: '0deg' },
    spot104: { top: 150, left: 132.7, rotate: '0deg' },
    spot105: { top: 145, left: 132.7, rotate: '0deg' },
    spot106: { top: 140, left: 132.7, rotate: '0deg' },
    spot107: { top: 135, left: 132.7, rotate: '0deg' },
    spot108: { top: 130, left: 132.7, rotate: '0deg' },
    spot109: { top: 125, left: 132.7, rotate: '0deg' },
    spot110: { top: 120, left: 132.7, rotate: '0deg' },
    spot111: { top: 115, left: 132.7, rotate: '0deg' },
    spot112: { top: 110, left: 132.7, rotate: '0deg' },
    spot113: { top: 105, left: 132.7, rotate: '0deg' },
    spot114: { top: 100, left: 132.7, rotate: '0deg' },
    spot115: { top: 95, left: 132.7, rotate: '0deg' },
    spot116: { top: 90, left: 132.7, rotate: '0deg' },
    spot117: { top: 85, left: 132.7, rotate: '0deg' },
    spot118: { top: 80, left: 132.7, rotate: '0deg' },
    spot119: { top: 75, left: 132.7, rotate: '0deg' },
    spot120: { top: 70, left: 132.7, rotate: '0deg' },
    spot121: { top: 65, left: 132.7, rotate: '0deg' },
    spot122: { top: 60, left: 132.7, rotate: '0deg' },
    spot123: { top: 60, left: 144.5, rotate: '0deg' },
    spot124: { top: 65, left: 144.5, rotate: '0deg' },
    spot125: { top: 70, left: 144.5, rotate: '0deg' },
    spot126: { top: 75, left: 144.5, rotate: '0deg' },
    spot127: { top: 80, left: 144.5, rotate: '0deg' },
    spot128: { top: 85, left: 144.5, rotate: '0deg' },
    spot129: { top: 90, left: 144.5, rotate: '0deg' },
    spot130: { top: 95, left: 144.5, rotate: '0deg' },
    spot131: { top: 100, left: 144.5, rotate: '0deg' },
    spot132: { top: 105, left: 144.5, rotate: '0deg' },
    spot133: { top: 110, left: 144.5, rotate: '0deg' },
    spot134: { top: 115, left: 144.5, rotate: '0deg' },
    spot135: { top: 120, left: 144.5, rotate: '0deg' },
    spot136: { top: 125, left: 144.5, rotate: '0deg' },
    spot137: { top: 130, left: 144.5, rotate: '0deg' },
    spot138: { top: 135, left: 144.5, rotate: '0deg' },
    spot139: { top: 140, left: 144.5, rotate: '0deg' },
    spot140: { top: 145, left: 144.5, rotate: '0deg' },
    spot141: { top: 150, left: 144.5, rotate: '0deg' },
    spot142: { top: 155, left: 144.5, rotate: '0deg' },
    spot143: { top: 160, left: 144.5, rotate: '0deg' },
    spot144: { top: 165, left: 144.5, rotate: '0deg' },
    spot145: { top: 170, left: 144.5, rotate: '0deg' },
    spot146: { top: 175, left: 144.5, rotate: '0deg' },
    spot147: { top: 180, left: 144.5, rotate: '0deg' },
    spot148: { top: 185, left: 144.5, rotate: '0deg' },
    spot149: { top: 190, left: 144.5, rotate: '0deg' },
    spot150: { top: 195, left: 144.5, rotate: '0deg' },
    spot151: { top: 200, left: 144.5, rotate: '0deg' },
    spot152: { top: 205, left: 144.5, rotate: '0deg' },
    spot153: { top: 210, left: 144.5, rotate: '0deg' },
    spot154: { top: 215, left: 144.5, rotate: '0deg' },
    spot155: { top: 220, left: 144.5, rotate: '0deg' },
    spot156: { top: 225, left: 144.5, rotate: '0deg' },
    spot157: { top: 230, left: 144.5, rotate: '0deg' },
    spot158: { top: 235, left: 144.5, rotate: '0deg' },
    spot159: { top: 240, left: 144.5, rotate: '0deg' },
    spot160: { top: 245, left: 144.5, rotate: '0deg' },
    spot161: { top: 245, left: 166, rotate: '0deg' },
    spot162: { top: 240, left: 166, rotate: '0deg' },
    spot163: { top: 235, left: 166, rotate: '0deg' },
    spot164: { top: 230, left: 166, rotate: '0deg' },
    spot165: { top: 225, left: 166, rotate: '0deg' },
    spot166: { top: 220, left: 166, rotate: '0deg' },
    spot167: { top: 215, left: 166, rotate: '0deg' },
    spot168: { top: 210, left: 166, rotate: '0deg' },
    spot169: { top: 205, left: 166, rotate: '0deg' },
    spot170: { top: 200, left: 166, rotate: '0deg' },
    spot171: { top: 195, left: 166, rotate: '0deg' },
    spot172: { top: 190, left: 166, rotate: '0deg' },
    spot173: { top: 185, left: 166, rotate: '0deg' },
    spot174: { top: 180, left: 166, rotate: '0deg' },
    spot175: { top: 175, left: 166, rotate: '0deg' },
    spot176: { top: 170, left: 166, rotate: '0deg' },
    spot177: { top: 165, left: 166, rotate: '0deg' },
    spot178: { top: 160, left: 166, rotate: '0deg' },
    spot179: { top: 155, left: 166, rotate: '0deg' },
    spot180: { top: 150, left: 166, rotate: '0deg' },
    spot181: { top: 145, left: 166, rotate: '0deg' },
    spot182: { top: 140, left: 166, rotate: '0deg' },
    spot183: { top: 135, left: 166, rotate: '0deg' },
    spot184: { top: 130, left: 166, rotate: '0deg' },
    spot185: { top: 125, left: 166, rotate: '0deg' },
    spot186: { top: 120, left: 166, rotate: '0deg' },
    spot187: { top: 115, left: 166, rotate: '0deg' },
    spot188: { top: 110, left: 166, rotate: '0deg' },
    spot189: { top: 105, left: 166, rotate: '0deg' },
    spot190: { top: 100, left: 166, rotate: '0deg' },
    spot191: { top: 95, left: 166, rotate: '0deg' },
    spot192: { top: 90, left: 166, rotate: '0deg' },
    spot193: { top: 85, left: 166, rotate: '0deg' },
    spot194: { top: 80, left: 166, rotate: '0deg' },
    spot195: { top: 75, left: 166, rotate: '0deg' },
    spot196: { top: 70, left: 166, rotate: '0deg' },
    spot197: { top: 65, left: 166, rotate: '0deg' },
    spot198: { top: 60, left: 166, rotate: '0deg' },
    spot199: { top: 60, left: 177.7, rotate: '0deg' },
    spot200: { top: 65, left: 177.7, rotate: '0deg' },
    spot201: { top: 70, left: 177.7, rotate: '0deg' },
    spot202: { top: 75, left: 177.7, rotate: '0deg' },
    spot203: { top: 80, left: 177.7, rotate: '0deg' },
    spot204: { top: 85, left: 177.7, rotate: '0deg' },
    spot205: { top: 90, left: 177.7, rotate: '0deg' },
    spot206: { top: 95, left: 177.7, rotate: '0deg' },
    spot207: { top: 100, left: 177.7, rotate: '0deg' },
    spot208: { top: 105, left: 177.7, rotate: '0deg' },
    spot209: { top: 110, left: 177.7, rotate: '0deg' },
    spot210: { top: 115, left: 177.7, rotate: '0deg' },
    spot211: { top: 120, left: 177.7, rotate: '0deg' },
    spot212: { top: 125, left: 177.7, rotate: '0deg' },
    spot213: { top: 130, left: 177.7, rotate: '0deg' },
    spot214: { top: 135, left: 177.7, rotate: '0deg' },
    spot215: { top: 140, left: 177.7, rotate: '0deg' },
    spot216: { top: 145, left: 177.7, rotate: '0deg' },
    spot217: { top: 150, left: 177.7, rotate: '0deg' },
    spot218: { top: 155, left: 177.7, rotate: '0deg' },
    spot219: { top: 160, left: 177.7, rotate: '0deg' },
    spot220: { top: 165, left: 177.7, rotate: '0deg' },
    spot221: { top: 170, left: 177.7, rotate: '0deg' },
    spot222: { top: 175, left: 177.7, rotate: '0deg' },
    spot223: { top: 180, left: 177.7, rotate: '0deg' },
    spot224: { top: 185, left: 177.7, rotate: '0deg' },
    spot225: { top: 190, left: 177.7, rotate: '0deg' },
    spot226: { top: 195, left: 177.7, rotate: '0deg' },
    spot227: { top: 200, left: 177.7, rotate: '0deg' },
    spot228: { top: 205, left: 177.7, rotate: '0deg' },
    spot229: { top: 210, left: 177.7, rotate: '0deg' },
    spot230: { top: 215, left: 177.7, rotate: '0deg' },
    spot231: { top: 220, left: 177.7, rotate: '0deg' },
    spot232: { top: 225, left: 177.7, rotate: '0deg' },
    spot233: { top: 230, left: 177.7, rotate: '0deg' },
    spot234: { top: 235, left: 177.7, rotate: '0deg' },
    spot235: { top: 240, left: 177.7, rotate: '0deg' },
    spot236: { top: 245, left: 177.7, rotate: '0deg' },
    spot237: { top: 235, left: 194.5, rotate: '0deg' },
    spot238: { top: 230, left: 194.5, rotate: '0deg' },
    spot239: { top: 225, left: 194.5, rotate: '0deg' },
    spot240: { top: 220, left: 194.5, rotate: '0deg' },
    spot241: { top: 215, left: 194.5, rotate: '0deg' },
    spot242: { top: 210, left: 194.5, rotate: '0deg' },
    spot243: { top: 205, left: 194.5, rotate: '0deg' },
    spot244: { top: 200, left: 194.5, rotate: '0deg' },
    spot245: { top: 195, left: 194.5, rotate: '0deg' },
    spot246: { top: 190, left: 194.5, rotate: '0deg' },
    spot247: { top: 185, left: 194.5, rotate: '0deg' },
    spot248: { top: 180, left: 194.5, rotate: '0deg' },
    spot249: { top: 175, left: 194.5, rotate: '0deg' },
    spot250: { top: 170, left: 194.5, rotate: '0deg' },
    spot251: { top: 165, left: 194.5, rotate: '0deg' },
    spot252: { top: 160, left: 194.5, rotate: '0deg' },
    spot253: { top: 155, left: 194.5, rotate: '0deg' },
    spot254: { top: 150, left: 194.5, rotate: '0deg' },
    spot255: { top: 145, left: 194.5, rotate: '0deg' },
    spot256: { top: 140, left: 194.5, rotate: '0deg' },
    spot257: { top: 135, left: 194.5, rotate: '0deg' },
    spot258: { top: 130, left: 194.5, rotate: '0deg' },
    spot259: { top: 125, left: 194.5, rotate: '0deg' },
    spot260: { top: 120, left: 194.5, rotate: '0deg' },
    spot261: { top: 115, left: 194.5, rotate: '0deg' },
    spot262: { top: 110, left: 194.5, rotate: '0deg' },
    spot263: { top: 105, left: 194.5, rotate: '0deg' },
    spot264: { top: 100, left: 194.5, rotate: '0deg' },
    spot265: { top: 95, left: 194.5, rotate: '0deg' },
    spot266: { top: 90, left: 194.5, rotate: '0deg' },
    spot267: { top: 85, left: 194.5, rotate: '0deg' },
    spot268: { top: 80, left: 194.5, rotate: '0deg' },
    spot269: { top: 75, left: 194.5, rotate: '0deg' },
    spot270: { top: 70, left: 194.5, rotate: '0deg' },
    spot271: { top: 65, left: 194.5, rotate: '0deg' },
    spot272: { top: 60, left: 194.5, rotate: '0deg' },
    spot273: { top: 60, left: 206.2, rotate: '0deg' },
    spot274: { top: 65, left: 206.2, rotate: '0deg' },
    spot275: { top: 70, left: 206.2, rotate: '0deg' },
    spot276: { top: 75, left: 206.2, rotate: '0deg' },
    spot277: { top: 80, left: 206.2, rotate: '0deg' },
    spot278: { top: 85, left: 206.2, rotate: '0deg' },
    spot279: { top: 90, left: 206.2, rotate: '0deg' },
    spot280: { top: 95, left: 206.2, rotate: '0deg' },
    spot281: { top: 100, left: 206.2, rotate: '0deg' },
    spot282: { top: 100, left: 233.2, rotate: '0deg' },
    spot283: { top: 95, left: 233.2, rotate: '0deg' },
    spot284: { top: 90, left: 233.2, rotate: '0deg' },
    spot285: { top: 85, left: 233.2, rotate: '0deg' },
    spot286: { top: 80, left: 233.2, rotate: '0deg' },
    spot287: { top: 75, left: 233.2, rotate: '0deg' },
    spot288: { top: 70, left: 233.2, rotate: '0deg' },
    spot289: { top: 65, left: 233.2, rotate: '0deg' },
    spot290: { top: 60, left: 233.2, rotate: '0deg' },
    spot291: { top: 180, left: 233.2, rotate: '0deg' },
    spot292: { top: 175, left: 233.2, rotate: '0deg' },
    spot293: { top: 170, left: 233.2, rotate: '0deg' },
    spot294: { top: 165, left: 233.2, rotate: '0deg' },
    spot295: { top: 160, left: 233.2, rotate: '0deg' },
    spot296: { top: 155, left: 233.2, rotate: '0deg' },
    spot297: { top: 150, left: 233.2, rotate: '0deg' },
    spot298: { top: 145, left: 233.2, rotate: '0deg' },
    spot299: { top: 140, left: 233.2, rotate: '0deg' },
    spot300: { top: 135, left: 233.2, rotate: '0deg' },
    spot301: { top: 130, left: 233.2, rotate: '0deg' },
    spot302: { top: 125, left: 233.2, rotate: '0deg' },
    spot303: { top: 120, left: 233.2, rotate: '0deg' },
    spot304: { top: 120, left: 206.2, rotate: '0deg' },
    spot305: { top: 125, left: 206.2, rotate: '0deg' },
    spot306: { top: 130, left: 206.2, rotate: '0deg' },
    spot307: { top: 135, left: 206.2, rotate: '0deg' },
    spot308: { top: 140, left: 206.2, rotate: '0deg' },
    spot309: { top: 145, left: 206.2, rotate: '0deg' },
    spot310: { top: 150, left: 206.2, rotate: '0deg' },
    spot311: { top: 155, left: 206.2, rotate: '0deg' },
    spot312: { top: 160, left: 206.2, rotate: '0deg' },
    spot313: { top: 165, left: 206.2, rotate: '0deg' },
    spot314: { top: 170, left: 206.2, rotate: '0deg' },
    spot315: { top: 175, left: 206.2, rotate: '0deg' },
    spot316: { top: 180, left: 206.2, rotate: '0deg' },
    spot317: { top: 185, left: 206.2, rotate: '0deg' },
    spot318: { top: 190, left: 206.2, rotate: '0deg' },
    spot319: { top: 195, left: 206.2, rotate: '0deg' },
    spot320: { top: 200, left: 206.2, rotate: '0deg' },
    spot321: { top: 205, left: 206.2, rotate: '0deg' },
    spot322: { top: 210, left: 206.2, rotate: '0deg' },
    spot323: { top: 215, left: 206.2, rotate: '0deg' },
    spot324: { top: 220, left: 206.2, rotate: '0deg' },
    spot325: { top: 225, left: 206.2, rotate: '0deg' },
    spot326: { top: 230, left: 206.2, rotate: '0deg' },
    spot327: { top: 240.5, left: 206.2, rotate: '90deg' },
    spot328: { top: 240.5, left: 216.2, rotate: '90deg' },
    spot329: { top: 240.5, left: 226.2, rotate: '90deg' },
    spot330: { top: 240.5, left: 231.2, rotate: '90deg' },
    spot331: { top: 230, left: 104.6, rotate: '90deg' },
    spot332: { top: 230, left: 95.6, rotate: '90deg' },
    spot333: { top: 230, left: 90.6, rotate: '90deg' },
    spot334: { top: 230, left: 85.6, rotate: '90deg' },
    spot335: { top: 230, left: 80.6, rotate: '90deg' },
    spot336: { top: 35.4, left: 110, rotate: '90deg' },
    spot337: { top: 218.3, left: 90.6, rotate: '90deg' },
    spot338: { top: 218.3, left: 85.6, rotate: '90deg' },
    spot339: { top: 218.3, left: 80.6, rotate: '90deg' },
    spot340: { top: 35.4, left: 155, rotate: '90deg' },
    spot341: { top: 35.4, left: 160, rotate: '90deg' },
    spot342: { top: 35.4, left: 165, rotate: '90deg' },
    spot343: { top: 35.4, left: 170, rotate: '90deg' },
    spot344: { top: 35.4, left: 175, rotate: '90deg' },
    spot345: { top: 35.4, left: 180, rotate: '90deg' },
    spot346: { top: 35.4, left: 185, rotate: '90deg' },
    spot347: { top: 283.8, left: 200, rotate: '90deg' },
    spot348: { top: 283.8, left: 80, rotate: '90deg' },
    spot349: { top: 283.8, left: 120, rotate: '90deg' },
    spot350: { top: 283.8, left: 150, rotate: '90deg' },

    // Add more spots as needed
  }

  const filteredSpaces = parkingSpaces.filter((space) => space.type === filter)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
  <Text style={styles.headerText}>{parkingLot}</Text>
</View>

<TouchableOpacity style={styles.backWrapper} onPress={() => navigation.goBack()}>
  <Text style={styles.backText}>← Back</Text>
</TouchableOpacity>
  


      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Non-gesture UI in white background */}
        <View style={styles.infoSection}>
          <View style={styles.filterContainer}>
            {['student', 'staff', 'accessible'].map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.filterOption}
                onPress={() => setFilter(type)}
              >
                <Text style={styles.checkbox}>{filter === type ? '☑' : '☐'}</Text>
                <Text style={styles.filterLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.legendContainer}>
            {[
              { color: 'green', label: 'Open' },
              { color: 'yellow', label: 'Reserved' },
            ].map(({ color, label }) => (
              <View style={styles.legendItem} key={label}>
                <View style={[styles.legendBox, { backgroundColor: color }]} />
                <Text style={styles.legendText}>{label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.legendContainer}>
            {[
              { color: 'red', label: 'Occupied' },
              { color: 'blue', label: 'Selected' }
            ].map(({ color, label }) => (
              <View style={styles.legendItem} key={label}>
                <View style={[styles.legendBox, { backgroundColor: color }]} />
                <Text style={styles.legendText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Gesture-enabled map area */}
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[animatedStyles, styles.mapWrapper]}>
            <ImageBackground source={cottageMap} style={styles.mapImage}>
              {filteredSpaces.map((space) => {
                const coords = layoutMap[space.id]
                if (!coords) return null

                const isSelected = selectedSpot === space.id
                const color = isSelected ? 'blue' : statusColors[space.status] || 'gray'

                return (
                  <TouchableOpacity
                    key={space.id}
                    onPress={() =>
                      space.status === 'available' ? setSelectedSpot(space.id) : null}
                    style={[
                      styles.spotButton,
                      {
                        top: coords.top * Screenscale,
                        left: coords.left * Screenscale,
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

        {/* Info and action buttons in white background */}
        <View style={styles.infoSection}>
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>Steps:</Text>
            <Text style={styles.stepsText}>1. Click on an available green spot</Text>
            <Text style={styles.stepsText}>2. Hit the reserve button after selecting</Text>
            <Text style={styles.stepsText}>3. Arrive within 30 minutes</Text>
          </View>

          {/* 🔧 CHANGED: Wrap reserve buttons in a row */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.reserveButton, { marginRight: 10 }]} onPress={handleReserve}>
              <Text style={styles.reserveText}>Reserve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.reserveButton, { backgroundColor: "#2196F3" }]}
              onPress={handleReserveRandomSpot}
            >
              <Text style={styles.reserveText}>Random Spot</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingTop: 50 },
  scrollContent: { alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  mapWrapper: {
    width: screenWidth,
    height: screenWidth, // maintain 300x400 aspect ratio
    position: 'relative',
    marginBottom: 20
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    position: 'relative'
  },
  spotButton: {
    position: 'absolute',
    width: 10 * Screenscale,
    height: 5 * Screenscale,
    // borderRadius: 20 * scale,
    justifyContent: 'center',
    alignItems: 'center'
    // borderWidth: 1,
    // borderColor: "black",
  },
  spotText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 3 * Screenscale
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 2,
    width: '50%'
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  legendBox: { width: 20, height: 20, marginRight: 5 },
  legendText: { fontSize: 16, fontWeight: 'bold' },
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginVertical: 5,
    backgroundColor: 'white',
    paddingVertical: 5,
    width: '100%'
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10
  },
  checkbox: { fontSize: 20, marginRight: 5 },
  filterLabel: { fontSize: 16 },
  infoSection: {
    backgroundColor: 'white',
    width: '100%',
    alignItems: 'center',
    zIndex: 1
  },
  header: {
    width: "100%",
    backgroundColor: "#CC0000",
    height: 80,
    justifyContent: 'center',
    alignItems: "center",
  },
  headerText: {
    fontSize: 27,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'black',
    textShadowOffset: { width: 3, height: 1 },
    textShadowRadius: 5
  },
  
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 80
  },

  reserveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
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
