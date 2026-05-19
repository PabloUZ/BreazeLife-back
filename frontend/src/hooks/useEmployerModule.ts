export type EmployerModuleState = {
  isReady: boolean;
};

export function useEmployerModule(): EmployerModuleState {
  return {
    isReady: false,
  };
}
