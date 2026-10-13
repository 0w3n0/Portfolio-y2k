import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { PROJECTS, projectCode } from '../../data/projects'
import { play } from '../../audio'
import { useScene } from '../../store/useScene'
import './Projects.css'

// Ouverture de la fiche : même nombre de points à chaque étape (motion interpole le polygone), bord dentelé au milieu.
const CRACK = [
  'polygon(0% 0%, 0% 0%, 0% 30%, 0% 55%, 0% 80%, 0% 100%, 0% 100%)',
  'polygon(0% 0%, 55% 0%, 30% 30%, 70% 55%, 40% 80%, 65% 100%, 0% 100%)',
  'polygon(0% 0%, 100% 0%, 100% 30%, 100% 55%, 100% 80%, 100% 100%, 0% 100%)',
]
// Éclats de vitre qui partent du coin de la fiche vers l'intérieur de l'encart : [x, y, rotation]
const SHARDS: [number, number, number][] = [
  [90, -20, -140],
  [160, 50, 90],
  [50, 140, 200],
  [-10, 100, -60],
]

// Encart de droite, même construction que .hero-art (couches encre / lavande / dalle) mais en carte inclinée.
// Le clavier du distributeur reste fixe en bas à gauche (liste accessible, même effet qu'un clic sur le produit 3D) ; seul l'encart change.
export default function ProjectsPanel() {
  const projectId = useScene((s) => s.projectId)
  const reduced = useReducedMotion()
  const i = PROJECTS.findIndex((p) => p.id === projectId)
  const p = PROJECTS[i]

  return (
    <>
      <nav className="keypad" aria-label="Projets">
        <ul>
          {PROJECTS.map((it, n) => (
            <li key={it.id}>
              <button aria-pressed={it.id === projectId} onPointerEnter={() => play('hover')} onClick={() => useScene.setState({ projectId: it.id })}>
                <span className="code">{projectCode(n)}</span> {it.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <aside className="projects-card" aria-label="Fiche projet">
        <div className="projects-card-ink" />
        <div className="projects-card-lav" />
        <div className="projects-card-slab">
          <AnimatePresence mode="wait">
            {p ? (
              <motion.section
                key={p.id}
                className="project-detail"
                aria-live="polite"
                // délai = le temps que le produit tombe dans le bac ; ouverture en vitre fendue (bord dentelé qui balaie)
                initial={reduced ? { opacity: 0 } : { clipPath: CRACK[0] }}
                animate={reduced ? { opacity: 1 } : { clipPath: CRACK, transition: { delay: 0.35, duration: 0.4, ease: 'easeOut' } }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: 40, transition: { duration: 0.2 } }}
              >
                <span className="code">{projectCode(i)}</span>
                <h2>{p.title}</h2>
                <p className="meta">
                  {p.year} — {p.tags.join(' / ')}
                </p>
                <p>{p.description}</p>
                {p.url && (
                  <a href={p.url} target="_blank" rel="noreferrer">
                    Voir le projet ↗
                  </a>
                )}
                <button className="close" onClick={() => useScene.setState({ projectId: null })}>
                  Fermer <kbd>Échap</kbd>
                </button>
              </motion.section>
            ) : (
              <motion.p key="hint" className="project-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Choisis un produit
              </motion.p>
            )}
          </AnimatePresence>
          {/* hors de la fiche, sinon la fissure (CRACK) les découperait */}
          {p && !reduced && (
            <span key={p.id} className="shards" aria-hidden>
              {SHARDS.map(([x, y, r], n) => (
                <motion.span
                  key={n}
                  initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
                  animate={{ x, y, rotate: r, opacity: [1, 0] }} // invisibles pendant le délai de chute
                  transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
                />
              ))}
            </span>
          )}
        </div>
      </aside>
    </>
  )
}
