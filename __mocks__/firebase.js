// __mocks__/firebase.js
export const auth = {
    signInWithEmailAndPassword: jest.fn().mockResolvedValue('mocked user'),
  };
  
  export const getAuth = jest.fn().mockReturnValue(auth); // Mock getAuth
  export const getFirestore = jest.fn().mockReturnValue({}); // Mock Firestore if necessary
  
  // Mock any other Firebase services you are using in your tests
  