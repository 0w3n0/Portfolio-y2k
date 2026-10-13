import { useFrame } from '@react-three/fiber'
import { ChromaticAberration, EffectComposer } from '@react-three/postprocessing'
import type { ChromaticAberrationEffect } from 'postprocessing'
import { useRef } from 'react'
import { useScene } from '../store/useScene'

const HOP_FX_S = 0.3 // durée de l'impulsion après une téléportation
const MAX_SPLIT = 0.006 // décalage des couleurs au pic (fraction de l'écran)

// Post-process : aberration chromatique en impulsion à chaque téléportation (Hero), nulle le reste du temps.
export default function Effects() {
  const ca = useRef<ChromaticAberrationEffect>(null)

  useFrame(() => {
    const k = Math.max(0, 1 - (performance.now() - useScene.getState().hopAt) / 1000 / HOP_FX_S) ** 2
    ca.current?.offset.set(k * MAX_SPLIT, k * MAX_SPLIT * 0.5)
  })

  return (
    <EffectComposer>
      <ChromaticAberration ref={ca} offset={[0, 0]} />
    </EffectComposer>
  )
}
