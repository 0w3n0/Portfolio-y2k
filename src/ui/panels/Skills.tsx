import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { PROJECTS } from '../../data/projects'
import { GEAR, PROFILE, SKILLS, STATS } from '../../data/skills'
import { play } from '../../audio'
import { useScene } from '../../store/useScene'
import './Skills.css'

const TABS = ['Stats', 'Compétences', 'Équipement'] as const
const EASE = [0.76, 0, 0.24, 1] as const
const title = (id: string) => PROJECTS.find((p) => p.id === id)?.title

// Jauge en segments penchés (StatGauge du design system).
function Gauge({ name, lv, max }: { name: string; lv: number; max: number }) {
  return (
    <div className="stat">
      <span className="stat-name">{name}</span>
      <span className="stat-lv">
        LV. <b>{lv}</b> / {max}
      </span>
      <div className="stat-bar" aria-hidden>
        {Array.from({ length: max }, (_, i) => (
          <i key={i} className={i < lv ? 'seg seg-on' : 'seg'} />
        ))}
      </div>
    </div>
  )
}

// Écran de perso façon HSR : le perso 3D (Hero) à gauche, fiche à onglets à droite.
// La fiche glisse quand il a appuyé sur la borne (scene/zones/Skills), d'où le délai = pic du geste.
export default function SkillsPanel() {
  const arrived = useScene((s) => !s.dashing)
  const reduced = useReducedMotion()
  const [tab, setTab] = useState(0)

  return (
    <>
      <section className="char-card" aria-label="Personnage">
        <span className="lv">Lv. {PROFILE.level}</span>
        <h2>{PROFILE.name}</h2>
        <p className="role">{PROFILE.role}</p>
        <span className="stars" aria-label={`${PROFILE.stars} sur 5`}>
          {'★'.repeat(PROFILE.stars)}
        </span>
      </section>

      {arrived && (
        <motion.section
          className="sheet"
          aria-label="Fiche perso"
          initial={reduced ? { opacity: 0 } : { x: '120%' }}
          animate={reduced ? { opacity: 1 } : { x: 0 }}
          transition={reduced ? { duration: 0.15 } : { delay: 0.3, duration: 0.5, ease: EASE }}
        >
          <div className="sheet-tabs" role="tablist">
            {TABS.map((t, i) => (
              <button key={t} role="tab" id={`tab-${i}`} aria-selected={tab === i} aria-controls="sheet-panel" onPointerEnter={() => play('hover')} onClick={() => (play('tab'), setTab(i))}>
                <span>{t}</span>
              </button>
            ))}
          </div>
          <div className="sheet-panel" id="sheet-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
            {tab === 0 && STATS.map((s) => <Gauge key={s.name} name={s.name} lv={s.lv} max={10} />)}
            {tab === 1 &&
              SKILLS.map((s) => (
                <div key={s.name}>
                  <Gauge name={s.name} lv={s.stars} max={5} />
                  {s.projects.length > 0 && <p className="used">{s.projects.map(title).join(' · ')}</p>}
                </div>
              ))}
            {tab === 2 &&
              GEAR.map((g, i) => (
                <article key={g.name} className="gear">
                  <div className="gear-top">
                    <span className="gear-code">E{i + 1}</span>
                    <span>Outil</span>
                  </div>
                  <h3 className="gear-name">{g.name}</h3>
                  <p className="gear-use">{g.use}</p>
                  {g.projects.length > 0 && <p className="used">{g.projects.map(title).join(' · ')}</p>}
                </article>
              ))}
          </div>
        </motion.section>
      )}
    </>
  )
}
