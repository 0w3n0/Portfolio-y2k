import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { PROJECTS, projectCode } from '../../data/projects'
import { useScene } from '../../store/useScene'
import './Projects.css'

// Clavier du distributeur = liste accessible des projets (même effet qu'un clic sur le produit 3D).
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

      <AnimatePresence>
        {p && (
          <motion.aside
            key={p.id}
            className="project-panel"
            aria-label={p.title}
            // délai = le temps que le produit tombe dans le bac
            initial={reduced ? { opacity: 0 } : { x: '110%' }}
            animate={reduced ? { opacity: 1 } : { x: 0, transition: { delay: 0.35, duration: 0.45, ease: [0.76, 0, 0.24, 1] } }}
            exit={reduced ? { opacity: 0 } : { x: '110%', transition: { duration: 0.3 } }}
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
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
