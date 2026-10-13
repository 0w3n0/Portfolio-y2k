import { COMBO_MS, TRICKS, type TrickId } from './data/tricks'
import { useScene, type ZoneId } from './store/useScene'

// Figures BRC (data/tricks.ts) : étiquette près du curseur, points × combo, combo qui retombe après COMBO_MS sans interaction.
const pointer = { x: innerWidth / 2, y: innerHeight / 2 }
addEventListener('pointermove', (e) => Object.assign(pointer, { x: e.clientX, y: e.clientY }), { passive: true })
addEventListener('pointerdown', (e) => Object.assign(pointer, { x: e.clientX, y: e.clientY }), { passive: true })

let drop: ReturnType<typeof setTimeout> | undefined

export function trick(id: TrickId) {
  const { combo, score, tricks } = useScene.getState()
  const c = combo + 1
  const pts = TRICKS[id].pts * c
  const t = { key: performance.now(), label: TRICKS[id].label, pts, ...pointer }
  useScene.setState({ combo: c, score: score + pts, tricks: [...tricks.slice(-4), t] }) // 5 étiquettes à l'écran au plus
  clearTimeout(drop)
  drop = setTimeout(() => useScene.setState({ combo: 0 }), COMBO_MS)
}

// Figures déclenchées par l'état de la scène, quel que soit le bouton (3D ou DOM) qui l'a changé.
const visited = new Set<ZoneId>()
useScene.subscribe((s, p) => {
  if (s.projectId && s.projectId !== p.projectId) trick('grab')
  if (s.sprayColor !== p.sprayColor) trick('shake')
  if (s.wallKey !== p.wallKey) trick('buff')
  if (s.mode === 'zone' && s.zoneId && !s.dashing && (p.dashing || p.mode !== 'zone') && !visited.has(s.zoneId)) {
    visited.add(s.zoneId)
    trick('spot')
  }
})
