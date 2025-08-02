import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameSetup } from './gameSetup.view';
import type { ParticipantSetup } from './gameSetup.types';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('GameSetup', () => {
  const mockOnStartGame = vi.fn();

  beforeEach(() => {
    mockOnStartGame.mockClear();
  });

  it('renders the game setup form', () => {
    render(<GameSetup onStartGame={mockOnStartGame} />);
    
    expect(screen.getByText('ゲームセットアップ')).toBeInTheDocument();
    expect(screen.getByLabelText('プレイヤー名')).toBeInTheDocument();
    expect(screen.getByLabelText('初期残高')).toBeInTheDocument();
    expect(screen.getByLabelText('人間プレイヤー')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'プレイヤーを追加' })).toBeInTheDocument();
    expect(screen.getByText('ゲームを開始', { selector: 'button' })).toBeInTheDocument();
  });

  it('adds a player with valid input', async () => {
    const user = userEvent.setup();
    render(<GameSetup onStartGame={mockOnStartGame} defaultBalance={1000} />);
    
    const nameInput = screen.getByLabelText('プレイヤー名');
    const balanceInput = screen.getByLabelText('初期残高');
    const addButton = screen.getByRole('button', { name: 'プレイヤーを追加' });
    
    await user.type(nameInput, 'プレイヤー1');
    await user.clear(balanceInput);
    await user.type(balanceInput, '2000');
    await user.click(addButton);
    
    expect(screen.getByText('プレイヤー1')).toBeInTheDocument();
    expect(screen.getByText('¥2,000')).toBeInTheDocument();
    expect(screen.getByText('人間')).toBeInTheDocument();
  });

  it('shows validation error for empty name', async () => {
    const user = userEvent.setup();
    render(<GameSetup onStartGame={mockOnStartGame} />);
    
    const addButton = screen.getByRole('button', { name: 'プレイヤーを追加' });
    await user.click(addButton);
    
    expect(screen.getByText('プレイヤー名を入力してください')).toBeInTheDocument();
  });

  it('shows validation error for invalid balance', async () => {
    const user = userEvent.setup();
    render(<GameSetup onStartGame={mockOnStartGame} />);
    
    const nameInput = screen.getByLabelText('プレイヤー名');
    const balanceInput = screen.getByLabelText('初期残高');
    const addButton = screen.getByRole('button', { name: 'プレイヤーを追加' });
    
    await user.type(nameInput, 'プレイヤー1');
    await user.clear(balanceInput);
    await user.type(balanceInput, '0');
    await user.click(addButton);
    
    expect(screen.getByText('初期残高は1以上の数値を入力してください')).toBeInTheDocument();
  });

  it('removes a player from the list', async () => {
    const user = userEvent.setup();
    render(<GameSetup onStartGame={mockOnStartGame} />);
    
    const nameInput = screen.getByLabelText('プレイヤー名');
    const addButton = screen.getByRole('button', { name: 'プレイヤーを追加' });
    
    await user.type(nameInput, 'プレイヤー1');
    await user.click(addButton);
    
    const removeButton = screen.getByLabelText('プレイヤー1を削除');
    await user.click(removeButton);
    
    expect(screen.queryByText('プレイヤー1')).not.toBeInTheDocument();
  });

  it('prevents adding players beyond max limit', async () => {
    const user = userEvent.setup();
    render(<GameSetup onStartGame={mockOnStartGame} maxPlayers={2} />);
    
    const nameInput = screen.getByLabelText('プレイヤー名');
    const addButton = screen.getByRole('button', { name: 'プレイヤーを追加' });
    
    await user.type(nameInput, 'プレイヤー1');
    await user.click(addButton);
    await user.clear(nameInput);
    await user.type(nameInput, 'プレイヤー2');
    await user.click(addButton);
    
    expect(addButton).toBeDisabled();
  });

  it('starts the game with at least one player', async () => {
    const user = userEvent.setup();
    render(<GameSetup onStartGame={mockOnStartGame} />);
    
    const nameInput = screen.getByLabelText('プレイヤー名');
    const balanceInput = screen.getByLabelText('初期残高');
    const addButton = screen.getByRole('button', { name: 'プレイヤーを追加' });
    const startButton = screen.getByText('ゲームを開始', { selector: 'button' });
    
    expect(startButton).toBeDisabled();
    
    await user.type(nameInput, 'プレイヤー1');
    await user.clear(balanceInput);
    await user.type(balanceInput, '1500');
    await user.click(addButton);
    
    expect(startButton).toBeEnabled();
    
    await user.click(startButton);
    
    const expectedParticipants: ParticipantSetup[] = [
      {
        name: 'プレイヤー1',
        balance: 1500,
        isHuman: true
      }
    ];
    
    expect(mockOnStartGame).toHaveBeenCalledWith(expectedParticipants);
  });

  it('toggles between human and AI player', async () => {
    const user = userEvent.setup();
    render(<GameSetup onStartGame={mockOnStartGame} />);
    
    const nameInput = screen.getByLabelText('プレイヤー名');
    const humanToggle = screen.getByLabelText('人間プレイヤー');
    const addButton = screen.getByRole('button', { name: 'プレイヤーを追加' });
    
    await user.type(nameInput, 'AIプレイヤー');
    await user.click(humanToggle);
    await user.click(addButton);
    
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('uses default balance when provided', () => {
    render(<GameSetup onStartGame={mockOnStartGame} defaultBalance={5000} />);
    
    const balanceInput = screen.getByLabelText('初期残高') as HTMLInputElement;
    expect(balanceInput.value).toBe('5000');
  });

  it('clears form after adding a player', async () => {
    const user = userEvent.setup();
    render(<GameSetup onStartGame={mockOnStartGame} />);
    
    const nameInput = screen.getByLabelText('プレイヤー名') as HTMLInputElement;
    const balanceInput = screen.getByLabelText('初期残高') as HTMLInputElement;
    const humanToggle = screen.getByLabelText('人間プレイヤー') as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: 'プレイヤーを追加' });
    
    await user.type(nameInput, 'プレイヤー1');
    await user.clear(balanceInput);
    await user.type(balanceInput, '2000');
    await user.click(humanToggle);
    await user.click(addButton);
    
    expect(nameInput.value).toBe('');
    expect(balanceInput.value).toBe('1000');
    expect(humanToggle.checked).toBe(true);
  });
});