export type ParticipantSetup = {
  name: string;
  balance: number;
  isHuman: boolean;
};

export type GameSetupProps = {
  onStartGame: (participants: ParticipantSetup[]) => void;
  defaultBalance?: number;
  maxPlayers?: number;
};

export type GameSetupFormData = {
  name: string;
  balance: string;
  isHuman: boolean;
};

export type GameSetupFormErrors = {
  name?: string;
  balance?: string;
  general?: string;
};