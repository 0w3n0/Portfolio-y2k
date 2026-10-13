import { motion } from 'motion/react'
import { useScene } from '../store/useScene'
import './SpeedLines.css'

// Lignes de vitesse manga sur les bords de l'écran, rejouées à chaque téléportation (hopAt, Hero).
export default function SpeedLines() {
  const dashing = useScene((s) => s.dashing)
  const hopAt = useScene((s) => s.hopAt)
  if (!dashing) return null
  return (
    <motion.div
      key={hopAt}
      className="speedlines"
      aria-hidden
      initial={{ opacity: 0.85, scale: 1.15 }}
      animate={{ opacity: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    />
  )
}
