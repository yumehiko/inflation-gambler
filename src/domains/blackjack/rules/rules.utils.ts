import type { BlackjackRules, RulePreset, RulesValidationError } from './rules.types';
import type { HandHolder } from '../hand-holder/handHolder.types';
import { calculateHandValue } from '../hand/hand.utils';

export const createDefaultRules = (): BlackjackRules => ({
  // デッキ関連
  deckCount: 6,
  cutCardRatio: 0.75,
  
  // ディーラールール
  dealerStandsOn: 17,
  dealerHitsSoft17: true,
  
  // プレイヤーアクション
  doubleAfterSplit: true,
  doubleOnAnyTwo: true,
  maxSplitHands: 4,
  splitAces: true,
  hitSplitAces: false,
  
  // サレンダー
  surrenderAllowed: true,
  lateSurrender: true,
  
  // ペイアウト
  blackjackPayout: 1.5,
  insurancePayout: 2.0,
  
  // ベット制限
  minBet: 5,
  maxBet: 500,
});

export const loadPresetRules = (preset: RulePreset): BlackjackRules => {
  switch (preset) {
    case 'vegas':
      return createDefaultRules();
      
    case 'atlantic-city':
      return {
        ...createDefaultRules(),
        deckCount: 8,
        dealerHitsSoft17: false,
        surrenderAllowed: true,
        lateSurrender: true,
      };
      
    case 'european':
      return {
        ...createDefaultRules(),
        dealerHitsSoft17: false,
        doubleAfterSplit: false,
        surrenderAllowed: false,
      };
      
    case 'custom':
    default:
      return createDefaultRules();
  }
};

export const validateRules = (rules: BlackjackRules): RulesValidationError[] => {
  const errors: RulesValidationError[] = [];
  
  // デッキ数の検証
  if (rules.deckCount < 1 || rules.deckCount > 8) {
    errors.push({
      field: 'deckCount',
      message: 'Deck count must be between 1 and 8',
    });
  }
  
  // カットカード位置の検証
  if (rules.cutCardRatio < 0.5 || rules.cutCardRatio > 0.9) {
    errors.push({
      field: 'cutCardRatio',
      message: 'Cut card ratio must be between 0.5 and 0.9',
    });
  }
  
  // スプリット回数の検証
  if (rules.maxSplitHands < 1 || rules.maxSplitHands > 4) {
    errors.push({
      field: 'maxSplitHands',
      message: 'Max split hands must be between 1 and 4',
    });
  }
  
  // ペイアウトレートの検証
  if (rules.blackjackPayout < 1.0 || rules.blackjackPayout > 2.0) {
    errors.push({
      field: 'blackjackPayout',
      message: 'Blackjack payout must be between 1.0 and 2.0',
    });
  }
  
  if (rules.insurancePayout < 1.0 || rules.insurancePayout > 3.0) {
    errors.push({
      field: 'insurancePayout',
      message: 'Insurance payout must be between 1.0 and 3.0',
    });
  }
  
  // ベット制限の検証
  if (rules.minBet < 1) {
    errors.push({
      field: 'minBet',
      message: 'Minimum bet must be at least 1',
    });
  }
  
  if (rules.minBet > rules.maxBet) {
    errors.push({
      field: 'minBet',
      message: 'Minimum bet cannot exceed maxBet',
    });
  }
  
  return errors;
};

export const canDouble = (
  handHolder: HandHolder,
  rules: BlackjackRules,
  isAfterSplit: boolean
): boolean => {
  // 2枚のカードでなければダブルダウンできない
  if (handHolder.hand.cards.length !== 2) {
    return false;
  }
  
  // スプリット後のダブルダウンチェック
  if (isAfterSplit && !rules.doubleAfterSplit) {
    return false;
  }
  
  // 任意の2枚でダブルダウン可能な場合
  if (rules.doubleOnAnyTwo) {
    return true;
  }
  
  // 9, 10, 11のみダブルダウン可能な場合
  const handValue = calculateHandValue(handHolder.hand.cards);
  return handValue >= 9 && handValue <= 11;
};

export const canSplit = (
  handHolder: HandHolder,
  rules: BlackjackRules,
  currentSplitCount: number
): boolean => {
  // 2枚のカードでなければスプリットできない
  if (handHolder.hand.cards.length !== 2) {
    return false;
  }
  
  // スプリット回数の上限チェック
  if (currentSplitCount >= rules.maxSplitHands) {
    return false;
  }
  
  const [card1, card2] = handHolder.hand.cards;
  
  // ランクが異なる場合はスプリットできない
  if (card1.rank !== card2.rank) {
    return false;
  }
  
  // エースのスプリットチェック
  if (card1.rank === 'A' && !rules.splitAces) {
    return false;
  }
  
  return true;
};

export const canSurrender = (rules: BlackjackRules): boolean => {
  return rules.surrenderAllowed;
};

export const calculatePayout = (
  result: 'win' | 'push' | 'lose',
  bet: number,
  isBlackjack: boolean,
  rules: BlackjackRules
): number => {
  switch (result) {
    case 'win':
      if (isBlackjack) {
        return Math.floor(bet * rules.blackjackPayout);
      }
      return bet;
      
    case 'push':
      return 0;
      
    case 'lose':
      return -bet;
  }
};