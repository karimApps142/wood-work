import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
    FlatList,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { useStore } from '@/store/useStore';
import Toast from 'react-native-toast-message';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function CustomersScreen() {
    const customers = useStore(state => state.customers);
    const addCustomer = useStore(state => state.addCustomer);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    // State for the "Add New Customer" form
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const handleAddCustomer = async () => {
        if (!name.trim()) {
            Toast.show({
                type: 'error', // 'success', 'error', 'info'
                text1: 'Validation Error',
                text2: 'Customer name cannot be empty.',
            });
            return;
        }



        try {
            const newId = Math.floor(Math.random() * 1000);

            const newCustomer = { id: newId, name, phone, address };
            addCustomer(newCustomer);
            closeModal();
        } catch (error) {
            console.error('Failed to add customer:', error);
            Toast.show({
                type: 'error', // 'success', 'error', 'info'
                text1: 'Error',
                text2: 'Could not save the new customer.',
            });
        }
    };

    const closeModal = () => {
        // Reset form fields and hide modal
        setName('');
        setPhone('');
        setAddress('');
        setModalVisible(false);
    };

    // Memoize the filtered list to avoid re-calculating on every render
    const filteredCustomers = useMemo(() => {
        if (!searchQuery.trim()) {
            return customers;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return customers.filter(
            customer =>
                customer.name.toLowerCase().includes(lowercasedQuery) ||
                customer.phone?.toLowerCase().includes(lowercasedQuery),
        );
    }, [customers, searchQuery]);

    return (
        <View className="flex-1 bg-gray-100 dark:bg-gray-900 p-4">
            {/* Search Input */}
            <View className="relative mb-4">
                <TextInput
                    placeholder="Search by name or phone..."
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="bg-white dark:bg-gray-800 dark:text-white rounded-lg p-3 pl-10 border border-gray-300 dark:border-gray-700"
                />
                <Feather
                    name="search"
                    size={20}
                    color="#9ca3af"
                    className="absolute left-3 top-3.5"
                />
            </View>

            {/* Customer List */}
            <FlatList
                data={filteredCustomers}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <Card>
                        <Text className="text-lg font-bold dark:text-white">
                            {item.name}
                        </Text>
                        <Text className="text-gray-600 dark:text-gray-400 mt-1">
                            {item.phone}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-500 mt-1">
                            {item.address}
                        </Text>
                    </Card>
                )}
                ListEmptyComponent={
                    <View className="mt-10 items-center">
                        <Text className="text-gray-500">{'No customers found.'}</Text>
                    </View>
                }
            />

            {/* "Add New Customer" Button */}
            <Button title="Add New Customer" onPress={() => setModalVisible(true)} />

            {/* Add/Edit Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}>
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="w-11/12 bg-white dark:bg-gray-800 rounded-2xl p-5">
                        <Text className="text-xl font-bold mb-4 dark:text-white">
                            Add New Customer
                        </Text>

                        <TextInput
                            placeholder="Full Name"
                            value={name}
                            onChangeText={setName}
                            className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded p-3 mb-3"
                        />
                        <TextInput
                            placeholder="Phone Number"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded p-3 mb-3"
                        />
                        <TextInput
                            placeholder="Address"
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded p-3 mb-4 h-20"
                        />

                        <View className="flex-row justify-end">
                            <TouchableOpacity onPress={closeModal} className="px-4 py-2 mr-2">
                                <Text className="text-gray-600 dark:text-gray-400 font-semibold">
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleAddCustomer}
                                className="bg-blue-500 rounded-lg px-6 py-2">
                                <Text className="text-white font-bold">Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
