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
                            source={require('../assets/tutorial/URPLogo.png')}
                            style={{ width: 500, height: 500, margin: 0 }}
                        />
                    ),
                    title: 'Welcome to URP!',
                    subtitle: 'Reserve your UNLV parking spot easily through our app.',
                    titleStyles: { marginTop: -220 }, 
                    subTitleStyles: { marginTop: -180 },
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
                    titleStyles: { marginTop: -100 },
                    subTitleStyles: { marginTop: -50 },
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
                    titleStyles: { marginTop: -100 },
                    subTitleStyles: { marginTop: -50 },
                },
                {
                    backgroundColor: '#e6ffe6',
                    image: (
                        <Image
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/190/190411.png' }}
                            style={{ width: 180, height: 180 }}
                        />
                    ),
                    title: 'You’re All Set!',
                    subtitle: 'Let’s go find your perfect parking spot.',
                    titleStyles: { marginTop: -100 },
                    subTitleStyles: { marginTop: -50 },
                },
            ]}
        />
    );
}
