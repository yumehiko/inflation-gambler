import { create } from 'zustand';
import type { BlackjackRules, RulePreset } from './rules.types';
import { createDefaultRules, loadPresetRules } from './rules.utils';

type RulesState = {
  rules: BlackjackRules;
  preset: RulePreset;
};

type RulesActions = {
  loadPreset: (preset: RulePreset) => void;
  updateRule: <K extends keyof BlackjackRules>(key: K, value: BlackjackRules[K]) => void;
  setRules: (rules: BlackjackRules) => void;
  reset: () => void;
};

type RulesStore = RulesState & RulesActions;

export const useRulesStore = create<RulesStore>((set) => ({
  rules: createDefaultRules(),
  preset: 'vegas',

  loadPreset: (preset) => {
    set({
      rules: loadPresetRules(preset),
      preset,
    });
  },

  updateRule: (key, value) => {
    set((state) => ({
      rules: {
        ...state.rules,
        [key]: value,
      },
      preset: 'custom',
    }));
  },

  setRules: (rules) => {
    set({
      rules,
      preset: 'custom',
    });
  },

  reset: () => {
    set({
      rules: createDefaultRules(),
      preset: 'vegas',
    });
  },
}));