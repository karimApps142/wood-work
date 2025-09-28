import { Redirect } from 'expo-router';

export default function AppEntry() {
  /**
   * This is the main entry point for the app.
   * Its sole purpose is to redirect the user from the root URL ('/')
   * to the first screen of our tab navigator, which is the job list screen.
   *
   * The href="/(tabs)/" points to the layout route defined by the `app/(tabs)` directory.
   * Expo Router will then automatically render the first screen defined in that layout ('index').
   */
  return <Redirect href="/(tabs)" />;
}