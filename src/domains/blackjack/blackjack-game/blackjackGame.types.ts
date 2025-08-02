import { GamePhase } from "../game-controller/gameController.types";

/**
 * ブラックジャックゲーム統合コンポーネントのビュー状態
 */
export type BlackjackGameViewState = {
  /**
   * 現在のゲームフェーズ
   */
  readonly phase: GamePhase;
  
  /**
   * ゲームが開始されているかどうか
   */
  readonly isGameStarted: boolean;
  
  /**
   * ベッティングフェーズでのプレイヤーのベット額
   */
  readonly playerBetAmount?: number;
  
  /**
   * 現在のプレイヤーがアクション可能かどうか
   */
  readonly isPlayerActionRequired: boolean;
  
  /**
   * エラーメッセージ
   */
  readonly errorMessage?: string;
  
  /**
   * ローディング状態
   */
  readonly isLoading: boolean;
};

/**
 * ゲームイベントハンドラー
 */
export type GameEventHandlers = {
  /**
   * ゲーム開始ハンドラー
   */
  readonly onGameStart: () => void;
  
  /**
   * ベット額確定ハンドラー
   */
  readonly onBetConfirm: (amount: number) => void;
  
  /**
   * プレイヤーアクションハンドラー
   */
  readonly onPlayerAction: (action: "hit" | "stand" | "double" | "split" | "insurance") => void;
  
  /**
   * 次のラウンド開始ハンドラー
   */
  readonly onNextRound: () => void;
  
  /**
   * ゲームリセットハンドラー
   */
  readonly onGameReset: () => void;
};

/**
 * フェーズごとの表示設定
 */
export type PhaseDisplayConfig = {
  readonly showBettingInput: boolean;
  readonly showActionButtons: boolean;
  readonly showGameResult: boolean;
  readonly showNextRoundButton: boolean;
  readonly showDealerCards: boolean;
  readonly showPlayerCards: boolean;
};