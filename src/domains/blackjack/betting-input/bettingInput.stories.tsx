import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { BettingInputView } from "./bettingInput.view";
import { BettingInputProps } from "./bettingInput.types";

const meta = {
  title: "Blackjack/BettingInput",
  component: BettingInputView,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    balance: {
      control: { type: "number", min: 0, max: 10000, step: 100 },
    },
    minBet: {
      control: { type: "number", min: 1, max: 100, step: 1 },
    },
    maxBet: {
      control: { type: "number", min: 100, max: 5000, step: 100 },
    },
    currentBet: {
      control: { type: "number", min: 0, max: 5000, step: 10 },
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof BettingInputView>;

export default meta;
type Story = StoryObj<typeof meta>;

const InteractiveComponent = (args: BettingInputProps) => {
  const [currentBet, setCurrentBet] = useState(args.currentBet);
  const [betHistory, setBetHistory] = useState<number[]>([]);

  const handleBetChange = (amount: number) => {
    setCurrentBet(amount);
  };

  const handleBetConfirm = () => {
    setBetHistory([...betHistory, currentBet]);
    alert(`Bet confirmed: $${currentBet}`);
  };

  return (
    <div style={{ width: "100%", minWidth: "400px" }}>
      <BettingInputView
        {...args}
        currentBet={currentBet}
        onBetChange={handleBetChange}
        onBetConfirm={handleBetConfirm}
      />
      {betHistory.length > 0 && (
        <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f3f4f6", borderRadius: "8px" }}>
          <h4 style={{ margin: "0 0 0.5rem 0" }}>Bet History:</h4>
          <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
            {betHistory.map((bet, index) => (
              <li key={index}>${bet}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const Default: Story = {
  args: {
    participantId: "player1",
    balance: 1000,
    minBet: 10,
    maxBet: 500,
    currentBet: 0,
    onBetChange: () => {},
    onBetConfirm: () => {},
  },
};

export const WithInitialBet: Story = {
  args: {
    ...Default.args,
    currentBet: 50,
  },
};

export const LowBalance: Story = {
  args: {
    ...Default.args,
    balance: 100,
    maxBet: 500,
  },
};

export const HighRoller: Story = {
  args: {
    ...Default.args,
    balance: 10000,
    minBet: 100,
    maxBet: 5000,
    currentBet: 500,
  },
};

export const AtMaximumBet: Story = {
  args: {
    ...Default.args,
    currentBet: 500,
  },
};

export const BelowMinimum: Story = {
  args: {
    ...Default.args,
    currentBet: 5,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    currentBet: 100,
    disabled: true,
  },
};

export const Interactive: Story = {
  render: (args) => <InteractiveComponent {...args} />,
  args: {
    participantId: "player1",
    balance: 1000,
    minBet: 10,
    maxBet: 500,
    currentBet: 0,
    onBetChange: () => {},
    onBetConfirm: () => {},
  },
};