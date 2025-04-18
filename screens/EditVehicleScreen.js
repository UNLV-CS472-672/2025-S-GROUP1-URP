import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal
} from 'react-native'
import { db, auth } from '../firebaseConfig'
import { doc, getDoc, setDoc } from 'firebase/firestore'

import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { getStorage, ref, deleteObject } from 'firebase/storage'

export default function EditVehicleScreen ({ route, navigation }) {
  const { vehicle, index } = route.params
  const [make, setMake] = useState(vehicle.make)
  const [model, setModel] = useState(vehicle.model)
  const [year, setYear] = useState(vehicle.year)
  const [licensePlate, setLicensePlate] = useState(vehicle.licensePlate)
  const [image, setImage] = useState(vehicle.imageUrl || null)
  const [isModalVisible, setModalVisible] = useState(false)
  const [isSaving, setIsSaving] = useState(false) // Prevent duplicate saves

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
    if (isSaving) return // Prevent duplicate calls
    setIsSaving(true)

    if (!make.trim() || !model.trim() || !year.trim() || !licensePlate.trim()) {
      Alert.alert('Error', 'All fields are required.')
      setIsSaving(false)
      return
    }

    if (
      isNaN(year) ||
      year.length !== 4 ||
      parseInt(year) < 1886 ||
      parseInt(year) > new Date().getFullYear()
    ) {
      Alert.alert('Error', 'Please enter a valid year (e.g., 2025).')
      setIsSaving(false)
      return
    }

    let imageUrl = vehicle.imageUrl

    try {
      const user = auth.currentUser
      if (!user) {
        Alert.alert('Error', 'User not logged in')
        setIsSaving(false)
        return
      }

      const docRef = doc(db, 'vehicles', user.uid)
      const docSnap = await getDoc(docRef)

      if (image === null && vehicle.imageUrl) {
        // Remove the image from Firebase Storage if the user has cleared it
        const storage = getStorage()
        const oldImageRef = ref(
          storage,
          decodeURIComponent(vehicle.imageUrl.split('/o/')[1].split('?')[0])
        )
        await deleteObject(oldImageRef).catch((error) => {
          console.warn('Failed to delete old image:', error.message)
        })

        imageUrl = null // Clear the image URL
      } else if (image && image !== vehicle.imageUrl) {
        // Upload the new image
        const fileInfo = await FileSystem.getInfoAsync(image)
        if (fileInfo.size > 5 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Image must be smaller than 5MB.')
          setIsSaving(false)
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

      if (docSnap.exists()) {
        const data = docSnap.data()
        const updatedVehicles = [...data.vehicles]
        updatedVehicles[index] = {
          make,
          model,
          year,
          licensePlate,
          imageUrl
        }

        await setDoc(docRef, { vehicles: updatedVehicles })
        Alert.alert('Vehicle updated successfully!')
        navigation.navigate('My Account')
      }
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setIsSaving(false) // Re-enable the button after the operation
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Edit Vehicle Information</Text>
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
        title='Save Changes'
        onPress={handleSave}
        color='green'
        disabled={isSaving} // Disable the button while saving
      />

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

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('My Account')}
      >
        <Text style={styles.backButtonText}>Back to My Account</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10
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
    borderRadius: 5
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
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#B0463C',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 5
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
})
