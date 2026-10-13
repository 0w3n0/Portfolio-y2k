import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { PROJECTS, projectCode } from '../../data/projects'
import { useScene } from '../../store/useScene'
import './Projects.css'

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
              <button aria-pressed={it.id === projectId} onClick={() => useScene.setState({ projectId: it.id })}>
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
                // délai = le temps que le produit tombe dans le bac
                initial={reduced ? { opacity: 0 } : { opacity: 0, x: 40 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0, transition: { delay: 0.35, duration: 0.35, ease: [0.76, 0, 0.24, 1] } }}
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
        </div>
      </aside>
    </>
  )
}
