import AsyncStorage from '@react-native-async-storage/async-storage';

export const setItem = async (key: string, value: any): Promise<void> => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const getItem = async <T = any>(key: string): Promise<T | null> => {
  const v = await AsyncStorage.getItem(key);
  return v != null ? JSON.parse(v) : null;
};

export const removeItem = async (key: string): Promise<void> => {
  await AsyncStorage.removeItem(key);
};

export const clear = async (): Promise<void> => {
  await AsyncStorage.clear();
};
