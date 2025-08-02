import { GamePhase } from "../game-controller/gameController.types";
import { PhaseDisplayConfig } from "./blackjackGame.types";

/**
 * ゲームフェーズに応じた表示設定を取得する
 * @param phase 現在のゲームフェーズ
 * @returns フェーズごとの表示設定
 */
export const getPhaseDisplayConfig = (phase: GamePhase): PhaseDisplayConfig => {
  switch (phase) {
    case "waiting":
      return {
        showBettingInput: false,
        showActionButtons: false,
        showGameResult: false,
        showNextRoundButton: true,
        showDealerCards: false,
        showPlayerCards: false,
      };
      
    case "betting":
      return {
        showBettingInput: true,
        showActionButtons: false,
        showGameResult: false,
        showNextRoundButton: false,
        showDealerCards: false,
        showPlayerCards: false,
      };
      
    case "dealing":
      return {
        showBettingInput: false,
        showActionButtons: false,
        showGameResult: false,
        showNextRoundButton: false,
        showDealerCards: true,
        showPlayerCards: true,
      };
      
    case "playing":
      return {
        showBettingInput: false,
        showActionButtons: true,
        showGameResult: false,
        showNextRoundButton: false,
        showDealerCards: true,
        showPlayerCards: true,
      };
      
    case "dealer-turn":
      return {
        showBettingInput: false,
        showActionButtons: false,
        showGameResult: false,
        showNextRoundButton: false,
        showDealerCards: true,
        showPlayerCards: true,
      };
      
    case "settlement":
      return {
        showBettingInput: false,
        showActionButtons: false,
        showGameResult: true,
        showNextRoundButton: false,
        showDealerCards: true,
        showPlayerCards: true,
      };
  }
};

/**
 * エラーメッセージを表示すべきかどうかを判定する
 * @param errorMessage エラーメッセージ
 * @returns エラーメッセージを表示すべきかどうか
 */
export const shouldShowErrorMessage = (errorMessage: string | undefined): boolean => {
  return !!errorMessage && errorMessage.length > 0;
};

/**
 * 新しいラウンドを開始できるかどうかを判定する
 * @param phase 現在のゲームフェーズ
 * @returns 新しいラウンドを開始できるかどうか
 */
export const canStartNewRound = (phase: GamePhase): boolean => {
  return phase === "waiting" || phase === "settlement";
};