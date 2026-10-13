import { motion, useReducedMotion } from 'motion/react'
import { SPRAYS, TAGS } from '../../data/about'
import { useScene } from '../../store/useScene'
import './About.css'

// Bombes de peinture pour le mur (scene/zones/About) + bio lisible par les lecteurs d'écran.
export default function AboutPanel() {
  const sprayColor = useScene((s) => s.sprayColor)
  const reduced = useReducedMotion()
  return (
    <>
      <p className="sr-only">{TAGS.map((t) => t.text).join('. ')}</p>
      <section className="spray-box" aria-label="Bombes de peinture">
        <span className="hint">Glisse sur le mur pour taguer</span>
        <div className="cans">
          {SPRAYS.map((s) => {
            const on = s.color === sprayColor
            return (
              <motion.button
                key={s.color}
                aria-label={s.name}
                aria-pressed={on}
                style={{ background: s.color }}
                initial={false} // pas de secousse à l'ouverture du panel, seulement au changement
                // bombe choisie : elle se lève et on la secoue (la bille claque : son sprayShake)
                animate={{ y: on ? '-0.4rem' : 0, rotate: on && !reduced ? [0, -16, 14, -10, 6, 0] : 0 }}
                transition={{ duration: on ? 0.4 : 0.12 }}
                onClick={() => useScene.setState({ sprayColor: s.color })}
              />
            )
          })}
        </div>
        <button className="wipe" onClick={() => useScene.setState((st) => ({ wallKey: st.wallKey + 1 }))}>
          Effacer
        </button>
      </section>
    </>
  )
}
