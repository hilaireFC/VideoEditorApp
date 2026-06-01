/**
 * @format
 */

// Polyfill URL pour Supabase (doit être importé en premier)
import 'react-native-url-polyfill/auto';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
