import { useScene } from '../store/useScene'
import './SoundControl.css'

// Réglage du son, toujours visible en haut à droite : couper / remettre, et volume général (mémorisés, store).
export default function SoundControl() {
  const volume = useScene((s) => s.volume)
  const muted = useScene((s) => s.muted)

  return (
    <div className="sound" role="group" aria-label="Son">
      <button className="sound-toggle" aria-pressed={!muted} onClick={() => useScene.setState({ muted: !muted })}>
        <span>
          Son <b aria-hidden>{muted ? 'off' : 'on'}</b>
        </span>
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        disabled={muted}
        aria-label="Volume"
        onChange={(e) => useScene.setState({ volume: +e.target.value })}
      />
    </div>
  )
}
