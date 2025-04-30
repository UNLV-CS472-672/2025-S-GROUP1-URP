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
                        source={require('../assets/tutorial/tut1.png')}
                        style={{marginBottom: 130}}
                        />
                    ),
                    title: 'Find Parking',
                    subtitle: 'Click on a parking garage!',
                    titleStyles: { marginTop: -180 },
                    subTitleStyles: { marginTop: -145 },
                },
                {
                    backgroundColor: '#fff',
                    image: (
                        <Image
                        source={require('../assets/tutorial/tut2.png')}
                        style={{marginBottom: 130}}
                        />
                    ),
                    title: 'Pick a Parking Spot',
                    subtitle: 'Select a parking spot or use the random spot button',
                    titleStyles: { marginTop: -180 },
                    subTitleStyles: { marginTop: -145 },
                },
                {
                    backgroundColor: '#fff',
                    image: (
                        <Image
                        source={require('../assets/tutorial/tut3.png')}
                        style={{marginBottom: 130}}
                        />
                    ),
                    title: 'Click on Here to Check on Your Reservation',
                    titleStyles: { marginTop: -180 },
                },
                {
                    backgroundColor: '#fff',
                    image: (
                        <Image
                        source={require('../assets/tutorial/tut4.png')}
                        style={{marginBottom: 130}}
                        />
                    ),
                    title: 'Check Your Reservation!',
                    subtitle: 'Look here to check on your spot number and the time left on your reservation',
                    titleStyles: { marginTop: -170 },
                    subTitleStyles: { marginTop: -130 },
                },
            ]}
        />
    );
}
