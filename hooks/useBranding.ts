import { useStore } from '../store/useStore';

/**
 * A custom hook to access the branding slice of the Zustand store.
 * This version uses the `shallow` middleware as a fallback.
 */
export const useBranding = () => {
  const brandingState = useStore(
    (state) => ({
      brandName: state.brandName,
      companyInfo: state.companyInfo,
      logo: state.logo,
    }),
  );

  return brandingState;
};