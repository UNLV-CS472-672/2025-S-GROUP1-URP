import React from 'react';
import { Image } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

export default function TutorialScreen({ navigation }) {
  return (
    <Onboarding
      onSkip={() => navigation.replace('Home')}
      onDone={() => navigation.replace('Home')}
      pages={[
        {
          backgroundColor: '#fff',
          image: (
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/684/684908.png' }}
              style={{ width: 200, height: 200 }}
            />
          ),
          title: 'Welcome to URP!',
          subtitle: 'Reserve your UNLV parking spot easily through our app.',
        },
        {
          backgroundColor: '#f9f9f9',
          image: (
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/854/854894.png' }}
              style={{ width: 200, height: 200 }}
            />
          ),
          title: 'Find Parking',
          subtitle: 'Explore available spots in real-time across garages.',
        },
        {
          backgroundColor: '#fff',
          image: (
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png' }}
              style={{ width: 150, height: 150 }}
            />
          ),
          title: 'Need Help?',
          subtitle: 'Tap the Help button any time to get guidance or support.',
        },
      ]}
    />
  );
}
