import type { Card } from './card.types'
import styles from './card.module.css'

type CardProps = {
  card: Card
}

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  spades: '♠',
  clubs: '♣',
} as const

export function CardView({ card }: CardProps) {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds'
  const suitClass = isRed ? styles.red : styles.black

  return (
    <div 
      className={`${styles.card} ${suitClass}`}
      aria-label={`${card.rank} of ${card.suit}`}
    >
      <div className={styles.rank}>{card.rank}</div>
      <div className={styles.suit}>{suitSymbols[card.suit]}</div>
    </div>
  )
}