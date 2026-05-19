export type AdminModuleState = {
  isReady: boolean;
};

export function useAdminModule(): AdminModuleState {
  return {
    isReady: false,
  };
}
