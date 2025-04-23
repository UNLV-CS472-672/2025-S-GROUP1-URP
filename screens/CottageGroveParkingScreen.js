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

function clamp (val, min, max) {
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
        prevTranslationX.value + event.translationX,
        -maxTranslateX,
        maxTranslateX
      )
      translationY.value = clamp(
        prevTranslationY.value + event.translationY,
        -maxTranslateY,
        maxTranslateY
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
      Alert.alert('No spot selected', 'Please select an available spot.')
      return
    }

    try {
      const user = auth.currentUser
      if (!user) {
        Alert.alert('Not signed in', 'Please log in to reserve a spot.')
        return
      }

      const reservationQuery = query(
        collection(db, 'Reservations'),
        where('userID', '==', user.uid),
        where('status', '==', 'held')
      )
      const reservationSnapshot = await getDocs(reservationQuery)

      if (!reservationSnapshot.empty) {
        Alert.alert(
          'Active Reservation Found',
          'You already have an active reservation. You must cancel it before reserving a new spot.'
        )
        return
      }

      const spotDocRef = doc(db, collectionName, selectedSpot)
      const reservationId = `${user.uid}_${selectedSpot}_${Date.now()}`
      const now = Timestamp.now()
      const holdExpires = Timestamp.fromDate(new Date(Date.now() + 2 * 60 * 1000))

      await updateDoc(spotDocRef, {
        status: 'held',
        heldBy: user.uid,
        holdExpiresAt: holdExpires
      })

      await setDoc(doc(db, 'Reservations', reservationId), {
        userID: user.uid,
        spotId: selectedSpot,
        status: 'held',
        startTime: now,
        endTime: holdExpires,
        createdAt: now
      })

      Alert.alert('Success', `Spot ${selectedSpot} reserved for 2 minutes.`)
      setSelectedSpot(null)
    } catch (err) {
      console.error('Reservation error:', err)
      Alert.alert('Error', 'Failed to reserve spot.')
    }
  }

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

      // Step 3: Reserve the spot
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
        new Date(Date.now() + 2 * 60 * 1000)
      ); // 2 minutes hold

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
        `Spot ${randomSpot.location} reserved for 2 minutes.`
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
    spot1: { top: 180, left: 75.3 },
    spot2: { top: 175, left: 75.3 },
    spot3: { top: 170, left: 75.3 },
    spot4: { top: 165, left: 75.3 },
    spot5: { top: 160, left: 75.3 },
    spot6: { top: 155, left: 75.3 },
    spot7: { top: 150, left: 75.3 },
    spot8: { top: 145, left: 75.3 },
    spot9: { top: 140, left: 75.3 },
    spot10: { top: 135, left: 75.3 },
    spot11: { top: 130, left: 75.3 },
    spot12: { top: 125, left: 75.3 },
    spot13: { top: 120, left: 75.3 },
    spot14: { top: 120, left: 101.6 },
    spot15: { top: 125, left: 101.6 },
    spot16: { top: 130, left: 101.6 },
    spot17: { top: 135, left: 101.6 },
    spot18: { top: 140, left: 101.6 },
    spot19: { top: 145, left: 101.6 },
    spot20: { top: 150, left: 101.6 },
    spot21: { top: 155, left: 101.6 },
    spot22: { top: 160, left: 101.6 },
    spot23: { top: 165, left: 101.6 },
    spot24: { top: 170, left: 101.6 },
    spot25: { top: 175, left: 101.6 },
    spot26: { top: 180, left: 101.6 },
    spot27: { top: 185, left: 101.6 },
    spot28: { top: 190, left: 101.6 },
    spot29: { top: 195, left: 101.6 },
    spot30: { top: 200, left: 101.6 },
    spot31: { top: 205, left: 101.6 },
    spot32: { top: 100, left: 101.6 },
    spot33: { top: 95, left: 101.6 },
    spot34: { top: 90, left: 101.6 },
    spot35: { top: 85, left: 101.6 },
    spot36: { top: 80, left: 101.6 },
    spot37: { top: 75, left: 101.6 },
    spot38: { top: 70, left: 101.6 },
    spot39: { top: 65, left: 101.6 },
    spot40: { top: 60, left: 101.6 },
    spot41: { top: 60, left: 75.3 },
    spot42: { top: 65, left: 75.3 },
    spot43: { top: 70, left: 75.3 },
    spot44: { top: 75, left: 75.3 },
    spot45: { top: 80, left: 75.3 },
    spot46: { top: 85, left: 75.3 },
    spot47: { top: 90, left: 75.3 },
    spot48: { top: 95, left: 75.3 },
    spot49: { top: 100, left: 75.3 },
    spot50: { top: 60, left: 113 },
    spot51: { top: 65, left: 113 },
    spot52: { top: 70, left: 113 },
    spot53: { top: 75, left: 113 },
    spot54: { top: 80, left: 113 },
    spot55: { top: 85, left: 113 },
    spot56: { top: 90, left: 113 },
    spot57: { top: 95, left: 113 },
    spot58: { top: 100, left: 113 },
    spot59: { top: 105, left: 113 },
    spot60: { top: 110, left: 113 },
    spot61: { top: 105, left: 113 },
    spot62: { top: 110, left: 113 },
    spot63: { top: 115, left: 113 },
    spot64: { top: 120, left: 113 },
    spot65: { top: 125, left: 113 },
    spot66: { top: 130, left: 113 },
    spot67: { top: 135, left: 113 },
    spot68: { top: 140, left: 113 },
    spot69: { top: 145, left: 113 },
    spot70: { top: 150, left: 113 },
    spot71: { top: 155, left: 113 },
    spot72: { top: 160, left: 113 },
    spot73: { top: 165, left: 113 },
    spot74: { top: 170, left: 113 },
    spot75: { top: 175, left: 113 },
    spot76: { top: 180, left: 113 },
    spot77: { top: 185, left: 113 },
    spot78: { top: 190, left: 113 },
    spot79: { top: 195, left: 113 },
    spot80: { top: 200, left: 113 },
    spot81: { top: 205, left: 113 },
    spot82: { top: 210, left: 113 },
    spot83: { top: 215, left: 113 },
    spot84: { top: 220, left: 113 },
    spot85: { top: 245, left: 132.7 },
    spot86: { top: 240, left: 132.7 },
    spot87: { top: 235, left: 132.7 },
    spot88: { top: 230, left: 132.7 },
    spot89: { top: 225, left: 132.7 },
    spot90: { top: 220, left: 132.7 },
    spot91: { top: 215, left: 132.7 },
    spot92: { top: 210, left: 132.7 },
    spot93: { top: 205, left: 132.7 },
    spot94: { top: 200, left: 132.7 },
    spot95: { top: 195, left: 132.7 },
    spot96: { top: 190, left: 132.7 },
    spot97: { top: 185, left: 132.7 },
    spot98: { top: 180, left: 132.7 },
    spot99: { top: 175, left: 132.7 },
    spot100: { top: 170, left: 132.7 },
    spot101: { top: 165, left: 132.7 },
    spot102: { top: 160, left: 132.7 },
    spot103: { top: 155, left: 132.7 },
    spot104: { top: 150, left: 132.7 },
    spot105: { top: 145, left: 132.7 },
    spot106: { top: 140, left: 132.7 },
    spot107: { top: 135, left: 132.7 },
    spot108: { top: 130, left: 132.7 },
    spot109: { top: 125, left: 132.7 },
    spot110: { top: 120, left: 132.7 },
    spot111: { top: 115, left: 132.7 },
    spot112: { top: 110, left: 132.7 },
    spot113: { top: 105, left: 132.7 },
    spot114: { top: 100, left: 132.7 },
    spot115: { top: 95, left: 132.7 },
    spot116: { top: 90, left: 132.7 },
    spot117: { top: 85, left: 132.7 },
    spot118: { top: 80, left: 132.7 },
    spot119: { top: 75, left: 132.7 },
    spot120: { top: 70, left: 132.7 },
    spot121: { top: 65, left: 132.7 },
    spot122: { top: 60, left: 132.7 },
    spot123: { top: 60, left: 144.5 },
    spot124: { top: 65, left: 144.5 },
    spot125: { top: 70, left: 144.5 },
    spot126: { top: 75, left: 144.5 },
    spot127: { top: 80, left: 144.5 },
    spot128: { top: 85, left: 144.5 },
    spot129: { top: 90, left: 144.5 },
    spot130: { top: 95, left: 144.5 },
    spot131: { top: 100, left: 144.5 },
    spot132: { top: 105, left: 144.5 },
    spot133: { top: 110, left: 144.5 },
    spot134: { top: 115, left: 144.5 },
    spot135: { top: 120, left: 144.5 },
    spot136: { top: 125, left: 144.5 },
    spot137: { top: 130, left: 144.5 },
    spot138: { top: 135, left: 144.5 },
    spot139: { top: 140, left: 144.5 },
    spot140: { top: 145, left: 144.5 },
    spot141: { top: 150, left: 144.5 },
    spot142: { top: 155, left: 144.5 },
    spot143: { top: 160, left: 144.5 },
    spot144: { top: 165, left: 144.5 },
    spot145: { top: 170, left: 144.5 },
    spot146: { top: 175, left: 144.5 },
    spot147: { top: 180, left: 144.5 },
    spot148: { top: 185, left: 144.5 },
    spot149: { top: 190, left: 144.5 },
    spot150: { top: 195, left: 144.5 },
    spot151: { top: 200, left: 144.5 },
    spot152: { top: 205, left: 144.5 },
    spot153: { top: 210, left: 144.5 },
    spot154: { top: 215, left: 144.5 },
    spot155: { top: 220, left: 144.5 },
    spot156: { top: 225, left: 144.5 },
    spot157: { top: 230, left: 144.5 },
    spot158: { top: 235, left: 144.5 },
    spot159: { top: 240, left: 144.5 },
    spot160: { top: 245, left: 144.5 },
    spot161: { top: 245, left: 166 },
    spot162: { top: 240, left: 166 },
    spot163: { top: 235, left: 166 },
    spot164: { top: 230, left: 166 },
    spot165: { top: 225, left: 166 },
    spot166: { top: 220, left: 166 },
    spot167: { top: 215, left: 166 },
    spot168: { top: 210, left: 166 },
    spot169: { top: 205, left: 166 },
    spot170: { top: 200, left: 166 },
    spot171: { top: 195, left: 166 },
    spot172: { top: 190, left: 166 },
    spot173: { top: 185, left: 166 },
    spot174: { top: 180, left: 166 },
    spot175: { top: 175, left: 166 },
    spot176: { top: 170, left: 166 },
    spot177: { top: 165, left: 166 },
    spot178: { top: 160, left: 166 },
    spot179: { top: 155, left: 166 },
    spot180: { top: 150, left: 166 },
    spot181: { top: 145, left: 166 },
    spot182: { top: 140, left: 166 },
    spot183: { top: 135, left: 166 },
    spot184: { top: 130, left: 166 },
    spot185: { top: 125, left: 166 },
    spot186: { top: 120, left: 166 },
    spot187: { top: 115, left: 166 },
    spot188: { top: 110, left: 166 },
    spot189: { top: 105, left: 166 },
    spot190: { top: 100, left: 166 },
    spot191: { top: 95, left: 166 },
    spot192: { top: 90, left: 166 },
    spot193: { top: 85, left: 166 },
    spot194: { top: 80, left: 166 },
    spot195: { top: 75, left: 166 },
    spot196: { top: 70, left: 166 },
    spot197: { top: 65, left: 166 },
    spot198: { top: 60, left: 166 },
    spot199: { top: 60, left: 177.7 },
    spot200: { top: 65, left: 177.7 },
    // Add more spots as needed
  }

  const filteredSpaces = parkingSpaces.filter((space) => space.type === filter)

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
        <Text style={{ fontSize: 16, color: 'blue' }}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{parkingLot}</Text>

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

          <TouchableOpacity style={styles.reserveButton} onPress={handleReserve}>
            <Text style={{ color: 'white', fontSize: 16 }}>Reserve</Text>
          </TouchableOpacity>
          <TouchableOpacity
          style={[
            styles.reserveButton,
            { backgroundColor: "#2196F3", marginTop: 10 , marginBottom: 10},
          ]}
          onPress={handleReserveRandomSpot}
        >
          <Text style={{ textAlign: "center", color: "white", fontSize: 16 }}>
            Reserve Random Spot
          </Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingTop: 40 },
  scrollContent: { alignItems: 'center'},
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
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
    width: '100%'
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  legendBox: { width: 20, height: 20, marginRight: 5 },
  legendText: { fontSize: 16, fontWeight: 'bold' },
  stepsContainer: { alignItems: 'center', padding: 10 },
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
    marginVertical: 10,
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
  }
})

export default ParkingMap
