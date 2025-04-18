import { useState } from 'react'
import { View, TextInput, Text, Alert, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebaseConfig'

/**
 * SignUpScreen Component
 *
 * This screen allows users to create a new account by providing their email and password.
 * It uses Firebase Authentication to create a new user account.
 *
 * Features:
 * - Input fields for email and password.
 * - Button to create a new account.
 * - Navigation option to go back to the login screen.
 *
 * @param {Object} navigation - React Navigation prop used to navigate between screens.
 */
const SignUpScreen = ({ navigation }) => {
  // State to store the user's email and password inputs
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false) // State to toggle password visibility

  /**
   * handleSignUp Function
   *
   * Creates a new user account using Firebase Authentication with the provided email and password.
   * After successful account creation, auto-log the user in and navigate to the Home screen.
   */
  const handleSignUp = async () => {
    try {
      // Create the new user account
      await createUserWithEmailAndPassword(auth, email, password)

      // EDIT: Auto-login after account creation
      await signInWithEmailAndPassword(auth, email, password) // Auto-login after sign-up

      // EDIT: Alert to indicate successful login
      Alert.alert('Account created and logged in successfully!') // Notify user of successful login

      // Navigate to the Home screen after successful login
      navigation.navigate('Home')
    } catch (error) {
      Alert.alert(error.message) // Display error message if something goes wrong
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust behavior for iOS/Android
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <Text style={styles.header}>UNLV Reserved Parking{'\n'}Create an Account</Text>

        {/* Email Input Field */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder='Enter your email'
          keyboardType='email-address'
          autoCapitalize='none'
          style={styles.input}
        />

        {/* Password Input Field */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder='Enter your password'
            secureTextEntry={!showPassword} // Toggle password visibility
            style={styles.passwordInput}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.showPassword}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
          </TouchableOpacity>
        </View>

        {/* Button to Create Account */}
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        {/* Back to Login Navigation */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// Styles for SignUpScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 60 // Added space to the bottom to avoid cover by the keyboard
  },
  header: {
    width: '100%',
    backgroundColor: '#CC0000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5
  },
  input: {
    width: '100%',
    backgroundColor: '#d3d3d3',
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1, // Added border for consistency
    borderColor: '#d3d3d3' // Match the background color for a cleaner look
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#d3d3d3',
    borderRadius: 5,
    paddingHorizontal: 10,
    borderWidth: 1, // Added border to match input field style
    borderColor: '#d3d3d3' // Match the background color for consistency
  },
  passwordInput: {
    flex: 1, // Makes the input take up most of the space
    paddingVertical: 10
  },
  showPassword: {
    color: '#CC0000',
    fontWeight: 'bold'
  },
  button: {
    width: '100%',
    backgroundColor: '#CC0000',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#000', // Border to match the image
    marginBottom: 10,
    marginTop: 20 // Added marginTop to move the button down
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  backText: {
    color: '#6495ED',
    marginTop: 10
  }
})

export default SignUpScreen
