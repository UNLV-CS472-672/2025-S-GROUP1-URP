/**
 * Babel Configuration
 *
 * This file sets up Babel for the Expo React Native project.
 * It includes:
 * - `babel-preset-expo`: Provides default presets required for Expo apps.
 * - `react-native-reanimated/plugin`: Enables support for Reanimated animations.
 *
 * Caching is enabled for performance.
 */

module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin']
  }
}
