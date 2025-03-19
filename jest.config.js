module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    "node_modules/(?!(@react-native|react-native|firebase|@firebase)/)" // Allow transformation of Firebase and React Native modules
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest", // Ensure all JS and TS files are processed by babel-jest
  },
};