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
        1, 3
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
    spot1: { top: 110, left: 75 },
    spot3: { top: 120, left: 75 },
    spot5: { top: 80, left: 75 },
    spot7: { top: 90, left: 75 },
    spot9: { top: 100, left: 75 },
    spot11: { top: 220, left: 75 }
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
            { backgroundColor: "#2196F3", marginTop: 10 , marginBottom: 80},
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
    width: 20 * Screenscale,
    height: 10 * Screenscale,
    // borderRadius: 20 * scale,
    justifyContent: 'center',
    alignItems: 'center'
    // borderWidth: 1,
    // borderColor: "black",
  },
  spotText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 5 * Screenscale
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
  }
})

export default ParkingMap
