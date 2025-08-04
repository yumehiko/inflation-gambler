import { useGameFlow } from '../game-flow/gameFlow.hook';
import { useActionButtons } from '../action-buttons/actionButtons.hook';
import { useBettingInput } from '../betting-input/bettingInput.hook';
import { usePlayerStore } from '../player/player.hook';

export const useGameTable = () => {
  const { currentPhase, proceedToNextPhase } = useGameFlow();
  const { players } = usePlayerStore();
  
  // ユーザープレイヤーを探す（brain.typeがhumanのプレイヤー）
  const userPlayer = players.find((p) => p.brain.type === 'human');
  const playerId = userPlayer?.id || '';
  
  // ActionButtonsのpropsを取得（playing フェーズでのみ使用）
  const actionButtonsProps = useActionButtons(playerId);
  
  // BettingInputのpropsを取得（betting フェーズでのみ使用）
  const bettingInputProps = useBettingInput(
    userPlayer?.chips || 0,
    10, // TODO: ゲーム設定から取得
    Math.min(userPlayer?.chips || 0, 500), // 最大ベット額は所持チップか500の小さい方
    async (amount) => {
      console.log('Bet confirmed in gameTable.hook:', amount);
      // ベットが確定したら次のフェーズに進む
      await proceedToNextPhase();
    }
  );
  
  // フェーズに応じた表示制御
  const showBettingInput = currentPhase === 'betting';
  const showActionButtons = currentPhase === 'playing';
  
  return {
    phase: currentPhase,
    players, // すべてのプレイヤーを返す
    playerId,
    actionButtonsProps,
    bettingInputProps,
    showBettingInput,
    showActionButtons,
  };
};