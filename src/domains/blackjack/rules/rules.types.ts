export type BlackjackRules = {
  // デッキ関連
  deckCount: number;
  cutCardRatio: number;
  
  // ディーラールール
  dealerStandsOn: 16 | 17;
  dealerHitsSoft17: boolean;
  
  // プレイヤーアクション
  doubleAfterSplit: boolean;
  doubleOnAnyTwo: boolean;
  maxSplitHands: number;
  splitAces: boolean;
  hitSplitAces: boolean;
  
  // サレンダー
  surrenderAllowed: boolean;
  lateSurrender: boolean;
  
  // ペイアウト
  blackjackPayout: number;
  insurancePayout: number;
  
  // ベット制限
  minBet: number;
  maxBet: number;
};

export type RulePreset = 'vegas' | 'atlantic-city' | 'european' | 'custom';

export type RulesValidationError = {
  field: keyof BlackjackRules;
  message: string;
};