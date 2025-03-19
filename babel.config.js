module.exports = {
    presets: [
      'module:metro-react-native-babel-preset', // Standard preset for React Native
      '@babel/preset-env' // Ensures modern JS features like async/await, destructuring, and more
    ],
    plugins: [
      '@babel/plugin-transform-modules-commonjs', // Convert ES modules to CommonJS for Jest
    ]
  };