import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useScene, type ZoneId } from '../store/useScene'
import AboutPanel from './panels/About'
import ContactPanel from './panels/Contact'
import ProjectsPanel from './panels/Projects'
import SkillsPanel from './panels/Skills'
import lockup from '../../design-system/logos/lockup-slab.svg'
import './Menu.css'

const ITEMS: { id: ZoneId; label: string }[] = [
  { id: 'projects', label: 'Projets' },
  { id: 'skills', label: 'Skills' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

const EASE = [0.76, 0, 0.24, 1] as const
const SWIPE_S = 0.6
const FADE_S = 0.3 // fondu 150 ms aller + 150 ms retour

export default function Menu() {
  const mode = useScene((s) => s.mode)
  const zoneId = useScene((s) => s.zoneId)
  const reduced = useReducedMotion()
  const [swipe, setSwipe] = useState(0) // clé du balayage en cours, 0 = aucun
  const busy = useRef(false)

  // Le store change quand la bande couvre l'écran (mi-parcours) → la caméra part, l'UI change à l'abri.
  const go = (zone: ZoneId | null) => {
    if (busy.current) return // pas isTransitioning : le rig sait changer de cible en plein vol
    busy.current = true
    setSwipe(Date.now())
    const total = reduced ? FADE_S : SWIPE_S + 0.08
    setTimeout(() => {
      useScene.setState(
        zone ? { mode: 'zone', zoneId: zone, scrollProgress: 0, projectId: null } : { mode: 'overview', zoneId: null, scrollProgress: 0, projectId: null },
      )
    }, (total / 2) * 1000)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const { mode, projectId } = useScene.getState()
      if (projectId) useScene.setState({ projectId: null }) // Échap ferme d'abord la fiche projet
      else if (mode === 'zone') go(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const done = () => {
    busy.current = false
    setSwipe(0)
  }

  return (
    <>
      {mode === 'overview' ? (
        <>
          <img className="lockup" src={lockup} alt="Owen Donnars" />
          <nav className="menu" aria-label="Quartiers">
            <ul>
              {ITEMS.map((it, i) => (
                <li key={it.id} style={{ '--i': i } as CSSProperties}>
                  <button className="menu-item" onClick={() => go(it.id)}>
                    <span className="menu-code">0{i + 1}</span>
                    <span className="menu-label">{it.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          {/* Image d'arrivée : couches décalées encre / lavande / image, bord gauche en éclat façon Persona.
              Elle cache le perso 3D (Hero) posé derrière ; au clic, le balayage l'enlève et le perso part en sautant. */}
          <figure className="hero-art" aria-hidden>
            <div className="hero-art-ink" />
            <div className="hero-art-lav" />
            <div className="hero-art-img">{/* <img src="…" alt="" /> quand l'image sera prête */}</div>
          </figure>
        </>
      ) : (
        <>
          <div className="zone-bar">
            <h1 className="zone-title">{ITEMS.find((it) => it.id === zoneId)?.label}</h1>
            <button className="back" onClick={() => go(null)}>
              <span>← Retour <kbd>Échap</kbd></span>
            </button>
          </div>
          {zoneId === 'projects' && <ProjectsPanel />}
          {zoneId === 'skills' && <SkillsPanel />}
          {zoneId === 'about' && <AboutPanel />}
          {zoneId === 'contact' && <ContactPanel />}
        </>
      )}

      {swipe !== 0 &&
          (reduced ? (
            <motion.div
              key={swipe}
              className="swipe-fade"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: FADE_S, ease: 'linear' }}
              onAnimationComplete={done}
            />
          ) : (
            <div key={swipe} className="swipe" aria-hidden>
              <motion.div
                className="swipe-band swipe-lav"
                initial={{ x: '-110%' }}
                animate={{ x: '110%' }}
                transition={{ duration: SWIPE_S, ease: EASE }}
              />
              <motion.div
                className="swipe-band swipe-ground"
                initial={{ x: '-110%' }}
                animate={{ x: '110%' }}
                transition={{ duration: SWIPE_S, ease: EASE, delay: 0.08 }}
                onAnimationComplete={done}
              />
            </div>
          ))}
    </>
  )
}
