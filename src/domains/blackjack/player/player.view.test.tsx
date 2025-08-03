import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerView } from './player.view';
import { usePlayer } from './player.hook';
import { Player } from './player.types';

// Mock the hook
vi.mock('./player.hook');

// Mock the Hand component
vi.mock('../hand/hand.view', () => ({
  HandView: ({ hand }: { hand: { value: number } }) => <div data-testid="hand">Hand: {hand.value}</div>,
}));

describe('PlayerView', () => {
  const mockPlayer: Player = {
    id: 'player1',
    name: 'John',
    hand: {
      cards: [],
      value: 20,
      isBust: false,
      isBlackjack: false,
    },
    brain: {
      type: 'human',
      makeDecision: async () => 'stand',
      decideBet: async () => 100,
    },
    chips: 1000,
    currentBet: 100,
    isActive: false,
    hasStood: false,
    hasBusted: false,
  };

  const mockUsePlayer = {
    player: mockPlayer,
    isActive: false,
    isHuman: true,
    canAct: false,
    placeBet: vi.fn(),
    stand: vi.fn(),
    updateHand: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (usePlayer as ReturnType<typeof vi.fn>).mockReturnValue(mockUsePlayer);
  });

  it('should render player information', () => {
    render(<PlayerView playerId="player1" />);

    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Chips: 1000')).toBeInTheDocument();
    expect(screen.getByText('Bet: 100')).toBeInTheDocument();
    expect(screen.getByTestId('hand')).toBeInTheDocument();
  });

  it('should show human indicator for human player', () => {
    render(<PlayerView playerId="player1" />);

    expect(screen.getByText('Human')).toBeInTheDocument();
  });

  it('should show CPU indicator for CPU player', () => {
    (usePlayer as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockUsePlayer,
      isHuman: false,
      player: {
        ...mockPlayer,
        brain: { type: 'cpu-easy', makeDecision: async () => 'hit' },
      },
    });

    render(<PlayerView playerId="player1" />);

    expect(screen.getByText('CPU')).toBeInTheDocument();
  });

  it('should show active indicator when player is active', () => {
    (usePlayer as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockUsePlayer,
      isActive: true,
    });

    render(<PlayerView playerId="player1" />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should show bust indicator when player has busted', () => {
    (usePlayer as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockUsePlayer,
      player: {
        ...mockPlayer,
        hasBusted: true,
      },
    });

    render(<PlayerView playerId="player1" />);

    expect(screen.getByText('Bust!')).toBeInTheDocument();
  });

  it('should show stand indicator when player has stood', () => {
    (usePlayer as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockUsePlayer,
      player: {
        ...mockPlayer,
        hasStood: true,
      },
    });

    render(<PlayerView playerId="player1" />);

    expect(screen.getByText('Stand')).toBeInTheDocument();
  });

  it('should not render anything when player does not exist', () => {
    (usePlayer as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockUsePlayer,
      player: undefined,
    });

    const { container } = render(<PlayerView playerId="player1" />);

    expect(container.firstChild).toBeNull();
  });

  it('should apply active class when player is active', () => {
    (usePlayer as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockUsePlayer,
      isActive: true,
    });

    render(<PlayerView playerId="player1" />);

    const playerElement = screen.getByTestId('player-view');
    expect(playerElement.className).toContain('active');
  });
});