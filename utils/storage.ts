import { INITIAL_APP_DATA } from '@/data/mockData';
import type { AppData } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@photo_billing_data';

export async function loadAppData(): Promise<AppData> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AppData;
    }
  } catch (e) {
    console.warn('Failed to load app data:', e);
  }
  return { ...INITIAL_APP_DATA };
}

export async function saveAppData(data: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save app data:', e);
  }
}
