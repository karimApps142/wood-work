import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Dimensions, ScrollView, Text, useColorScheme, View } from 'react-native';

// --- NEW IMPORT from react-native-chart-kit ---
import { BarChart, PieChart } from 'react-native-chart-kit';

import { formatCurrencyPKR } from '@/helper';
import Card from '../../components/Card';
import { useStore } from '../../store/useStore';

export default function AnalyticsScreen() {
    const { jobs } = useStore();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    // --- Data processing is memoized for performance ---
    const analyticsData = useMemo(() => {
        if (!jobs || jobs.length === 0) {
            return { barChartData: null, pieChartData: [], totalRevenue: 0, totalJobs: 0 };
        }

        // --- 1. Data Transformation for Bar Chart ---
        const revenueByMonth: { [key: string]: number } = {};
        let totalRevenue = 0;
        jobs.forEach(job => {
            const date = new Date(job.date);
            const month = date.toLocaleString('en-US', { month: 'short' });
            revenueByMonth[month] = (revenueByMonth[month] || 0) + job.grandTotal;
            totalRevenue += job.grandTotal;
        });
        const barChartData = {
            labels: Object.keys(revenueByMonth).reverse(),
            datasets: [{
                data: Object.values(revenueByMonth).reverse(),
            }],
        };

        // --- 2. Data Transformation for Pie Chart ---
        const materialTotals = { 'Area': 0, 'Beading': 0, 'Frame': 0, 'Paling': 0, 'Polish': 0 };
        jobs.forEach(job => {
            job.doors.forEach(door => {
                materialTotals['Area'] += door.area;
                materialTotals['Beading'] += door.beading;
                materialTotals['Frame'] += door.frame;
                materialTotals['Paling'] += door.paling;
                materialTotals['Polish'] += door.polish;
            });
        });
        // react-native-chart-kit needs a specific color and legendFontColor for each slice
        const pieColors = ["#3b82f6", "#ef4444", "#22c55e", "#f97316", "#8b5cf6"];
        const pieChartData = Object.keys(materialTotals)
            .map((key, index) => ({
                name: key,
                population: materialTotals[key as keyof typeof materialTotals],
                color: pieColors[index % pieColors.length],
                legendFontColor: isDarkMode ? "#FFF" : "#333",
                legendFontSize: 12
            }))
            .filter(item => item.population > 0);

        return { barChartData, pieChartData, totalRevenue, totalJobs: jobs.length };
    }, [jobs, isDarkMode]);

    // --- Styling configuration object for the charts ---
    const chartConfig = {
        backgroundGradientFrom: isDarkMode ? "#1f2937" : "#eff6ff",
        backgroundGradientTo: isDarkMode ? "#374151" : "#dbeafe",
        decimalPlaces: 0,
        color: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 90, 156, ${opacity})`,
        labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726"
        }
    };

    // Make charts responsive to screen size
    const screenWidth = Dimensions.get('window').width - 32; // 32 is for the container padding (16*2)

    if (jobs.length === 0) {
        return (
            <View className="flex-1 justify-center items-center p-4 bg-gray-100 dark:bg-gray-900">
                <Feather name="bar-chart-2" size={40} className="text-gray-400 dark:text-gray-500 mb-4" />
                <Text className="text-xl font-bold text-center dark:text-white">No Analytics Yet</Text>
                <Text className="text-base text-center text-gray-500 mt-2">
                    Once you complete a few jobs, your business insights will appear here.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 p-4 bg-gray-100 dark:bg-gray-900">
            <View className="flex-row justify-between mb-4">
                <Card style={{ flex: 1, marginRight: 8, alignItems: 'center' }}>
                    <Text className="text-lg font-bold dark:text-white">{analyticsData.totalJobs}</Text>
                    <Text className="text-gray-500 dark:text-gray-400">Total Jobs</Text>
                </Card>
                <Card style={{ flex: 1, marginLeft: 8, alignItems: 'center' }}>
                    <Text className="text-lg font-bold dark:text-white">{formatCurrencyPKR(analyticsData.totalRevenue)}</Text>
                    <Text className="text-gray-500 dark:text-gray-400">Total Revenue</Text>
                </Card>
            </View>

            <Card>
                <Text className="text-xl font-bold mb-4 text-center dark:text-white">Monthly Revenue</Text>
                {analyticsData.barChartData && (
                    <BarChart
                        data={analyticsData.barChartData}
                        width={screenWidth}
                        height={220}
                        yAxisLabel="Rs "
                        chartConfig={chartConfig}
                        verticalLabelRotation={30}
                        style={{ borderRadius: 16, overflow: 'hidden' }}
                    />
                )}
            </Card>

            <Card>
                <Text className="text-xl font-bold mb-4 text-center dark:text-white">Most Used Materials</Text>
                {analyticsData.pieChartData.length > 0 ? (
                    <PieChart
                        data={analyticsData.pieChartData}
                        width={screenWidth}
                        height={220}
                        chartConfig={chartConfig}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        center={[10, 0]}
                    />
                ) : (
                    <Text className="text-center text-gray-500 p-8">No materials have been used yet.</Text>
                )}
            </Card>
        </ScrollView>
    );
}