import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { formatCurrencyPKR } from '../../helper';
import { useStore } from '../../store/useStore';

const JobListScreen = () => {
    const router = useRouter();
    // Get all jobs directly from our central store
    const { jobs } = useStore();

    return (
        <View className="flex-1 p-4 bg-gray-100 dark:bg-gray-900">
            <FlatList
                data={jobs}
                keyExtractor={(item) => item.id.toString()}
                // Add some space at the end of the list so the button doesn't cover the last item
                contentContainerStyle={{ paddingBottom: 80 }}
                renderItem={({ item }) => {
                    // Format the date for display
                    const jobDate = new Date(item.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    });

                    return (
                        // --- Each card is now a button that navigates to the edit screen ---
                        <TouchableOpacity onPress={() => router.push(`/job/${item.id}`)}>
                            <Card>
                                {/* --- Header Row: Title and Date --- */}
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className="text-lg font-bold dark:text-white flex-1 mr-2" numberOfLines={2}>
                                        {item.title}
                                    </Text>
                                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {jobDate}
                                    </Text>
                                </View>

                                <View className="border-b border-gray-200 dark:border-gray-700 my-2" />

                                {/* --- Details Section: Door Count and Notes --- */}
                                <View className="space-y-2 mb-3">
                                    <View className="flex-row items-center">
                                        <Feather name="box" size={16} className="text-gray-500 dark:text-gray-400" />
                                        <Text className="text-base text-gray-600 dark:text-gray-300 ml-2">
                                            Total Doors: {item.doors.length}
                                        </Text>
                                    </View>
                                    {/* --- Conditionally render notes only if they exist --- */}
                                    {item.notes && (
                                        <View className="flex-row items-start">
                                            <Feather name="file-text" size={16} className="text-gray-500 dark:text-gray-400 mt-1" />
                                            <Text className="text-base text-gray-600 dark:text-gray-300 ml-2 flex-1" numberOfLines={1}>
                                                Notes: {item.notes}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* --- Footer: Grand Total --- */}
                                <View className="flex-row justify-end items-center">
                                    <Text className="text-xl font-bold dark:text-white">
                                        {formatCurrencyPKR(item.grandTotal)}
                                    </Text>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View className="mt-10 items-center p-6 bg-gray-200 dark:bg-gray-800 rounded-lg">
                        <Feather name="inbox" size={32} className="text-gray-400 dark:text-gray-500" />
                        <Text className="text-gray-500 text-center font-bold text-lg mt-4">No Jobs Found</Text>
                        <Text className="text-gray-500 text-center mt-1">Click the button below to create your first job!</Text>
                    </View>
                }
            />
            {/* --- The create button is now positioned over the list for a better UX --- */}
            <View className="absolute bottom-4 left-4 right-4">
                <Button
                    title="Create New Job"
                    onPress={() => router.push('/job/new')}
                />
            </View>
        </View>
    );
};

export default JobListScreen;