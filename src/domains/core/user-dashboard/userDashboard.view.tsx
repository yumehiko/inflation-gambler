import { useUser } from '../user/user.hook'
import { useGameSetup } from '../../blackjack/game-setup/gameSetup.hook'
import type { GameSetupConfig } from '../../blackjack/game-setup/gameSetup.types'
import styles from './userDashboard.module.css'

export function UserDashboardView() {
  const { user } = useUser()
  const { setupAndStartGame } = useGameSetup()

  const handlePlayBlackjack = async () => {
    try {
      // ゲームセットアップ設定を作成
      const gameConfig: GameSetupConfig = {
        userId: user.id,
        userName: user.name,
        userChips: user.coin.value,
        cpuCount: 3, // デフォルトで3人のCPUプレイヤー
        minBet: 10,
        maxBet: 1000,
        deckCount: 6,
      }
      
      console.log('Starting game with config:', gameConfig)
      await setupAndStartGame(gameConfig)
      console.log('Game started successfully')
    } catch (error) {
      console.error('Error starting game:', error)
    }
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.userInfo}>
        <h2 className={styles.userName}>{user.name}</h2>
        <div className={styles.coinBalance}>
          <span className={styles.coinLabel}>Coins:</span>
          <span className={styles.coinValue}>{user.coin.value}</span>
        </div>
      </div>
      
      <button 
        className={styles.playButton}
        onClick={handlePlayBlackjack}
        type="button"
      >
        Play Blackjack
      </button>
    </div>
  )
}