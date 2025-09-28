import { useState } from 'react';
import { FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import Toast from 'react-native-toast-message';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { formatCurrencyPKR } from '../../helper';
import { useStore } from '../../store/useStore';
import { PriceTemplate } from '../../types';



export default function TemplatesScreen() {
    // Get the templates array and the addTemplate action from the Zustand store
    const { templates, addTemplate } = useStore();

    const [modalVisible, setModalVisible] = useState(false);



    // Local state for the "Add New Template" form
    const [name, setName] = useState('');
    const [door, setDoor] = useState('');
    const [beading, setBeading] = useState('');
    const [frame, setFrame] = useState('');
    const [paling, setPaling] = useState('');
    const [polish, setPolish] = useState('');

    const resetForm = () => {
        setName('');
        setDoor('');
        setBeading('');
        setFrame('');
        setPaling('');
        setPolish('');
    };

    const openModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const handleSaveTemplate = () => {
        // Basic validation
        if (!name.trim()) {
            Toast.show({
                type: 'error', // 'success', 'error', 'info'
                text1: 'Validation Error',
                text2: 'Template name cannot be empty.',
            });
            return;
        }
        const doorPrice = parseFloat(door);
        if (isNaN(doorPrice) || doorPrice < 0) {
            Toast.show({
                type: 'error', // 'success', 'error', 'info'
                text1: 'Validation Error',
                text2: 'Please enter a valid price for the Door.',
            });
            return;
        }

        const newTemplate: PriceTemplate = {
            name: name.trim(),
            door: parseFloat(door) || 0,
            beading: parseFloat(beading) || 0,
            frame: parseFloat(frame) || 0,
            paling: parseFloat(paling) || 0,
            polish: parseFloat(polish) || 0,
        };

        addTemplate(newTemplate);
        setModalVisible(false);
    };

    return (
        <View className="flex-1 bg-gray-100 dark:bg-gray-900 p-4">
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4 px-2">
                Save frequently used price settings as templates to quickly apply them when creating new jobs.
            </Text>

            <FlatList
                data={templates}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                    <Card>
                        <Text className="text-lg font-bold dark:text-white mb-2">{item.name}</Text>
                        <View className="flex-row flex-wrap">
                            <Text className="text-gray-700 dark:text-gray-300 w-1/2 mb-1">Door: {formatCurrencyPKR(item.door)}</Text>
                            <Text className="text-gray-700 dark:text-gray-300 w-1/2 mb-1">Beading: {formatCurrencyPKR(item.beading)}</Text>
                            <Text className="text-gray-700 dark:text-gray-300 w-1/2 mb-1">Frame: {formatCurrencyPKR(item.frame)}</Text>
                            <Text className="text-gray-700 dark:text-gray-300 w-1/2 mb-1">Paling: {formatCurrencyPKR(item.paling)}</Text>
                            <Text className="text-gray-700 dark:text-gray-300 w-1/2 mb-1">Polish: {formatCurrencyPKR(item.polish)}</Text>
                        </View>
                    </Card>
                )}
                ListEmptyComponent={
                    <View className="mt-10 items-center p-4 bg-gray-200 dark:bg-gray-800 rounded-lg">
                        <Text className="text-gray-500 text-center">No templates saved yet.</Text>
                        <Text className="text-gray-500 text-center mt-1">Click the button below to create your first one!</Text>
                    </View>
                }
            />

            <Button title="Create New Template" onPress={openModal} />

            {/* Add New Template Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 p-4">
                    <ScrollView className="w-full max-w-md">
                        <View className="bg-white dark:bg-gray-800 rounded-2xl p-5">
                            <Text className="text-xl font-bold mb-4 dark:text-white">New Price Template</Text>

                            <TextInput placeholder="Template Name (e.g., 'Premium Oak')" value={name} onChangeText={setName} className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded p-3 mb-3" />
                            <TextInput placeholder="Price per Door (sq ft)" value={door} onChangeText={setDoor} keyboardType="numeric" className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded p-3 mb-3" />
                            <TextInput placeholder="Price per Beading (ft)" value={beading} onChangeText={setBeading} keyboardType="numeric" className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded p-3 mb-3" />
                            <TextInput placeholder="Price per Frame (ft)" value={frame} onChangeText={setFrame} keyboardType="numeric" className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded p-3 mb-3" />
                            <TextInput placeholder="Price per Paling (ft)" value={paling} onChangeText={setPaling} keyboardType="numeric" className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded p-3 mb-3" />
                            <TextInput placeholder="Price per Polish (sq ft)" value={polish} onChangeText={setPolish} keyboardType="numeric" className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded p-3 mb-4" />

                            <View className="flex-row justify-end">
                                <TouchableOpacity onPress={() => setModalVisible(false)} className="px-4 py-2 mr-2">
                                    <Text className="text-gray-600 dark:text-gray-400 font-semibold">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSaveTemplate} className="bg-blue-500 rounded-lg px-6 py-2">
                                    <Text className="text-white font-bold">Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}