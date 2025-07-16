import { create } from 'zustand';

export const useViolationRulesStore = create((set) => ({
  tabSwitch: true,
  copy: true,
  paste: true,
  rightClick: true,
  printScreen: true,
  ctrlC: true,
  ctrlV: true,
  ctrlS: true,
  ctrlP: true,
  allowMultipleAttempts: false,
  setRule: (rule, value) => set((state) => ({ ...state, [rule]: value })),
  setAllowMultipleAttempts: (val) => set({ allowMultipleAttempts: val }),
  enableAll: () => set(() => ({
    tabSwitch: true, copy: true, paste: true, rightClick: true, printScreen: true, ctrlC: true, ctrlV: true, ctrlS: true, ctrlP: true
  })),
  disableAll: () => set(() => ({
    tabSwitch: false, copy: false, paste: false, rightClick: false, printScreen: false, ctrlC: false, ctrlV: false, ctrlS: false, ctrlP: false
  })),
}));
// ⚠️ Dev-only! Remove this file before production. 