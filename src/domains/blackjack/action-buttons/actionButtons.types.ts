import type { GameAction } from '../game-controller/gameController.types';

export type ActionButtonsProps = {
  readonly participantId: string;
  readonly canHit: boolean;
  readonly canStand: boolean;
  readonly canDouble: boolean;
  readonly canSplit: boolean;
  readonly canSurrender: boolean;
  readonly onAction: (action: GameAction) => void;
  readonly disabled?: boolean;
};