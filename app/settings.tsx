import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Platform, ScrollView, Text, View } from 'react-native';

import { TextInput } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import Button from '../components/Button';
import Card from '../components/Card';
import { useStore } from '../store/useStore';

export default function SettingsScreen() {
    const router = useRouter();

    // Get global state and the update action from the Zustand store
    const { brandName, companyInfo, logo, updateBranding } = useStore();

    // Use local state for form inputs to avoid re-rendering the whole app on every keystroke
    const [localBrandName, setLocalBrandName] = useState(brandName);
    const [localCompanyInfo, setLocalCompanyInfo] = useState(companyInfo);
    const [localLogo, setLocalLogo] = useState<string | null>(logo);

    const handlePickImage = async () => {
        // Request permission for media library
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
                return;
            }
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Square aspect ratio for logos
            quality: 1,
        });

        if (!result.canceled) {
            setLocalLogo(result.assets[0].uri);
        }
    };

    const handleSave = () => {
        // Update the global state with the local form state
        updateBranding({
            brandName: localBrandName,
            companyInfo: localCompanyInfo,
            logo: localLogo
        });

        Toast.show({
            type: 'success', // 'success', 'error', 'info'
            text1: 'Settings Saved',
            text2: 'Your branding has been updated.',
        });
        router.back();
    };

    return (
        <ScrollView className="flex-1 p-4 bg-gray-100 dark:bg-gray-900">
            <Card>
                <Text className="text-lg font-bold mb-2 dark:text-white">Brand Customization</Text>

                <Text className="font-semibold mb-1 dark:text-gray-300">App Brand Name</Text>
                <TextInput
                    placeholder="e.g., ProWood Crafters"
                    value={localBrandName}
                    onChangeText={setLocalBrandName}
                    className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded p-3 mb-4"
                />

                <Text className="font-semibold mb-1 dark:text-gray-300">Company Contact Info</Text>
                <TextInput
                    placeholder="Your Name, Phone, Email..."
                    value={localCompanyInfo}
                    onChangeText={setLocalCompanyInfo}
                    multiline
                    className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded p-3 h-24 mb-4"
                />
            </Card>

            <Card>
                <Text className="text-lg font-bold mb-2 dark:text-white">Company Logo</Text>
                <View className="items-center mb-4">
                    {localLogo ? (
                        <Image source={{ uri: localLogo }} className="w-32 h-32 rounded-full bg-gray-300" />
                    ) : (
                        <View className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600 justify-center items-center">
                            <Text className="text-gray-500 dark:text-gray-400">No Logo</Text>
                        </View>
                    )}
                </View>
                <Button title="Change Logo" onPress={handlePickImage} variant="secondary" />
            </Card>

            <Button title="Save Settings" onPress={handleSave} />
        </ScrollView>
    );
}