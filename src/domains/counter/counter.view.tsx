import { useCounter } from './counter.hook'
import styles from './counter.module.css'

export function Counter() {
  const { count, increment, decrement, reset } = useCounter()

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <button 
          onClick={decrement}
          className={styles.button}
          aria-label="-"
        >
          -
        </button>
        <span 
          className={styles.count}
          role="status"
          aria-label="Current count"
        >
          {count}
        </span>
        <button 
          onClick={increment}
          className={styles.button}
          aria-label="+"
        >
          +
        </button>
      </div>
      <button 
        onClick={reset}
        className={styles.resetButton}
      >
        Reset
      </button>
    </div>
  )
}