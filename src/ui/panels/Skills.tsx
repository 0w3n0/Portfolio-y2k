import { PROFILE } from '../../data/skills'
import './Skills.css'

// Fiche perso (bas gauche). Les compétences tournent autour de l'avatar en 3D (scene/zones/Skills).
export default function SkillsPanel() {
  return (
    <section className="char-card" aria-label="Personnage">
      <span className="lv">Lv. {PROFILE.level}</span>
      <h2>{PROFILE.name}</h2>
      <p className="role">{PROFILE.role}</p>
      <span className="stars" aria-label={`${PROFILE.stars} sur 5`}>
        {'★'.repeat(PROFILE.stars)}
      </span>
    </section>
  )
}
