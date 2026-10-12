import { Outlines, useCursor } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { TAGS } from '../../data/about'
import { useScene } from '../../store/useScene'
import { SPOTS } from '../City'
import { toonGradient } from '../toon'

const [X, , Z] = SPOTS.about
const WALL_Z = Z - 3.2 // fond de la place, face au rail caméra (RAILS.about dans CameraRig)
const W = 6, H = 3 // mètres
const PX = 1024, PY = 512 // résolution de la peinture
const R = 18 // rayon d'un jet, en px

// Un seul mur : la peinture vit au niveau du module (elle survit aux allers-retours entre zones).
const canvas = Object.assign(document.createElement('canvas'), { width: PX, height: PY })
const ctx = canvas.getContext('2d')!
const tex = new CanvasTexture(canvas)
tex.colorSpace = SRGBColorSpace

// Mur de béton + bio en tags (contour épais, ombre décalée rouge).
function drawWall(ctx: CanvasRenderingContext2D) {
  ctx.globalAlpha = 1
  ctx.fillStyle = '#C9C6BE'
  ctx.fillRect(0, 0, PX, PY)
  ctx.strokeStyle = '#B3B0A8'
  ctx.lineWidth = 2
  for (let y = 64; y < PY; y += 64) ctx.strokeRect(-2, y, PX + 4, 0) // joints des parpaings
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  for (const t of TAGS) {
    const s = t.size * PY
    ctx.save()
    ctx.translate(t.x * PX, t.y * PY)
    ctx.rotate((t.rotate * Math.PI) / 180)
    ctx.font = `${s}px Anton, Impact, sans-serif`
    const txt = t.text.toUpperCase()
    ctx.fillStyle = '#E5002B'
    ctx.fillText(txt, s * 0.06, s * 0.06)
    ctx.lineWidth = s * 0.14
    ctx.strokeStyle = '#0A0A0A'
    ctx.strokeText(txt, 0, 0)
    ctx.fillStyle = t.fill
    ctx.fillText(txt, 0, 0)
    ctx.restore()
  }
}

// Un jet de bombe : halo léger + postillons denses au centre.
function puff(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.globalAlpha = 0.1
  ctx.beginPath()
  ctx.arc(x, y, R * 0.7, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 0.6
  for (let k = 0; k < 10; k++) {
    const r = Math.random() ** 2 * R, a = Math.random() * Math.PI * 2
    ctx.beginPath()
    ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 0.8 + Math.random() * 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

// Mur graffiti : le visiteur peint librement dessus (glisser à la souris / au doigt).
export default function About() {
  const wallKey = useScene((s) => s.wallKey)
  const [hovered, setHovered] = useState(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  useCursor(hovered, 'crosshair')

  // wallKey change = bouton « Effacer » du panel
  useEffect(() => {
    drawWall(ctx)
    tex.needsUpdate = true
  }, [wallKey])

  const paint = (e: ThreeEvent<PointerEvent>) => {
    const { zoneId, isTransitioning, sprayColor } = useScene.getState()
    if (!(e.buttons & 1) || !e.uv || zoneId !== 'about' || isTransitioning) return (last.current = null)
    e.stopPropagation()
    const x = e.uv.x * PX, y = (1 - e.uv.y) * PY
    const from = last.current ?? { x, y }
    const steps = Math.max(1, Math.ceil(Math.hypot(x - from.x, y - from.y) / (R / 3))) // trait continu même si la souris va vite
    ctx.fillStyle = sprayColor
    for (let i = 1; i <= steps; i++) puff(ctx, from.x + ((x - from.x) * i) / steps, from.y + ((y - from.y) * i) / steps)
    last.current = { x, y }
    tex.needsUpdate = true
  }

  return (
    <group position={[X, 0.2, WALL_Z]}>
      <mesh position-y={H / 2}>
        <boxGeometry args={[W + 0.3, H + 0.2, 0.3]} />
        <meshToonMaterial color="#8F8C86" gradientMap={toonGradient} />
        <Outlines thickness={0.05} color="#0A0A0A" />
      </mesh>
      <mesh
        position={[0, H / 2, 0.16]}
        onPointerDown={paint}
        onPointerMove={paint}
        onPointerUp={() => (last.current = null)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => ((last.current = null), setHovered(false))}
      >
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial map={tex} />
      </mesh>
    </group>
  )
}
