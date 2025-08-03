import { useGameFlow } from '../game-flow/gameFlow.hook';
import { useActionButtons } from '../action-buttons/actionButtons.hook';
import { useBettingInput } from '../betting-input/bettingInput.hook';

export const useGameTable = () => {
  const { currentPhase } = useGameFlow();
  
  // ActionButtonsのpropsを取得（playing フェーズでのみ使用）
  const actionButtonsProps = useActionButtons('player-1');
  
  // BettingInputのpropsを取得（betting フェーズでのみ使用）
  // TODO: 実際のプレイヤーのバランスとベット設定を使用するように更新
  const bettingInputProps = useBettingInput(1000, 10, 1000, (amount) => {
    console.log('Bet confirmed:', amount);
  });
  
  // フェーズに応じた表示制御
  const showBettingInput = currentPhase === 'betting';
  const showActionButtons = currentPhase === 'playing';
  
  return {
    phase: currentPhase,
    playerId: 'player-1',
    actionButtonsProps,
    bettingInputProps,
    showBettingInput,
    showActionButtons,
  };
};