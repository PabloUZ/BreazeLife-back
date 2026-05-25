export type AffiliateModuleState = {
  isReady: boolean;
};

export function useAffiliateModule(): AffiliateModuleState {
  return {
    isReady: false,
  };
}
