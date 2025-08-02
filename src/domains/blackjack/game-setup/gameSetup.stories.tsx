import type { Meta, StoryObj } from '@storybook/react';
import { GameSetup } from './gameSetup.view';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Domains/Blackjack/GameSetup',
  component: GameSetup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultBalance: {
      control: { type: 'number', min: 1, max: 10000, step: 100 }
    },
    maxPlayers: {
      control: { type: 'number', min: 1, max: 8, step: 1 }
    }
  }
} satisfies Meta<typeof GameSetup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onStartGame: action('onStartGame'),
    defaultBalance: 1000,
    maxPlayers: 4
  }
};

export const WithHighDefaultBalance: Story = {
  args: {
    onStartGame: action('onStartGame'),
    defaultBalance: 5000,
    maxPlayers: 4
  }
};

export const TwoPlayerLimit: Story = {
  args: {
    onStartGame: action('onStartGame'),
    defaultBalance: 1000,
    maxPlayers: 2
  }
};

export const SinglePlayerOnly: Story = {
  args: {
    onStartGame: action('onStartGame'),
    defaultBalance: 1000,
    maxPlayers: 1
  }
};

export const WithPrefilledPlayers: Story = {
  render: (args) => {
    return <GameSetup {...args} />;
  },
  args: {
    onStartGame: action('onStartGame'),
    defaultBalance: 1000,
    maxPlayers: 4
  },
  play: async ({ canvasElement }) => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    await delay(500);
    
    const nameInput = canvasElement.querySelector('#playerName') as HTMLInputElement;
    const balanceInput = canvasElement.querySelector('#playerBalance') as HTMLInputElement;
    const addButton = canvasElement.querySelector('button[class*="addButton"]') as HTMLButtonElement;
    
    if (nameInput && balanceInput && addButton) {
      nameInput.value = 'プレイヤー1';
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));
      await delay(200);
      
      balanceInput.value = '2000';
      balanceInput.dispatchEvent(new Event('change', { bubbles: true }));
      await delay(200);
      
      addButton.click();
      await delay(500);
      
      nameInput.value = 'AIプレイヤー';
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));
      await delay(200);
      
      const humanToggle = canvasElement.querySelector('#isHuman') as HTMLInputElement;
      if (humanToggle) {
        humanToggle.click();
      }
      await delay(200);
      
      addButton.click();
    }
  }
};

export const MaxPlayersReached: Story = {
  render: (args) => {
    return <GameSetup {...args} />;
  },
  args: {
    onStartGame: action('onStartGame'),
    defaultBalance: 1000,
    maxPlayers: 2
  },
  play: async ({ canvasElement }) => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    await delay(500);
    
    const nameInput = canvasElement.querySelector('#playerName') as HTMLInputElement;
    const addButton = canvasElement.querySelector('button[class*="addButton"]') as HTMLButtonElement;
    
    if (nameInput && addButton) {
      for (let i = 1; i <= 2; i++) {
        nameInput.value = `プレイヤー${i}`;
        nameInput.dispatchEvent(new Event('change', { bubbles: true }));
        await delay(200);
        
        addButton.click();
        await delay(300);
      }
    }
  }
};