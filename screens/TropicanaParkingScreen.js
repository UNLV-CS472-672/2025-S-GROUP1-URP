/**
 * TropicanaParkingMap Component
 * -----------------------------
 * This screen displays an interactive map of the Tropicana Parking Garage, allowing users
 * to select and reserve parking spots in real-time. Users can manually select a spot or
 * request a random available spot of a specific type (student, staff, accessible).
 *
 * Features:
 * - Interactive image-based parking layout with pan and zoom gestures.
 * - Real-time Firebase updates to spot availability and expiration logic.
 * - Spot selection and reservation with a 30-minute hold.
 * - Dynamic filtering by parking spot type (student, staff, accessible).
 * - Legend and instructions for ease of use.
 *
 * Dependencies:
 * - Firebase Firestore for real-time parking spot data.
 * - Firebase Auth to associate reservations with users.
 * - React Native Gesture Handler and Reanimated for gesture-based interaction.
 * - React Navigation for screen transitions.
 */


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
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated'

import tropicanaMap from '../assets/trop_map.png' // your updated image

const db = getFirestore()
const auth = getAuth()
const screenWidth = Dimensions.get('window').width
const baseWidth = 300
const ScreenScale = screenWidth / baseWidth
const aspectRatio = 1890 / 996
const imageHeight = screenWidth * aspectRatio

const imageOriginalWidth = 996
const imageOriginalHeight = 1890
const ImageScaleX = screenWidth / imageOriginalWidth
const ImageScaleY = imageHeight / imageOriginalHeight

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

