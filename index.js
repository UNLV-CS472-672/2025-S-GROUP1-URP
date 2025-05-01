/**
 * Entry Point
 *
 * This file registers the root React component (`App`) with the Expo runtime.
 * Ensures the environment is correctly configured for both Expo Go and standalone builds.
 *
 * Functionality:
 * - Calls `registerRootComponent(App)` to launch the app.
 *
 * Dependencies:
 * - App: The main application component (from ./App).
 * - registerRootComponent: Provided by Expo to handle platform setup.
 */

import { registerRootComponent } from 'expo'

import App from './App'

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App)
