import { describe, it, expect, beforeEach } from 'vitest';
import { useRulesStore } from './rules.store';
import { createDefaultRules } from './rules.utils';


describe('rules.store', () => {
  beforeEach(() => {
    useRulesStore.setState({
      rules: createDefaultRules(),
      preset: 'vegas',
    });
  });

  describe('initial state', () => {
    it('should have default rules and vegas preset', () => {
      const state = useRulesStore.getState();
      expect(state.rules).toEqual(createDefaultRules());
      expect(state.preset).toBe('vegas');
    });
  });

  describe('loadPreset', () => {
    it('should load Atlantic City preset', () => {
      const { loadPreset } = useRulesStore.getState();
      loadPreset('atlantic-city');
      
      const state = useRulesStore.getState();
      expect(state.preset).toBe('atlantic-city');
      expect(state.rules.deckCount).toBe(8);
      expect(state.rules.dealerHitsSoft17).toBe(false);
    });

    it('should load European preset', () => {
      const { loadPreset } = useRulesStore.getState();
      loadPreset('european');
      
      const state = useRulesStore.getState();
      expect(state.preset).toBe('european');
      expect(state.rules.surrenderAllowed).toBe(false);
      expect(state.rules.doubleAfterSplit).toBe(false);
    });

    it('should load custom preset', () => {
      const { loadPreset } = useRulesStore.getState();
      loadPreset('custom');
      
      const state = useRulesStore.getState();
      expect(state.preset).toBe('custom');
      expect(state.rules).toEqual(createDefaultRules());
    });
  });

  describe('updateRule', () => {
    it('should update individual rule', () => {
      const { updateRule } = useRulesStore.getState();
      updateRule('deckCount', 4);
      
      const state = useRulesStore.getState();
      expect(state.rules.deckCount).toBe(4);
      expect(state.preset).toBe('custom');
    });

    it('should update multiple rules', () => {
      const { updateRule } = useRulesStore.getState();
      updateRule('blackjackPayout', 1.2);
      updateRule('minBet', 10);
      
      const state = useRulesStore.getState();
      expect(state.rules.blackjackPayout).toBe(1.2);
      expect(state.rules.minBet).toBe(10);
      expect(state.preset).toBe('custom');
    });

    it('should change preset to custom when rule is updated', () => {
      const { updateRule } = useRulesStore.getState();
      const state1 = useRulesStore.getState();
      expect(state1.preset).toBe('vegas');
      
      updateRule('deckCount', 4);
      
      const state2 = useRulesStore.getState();
      expect(state2.preset).toBe('custom');
    });
  });

  describe('setRules', () => {
    it('should set all rules at once', () => {
      const newRules = {
        ...createDefaultRules(),
        deckCount: 2,
        blackjackPayout: 1.2,
        surrenderAllowed: false,
      };
      
      const { setRules } = useRulesStore.getState();
      setRules(newRules);
      
      const state = useRulesStore.getState();
      expect(state.rules).toEqual(newRules);
      expect(state.preset).toBe('custom');
    });
  });

  describe('reset', () => {
    it('should reset to default rules', () => {
      const { updateRule, reset } = useRulesStore.getState();
      
      // Change some rules
      updateRule('deckCount', 4);
      updateRule('blackjackPayout', 1.2);
      
      let state = useRulesStore.getState();
      expect(state.rules.deckCount).toBe(4);
      expect(state.preset).toBe('custom');
      
      // Reset
      reset();
      
      state = useRulesStore.getState();
      expect(state.rules).toEqual(createDefaultRules());
      expect(state.preset).toBe('vegas');
    });
  });
});