import { Feather } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Pressable, Text } from 'react-native';

import { useStore } from '@/store/useStore';
import i18n from '../../utils/i18n'; // Import your i18n instance

// A map to link route names to their icons and translation keys
const tabScreenConfig = {
    index: {
        icon: 'briefcase' as const, // The 'as const' helps TypeScript infer the literal type
        translationKey: 'tabs.jobs',
    },
    analytics: {
        icon: 'bar-chart-2' as const,
        translationKey: 'tabs.analytics',
    },
    customers: {
        icon: 'users' as const,
        translationKey: 'tabs.customers',
    },
    templates: {
        icon: 'archive' as const,
        translationKey: 'tabs.templates',
    },
};

export default function TabLayout() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();

    const { brandName } = useStore();

    const isDarkMode = colorScheme === 'dark';
    const activeColor = isDarkMode ? '#3b82f6' : '#2563eb';
    const inactiveColor = isDarkMode ? '#9ca3af' : '#6b7280';

    // Component for the header title with the long-press gesture
    const HeaderTitleWithGesture = () => (
        <Pressable
            onLongPress={() => {
                console.log('Long press detected, navigating to settings...');
                router.push('/settings');
            }}
            // Delay to make the gesture feel intentional
            delayLongPress={800}
        >
            <Text
                style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: isDarkMode ? 'white' : 'black',
                }}
                // Add accessibility hint for the hidden feature
                accessibilityHint="Long press to open branding settings"
            >
                {brandName}
            </Text>
        </Pressable>
    );

    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: inactiveColor,
                tabBarStyle: {
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    borderTopColor: isDarkMode ? '#374151' : '#e5e7eb',
                },
                headerStyle: {
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                },
                headerTintColor: isDarkMode ? '#ffffff' : '#000000',
                headerTitleAlign: 'center',
                // Define the icon for each tab using the config object
                tabBarIcon: ({ color, size }) => {
                    const routeName = route.name as keyof typeof tabScreenConfig;
                    const iconName = tabScreenConfig[routeName]?.icon || 'alert-circle';
                    return <Feather name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: i18n.t('tabs.jobs'), // Localized title
                    headerTitle: () => <HeaderTitleWithGesture />,
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    title: i18n.t('tabs.analytics'), // Localized title
                }}
            />
            <Tabs.Screen
                name="customers"
                options={{
                    title: i18n.t('tabs.customers'), // Localized title
                }}
            />
            <Tabs.Screen
                name="templates"
                options={{
                    title: i18n.t('tabs.templates'), // Localized title
                }}
            />
        </Tabs>
    );
}
