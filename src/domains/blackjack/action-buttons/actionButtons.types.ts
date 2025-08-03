
export type ActionType = 'hit' | 'stand' | 'double' | 'split' | 'surrender' | 'insurance';

export type ActionButtonsProps = {
  readonly participantId: string;
  readonly canHit: boolean;
  readonly canStand: boolean;
  readonly canDouble: boolean;
  readonly canSplit: boolean;
  readonly canSurrender: boolean;
  readonly onAction: (action: { type: ActionType }) => void;
  readonly disabled?: boolean;
};