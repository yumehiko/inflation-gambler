import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ActionButtonsView } from './actionButtons.view';
import type { ActionButtonsProps } from './actionButtons.types';


describe('ActionButtonsView', () => {
  const defaultProps: ActionButtonsProps = {
    participantId: 'test-player',
    canHit: true,
    canStand: true,
    canDouble: false,
    canSplit: false,
    canSurrender: false,
    onAction: vi.fn(),
    disabled: false,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ボタンの表示', () => {
    it('Hitボタンが有効な場合、表示される', () => {
      render(<ActionButtonsView {...defaultProps} canHit={true} />);
      const hitButton = screen.getByRole('button', { name: /hit/i });
      expect(hitButton).toBeInTheDocument();
      expect(hitButton).not.toBeDisabled();
    });

    it('Standボタンが有効な場合、表示される', () => {
      render(<ActionButtonsView {...defaultProps} canStand={true} />);
      const standButton = screen.getByRole('button', { name: /stand/i });
      expect(standButton).toBeInTheDocument();
      expect(standButton).not.toBeDisabled();
    });

    it('Doubleボタンが有効な場合、表示される', () => {
      render(<ActionButtonsView {...defaultProps} canDouble={true} />);
      const doubleButton = screen.getByRole('button', { name: /double/i });
      expect(doubleButton).toBeInTheDocument();
      expect(doubleButton).not.toBeDisabled();
    });

    it('Splitボタンが有効な場合、表示される', () => {
      render(<ActionButtonsView {...defaultProps} canSplit={true} />);
      const splitButton = screen.getByRole('button', { name: /split/i });
      expect(splitButton).toBeInTheDocument();
      expect(splitButton).not.toBeDisabled();
    });

    it('Surrenderボタンが有効な場合、表示される', () => {
      render(<ActionButtonsView {...defaultProps} canSurrender={true} />);
      const surrenderButton = screen.getByRole('button', { name: /surrender/i });
      expect(surrenderButton).toBeInTheDocument();
      expect(surrenderButton).not.toBeDisabled();
    });
  });

  describe('ボタンの無効化', () => {
    it('canHitがfalseの場合、Hitボタンが無効', () => {
      render(<ActionButtonsView {...defaultProps} canHit={false} />);
      const hitButton = screen.getByRole('button', { name: /hit/i });
      expect(hitButton).toBeDisabled();
    });

    it('disabledがtrueの場合、すべてのボタンが無効', () => {
      render(<ActionButtonsView {...defaultProps} 
        canHit={true}
        canStand={true}
        canDouble={true}
        canSplit={true}
        canSurrender={true}
        disabled={true} 
      />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('アクションの実行', () => {
    it('Hitボタンをクリックすると、onActionがhitアクションで呼ばれる', () => {
      const onAction = vi.fn();
      render(<ActionButtonsView {...defaultProps} onAction={onAction} />);
      
      const hitButton = screen.getByRole('button', { name: /hit/i });
      fireEvent.click(hitButton);
      
      expect(onAction).toHaveBeenCalledWith({ type: 'hit' });
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('Standボタンをクリックすると、onActionがstandアクションで呼ばれる', () => {
      const onAction = vi.fn();
      render(<ActionButtonsView {...defaultProps} onAction={onAction} />);
      
      const standButton = screen.getByRole('button', { name: /stand/i });
      fireEvent.click(standButton);
      
      expect(onAction).toHaveBeenCalledWith({ type: 'stand' });
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('Doubleボタンをクリックすると、onActionがdoubleアクションで呼ばれる', () => {
      const onAction = vi.fn();
      render(<ActionButtonsView {...defaultProps} canDouble={true} onAction={onAction} />);
      
      const doubleButton = screen.getByRole('button', { name: /double/i });
      fireEvent.click(doubleButton);
      
      expect(onAction).toHaveBeenCalledWith({ type: 'double' });
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('Splitボタンをクリックすると、onActionがsplitアクションで呼ばれる', () => {
      const onAction = vi.fn();
      render(<ActionButtonsView {...defaultProps} canSplit={true} onAction={onAction} />);
      
      const splitButton = screen.getByRole('button', { name: /split/i });
      fireEvent.click(splitButton);
      
      expect(onAction).toHaveBeenCalledWith({ type: 'split' });
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('Surrenderボタンをクリックすると、onActionがsurrenderアクションで呼ばれる', () => {
      const onAction = vi.fn();
      render(<ActionButtonsView {...defaultProps} canSurrender={true} onAction={onAction} />);
      
      const surrenderButton = screen.getByRole('button', { name: /surrender/i });
      fireEvent.click(surrenderButton);
      
      expect(onAction).toHaveBeenCalledWith({ type: 'surrender' });
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('無効なボタンをクリックしても、onActionが呼ばれない', () => {
      const onAction = vi.fn();
      render(<ActionButtonsView {...defaultProps} canHit={false} onAction={onAction} />);
      
      const hitButton = screen.getByRole('button', { name: /hit/i });
      fireEvent.click(hitButton);
      
      expect(onAction).not.toHaveBeenCalled();
    });
  });

  describe('アクセシビリティ', () => {
    it('すべてのボタンに適切なaria-labelが設定されている', () => {
      render(<ActionButtonsView {...defaultProps} 
        canHit={true}
        canStand={true}
        canDouble={true}
        canSplit={true}
        canSurrender={true}
      />);
      
      expect(screen.getByRole('button', { name: /hit/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /stand/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /double/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /split/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /surrender/i })).toHaveAttribute('aria-label');
    });

    it('ボタンコンテナに適切なroleとaria-labelが設定されている', () => {
      render(<ActionButtonsView {...defaultProps} />);
      
      const container = screen.getByRole('group', { name: /player actions/i });
      expect(container).toBeInTheDocument();
    });
  });
});