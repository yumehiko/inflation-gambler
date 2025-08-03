import { useUser } from '../user/user.hook'
import styles from './userDashboard.module.css'

export function UserDashboardView() {
  const { user } = useUser()

  const handlePlayBlackjack = () => {
    // TODO: Implement navigation to blackjack game
    console.log('Play Blackjack clicked')
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