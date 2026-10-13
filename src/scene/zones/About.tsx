import { Outlines, useCursor } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CanvasTexture, Object3D, SRGBColorSpace, Vector3, type InstancedMesh, type MeshBasicMaterial } from 'three'
import { TAGS } from '../../data/about'
import { loop } from '../../audio'
import { trick } from '../../tricks'
import { useScene } from '../../store/useScene'
import { SPOTS } from '../City'
import { toonGradient } from '../toon'
import { C } from '../../tokens'

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

// Mur de béton + bio en tags (contour épais, ombre décalée lavande).
function drawWall(ctx: CanvasRenderingContext2D) {
  ctx.globalAlpha = 1
  ctx.fillStyle = C.slab
  ctx.fillRect(0, 0, PX, PY)
  ctx.strokeStyle = C.hairline
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
    ctx.fillStyle = C.lavender
    ctx.fillText(txt, s * 0.06, s * 0.06)
    ctx.lineWidth = s * 0.14
    ctx.strokeStyle = C.ground
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

// Coulures : de temps en temps la peinture coule sous le trait et finit en goutte, comme sur un vrai mur.
type Drip = { x: number; y: number; left: number; w: number; color: string }
const drips: Drip[] = []
const DRIP_SPEED = 40 // px/s

function maybeDrip(x: number, y: number, color: string) {
  if (drips.length < 24 && Math.random() < 0.03)
    drips.push({ x: x + (Math.random() - 0.5) * R, y, left: 20 + Math.random() * 60, w: 2 + Math.random() * 2, color })
}

// Fait avancer les coulures ; false = plus rien ne coule (inutile de renvoyer la texture au GPU).
function runDrips(dt: number) {
  for (let i = drips.length - 1; i >= 0; i--) {
    const d = drips[i], step = Math.min(d.left, DRIP_SPEED * dt)
    ctx.globalAlpha = 0.85
    ctx.fillStyle = d.color
    ctx.fillRect(d.x - d.w / 2, d.y, d.w, step + 1)
    d.y += step
    d.left -= step
    if (d.left > 0) continue
    ctx.beginPath()
    ctx.arc(d.x, d.y, d.w * 0.9, 0, Math.PI * 2) // la goutte au bout
    ctx.fill()
    drips.splice(i, 1)
  }
  return drips.length > 0
}

// Brume de peinture qui rebondit du mur vers le visiteur à chaque jet (repère du mur, un seul draw call).
const MIST_S = 0.4
const mist = Array.from({ length: 40 }, () => ({ p: new Vector3(), v: new Vector3(), age: MIST_S }))
let nextMist = 0

function spawnMist(u: number, v: number) {
  for (let k = 0; k < 3; k++) {
    const m = mist[nextMist++ % mist.length]
    m.p.set((u - 0.5) * W, H / 2 + (v - 0.5) * H, 0.17)
    m.v.set(Math.random() - 0.5, Math.random() * 0.6, 0.5 + Math.random() * 0.7)
    m.age = 0
  }
}

// Score total BRC (tricks.ts), en autocollant discret dans le coin bas droit du mur : à trouver, pas à montrer.
function ScoreSticker() {
  const score = useScene((s) => s.score)
  const [canvas, sticker] = useMemo(() => {
    const c = Object.assign(document.createElement('canvas'), { width: 256, height: 96 })
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    return [c, t] as const
  }, [])

  useEffect(() => {
    const g = canvas.getContext('2d')!
    g.fillStyle = C.chrome
    g.fillRect(0, 0, canvas.width, canvas.height)
    g.fillStyle = C['on-pop']
    g.textAlign = 'center'
    g.font = '700 22px "JetBrains Mono", monospace'
    g.fillText('HI-SCORE', canvas.width / 2, 30)
    g.font = '700 44px "JetBrains Mono", monospace'
    g.fillText(String(score).padStart(7, '0'), canvas.width / 2, 78)
    sticker.needsUpdate = true
  }, [score, canvas, sticker])

  return (
    <mesh position={[W / 2 - 0.05, 0.12, 0.17]} rotation-z={0.12}>
      <planeGeometry args={[0.36, 0.135]} />
      <meshBasicMaterial map={sticker} toneMapped={false} />
    </mesh>
  )
}

// Mur graffiti : le visiteur peint librement dessus (glisser à la souris / au doigt).
export default function About() {
  const wallKey = useScene((s) => s.wallKey)
  const [hovered, setHovered] = useState(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  useCursor(hovered, 'crosshair')

  const mistRef = useRef<InstancedMesh>(null!)
  const mistMat = useRef<MeshBasicMaterial>(null!)
  const o = useMemo(() => new Object3D(), [])

  // wallKey change = bouton « Effacer » du panel
  useEffect(() => {
    drips.length = 0 // mur repeint : les coulures en cours disparaissent avec
    drawWall(ctx)
    tex.needsUpdate = true
  }, [wallKey])

  // fin du trait : on relâche le bouton ou on sort du mur
  const stop = () => {
    last.current = null
    loop('spray', false)
  }

  const paint = (e: ThreeEvent<PointerEvent>) => {
    const { zoneId, isTransitioning, sprayColor } = useScene.getState()
    if (!(e.buttons & 1) || !e.uv || zoneId !== 'about' || isTransitioning) return stop()
    e.stopPropagation()
    loop('spray', true)
    if (!last.current) trick('tag') // un trait = une figure
    const x = e.uv.x * PX, y = (1 - e.uv.y) * PY
    const from = last.current ?? { x, y }
    const steps = Math.max(1, Math.ceil(Math.hypot(x - from.x, y - from.y) / (R / 3))) // trait continu même si la souris va vite
    ctx.fillStyle = sprayColor
    for (let i = 1; i <= steps; i++) {
      const px = from.x + ((x - from.x) * i) / steps, py = from.y + ((y - from.y) * i) / steps
      puff(ctx, px, py)
      maybeDrip(px, py, sprayColor)
    }
    spawnMist(e.uv.x, e.uv.y)
    last.current = { x, y }
    tex.needsUpdate = true
  }

  useFrame((_, dt) => {
    if (runDrips(dt)) tex.needsUpdate = true
    mistMat.current.color.set(useScene.getState().sprayColor)
    mist.forEach((m, i) => {
      m.age += dt
      const k = Math.max(0, 1 - m.age / MIST_S)
      m.p.addScaledVector(m.v, dt)
      m.v.y -= 2 * dt
      o.position.copy(m.p)
      o.scale.setScalar(0.03 * k)
      o.updateMatrix()
      mistRef.current.setMatrixAt(i, o.matrix)
    })
    mistRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={[X, 0.2, WALL_Z]}>
      <mesh position-y={H / 2}>
        <boxGeometry args={[W + 0.3, H + 0.2, 0.3]} />
        <meshToonMaterial color={C.hairline} gradientMap={toonGradient} />
        <Outlines thickness={0.05} color={C.ground} />
      </mesh>
      <mesh
        position={[0, H / 2, 0.16]}
        onPointerDown={paint}
        onPointerMove={paint}
        onPointerUp={stop}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => (stop(), setHovered(false))}
      >
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <instancedMesh ref={mistRef} args={[undefined, undefined, mist.length]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshBasicMaterial ref={mistMat} transparent opacity={0.8} />
      </instancedMesh>
      <ScoreSticker />
    </group>
  )
}
