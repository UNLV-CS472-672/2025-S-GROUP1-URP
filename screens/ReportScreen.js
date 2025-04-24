import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { db } from '../firebaseConfig'
import { getAuth } from 'firebase/auth'
const auth = getAuth()

export default function ReportScreen ({ navigation }) {
  const [licensePlate, setLicensePlate] = useState('')
  const [color, setColor] = useState('')
  const [makeModel, setMakeModel] = useState('')
  const [comments, setComments] = useState('')
  const [image, setImage] = useState(null)

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

  const handleSubmit = async () => {
    if (!licensePlate || !color || !makeModel) {
      Alert.alert('Missing Info', 'Please fill out all required fields.')
      return
    }

    let imageUrl = null

    try {
      if (image) {
        // 🔒 File size check
        const fileInfo = await FileSystem.getInfoAsync(image)
        if (fileInfo.size > 5 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Image must be smaller than 5MB.')
          return
        }

        const storage = getStorage()
        const filename = `violationReports/test_${Date.now()}.jpg`
        const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/${encodeURIComponent(filename)}?uploadType=media`

        console.log('Uploading image from:', image)
        const uploadResult = await FileSystem.uploadAsync(uploadUrl, image, {
          httpMethod: 'POST',
          headers: { 'Content-Type': 'image/jpeg' },
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT
        })

        if (uploadResult.status !== 200) {
          throw new Error('Upload failed with status ' + uploadResult.status)
        }

        imageUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/${encodeURIComponent(filename)}?alt=media`
        console.log('✅ Upload success:', imageUrl)
      }

      await addDoc(collection(db, 'reports'), {
        licensePlate,
        color,
        makeModel,
        comments,
        imageUrl,
        timestamp: serverTimestamp(),
        userId: auth.currentUser?.uid || 'unknown'
      })

      Alert.alert('Success', 'Report submitted.')
      setLicensePlate('')
      setColor('')
      setMakeModel('')
      setComments('')
      setImage(null)
    } catch (err) {
      console.error('Upload failed:', err.message)
      Alert.alert('Upload Error', 'Image upload or report save failed.')
    }
  }

  return (
    <View style={styles.container}>
      {/* Red Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Report Violation</Text>
      </View>

      <TouchableOpacity style={styles.backWrapper} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.label}>License Plate Number:</Text>
          <TextInput
            style={styles.input}
            value={licensePlate}
            onChangeText={setLicensePlate}
            placeholder='ABC123'
          />

          <Text style={styles.label}>Color:</Text>
          <TextInput
            style={styles.input}
            value={color}
            onChangeText={setColor}
            placeholder='Red, Blue, etc'
          />

          <Text style={styles.label}>Make/Model:</Text>
          <TextInput
            style={styles.input}
            value={makeModel}
            onChangeText={setMakeModel}
            placeholder='e.g. Toyota Camry'
          />

          <Text style={styles.label}>Comments:</Text>
          <TextInput
            style={[styles.input, styles.commentInput]}
            value={comments}
            onChangeText={setComments}
            placeholder='Additional comments'
            multiline
          />

          {/* Image Buttons */}
          <View style={styles.imageButtons}>
            <TouchableOpacity style={styles.imageButton} onPress={takePhotoWithCamera}>
              <Text style={styles.imageButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton} onPress={pickImageFromLibrary}>
              <Text style={styles.imageButtonText}>Choose Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Image Preview */}
          {image && (
            <Image source={{ uri: image }} style={styles.imagePreview} resizeMode='cover' />
          )}

          {/* Submit */}
          <Button title='Submit Report' onPress={handleSubmit} color='red' />
        </View>
      </ScrollView>


    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 20
  },
  header: {
    width: '100%',
    height: 80,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
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
    marginBottom: 10,
    paddingLeft: 5
  },
  backText: {
    color: 'red',
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120
  },
  content: {},
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 5
  },
  commentInput: {
    height: 80,
    textAlignVertical: 'top'
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 10
  },
  imageButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  imageButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10
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
  }
})
