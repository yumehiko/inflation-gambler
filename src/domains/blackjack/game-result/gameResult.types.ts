import type { Hand } from "../hand/hand.types";
import type { ParticipantResult } from "../game-controller/gameController.types";

export type GameResultProps = {
  results: ParticipantResult[];
  dealerHand: Hand;
  onNextRound: () => void;
  onEndGame: () => void;
};