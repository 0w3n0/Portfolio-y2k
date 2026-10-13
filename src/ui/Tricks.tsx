import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useScene } from '../store/useScene'
import '../tricks' // abonne les figures à l'état de la scène
import './Tricks.css'

// Étiquettes BRC qui jaillissent du curseur et s'envolent, et compteur de combo en haut au centre.
export default function Tricks() {
  const tricks = useScene((s) => s.tricks)
  const combo = useScene((s) => s.combo)
  const reduced = useReducedMotion()

  return (
    <div className="tricks" aria-hidden>
      {tricks.map((t) => (
        <motion.div
          key={t.key}
          className="trick"
          style={{ left: t.x, top: t.y }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: 0 }}
          animate={reduced ? { opacity: [0, 1, 0] } : { opacity: [0, 1, 1, 0], scale: [0.4, 1.15, 1, 1], y: -90 }}
          transition={{ duration: 1.1, ease: 'easeOut', times: reduced ? undefined : [0, 0.15, 0.7, 1] }}
        >
          <span className="trick-label">+{t.label}</span>
          <span className="trick-pts">{t.pts}</span>
        </motion.div>
      ))}

      <AnimatePresence>
        {combo > 1 && (
          <motion.div
            className="combo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} // opacité seule : transform garde le biais CSS
            transition={{ duration: 0.2 }}
          >
            Combo{' '}
            <motion.b key={combo} initial={reduced ? false : { scale: 1.6 }} animate={{ scale: 1 }}>
              ×{combo}
            </motion.b>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
