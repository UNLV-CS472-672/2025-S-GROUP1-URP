import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Image,
  Modal
} from 'react-native'
import { db, auth } from '../firebaseConfig'
import { doc, setDoc, getDoc } from 'firebase/firestore'

import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { getStorage } from 'firebase/storage'



// AddVehicleScreen component
export default function AddVehicleScreen({ navigation, route }) {
  const [make, setMake] = useState(""); // Vehicle make
  const [model, setModel] = useState(""); // Vehicle model
  const [year, setYear] = useState(""); // Vehicle year
  const [licensePlate, setLicensePlate] = useState(""); // License plate
  const [isKeyboardVisible, setKeyboardVisible] = useState(false); // Keyboard visibility
  const [image, setImage] = useState(null); // State for vehicle image
  const [isModalVisible, setModalVisible] = useState(false); // Modal visibility
  const [isSaving, setIsSaving] = useState(false); // Prevent duplicate saves
  const fromRedirect = route?.params?.fromRedirect || false;

  // Listen to keyboard show/hide events
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true)
    )
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false)
    )

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  const pickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1
    })
    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri)
    }
  }

  const takePhotoWithCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Permission required', 'Camera access is needed.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1
    })
    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri)
    }
  }

  const removeImage = () => {
    // Set the image state to null (mark for removal)
    setImage(null)
  }

  const handleSave = async () => {
    if (isSaving) return // Prevent duplicate saves
    setIsSaving(true) // Disable the button immediately

    if (!make.trim() || !model.trim() || !year.trim() || !licensePlate.trim()) {
      Alert.alert('Error', 'All fields are required.')
      setIsSaving(false) // Re-enable the button
      return
    }

    if (
      isNaN(year) ||
      year.length !== 4 ||
      parseInt(year) < 1886 ||
      parseInt(year) > new Date().getFullYear()
    ) {
      Alert.alert('Error', 'Please enter a valid year (e.g., 2025).')
      setIsSaving(false) // Re-enable the button
      return
    }

    let imageUrl = null

    try {
      if (image) {
        const fileInfo = await FileSystem.getInfoAsync(image)
        if (fileInfo.size > 5 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Image must be smaller than 5MB.')
          setIsSaving(false) // Re-enable the button
          return
        }

        const storage = getStorage()
        const filename = `vehicleImages/${licensePlate}_${Date.now()}.jpg`
        const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${
          storage.app.options.storageBucket
        }/o/${encodeURIComponent(filename)}?uploadType=media`

        const uploadResult = await FileSystem.uploadAsync(uploadUrl, image, {
          httpMethod: 'POST',
          headers: { 'Content-Type': 'image/jpeg' },
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT
        })

        if (uploadResult.status !== 200) {
          throw new Error('Upload failed with status ' + uploadResult.status)
        }

        imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
          storage.app.options.storageBucket
        }/o/${encodeURIComponent(filename)}?alt=media`
      }

      const user = auth.currentUser
      if (user) {
        const docRef = doc(db, 'vehicles', user.uid)
        const docSnap = await getDoc(docRef)

        let updatedVehicles = []

        if (docSnap.exists()) {
          const data = docSnap.data()
          updatedVehicles = data.vehicles || []
        }

        const newVehicle = { make, model, year, licensePlate, imageUrl }
        updatedVehicles.push(newVehicle)

        await setDoc(doc(db, 'vehicles', user.uid), {
          vehicles: updatedVehicles
        })

        Alert.alert('Vehicle information saved successfully!')
        navigation.navigate('My Account')
      } else {
        Alert.alert('Error', 'User not logged in')
      }
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setIsSaving(false) // Re-enable the button after the operation
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
          Enter the car information that you would like to register with UNLV
          Reserve Parking:{'\n\n'}
        </Text>
        <TextInput
          placeholder='Make'
          value={make}
          onChangeText={setMake}
          style={styles.input}
        />
        <TextInput
          placeholder='Model'
          value={model}
          onChangeText={setModel}
          style={styles.input}
        />
        <TextInput
          placeholder='Year'
          value={year}
          onChangeText={setYear}
          style={styles.input}
          keyboardType='numeric'
        />
        <TextInput
          placeholder='License Plate'
          value={licensePlate}
          onChangeText={setLicensePlate}
          style={styles.input}
        />

        {/* Image Buttons */}
        <View style={styles.imageButtons}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={takePhotoWithCamera}
          >
            <Text style={styles.imageButtonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={pickImageFromLibrary}
          >
            <Text style={styles.imageButtonText}>Choose Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Show Image and Remove Image Buttons */}
        {image && (
          <View style={styles.imageActions}>
            <TouchableOpacity
              style={styles.showImageButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.showImageButtonText}>Show Image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={removeImage}
            >
              <Text style={styles.removeImageButtonText}>Remove Image</Text>
            </TouchableOpacity>
          </View>
        )}

        <Button
          title='Save'
          onPress={handleSave}
          color='red'
          disabled={isSaving} // Disable the button while saving
        />
      </ScrollView>

      {/* Modal for Image Preview */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType='slide'
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Image
            source={{ uri: image }}
            style={styles.modalImage}
            resizeMode='contain'
          />
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeModalButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Only show back button when keyboard is hidden */}
      {!isKeyboardVisible && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            })
          }
        >
          <Text style={styles.backButtonText}>
            Back to {fromRedirect ? "Home" : "My Account"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10
  },
  backButton: {
    width: '50%',
    backgroundColor: '#B0463C',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 5,
    position: 'absolute',
    bottom: 20,
    left: 20
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  imageButton: {
    backgroundColor: '#B0463C',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  showImageButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 10
  },
  showImageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  removeImageButton: {
    backgroundColor: '#FF0000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1
  },
  removeImageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalImage: {
    width: '90%',
    height: '70%'
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: '#B0463C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5
  },
  closeModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
})
