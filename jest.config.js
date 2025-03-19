module.exports = {
  preset: 'react-native',
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest", // Ensure JS and TS files are transformed by babel-jest
    "^.+\\.mjs$": "babel-jest", // Transform .mjs files with babel-jest
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@react-native|react-native|firebase|@firebase)/)" // Allow transformation of Firebase and React Native modules
  ],
};