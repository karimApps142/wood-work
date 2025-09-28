import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import '../global.css';


// Keep the splash screen visible while we fetch resources and initialize the app
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Hook into the device's color scheme (dark/light mode)
  const { colorScheme } = useColorScheme();
  // const [isDataLoaded, setIsDataLoaded] = useState(false); // New state to track data loading

  // Load custom fonts. You can add more fonts to the assets/fonts folder.
  const [loaded, error] = useFonts({
    // Example: Make sure you have this font file at assets/fonts/SpaceMono-Regular.ttf
    // 'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'), 
  });



  // This effect now handles loading ALL initial data from AsyncStorage
  // useEffect(() => {
  //   async function prepareApp() {
  //     try {
  //       console.log("Loading initial data from AsyncStorage...");
  //       const initialData = await loadInitialData();

  //       // Populate the Zustand store with the loaded data
  //       useStore.getState().setInitialData(initialData);

  //       console.log("Data loaded successfully into the store.");
  //       setIsDataLoaded(true);
  //     } catch (e) {
  //       console.warn("Error during app data preparation:", e);
  //     }
  //   }

  //   prepareApp();
  // }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Once fonts are loaded, hide the splash screen.
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // If fonts are not yet loaded, render nothing to prevent a flash of unstyled content.
  if (!loaded) {
    return null;
  }

  // Once everything is loaded, render the main navigation stack.
  return (
    <GestureHandlerRootView>
      {/* Set the status bar text color based on the current theme */}
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <Stack
        screenOptions={{
          // Apply theme-based header styles globally
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
          },
          headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />

        {/* Main entry point to the app with tabs. We hide its own header */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Screen for Creating or Editing a Job. Presented as a pop-up modal. */}
        <Stack.Screen
          name="job/[id]"
          options={{ presentation: 'modal', title: 'Manage Job' }}
        />

        {/* The hidden settings screen, also presented as a modal. */}
        <Stack.Screen
          name="settings"
          options={{ presentation: 'modal', title: 'Brand Settings' }}
        />
      </Stack>
      <Toast />

    </GestureHandlerRootView>
  );
}
