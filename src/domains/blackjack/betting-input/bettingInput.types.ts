export type BettingInputProps = {
  readonly participantId: string;
  readonly balance: number;
  readonly minBet: number;
  readonly maxBet: number;
  readonly currentBet: number;
  readonly onBetChange: (amount: number) => void;
  readonly onBetConfirm: () => void;
  readonly disabled?: boolean;
};