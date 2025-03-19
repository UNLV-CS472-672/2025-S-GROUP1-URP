module.exports = {
  presets: [
    'module:metro-react-native-babel-preset', // React Native preset
    '@babel/preset-env' // Handle modern JavaScript syntax
  ],
  plugins: [
    '@babel/plugin-transform-modules-commonjs', // Convert ES modules to CommonJS for Jest
  ],
  overrides: [
    {
      test: /\.mjs$/, // Handle .mjs files
      presets: ['@babel/preset-env'],
      plugins: ['@babel/plugin-transform-modules-commonjs'],
    },
  ],
};