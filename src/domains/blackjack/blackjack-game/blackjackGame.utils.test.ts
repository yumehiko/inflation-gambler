import { describe, it, expect } from "vitest";
import { getPhaseDisplayConfig, shouldShowErrorMessage, canStartNewRound } from "./blackjackGame.utils";
import { GamePhase } from "../game-controller/gameController.types";

describe("blackjackGame.utils", () => {
  describe("getPhaseDisplayConfig", () => {
    it("待機フェーズでは次のラウンドボタンのみ表示", () => {
      const config = getPhaseDisplayConfig("waiting");
      
      expect(config).toEqual({
        showBettingInput: false,
        showActionButtons: false,
        showGameResult: false,
        showNextRoundButton: true,
        showDealerCards: false,
        showPlayerCards: false,
      });
    });
    
    it("ベッティングフェーズではベット入力のみ表示", () => {
      const config = getPhaseDisplayConfig("betting");
      
      expect(config).toEqual({
        showBettingInput: true,
        showActionButtons: false,
        showGameResult: false,
        showNextRoundButton: false,
        showDealerCards: false,
        showPlayerCards: false,
      });
    });
    
    it("ディーリングフェーズではカードのみ表示", () => {
      const config = getPhaseDisplayConfig("dealing");
      
      expect(config).toEqual({
        showBettingInput: false,
        showActionButtons: false,
        showGameResult: false,
        showNextRoundButton: false,
        showDealerCards: true,
        showPlayerCards: true,
      });
    });
    
    it("プレイフェーズではアクションボタンとカードを表示", () => {
      const config = getPhaseDisplayConfig("playing");
      
      expect(config).toEqual({
        showBettingInput: false,
        showActionButtons: true,
        showGameResult: false,
        showNextRoundButton: false,
        showDealerCards: true,
        showPlayerCards: true,
      });
    });
    
    it("ディーラーターンフェーズではカードのみ表示", () => {
      const config = getPhaseDisplayConfig("dealer-turn");
      
      expect(config).toEqual({
        showBettingInput: false,
        showActionButtons: false,
        showGameResult: false,
        showNextRoundButton: false,
        showDealerCards: true,
        showPlayerCards: true,
      });
    });
    
    it("精算フェーズでは結果とカードを表示", () => {
      const config = getPhaseDisplayConfig("settlement");
      
      expect(config).toEqual({
        showBettingInput: false,
        showActionButtons: false,
        showGameResult: true,
        showNextRoundButton: false,
        showDealerCards: true,
        showPlayerCards: true,
      });
    });
  });
  
  describe("shouldShowErrorMessage", () => {
    it("エラーメッセージがある場合はtrueを返す", () => {
      expect(shouldShowErrorMessage("エラーが発生しました")).toBe(true);
    });
    
    it("エラーメッセージがundefinedの場合はfalseを返す", () => {
      expect(shouldShowErrorMessage(undefined)).toBe(false);
    });
    
    it("空文字の場合はfalseを返す", () => {
      expect(shouldShowErrorMessage("")).toBe(false);
    });
  });
  
  describe("canStartNewRound", () => {
    it("待機フェーズの場合はtrueを返す", () => {
      expect(canStartNewRound("waiting")).toBe(true);
    });
    
    it("精算フェーズの場合はtrueを返す", () => {
      expect(canStartNewRound("settlement")).toBe(true);
    });
    
    it("その他のフェーズではfalseを返す", () => {
      const phases: GamePhase[] = ["betting", "dealing", "playing", "dealer-turn"];
      phases.forEach(phase => {
        expect(canStartNewRound(phase)).toBe(false);
      });
    });
  });
});