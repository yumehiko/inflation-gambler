import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameTableView } from './gameTable.view';

// モックの設定
vi.mock('./gameTable.hook', () => ({
  useGameTable: vi.fn(),
}));

vi.mock('../dealer/dealer.view', () => ({
  DealerView: vi.fn(() => <div data-testid="dealer-view">Dealer</div>),
}));

vi.mock('../player/player.view', () => ({
  PlayerView: vi.fn(({ playerId }) => <div data-testid="player-view">{playerId}</div>),
}));

vi.mock('../action-buttons/actionButtons.view', () => ({
  ActionButtonsView: vi.fn(({ participantId }) => <div data-testid="action-buttons">{participantId}</div>),
}));

vi.mock('../betting-input/bettingInput.view', () => ({
  BettingInputView: vi.fn(({ participantId }) => <div data-testid="betting-input">{participantId}</div>),
}));

import { useGameTable } from './gameTable.hook';

describe('GameTableView', () => {
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
  
  const mockBettingInputProps = {
    balance: 1000,
    currentBet: 0,
    minBet: 10,
    maxBet: 1000,
    onBetChange: vi.fn(),
    onBetConfirm: vi.fn(),
    disabled: false,
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should render dealer and player views', () => {
    vi.mocked(useGameTable).mockReturnValue({
      phase: 'waiting',
      playerId: 'player-1',
      actionButtonsProps: mockActionButtonsProps,
      bettingInputProps: mockBettingInputProps,
      showBettingInput: false,
      showActionButtons: false,
    });
    
    render(<GameTableView />);
    
    expect(screen.getByTestId('dealer-view')).toBeInTheDocument();
    expect(screen.getByTestId('player-view')).toBeInTheDocument();
  });
  
  it('should show betting input when in betting phase', () => {
    vi.mocked(useGameTable).mockReturnValue({
      phase: 'betting',
      playerId: 'player-1',
      actionButtonsProps: mockActionButtonsProps,
      bettingInputProps: mockBettingInputProps,
      showBettingInput: true,
      showActionButtons: false,
    });
    
    render(<GameTableView />);
    
    expect(screen.getByTestId('betting-input')).toBeInTheDocument();
    expect(screen.queryByTestId('action-buttons')).not.toBeInTheDocument();
  });
  
  it('should show action buttons when in playing phase', () => {
    vi.mocked(useGameTable).mockReturnValue({
      phase: 'playing',
      playerId: 'player-1',
      actionButtonsProps: mockActionButtonsProps,
      bettingInputProps: mockBettingInputProps,
      showBettingInput: false,
      showActionButtons: true,
    });
    
    render(<GameTableView />);
    
    expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
    expect(screen.queryByTestId('betting-input')).not.toBeInTheDocument();
  });
  
  it('should not show any input controls when in other phases', () => {
    vi.mocked(useGameTable).mockReturnValue({
      phase: 'dealing',
      playerId: 'player-1',
      actionButtonsProps: mockActionButtonsProps,
      bettingInputProps: mockBettingInputProps,
      showBettingInput: false,
      showActionButtons: false,
    });
    
    render(<GameTableView />);
    
    expect(screen.queryByTestId('action-buttons')).not.toBeInTheDocument();
    expect(screen.queryByTestId('betting-input')).not.toBeInTheDocument();
  });
  
  it('should apply custom className', () => {
    vi.mocked(useGameTable).mockReturnValue({
      phase: 'waiting',
      playerId: 'player-1',
      actionButtonsProps: mockActionButtonsProps,
      bettingInputProps: mockBettingInputProps,
      showBettingInput: false,
      showActionButtons: false,
    });
    
    const { container } = render(<GameTableView className="custom-class" />);
    
    const gameTable = container.firstChild as HTMLElement;
    expect(gameTable.classList.contains('custom-class')).toBe(true);
  });
});