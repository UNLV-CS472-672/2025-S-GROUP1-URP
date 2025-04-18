import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'

const ReservationConfirmationScreen = () => {
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reservation Confirmed</Text>
      <Text style={styles.message}>
        You have 1 hour to park in your reserved spot before it is lost.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  )
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    color: 'black',
    marginBottom: 30
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
})

export default ReservationConfirmationScreen
