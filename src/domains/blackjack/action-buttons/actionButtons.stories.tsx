import type { Meta, StoryObj } from '@storybook/react';
import { ActionButtonsView } from './actionButtons.view';
import { useState } from 'react';
import type { ActionType } from './actionButtons.types';
import type { ActionButtonsProps } from './actionButtons.types';

const meta = {
  title: 'Domains/Blackjack/ActionButtons',
  component: ActionButtonsView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    participantId: {
      control: 'text',
      description: 'ID of the participant',
    },
    canHit: {
      control: 'boolean',
      description: 'Whether the Hit action is available',
    },
    canStand: {
      control: 'boolean',
      description: 'Whether the Stand action is available',
    },
    canDouble: {
      control: 'boolean',
      description: 'Whether the Double action is available',
    },
    canSplit: {
      control: 'boolean',
      description: 'Whether the Split action is available',
    },
    canSurrender: {
      control: 'boolean',
      description: 'Whether the Surrender action is available',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether all buttons are disabled',
    },
  },
} satisfies Meta<typeof ActionButtonsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllActionsAvailable: Story = {
  args: {
    participantId: 'player-1',
    canHit: true,
    canStand: true,
    canDouble: true,
    canSplit: true,
    canSurrender: true,
    onAction: (action: { type: ActionType }) => console.log('Action:', action),
    disabled: false,
  },
};

export const BasicActionsOnly: Story = {
  args: {
    participantId: 'player-1',
    canHit: true,
    canStand: true,
    canDouble: false,
    canSplit: false,
    canSurrender: false,
    onAction: (action: { type: ActionType }) => console.log('Action:', action),
    disabled: false,
  },
};

export const FirstTurnOptions: Story = {
  args: {
    participantId: 'player-1',
    canHit: true,
    canStand: true,
    canDouble: true,
    canSplit: false,
    canSurrender: true,
    onAction: (action: { type: ActionType }) => console.log('Action:', action),
    disabled: false,
  },
};

export const SplitAvailable: Story = {
  args: {
    participantId: 'player-1',
    canHit: true,
    canStand: true,
    canDouble: true,
    canSplit: true,
    canSurrender: false,
    onAction: (action: { type: ActionType }) => console.log('Action:', action),
    disabled: false,
  },
};

export const OnlyStandAvailable: Story = {
  args: {
    participantId: 'player-1',
    canHit: false,
    canStand: true,
    canDouble: false,
    canSplit: false,
    canSurrender: false,
    onAction: (action: { type: ActionType }) => console.log('Action:', action),
    disabled: false,
  },
};

export const AllDisabled: Story = {
  args: {
    participantId: 'player-1',
    canHit: true,
    canStand: true,
    canDouble: true,
    canSplit: true,
    canSurrender: true,
    onAction: (action: { type: ActionType }) => console.log('Action:', action),
    disabled: true,
  },
};

const InteractiveComponent = (args: ActionButtonsProps) => {
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [actionCount, setActionCount] = useState(0);

  const handleAction = (action: { type: ActionType }) => {
    setLastAction(action.type);
    setActionCount(count => count + 1);
    console.log('Action:', action);
  };

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '2rem',
        padding: '2rem',
        background: '#f3f4f6',
        borderRadius: '8px',
        minWidth: '400px',
      }}>
        <h3 style={{ margin: 0 }}>Interactive Action Buttons Demo</h3>
        
        <ActionButtonsView {...args} onAction={handleAction} />
        
        <div style={{ 
          textAlign: 'center',
          padding: '1rem',
          background: 'white',
          borderRadius: '4px',
          width: '100%',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>
            Last Action: {lastAction || 'None'}
          </p>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Total Actions: {actionCount}
          </p>
        </div>
      </div>
    );
};

export const Interactive: Story = {
  render: InteractiveComponent,
  args: {
    participantId: 'player-1',
    canHit: true,
    canStand: true,
    canDouble: true,
    canSplit: false,
    canSurrender: false,
    onAction: () => {}, // Will be overridden in the component
    disabled: false,
  },
};
