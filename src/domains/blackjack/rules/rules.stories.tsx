import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import { useRulesStore } from './rules.store';
import type { BlackjackRules, RulePreset } from './rules.types';
import { validateRules } from './rules.utils';
import styles from './rules.module.css';

const meta: Meta = {
  title: 'Blackjack/Rules',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj;

const RulesEditor = () => {
  const { rules, preset, loadPreset, updateRule, reset } = useRulesStore();
  const [errors, setErrors] = useState(validateRules(rules));

  useEffect(() => {
    setErrors(validateRules(rules));
  }, [rules]);

  const presets: RulePreset[] = ['vegas', 'atlantic-city', 'european', 'custom'];

  const handleRuleChange = <K extends keyof BlackjackRules>(
    key: K,
    value: string | boolean
  ) => {
    if (typeof rules[key] === 'number') {
      updateRule(key, Number(value) as BlackjackRules[K]);
    } else if (typeof rules[key] === 'boolean') {
      updateRule(key, value as BlackjackRules[K]);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Blackjack Rules Configuration</h2>
      
      <div className={styles.section}>
        <h3>Preset</h3>
        <select 
          value={preset} 
          onChange={(e) => loadPreset(e.target.value as RulePreset)}
          className={styles.select}
        >
          {presets.map(p => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' ')}
            </option>
          ))}
        </select>
        <button onClick={reset} className={styles.button}>
          Reset to Default
        </button>
      </div>

      {errors.length > 0 && (
        <div className={styles.errors}>
          <h4>Validation Errors:</h4>
          {errors.map((error, index) => (
            <p key={index} className={styles.error}>
              {error.field}: {error.message}
            </p>
          ))}
        </div>
      )}

      <div className={styles.section}>
        <h3>Deck Settings</h3>
        <label className={styles.label}>
          Deck Count:
          <input
            type="number"
            value={rules.deckCount}
            onChange={(e) => handleRuleChange('deckCount', e.target.value)}
            min={1}
            max={8}
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          Cut Card Ratio:
          <input
            type="number"
            value={rules.cutCardRatio}
            onChange={(e) => handleRuleChange('cutCardRatio', e.target.value)}
            min={0.5}
            max={0.9}
            step={0.1}
            className={styles.input}
          />
        </label>
      </div>

      <div className={styles.section}>
        <h3>Dealer Rules</h3>
        <label className={styles.label}>
          Dealer Stands On:
          <select
            value={rules.dealerStandsOn}
            onChange={(e) => handleRuleChange('dealerStandsOn', e.target.value)}
            className={styles.select}
          >
            <option value={16}>16</option>
            <option value={17}>17</option>
          </select>
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={rules.dealerHitsSoft17}
            onChange={(e) => handleRuleChange('dealerHitsSoft17', e.target.checked)}
          />
          Dealer Hits Soft 17
        </label>
      </div>

      <div className={styles.section}>
        <h3>Player Actions</h3>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={rules.doubleAfterSplit}
            onChange={(e) => handleRuleChange('doubleAfterSplit', e.target.checked)}
          />
          Double After Split
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={rules.doubleOnAnyTwo}
            onChange={(e) => handleRuleChange('doubleOnAnyTwo', e.target.checked)}
          />
          Double on Any Two Cards
        </label>
        <label className={styles.label}>
          Max Split Hands:
          <input
            type="number"
            value={rules.maxSplitHands}
            onChange={(e) => handleRuleChange('maxSplitHands', e.target.value)}
            min={1}
            max={4}
            className={styles.input}
          />
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={rules.splitAces}
            onChange={(e) => handleRuleChange('splitAces', e.target.checked)}
          />
          Allow Split Aces
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={rules.hitSplitAces}
            onChange={(e) => handleRuleChange('hitSplitAces', e.target.checked)}
            disabled={!rules.splitAces}
          />
          Hit Split Aces
        </label>
      </div>

      <div className={styles.section}>
        <h3>Surrender</h3>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={rules.surrenderAllowed}
            onChange={(e) => handleRuleChange('surrenderAllowed', e.target.checked)}
          />
          Surrender Allowed
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={rules.lateSurrender}
            onChange={(e) => handleRuleChange('lateSurrender', e.target.checked)}
            disabled={!rules.surrenderAllowed}
          />
          Late Surrender
        </label>
      </div>

      <div className={styles.section}>
        <h3>Payouts</h3>
        <label className={styles.label}>
          Blackjack Payout:
          <select
            value={rules.blackjackPayout}
            onChange={(e) => handleRuleChange('blackjackPayout', e.target.value)}
            className={styles.select}
          >
            <option value={1.2}>6:5 (1.2x)</option>
            <option value={1.5}>3:2 (1.5x)</option>
            <option value={2.0}>2:1 (2.0x)</option>
          </select>
        </label>
        <label className={styles.label}>
          Insurance Payout:
          <input
            type="number"
            value={rules.insurancePayout}
            onChange={(e) => handleRuleChange('insurancePayout', e.target.value)}
            min={1}
            max={3}
            step={0.5}
            className={styles.input}
          />
        </label>
      </div>

      <div className={styles.section}>
        <h3>Bet Limits</h3>
        <label className={styles.label}>
          Minimum Bet:
          <input
            type="number"
            value={rules.minBet}
            onChange={(e) => handleRuleChange('minBet', e.target.value)}
            min={1}
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          Maximum Bet:
          <input
            type="number"
            value={rules.maxBet}
            onChange={(e) => handleRuleChange('maxBet', e.target.value)}
            min={rules.minBet}
            className={styles.input}
          />
        </label>
      </div>

      <div className={styles.section}>
        <h3>Current Rules Summary</h3>
        <pre className={styles.summary}>
          {JSON.stringify(rules, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: () => <RulesEditor />,
};

const RulesDisplay = ({ title, rules }: { title: string; rules: BlackjackRules }) => (
  <div className={styles.display}>
    <h3>{title}</h3>
    <ul className={styles.rulesList}>
      <li>Decks: {rules.deckCount}</li>
      <li>Dealer stands on: {rules.dealerStandsOn}</li>
      <li>Dealer hits soft 17: {rules.dealerHitsSoft17 ? 'Yes' : 'No'}</li>
      <li>Double after split: {rules.doubleAfterSplit ? 'Yes' : 'No'}</li>
      <li>Surrender allowed: {rules.surrenderAllowed ? 'Yes' : 'No'}</li>
      <li>Blackjack pays: {rules.blackjackPayout}:1</li>
      <li>Bet range: ${rules.minBet} - ${rules.maxBet}</li>
    </ul>
  </div>
);

const PresetComparisonComponent = () => {
    const vegasRules = useRulesStore.getState().rules;
    const [atlanticRules, setAtlanticRules] = useState<BlackjackRules>(vegasRules);
    const [europeanRules, setEuropeanRules] = useState<BlackjackRules>(vegasRules);

    useEffect(() => {
      const { loadPreset, rules } = useRulesStore.getState();
      
      loadPreset('vegas');
      const vegas = { ...rules };
      
      loadPreset('atlantic-city');
      setAtlanticRules({ ...useRulesStore.getState().rules });
      
      loadPreset('european');
      setEuropeanRules({ ...useRulesStore.getState().rules });
      
      useRulesStore.setState({ rules: vegas, preset: 'vegas' });
    }, []);

    return (
      <div className={styles.comparison}>
        <h2>Preset Rules Comparison</h2>
        <div className={styles.grid}>
          <RulesDisplay title="Vegas Rules" rules={vegasRules} />
          <RulesDisplay title="Atlantic City Rules" rules={atlanticRules} />
          <RulesDisplay title="European Rules" rules={europeanRules} />
        </div>
      </div>
    );
};

export const PresetComparison: Story = {
  render: () => <PresetComparisonComponent />,
};