const ParkingMap = ({ parkingLot = 'Tropicana Parking' }) => {
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

  const pinch = Gesture.Pinch()
    .onStart(() => { startScale.value = scale.value })
    .onUpdate((e) => {
      scale.value = clamp(startScale.value * e.scale, 1, 5)
    })
    .runOnJS(true)

  const pan = Gesture.Pan()
    .onStart(() => {
      prevTranslationX.value = translationX.value
      prevTranslationY.value = translationY.value
    })
    .onUpdate((e) => {
      const maxPanX = screenWidth * (scale.value - 1) / 2
      const maxPanY = imageHeight * (scale.value - 1) / 2

      translationX.value = clamp(
        prevTranslationX.value + e.translationX,
        -maxPanX,
        maxPanX
      )
      translationY.value = clamp(
        prevTranslationY.value + e.translationY,
        -maxPanY,
        maxPanY
      )
    })
    .runOnJS(true)

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

  const collectionMap = {
    'Tropicana Parking': 'parkingSpotsTrop',
    'Cottage Grove Parking': 'parkingSpotsCottage',
    'Gateway Parking': 'parkingSpotsGateway'
  }

  const collectionName = collectionMap[parkingLot] || 'parkingSpotsTrop'

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, collectionName), async (snapshot) => {
      const now = Timestamp.now()
      const spots = []

      for (const docSnap of snapshot.docs) {
        const spot = { id: docSnap.id, ...docSnap.data() }
        if (spot.status === 'held' && spot.holdExpiresAt?.toMillis() < now.toMillis()) {
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
    })

    return () => unsubscribe()
  }, [collectionName])

  const handleReserve = async () => {
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
      await updateDoc(doc(db, collectionName, selectedSpot), {
        status: 'held',
        heldBy: user.uid,
        holdExpiresAt: holdExpires
      })

      const reservationId = `${user.uid}_${selectedSpot}_${Date.now()}`
      await setDoc(doc(db, 'Reservations', reservationId), {
        userID: user.uid,
        spotId: selectedSpot,
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

      await updateDoc(doc(db, collectionName, randomSpot.id), {
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

  const layoutMap = {
    // top left 
    spot1:  { top: 278, left: 305, rotate: '0deg' },
    spot2:  { top: 311, left: 305, rotate: '0deg' },
    spot3:  { top: 344, left: 305, rotate: '0deg' },
    spot4:  { top: 377, left: 305, rotate: '0deg' },
    spot5:  { top: 410, left: 305, rotate: '0deg' },
    spot6:  { top: 443, left: 305, rotate: '0deg' },
    spot7:  { top: 476, left: 305, rotate: '0deg' },
    spot8:  { top: 509, left: 305, rotate: '0deg' },
    spot9:  { top: 542, left: 305, rotate: '0deg' },
    spot10: { top: 575, left: 305, rotate: '0deg' },
    spot11: { top: 608, left: 305, rotate: '0deg' },
    spot12: { top: 641, left: 305, rotate: '0deg' },
    spot13: { top: 674, left: 305, rotate: '0deg' },
    spot14: { top: 707, left: 305, rotate: '0deg' },
    spot15: { top: 740, left: 305, rotate: '0deg' },
    spot16: { top: 773, left: 305, rotate: '0deg' },
    spot17: { top: 806, left: 305, rotate: '0deg' },

    spot18:  { top: 278, left: 432, rotate: '0deg' },
    spot19:  { top: 311, left: 432, rotate: '0deg' },
    spot20:  { top: 344, left: 432, rotate: '0deg' },
    spot21:  { top: 377, left: 432, rotate: '0deg' },
    spot22:  { top: 410, left: 432, rotate: '0deg' },
    spot23:  { top: 443, left: 432, rotate: '0deg' },
    spot24:  { top: 476, left: 432, rotate: '0deg' },
    spot25:  { top: 509, left: 432, rotate: '0deg' },
    spot26:  { top: 542, left: 432, rotate: '0deg' },
    spot27: { top: 575, left: 432, rotate: '0deg' },
    spot28: { top: 608, left: 432, rotate: '0deg' },
    spot29: { top: 641, left: 432, rotate: '0deg' },
    spot30: { top: 674, left: 432, rotate: '0deg' },
    spot31: { top: 707, left: 432, rotate: '0deg' },
    spot32: { top: 740, left: 432, rotate: '0deg' },
    spot33: { top: 773, left: 432, rotate: '0deg' },
    spot34: { top: 806, left: 432, rotate: '0deg' },

    //bottom left

    spot35:  { top: 1143, left: 305, rotate: '0deg' },
    spot36:  { top: 1176, left: 305, rotate: '0deg' },
    spot37:  { top: 1209, left: 305, rotate: '0deg' },
    spot38:  { top: 1242, left: 305, rotate: '0deg' },
    spot39:  { top: 1275, left: 305, rotate: '0deg' },
    spot40:  { top: 1308, left: 305, rotate: '0deg' },
    spot41:  { top: 1341, left: 305, rotate: '0deg' },
    spot42:  { top: 1374, left: 305, rotate: '0deg' },
    spot43:  { top: 1407, left: 305, rotate: '0deg' },
    spot44: { top: 1440, left: 305, rotate: '0deg' },
    spot45: { top: 1473, left: 305, rotate: '0deg' },
    spot46: { top: 1506, left: 305, rotate: '0deg' },
    spot47: { top: 1539, left: 305, rotate: '0deg' },
    spot48: { top: 1572, left: 305, rotate: '0deg' },
    spot49: { top: 1605, left: 305, rotate: '0deg' },
    spot50: { top: 1638, left: 305, rotate: '0deg' },
    spot51: { top: 1671, left: 305, rotate: '0deg' },

    spot52:  { top: 1143, left: 432, rotate: '0deg' },
    spot53:  { top: 1176, left: 432, rotate: '0deg' },
    spot54:  { top: 1209, left: 432, rotate: '0deg' },
    spot55:  { top: 1242, left: 432, rotate: '0deg' },
    spot56:  { top: 1275, left: 432, rotate: '0deg' },
    spot57:  { top: 1308, left: 432, rotate: '0deg' },
    spot58:  { top: 1341, left: 432, rotate: '0deg' },
    spot59:  { top: 1374, left: 432, rotate: '0deg' },
    spot60:  { top: 1407, left: 432, rotate: '0deg' },
    spot61: { top: 1440, left: 432, rotate: '0deg' },
    spot62: { top: 1473, left: 432, rotate: '0deg' },
    spot63: { top: 1506, left: 432, rotate: '0deg' },
    spot64: { top: 1539, left: 432, rotate: '0deg' },
    spot65: { top: 1572, left: 432, rotate: '0deg' },
    spot66: { top: 1605, left: 432, rotate: '0deg' },
    spot67: { top: 1638, left: 432, rotate: '0deg' },
    spot68: { top: 1671, left: 432, rotate: '0deg' },

    //left side 

    spot69:  { top: 75, left: 87, rotate: '0deg' },
    spot70:  { top: 108, left: 87, rotate: '0deg' },
    spot71:  { top: 141, left: 87, rotate: '0deg' },
    spot72:  { top: 174, left: 87, rotate: '0deg' },
    spot73:  { top: 207, left: 87, rotate: '0deg' },
    spot74:  { top: 240, left: 87, rotate: '0deg' },
    spot75:  { top: 273, left: 87, rotate: '0deg' },
    spot76:  { top: 306, left: 87, rotate: '0deg' },
    spot77:  { top: 339, left: 87, rotate: '0deg' },
    spot78:  { top: 372, left: 87, rotate: '0deg' },
    spot79:  { top: 405, left: 87, rotate: '0deg' },
    spot80:  { top: 438, left: 87, rotate: '0deg' },
    spot81:  { top: 471, left: 87, rotate: '0deg' },
    spot82:  { top: 504, left: 87, rotate: '0deg' },
    spot83:  { top: 537, left: 87, rotate: '0deg' },
    spot84:  { top: 570, left: 87, rotate: '0deg' },
    spot85:  { top: 603, left: 87, rotate: '0deg' },
    spot86:  { top: 636, left: 87, rotate: '0deg' },
    spot87:  { top: 669, left: 87, rotate: '0deg' },
    spot88:  { top: 702, left: 87, rotate: '0deg' },
    spot89:  { top: 735, left: 87, rotate: '0deg' },
    spot90:  { top: 768, left: 87, rotate: '0deg' },
    spot91:  { top: 801, left: 87, rotate: '0deg' },
    spot92:  { top: 834, left: 87, rotate: '0deg' },
    spot93:  { top: 867, left: 87, rotate: '0deg' },
    spot94:  { top: 900, left: 87, rotate: '0deg' },
    spot95:  { top: 933, left: 87, rotate: '0deg' },
    spot96:  { top: 966, left: 87, rotate: '0deg' },
    spot97:  { top: 999, left: 87, rotate: '0deg' },
    spot98:  { top: 1032, left: 87, rotate: '0deg' },
    spot99:  { top: 1065, left: 87, rotate: '0deg' },
    spot100:  { top: 1098, left: 87, rotate: '0deg' },
    spot101:  { top: 1131, left: 87, rotate: '0deg' },
    spot102:  { top: 1164, left: 87, rotate: '0deg' },
    spot103:  { top: 1197, left: 87, rotate: '0deg' },
    spot104:  { top: 1230, left: 87, rotate: '0deg' },
    spot105:  { top: 1263, left: 87, rotate: '0deg' },
    spot106:  { top: 1296, left: 87, rotate: '0deg' },
    spot107:  { top: 1329, left: 87, rotate: '0deg' },
    spot108:  { top: 1362, left: 87, rotate: '0deg' },
    spot109:  { top: 1395, left: 87, rotate: '0deg' },
    spot110:  { top: 1428, left: 87, rotate: '0deg' },
    spot111:  { top: 1461, left: 87, rotate: '0deg' },
    spot112:  { top: 1494, left: 87, rotate: '0deg' },
    spot113:  { top: 1527, left: 87, rotate: '0deg' },
    spot114:  { top: 1560, left: 87, rotate: '0deg' },
    spot115:  { top: 1593, left: 87, rotate: '0deg' },
    spot116:  { top: 1626, left: 87, rotate: '0deg' },
    spot117:  { top: 1659, left: 87, rotate: '0deg' },
    spot118:  { top: 1692, left: 87, rotate: '0deg' },
    spot119:  { top: 1725, left: 87, rotate: '0deg' },
    spot120:  { top: 1758, left: 87, rotate: '0deg' },
    spot121:  { top: 1791, left: 87, rotate: '0deg' },

    // right side

    spot122:  { top: 75, left:  852, rotate: '0deg' },
    spot123:  { top: 108, left: 852, rotate: '0deg' },
    spot124:  { top: 141, left: 852, rotate: '0deg' },
    spot125:  { top: 174, left: 852, rotate: '0deg' },
    spot126:  { top: 207, left: 852, rotate: '0deg' },
    spot127:  { top: 240, left: 852, rotate: '0deg' },
    spot128:  { top: 273, left: 852, rotate: '0deg' },
    spot129:  { top: 306, left: 852, rotate: '0deg' },
    spot130:  { top: 339, left: 852, rotate: '0deg' },
    spot131:  { top: 372, left: 852, rotate: '0deg' },
    spot132:  { top: 405, left: 852, rotate: '0deg' },
    spot133:  { top: 438, left: 852, rotate: '0deg' },
    spot134:  { top: 471, left: 852, rotate: '0deg' },
    spot135:  { top: 504, left: 852, rotate: '0deg' },
    spot136:  { top: 537, left: 852, rotate: '0deg' },
    spot137:  { top: 570, left: 852, rotate: '0deg' },
    spot138:  { top: 603, left: 852, rotate: '0deg' },
    spot139:  { top: 636, left: 852, rotate: '0deg' },
    spot140:  { top: 669, left: 852, rotate: '0deg' },
    spot141:  { top: 702, left: 852, rotate: '0deg' },
    spot142:  { top: 735, left: 852, rotate: '0deg' },
    spot143:  { top: 768, left: 852, rotate: '0deg' },
    spot144:  { top: 801, left: 852, rotate: '0deg' },
    spot145:  { top: 834, left: 852, rotate: '0deg' },
    spot146:  { top: 867, left: 852, rotate: '0deg' },
    spot147:  { top: 900, left: 852, rotate: '0deg' },
    spot148:  { top: 933, left: 852, rotate: '0deg' },
    spot149:  { top: 966, left: 852, rotate: '0deg' },
    spot150:  { top: 999, left: 852, rotate: '0deg' },
    spot151:  { top: 1032, left: 852, rotate: '0deg' },
    spot152:  { top: 1065, left: 852, rotate: '0deg' },
    spot153:  { top: 1098, left: 852, rotate: '0deg' },
    spot154:  { top: 1131, left: 852, rotate: '0deg' },
    spot155:  { top: 1164, left: 852, rotate: '0deg' },
    spot156:  { top: 1197, left: 852, rotate: '0deg' },
    spot157:  { top: 1230, left: 852, rotate: '0deg' },
    spot158:  { top: 1263, left: 852, rotate: '0deg' },
    spot159:  { top: 1296, left: 852, rotate: '0deg' },
    spot160:  { top: 1329, left: 852, rotate: '0deg' },
    spot161:  { top: 1362, left: 852, rotate: '0deg' },
    spot162:  { top: 1395, left: 852, rotate: '0deg' },
    spot163:  { top: 1428, left: 852, rotate: '0deg' },
    spot164:  { top: 1461, left: 852, rotate: '0deg' },
    spot165:  { top: 1494, left: 852, rotate: '0deg' },
    spot166:  { top: 1527, left: 852, rotate: '0deg' },
    spot167:  { top: 1560, left: 852, rotate: '0deg' },
    spot168:  { top: 1593, left: 852, rotate: '0deg' },
    spot169:  { top: 1626, left: 852, rotate: '0deg' },
    spot170:  { top: 1659, left: 852, rotate: '0deg' },
    spot171:  { top: 1692, left: 852, rotate: '0deg' },
    spot172:  { top: 1725, left: 852, rotate: '0deg' },
    spot173:  { top: 1758, left: 852, rotate: '0deg' },
    spot174:  { top: 1791, left: 852, rotate: '0deg' },


    //top right 
    spot175:  { top: 749, left: 507, rotate: '0deg' },
    spot176:  { top: 716, left: 507, rotate: '0deg' },
    spot177:  { top: 683, left: 507, rotate: '0deg' },
    spot178:  { top: 650, left: 507, rotate: '0deg' },
    spot179:  { top: 617, left: 507, rotate: '0deg' },
    spot180:  { top: 584, left: 507, rotate: '0deg' },
    spot181:  { top: 551, left: 507, rotate: '0deg' },
    spot182:  { top: 518, left: 507, rotate: '0deg' },
    spot183:  { top: 485, left: 507, rotate: '0deg' },
    spot184:  { top: 452, left: 507, rotate: '0deg' },
    spot185:  { top: 419, left: 507, rotate: '0deg' },
    spot186:  { top: 386, left: 507, rotate: '0deg' },
    spot187:  { top: 353, left: 507, rotate: '0deg' },
    spot188:  { top: 320, left: 507, rotate: '0deg' },
    spot189:  { top: 287, left: 507, rotate: '0deg' },
    spot190:  { top: 254, left: 507, rotate: '0deg' },
    spot191:  { top: 221, left: 507, rotate: '0deg' },

    spot192:  { top: 749, left: 634, rotate: '0deg' },
    spot193:  { top: 716, left: 634, rotate: '0deg' },
    spot194:  { top: 683, left: 634, rotate: '0deg' },
    spot195:  { top: 650, left: 634, rotate: '0deg' },
    spot196:  { top: 617, left: 634, rotate: '0deg' },
    spot197:  { top: 584, left: 634, rotate: '0deg' },
    spot198:  { top: 551, left: 634, rotate: '0deg' },
    spot199:  { top: 518, left: 634, rotate: '0deg' },
    spot200:  { top: 485, left: 634, rotate: '0deg' },
    spot201:  { top: 452, left: 634, rotate: '0deg' },
    spot202:  { top: 419, left: 634, rotate: '0deg' },
    spot203:  { top: 386, left: 634, rotate: '0deg' },
    spot204:  { top: 353, left: 634, rotate: '0deg' },
    spot205:  { top: 320, left: 634, rotate: '0deg' },
    spot206:  { top: 287, left: 634, rotate: '0deg' },
    spot207:  { top: 254, left: 634, rotate: '0deg' },
    spot208:  { top: 221, left: 634, rotate: '0deg' },


    //bottom right
    spot209:  { top: 1614, left: 507, rotate: '0deg' },
    spot210:  { top: 1581, left: 507, rotate: '0deg' },
    spot211:  { top: 1548, left: 507, rotate: '0deg' },
    spot212:  { top: 1515, left: 507, rotate: '0deg' },
    spot213:  { top: 1482, left: 507, rotate: '0deg' },
    spot214:  { top: 1449, left: 507, rotate: '0deg' },
    spot215:  { top: 1416, left: 507, rotate: '0deg' },
    spot216:  { top: 1383, left: 507, rotate: '0deg' },
    spot217:  { top: 1350, left: 507, rotate: '0deg' },
    spot218:  { top: 1317, left: 507, rotate: '0deg' },
    spot219:  { top: 1284, left: 507, rotate: '0deg' },
    spot220:  { top: 1251, left: 507, rotate: '0deg' },
    spot221:  { top: 1218, left: 507, rotate: '0deg' },
    spot222:  { top: 1185, left: 507, rotate: '0deg' },
    spot223:  { top: 1152, left: 507, rotate: '0deg' },
    spot224:  { top: 1119, left: 507, rotate: '0deg' },
    spot225:  { top: 1086, left: 507, rotate: '0deg' },

    spot226:  { top: 1614, left: 634, rotate: '0deg' },
    spot227:  { top: 1581, left: 634, rotate: '0deg' },
    spot228:  { top: 1548, left: 634, rotate: '0deg' },
    spot229:  { top: 1515, left: 634, rotate: '0deg' },
    spot230:  { top: 1482, left: 634, rotate: '0deg' },
    spot231:  { top: 1449, left: 634, rotate: '0deg' },
    spot232:  { top: 1416, left: 634, rotate: '0deg' },
    spot233:  { top: 1383, left: 634, rotate: '0deg' },
    spot234:  { top: 1350, left: 634, rotate: '0deg' },
    spot235:  { top: 1317, left: 634, rotate: '0deg' },
    spot236:  { top: 1284, left: 634, rotate: '0deg' },
    spot237:  { top: 1251, left: 634, rotate: '0deg' },
    spot238:  { top: 1218, left: 634, rotate: '0deg' },
    spot239:  { top: 1185, left: 634, rotate: '0deg' },
    spot240:  { top: 1152, left: 634, rotate: '0deg' },
    spot241:  { top: 1119, left: 634, rotate: '0deg' },
    spot242:  { top: 1086, left: 634, rotate: '0deg' },



//extra spots
/*
    spot243:  { top: 1791, left: 852, rotate: '0deg' },
    spot244:  { top: 1791, left: 852, rotate: '0deg' },
    spot245:  { top: 1791, left: 852, rotate: '0deg' },
    spot246:  { top: 1791, left: 852, rotate: '0deg' },
    spot247:  { top: 1791, left: 852, rotate: '0deg' },
    spot248:  { top: 1791, left: 852, rotate: '0deg' },
    spot249:  { top: 1791, left: 852, rotate: '0deg' },
    spot250:  { top: 1791, left: 852, rotate: '0deg' },
    spot251:  { top: 1791, left: 852, rotate: '0deg' },
    spot252:  { top: 1791, left: 852, rotate: '0deg' },
    spot253:  { top: 1791, left: 852, rotate: '0deg' },
    spot254:  { top: 1791, left: 852, rotate: '0deg' },
    spot255:  { top: 1791, left: 852, rotate: '0deg' },
    spot256:  { top: 1791, left: 852, rotate: '0deg' },
    spot257:  { top: 1791, left: 852, rotate: '0deg' },
    spot258:  { top: 1791, left: 852, rotate: '0deg' },
    spot259:  { top: 1791, left: 852, rotate: '0deg' },
    spot260:  { top: 1791, left: 852, rotate: '0deg' },
    spot261:  { top: 1791, left: 852, rotate: '0deg' },
    spot262:  { top: 1791, left: 852, rotate: '0deg' },
    spot263:  { top: 1791, left: 852, rotate: '0deg' },
    spot264:  { top: 1791, left: 852, rotate: '0deg' },
    spot265:  { top: 1791, left: 852, rotate: '0deg' },
    spot266:  { top: 1791, left: 852, rotate: '0deg' },
    spot267:  { top: 1791, left: 852, rotate: '0deg' },
    spot268:  { top: 1791, left: 852, rotate: '0deg' },
    spot269:  { top: 1791, left: 852, rotate: '0deg' },
    spot270:  { top: 1791, left: 852, rotate: '0deg' },
    spot271:  { top: 1791, left: 852, rotate: '0deg' },
    spot272:  { top: 1791, left: 852, rotate: '0deg' },
    spot273:  { top: 1791, left: 852, rotate: '0deg' },
    spot274:  { top: 1791, left: 852, rotate: '0deg' },
    spot275:  { top: 1791, left: 852, rotate: '0deg' },
    spot276:  { top: 1791, left: 852, rotate: '0deg' },
    spot277:  { top: 1791, left: 852, rotate: '0deg' },
    spot278:  { top: 1791, left: 852, rotate: '0deg' },
    spot279:  { top: 1791, left: 852, rotate: '0deg' },
    spot280:  { top: 1791, left: 852, rotate: '0deg' },
    spot281:  { top: 1791, left: 852, rotate: '0deg' },
    spot282:  { top: 1791, left: 852, rotate: '0deg' },
    spot283:  { top: 1791, left: 852, rotate: '0deg' },
    spot284:  { top: 1791, left: 852, rotate: '0deg' },
    spot285:  { top: 1791, left: 852, rotate: '0deg' },
    spot286:  { top: 1791, left: 852, rotate: '0deg' },
    spot287:  { top: 1791, left: 852, rotate: '0deg' },
    spot288:  { top: 1791, left: 852, rotate: '0deg' },
    spot289:  { top: 1791, left: 852, rotate: '0deg' },
    spot290:  { top: 1791, left: 852, rotate: '0deg' },
    spot291:  { top: 1791, left: 852, rotate: '0deg' },
    spot292:  { top: 1791, left: 852, rotate: '0deg' },
    spot293:  { top: 1791, left: 852, rotate: '0deg' },
    spot294:  { top: 1791, left: 852, rotate: '0deg' },
    spot295:  { top: 1791, left: 852, rotate: '0deg' },
    spot296:  { top: 1791, left: 852, rotate: '0deg' },
    spot297:  { top: 1791, left: 852, rotate: '0deg' },
    spot298:  { top: 1791, left: 852, rotate: '0deg' },
    spot299:  { top: 1791, left: 852, rotate: '0deg' },
    spot300:  { top: 1791, left: 852, rotate: '0deg' },
*/


  }

  const filteredSpaces = parkingSpaces.filter(s => s.type === filter)

  return (
    <View style={styles.container}>
  <View style={styles.header}>
    <Text style={styles.headerText}>{parkingLot}</Text>
  </View>

  <TouchableOpacity style={styles.backWrapper} onPress={() => navigation.goBack()}>
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
          {[
            { color: 'green', label: 'Open' },
            { color: 'yellow', label: 'Reserved' }
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


        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.mapWrapper, animatedStyles]}>
            <ImageBackground source={tropicanaMap} style={styles.mapImage}>
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
    width: 20 * ScreenScale,
    height: 10 * ScreenScale,
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
    width: '50%'
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  legendBox: { width: 20, height: 20, marginRight: 5 },
  legendText: { fontSize: 16, fontWeight: 'bold' },
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
