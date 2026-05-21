export class SecureStoreService {
  async deleteItem(_key: string): Promise<void> {
    // TODO: Replace with expo-secure-store when JWT auth is implemented.
  }

  async getItem(_key: string): Promise<string | null> {
    // TODO: Replace with expo-secure-store when JWT auth is implemented.
    return null;
  }

  async setItem(_key: string, _value: string): Promise<void> {
    // TODO: Replace with expo-secure-store when JWT auth is implemented.
  }
}

export const secureStoreService = new SecureStoreService();
