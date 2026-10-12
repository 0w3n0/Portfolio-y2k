import { SPRAYS, TAGS } from '../../data/about'
import { useScene } from '../../store/useScene'
import './About.css'

// Bombes de peinture pour le mur (scene/zones/About) + bio lisible par les lecteurs d'écran.
export default function AboutPanel() {
  const sprayColor = useScene((s) => s.sprayColor)
  return (
    <>
      <p className="sr-only">{TAGS.map((t) => t.text).join('. ')}</p>
      <section className="spray-box" aria-label="Bombes de peinture">
        <span className="hint">Glisse sur le mur pour taguer</span>
        <div className="cans">
          {SPRAYS.map((s) => (
            <button
              key={s.color}
              aria-label={s.name}
              aria-pressed={s.color === sprayColor}
              style={{ background: s.color }}
              onClick={() => useScene.setState({ sprayColor: s.color })}
            />
          ))}
        </div>
        <button className="wipe" onClick={() => useScene.setState((st) => ({ wallKey: st.wallKey + 1 }))}>
          Effacer
        </button>
      </section>
    </>
  )
}
