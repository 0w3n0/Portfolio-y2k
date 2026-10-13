import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { play } from '../audio'
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
// Clic sur une catégorie (Persona) : flash chrome et image figée IMPACT_S, puis balayage plus lent qui porte le nom du quartier.
const IMPACT_S = 0.08
const LABEL_S = 0.8
// Arrivée : le titre tombe une fois le 2e balayage sorti de l'écran (l'arrivée est déclarée à mi-balayage).
const STAMP_DELAY_S = 0.3
const STAMP_S = 0.22

// Timing d'un balayage : départ des bandes (après l'impact) et durée de chacune.
const timing = (label: string) => ({ lead: label ? IMPACT_S : 0, dur: label ? LABEL_S : SWIPE_S })

export default function Menu() {
  const mode = useScene((s) => s.mode)
  const zoneId = useScene((s) => s.zoneId)
  const dashing = useScene((s) => s.dashing)
  const reduced = useReducedMotion()
  const [swipe, setSwipe] = useState<{ key: number; label: string } | null>(null) // balayage en cours
  const busy = useRef(false)

  // Le store change quand la bande couvre l'écran (mi-parcours) → la caméra coupe, l'UI change à l'abri.
  const swipeThen = (atMid: () => void, label = '') => {
    if (busy.current) return
    busy.current = true
    play('swipe')
    setSwipe({ key: Date.now(), label })
    const { lead, dur } = timing(label)
    setTimeout(atMid, (reduced ? FADE_S / 2 : lead + (dur + 0.08) / 2) * 1000)
  }

  // Aller : balayage → dashs vus d'en haut (Hero) → balayage → zone. Sans animations : directement la zone.
  const go = (zone: ZoneId | null) => {
    if (!busy.current) play(zone ? 'select' : 'back')
    swipeThen(() =>
      useScene.setState(
        zone
          ? { mode: 'zone', zoneId: zone, scrollProgress: 0, projectId: null, dashing: !reduced, journey: 0 }
          : { mode: 'overview', zoneId: null, scrollProgress: 0, projectId: null, dashing: false },
      ),
      ITEMS.find((it) => it.id === zone)?.label,
    )
  }

  // Fin des dashs → second balayage, qui révèle la zone.
  useEffect(
    () =>
      useScene.subscribe((s, prev) => {
        if (s.dashing && s.journey >= 1 && prev.journey < 1) swipeThen(() => useScene.setState({ dashing: false }))
      }),
    [], // swipeThen ne lit que des refs et setSwipe : un seul abonnement suffit
  )

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
    setSwipe(null)
  }

  const { lead, dur } = timing(swipe?.label ?? '')

  return (
    <>
      {mode === 'overview' ? (
        <>
          <img className="lockup" src={lockup} alt="Owen Donnars" />
          <nav className="menu" aria-label="Quartiers">
            <ul>
              {ITEMS.map((it, i) => (
                <li key={it.id} style={{ '--i': i } as CSSProperties}>
                  <button className="menu-item" onPointerEnter={() => play('hover')} onClick={() => go(it.id)}>
                    <span className="menu-code">0{i + 1}</span>
                    <span className="menu-label">{it.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          {/* Image d'arrivée : couches décalées encre / lavande / image, bord gauche en éclat façon Persona.
              Elle cache le perso 3D (Hero) posé derrière ; au clic, le balayage l'enlève et le perso part en dashant. */}
          <figure className="hero-art" aria-hidden>
            <div className="hero-art-ink" />
            <div className="hero-art-lav" />
            <div className="hero-art-img">{/* <img src="…" alt="" /> quand l'image sera prête */}</div>
          </figure>
        </>
      ) : (
        <>
          {/* Arrivée : le titre tombe en tampon une fois le balayage passé, la barre encaisse le choc */}
          <motion.div
            key={dashing ? 'dash' : 'here'}
            className="zone-bar"
            animate={reduced || dashing ? undefined : { x: [0, -8, 7, -5, 3, 0] }}
            transition={{ delay: STAMP_DELAY_S + STAMP_S, duration: 0.25 }}
          >
            {!dashing && (
              <motion.div
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 2.4, rotate: -10 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: STAMP_DELAY_S, duration: STAMP_S, ease: [0.5, 0, 0.75, 0] }} // accélère jusqu'à l'impact
                onAnimationComplete={() => play('stamp')}
              >
                <h1 className="zone-title">{ITEMS.find((it) => it.id === zoneId)?.label}</h1>
              </motion.div>
            )}
            <button className="back" onClick={() => go(null)}>
              <span>← Retour <kbd>Échap</kbd></span>
            </button>
          </motion.div>
          {!dashing && zoneId === 'projects' && <ProjectsPanel />}
          {!dashing && zoneId === 'skills' && <SkillsPanel />}
          {!dashing && zoneId === 'about' && <AboutPanel />}
          {!dashing && zoneId === 'contact' && <ContactPanel />}
        </>
      )}

      {swipe &&
        (reduced ? (
          <motion.div
            key={swipe.key}
            className="swipe-fade"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: FADE_S, ease: 'linear' }}
            onAnimationComplete={done}
          />
        ) : (
          <div key={swipe.key} className="swipe" aria-hidden>
            {swipe.label && (
              <motion.div
                className="swipe-flash"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.45, 0] }}
                transition={{ duration: IMPACT_S * 2, ease: 'linear' }}
              />
            )}
            <motion.div
              className="swipe-band swipe-lav"
              initial={{ x: '-110%' }}
              animate={{ x: '110%' }}
              transition={{ duration: dur, ease: EASE, delay: lead }}
            />
            <motion.div
              className="swipe-band swipe-ground"
              initial={{ x: '-110%' }}
              animate={{ x: '110%' }}
              transition={{ duration: dur, ease: EASE, delay: lead + 0.08 }}
              onAnimationComplete={done}
            >
              {/* le nom glisse à contresens de la bande : il reste plus longtemps lisible au centre */}
              {swipe.label && (
                <motion.span
                  className="swipe-label-track"
                  initial={{ x: '25vw' }}
                  animate={{ x: '-25vw' }}
                  transition={{ duration: dur, ease: 'linear', delay: lead + 0.08 }}
                >
                  <span className="swipe-label">{swipe.label}</span>
                </motion.span>
              )}
            </motion.div>
          </div>
        ))}
    </>
  )
}
