import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DealerView } from './dealer.view';
import { useDealer } from './dealer.hook';
import { Dealer } from './dealer.types';

// Mock the hook
vi.mock('./dealer.hook');

// Mock the Hand component
vi.mock('../hand/hand.view', () => ({
  HandView: ({ hand }: { hand: { value: number } }) => 
    <div data-testid="hand">Hand: {hand.value}</div>,
}));

describe('DealerView', () => {
  const mockDealer: Dealer = {
    id: 'dealer',
    hand: {
      cards: [],
      value: 17,
      isBust: false,
      isBlackjack: false,

    },
    isShowingHoleCard: true,
  };

  const mockUseDealer = {
    dealer: mockDealer,
    initializeDealer: vi.fn(),
    dealCard: vi.fn(),
    revealHoleCard: vi.fn(),
    shouldHit: vi.fn(),
    reset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useDealer as ReturnType<typeof vi.fn>).mockReturnValue(mockUseDealer);
  });

  it('should render dealer information', () => {
    render(<DealerView />);

    expect(screen.getByText('Dealer')).toBeInTheDocument();
    expect(screen.getByTestId('hand')).toBeInTheDocument();
  });

  it('should show waiting indicator when hole card is hidden', () => {
    (useDealer as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockUseDealer,
      dealer: {
        ...mockDealer,
        isShowingHoleCard: false,
      },
    });

    render(<DealerView />);

    expect(screen.getByText('Waiting...')).toBeInTheDocument();
  });

  it('should show bust indicator when dealer has busted', () => {
    (useDealer as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockUseDealer,
      dealer: {
        ...mockDealer,
        hand: {
          ...mockDealer.hand,
          isBust: true,
          value: 22,
        },
      },
    });

    render(<DealerView />);

    expect(screen.getByText('Bust!')).toBeInTheDocument();
  });

  it('should not render anything when dealer does not exist', () => {
    (useDealer as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockUseDealer,
      dealer: undefined,
    });

    const { container } = render(<DealerView />);

    expect(container.firstChild).toBeNull();
  });



  it('should not show waiting indicator when hole card is showing', () => {
    render(<DealerView />);

    expect(screen.queryByText('Waiting...')).not.toBeInTheDocument();
  });

  it('should have correct test id', () => {
    render(<DealerView />);

    expect(screen.getByTestId('dealer-view')).toBeInTheDocument();
  });
});