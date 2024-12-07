import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  keyboardEnabled: boolean;
  mouseEnabled: boolean;
  gamepadEnabled: boolean;
  smoothing: boolean;
}

interface SettingsStore {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  keyboardEnabled: true,
  mouseEnabled: true,
  gamepadEnabled: true,
  smoothing: false,
};

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'emulator-settings',
      version: 1,
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);