import { SOUNDS, type Sound, type SoundId } from './data/sounds'
import { useScene } from './store/useScene'

// Lecteur des sons de data/sounds.ts : un <audio> préchargé par son branché ; les sons ponctuels jouent une copie
// pour pouvoir se chevaucher (téléportations rapprochées).
const base: Partial<Record<SoundId, HTMLAudioElement>> = {}
for (const [id, s] of Object.entries(SOUNDS) as [SoundId, Sound][]) {
  if (!s.src) continue
  const a = new Audio(s.src)
  a.preload = 'auto'
  a.loop = !!s.loop
  base[id] = a
}

const level = (id: SoundId) => {
  const { volume, muted } = useScene.getState()
  return muted ? 0 : SOUNDS[id].volume * volume
}

export function play(id: SoundId) {
  const a = base[id]
  if (!a || !level(id)) return
  const c = a.cloneNode() as HTMLAudioElement
  c.volume = level(id)
  c.play().catch(() => {}) // refusé avant le premier geste du visiteur : on ignore
}

export function loop(id: SoundId, on: boolean) {
  const a = base[id]
  if (!a) return
  a.volume = level(id)
  if (on) a.play().catch(() => {})
  else a.pause()
}

// Ambiance au premier geste (avant, le navigateur refuse de jouer).
const startAmbience = () => (loop('music', true), loop('city', true))
addEventListener('pointerdown', startAmbience, { once: true })
addEventListener('keydown', startAmbience, { once: true })

// Sons déclenchés par l'état de la scène, quel que soit le bouton (3D ou DOM) qui l'a changé.
useScene.subscribe((s, p) => {
  if (s.volume !== p.volume || s.muted !== p.muted) for (const id of Object.keys(base) as SoundId[]) base[id]!.volume = level(id)
  if (s.projectId && s.projectId !== p.projectId) {
    play('machineButton')
    setTimeout(() => play('productDrop'), 350) // le temps que le produit tombe (même délai que la fiche, ui/panels/Projects)
  }
  if (!s.projectId && p.projectId) play('panelClose')
  if (s.sprayColor !== p.sprayColor) play('sprayShake')
  if (s.wallKey !== p.wallKey) play('wipe')
  if (s.mode === 'zone' && !s.dashing && (p.dashing || p.mode !== 'zone')) {
    play('arrive')
    if (s.zoneId === 'skills') play('kiosk')
  }
})
