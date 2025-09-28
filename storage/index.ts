import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer, Job } from '../types';
// Define the keys that will be used in AsyncStorage.
const STORAGE_KEYS = {
    JOBS: 'WOODWORK_PRO_JOBS',
    CUSTOMERS: 'WOODWORK_PRO_CUSTOMERS',
    // Note: Templates and Branding are already handled by Zustand's persist middleware.
};
export type AppData = {
    jobs: Job[];
    customers: Customer[];
};
// --- Job Storage Functions ---
export const getJobs = async (): Promise<Job[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.JOBS);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Failed to fetch jobs.", e);
        return [];
    }
};
export const saveJob = async (newJob: Job): Promise<Job[]> => {
    try {
        const existingJobs = await getJobs();
        const updatedJobs = [...existingJobs, newJob];
        const jsonValue = JSON.stringify(updatedJobs);
        await AsyncStorage.setItem(STORAGE_KEYS.JOBS, jsonValue);
        return updatedJobs;
    } catch (e) {
        console.error("Failed to save job.", e);
        return []; // Return empty array on failure
    }
};
// --- Customer Storage Functions ---
export const getCustomers = async (): Promise<Customer[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOMERS);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Failed to fetch customers.", e);
        return [];
    }
};
export const saveCustomer = async (newCustomer: Customer): Promise<Customer[]> => {
    try {
        const existingCustomers = await getCustomers();
        const updatedCustomers = [...existingCustomers, newCustomer];
        const jsonValue = JSON.stringify(updatedCustomers);
        await AsyncStorage.setItem(STORAGE_KEYS.CUSTOMERS, jsonValue);
        return updatedCustomers;
    } catch (e) {
        console.error("Failed to save customer.", e);
        return [];
    }
};
// --- Combined Function to load all data at startup ---
export const loadInitialData = async (): Promise<AppData> => {
    // Promise.all allows us to fetch jobs and customers in parallel
    const [jobs, customers] = await Promise.all([
        getJobs(),
        getCustomers(),
    ]);
    return { jobs, customers };
}
