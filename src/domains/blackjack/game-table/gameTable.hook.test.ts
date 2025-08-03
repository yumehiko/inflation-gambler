import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useGameTable } from './gameTable.hook';

// モックの設定
vi.mock('../game-flow/gameFlow.hook', () => ({
  useGameFlow: vi.fn(),
}));

vi.mock('../action-buttons/actionButtons.hook', () => ({
  useActionButtons: vi.fn(),
}));

vi.mock('../betting-input/bettingInput.hook', () => ({
  useBettingInput: vi.fn(),
}));

import { useGameFlow } from '../game-flow/gameFlow.hook';
import { useActionButtons } from '../action-buttons/actionButtons.hook';
import { useBettingInput } from '../betting-input/bettingInput.hook';

describe('useGameTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should show betting input when phase is betting', () => {
    vi.mocked(useGameFlow).mockReturnValue({
      game: null,
      initializeGame: vi.fn(),
      startGame: vi.fn(),
      proceedToNextPhase: vi.fn(),
      handlePlayerAction: vi.fn(),
      resetGame: vi.fn(),
      isGameComplete: false,
      currentPhase: 'betting',
    });
    
    const mockActionButtonsProps = {
      participantId: 'player-1',
      canHit: false,
      canStand: false,
      canDouble: false,
      canSplit: false,
      canSurrender: false,
      onAction: vi.fn(),
      disabled: true,
      isWaitingForAction: false,
    };
    vi.mocked(useActionButtons).mockReturnValue(mockActionButtonsProps);
    
    const mockBettingInputProps = {
      balance: 1000,
      currentBet: 0,
      minBet: 10,
      maxBet: 1000,
      onBetChange: vi.fn(),
      onBetConfirm: vi.fn(),
      disabled: false,
    };
    vi.mocked(useBettingInput).mockReturnValue(mockBettingInputProps);
    
    const { result } = renderHook(() => useGameTable());
    
    expect(result.current.phase).toBe('betting');
    expect(result.current.showBettingInput).toBe(true);
    expect(result.current.showActionButtons).toBe(false);
  });
  
  it('should show action buttons when phase is playing', () => {
    vi.mocked(useGameFlow).mockReturnValue({
      game: null,
      initializeGame: vi.fn(),
      startGame: vi.fn(),
      proceedToNextPhase: vi.fn(),
      handlePlayerAction: vi.fn(),
      resetGame: vi.fn(),
      isGameComplete: false,
      currentPhase: 'playing',
    });
    
    const mockActionButtonsProps = {
      participantId: 'player-1',
      canHit: true,
      canStand: true,
      canDouble: true,
      canSplit: false,
      canSurrender: true,
      onAction: vi.fn(),
      disabled: false,
      isWaitingForAction: true,
    };
    vi.mocked(useActionButtons).mockReturnValue(mockActionButtonsProps);
    
    const mockBettingInputProps = {
      participantId: 'player-1',
      balance: 1000,
      currentBet: 100,
      minBet: 10,
      maxBet: 1000,
      onBetChange: vi.fn(),
      onBetConfirm: vi.fn(),
      currentChips: 1000,
      onBetSubmit: vi.fn(),
      disabled: true,
      isWaitingForBet: false,
    };
    vi.mocked(useBettingInput).mockReturnValue(mockBettingInputProps);
    
    const { result } = renderHook(() => useGameTable());
    
    expect(result.current.phase).toBe('playing');
    expect(result.current.showBettingInput).toBe(false);
    expect(result.current.showActionButtons).toBe(true);
  });
  
  it('should not show any input when phase is neither betting nor playing', () => {
    vi.mocked(useGameFlow).mockReturnValue({
      game: null,
      initializeGame: vi.fn(),
      startGame: vi.fn(),
      proceedToNextPhase: vi.fn(),
      handlePlayerAction: vi.fn(),
      resetGame: vi.fn(),
      isGameComplete: false,
      currentPhase: 'dealing',
    });
    
    const mockActionButtonsProps = {
      participantId: 'player-1',
      canHit: false,
      canStand: false,
      canDouble: false,
      canSplit: false,
      canSurrender: false,
      onAction: vi.fn(),
      disabled: true,
      isWaitingForAction: false,
    };
    vi.mocked(useActionButtons).mockReturnValue(mockActionButtonsProps);
    
    const mockBettingInputProps = {
      participantId: 'player-1',
      balance: 1000,
      currentBet: 100,
      minBet: 10,
      maxBet: 1000,
      onBetChange: vi.fn(),
      onBetConfirm: vi.fn(),
      currentChips: 1000,
      onBetSubmit: vi.fn(),
      disabled: true,
      isWaitingForBet: false,
    };
    vi.mocked(useBettingInput).mockReturnValue(mockBettingInputProps);
    
    const { result } = renderHook(() => useGameTable());
    
    expect(result.current.phase).toBe('dealing');
    expect(result.current.showBettingInput).toBe(false);
    expect(result.current.showActionButtons).toBe(false);
  });
});