import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions
} from 'react-native'
import Svg, { Rect, Text as SvgText, Image as SvgImage } from 'react-native-svg'
import carIcon from '../../../assets/car_icon.png'
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

// Firebase setup
const db = getFirestore()
const auth = getAuth()
const screenWidth = Dimensions.get('window').width

const ParkingMap = ({ parkingLot = 'Tropicana Parking' }) => {
  const navigation = useNavigation()
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [parkingSpaces, setParkingSpaces] = useState([])
  const [filter, setFilter] = useState('student')

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

  const filteredSpaces = parkingSpaces.filter(space => space.type === filter)

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
        <Text style={{ fontSize: 16, color: 'blue' }}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{parkingLot}</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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

        <View style={styles.mapWrapper}>
          <Svg height='400' width='300' viewBox='0 0 300 400'>
            <Rect x='0' y='0' width='300' height='400' fill='lightgray' />
            {filteredSpaces.map((space) => {
              const col = space.location % 2 === 0 ? 1 : 0
              const row = Math.floor((space.location - 1) / 2)
              const xPos = col === 0 ? 30 : 160
              const yPos = row * 60 + 40
              const isSelected = selectedSpot === space.id

              return (
                <React.Fragment key={space.id}>
                  <Rect
                    x={xPos}
                    y={yPos}
                    width='100'
                    height='50'
                    fill={isSelected ? 'blue' : statusColors[space.status]}
                    stroke='black'
                    strokeWidth='2'
                    rx='5'
                    ry='5'
                  />
                  <SvgText
                    x={xPos + 50}
                    y={yPos + 30}
                    fontSize='18'
                    fill='black'
                    textAnchor='middle'
                    fontWeight='bold'
                  >
                    {space.location}
                  </SvgText>
                  {(space.status === 'occupied' || space.status === 'held') && (
                    <SvgImage
                      x={xPos + 10}
                      y={yPos + 5}
                      width='80'
                      height='40'
                      href={carIcon}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </Svg>

          {filteredSpaces.map((space) => {
            const col = space.location % 2 === 0 ? 1 : 0
            const row = Math.floor((space.location - 1) / 2)
            const xPos = col === 0 ? 30 : 160
            const yPos = row * 60 + 40

            return space.status === 'available'
              ? (
                <TouchableOpacity
                  key={`touch-${space.id}`}
                  style={{
                    position: 'absolute',
                    left: xPos,
                    top: yPos,
                    width: 100,
                    height: 50
                  }}
                  onPress={() => setSelectedSpot(space.id)}
                />
                )
              : null
          })}
        </View>

        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Steps:</Text>
          <Text style={styles.stepsText}>1. Click on an available green spot</Text>
          <Text style={styles.stepsText}>2. Hit the reserve button after selecting</Text>
          <Text style={styles.stepsText}>3. Arrive within 30 minutes</Text>
        </View>

        <TouchableOpacity style={styles.reserveButton} onPress={handleReserve}>
          <Text style={{ color: 'white', fontSize: 16 }}>Reserve</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingTop: 40 },
  scrollContent: { alignItems: 'center', paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  legendContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  legendBox: { width: 20, height: 20, marginRight: 5 },
  legendText: { fontSize: 16, fontWeight: 'bold' },
  mapWrapper: { width: 300, height: 400, position: 'relative', marginBottom: 20 },
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
    marginVertical: 10
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10
  },
  checkbox: { fontSize: 20, marginRight: 5 },
  filterLabel: { fontSize: 16 }
})

export default ParkingMap
