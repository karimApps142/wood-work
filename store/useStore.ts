
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Customer, Job, PriceTemplate } from '../types';

// Define the shape of your application's entire state
interface AppState {
    // Data loaded from AsyncStorage
    jobs: Job[];
    customers: Customer[];

    // Data persisted by Zustand's middleware
    brandName: string;
    companyInfo: string;
    logo: string | null;
    templates: PriceTemplate[];
    language: 'en' | 'ur';

    // Actions (functions to modify the state)
    // setInitialData: (data: { jobs: Job[]; customers: Customer[] }) => void;
    addJob: (job: Job) => void;
    updateJob: (updatedJob: Job) => void;
    deleteJob: (jobId: number) => void;
    addCustomer: (customer: Customer) => void;
    addTemplate: (template: PriceTemplate) => void;
    updateBranding: (branding: Partial<Pick<AppState, 'brandName' | 'companyInfo' | 'logo'>>) => void;
    setLanguage: (lang: 'en' | 'ur') => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            // --- Initial State ---
            jobs: [],
            customers: [],
            brandName: 'WoodWork Pro',
            companyInfo: '123 Woodwork Lane, Timber Town',
            logo: null,
            templates: [],
            language: 'en',

            // --- Actions ---
            // setInitialData: (data) => set({ jobs: data.jobs, customers: data.customers }),

            addJob: (job) => set((state) => ({ jobs: [...state.jobs, job] })),

            updateJob: (updatedJob) =>
                set((state) => ({
                    jobs: state.jobs.map((job) =>
                        job.id === updatedJob.id ? updatedJob : job
                    ),
                })),
            deleteJob: (jobId) =>
                set((state) => ({
                    jobs: state.jobs.filter((job) => job.id !== jobId),
                })),
            addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),

            addTemplate: (template) =>
                set((state) => ({ templates: [...state.templates, template] })),

            updateBranding: (branding) => set(branding),

            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'woodwork-pro-app-storage', // The key for Zustand's persisted data in AsyncStorage
            storage: createJSONStorage(() => AsyncStorage),
            // Only persist these specific parts of the state with the middleware.
            // `jobs` and `customers` are handled manually by our own functions.
            partialize: (state) => ({
                brandName: state.brandName,
                companyInfo: state.companyInfo,
                logo: state.logo,
                templates: state.templates,
                language: state.language,
                jobs: state.jobs,
                customers: state.customers,
            }),
        }
    )
);