import { Outlines } from '@react-three/drei'
import { useLayoutEffect, useRef } from 'react'
import { Color, InstancedMesh, Object3D } from 'three'
import type { ZoneId } from '../store/useScene'
import { toonGradient } from './toon'
import { C } from '../tokens'

export type V3 = [number, number, number]
type Box = { pos: V3; size: V3; color: string }

export const CELL = 12 // pas de la grille : bloc de 8 + rue de 4
const BLOCK = 8
export const GRID = 3 // cellules de -GRID à +GRID sur x et z

// Centre de chaque quartier = une cellule laissée vide (place) au milieu des blocs.
export const SPOTS: Record<ZoneId, V3> = {
  projects: [-CELL, 0, CELL],
  skills: [CELL, 0, CELL],
  about: [-CELL, 0, -CELL],
  contact: [CELL, 0, -CELL],
}
const SPOT_COLORS: Record<ZoneId, string> = { projects: C.lavender, skills: C['pop-pink'], about: C.chrome, contact: C['pop-mint'] }

// Façades sombres proches de slab, quelques enseignes lavande.
const PALETTE = [C.slab, C.slab, C.hairline, C.hairline, C.lavender]
const rand = (i: number) => (((Math.sin(i * 127.1) * 43758.5453) % 1) + 1) % 1 // pseudo-aléatoire stable

const SIDEWALKS: Box[] = []
const BUILDINGS: Box[] = []
for (let i = -GRID; i <= GRID; i++)
  for (let j = -GRID; j <= GRID; j++) {
    const x = i * CELL, z = j * CELL, k = SIDEWALKS.length
    SIDEWALKS.push({ pos: [x, 0.1, z], size: [BLOCK, 0.2, BLOCK], color: C.hairline })
    if (Object.values(SPOTS).some(([sx, , sz]) => sx === x && sz === z)) continue
    const h = 4 + rand(k + 100) * 12
    BUILDINGS.push({
      pos: [x, h / 2 + 0.2, z],
      size: [BLOCK - 1 - rand(k) * 2, h, BLOCK - 1 - rand(k + 50) * 2],
      color: PALETTE[Math.floor(rand(k + 200) * PALETTE.length)],
    })
  }

// Fenêtres sur les 4 faces de chaque immeuble : ~1/3 allumées (chrome surtout, parfois lavande ou rose).
const LIT = [C.chrome, C.chrome, C.chrome, C.lavender, C['pop-pink']]
const WINDOWS: Box[] = []
BUILDINGS.forEach(({ pos: [x, , z], size: [w, h, d] }, b) => {
  for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const span = nx ? d : w
    const cols = Math.floor((span - 0.6) / 1.2), rows = Math.floor((h - 1) / 1.5)
    for (let c = 0; c < cols; c++)
      for (let r = 0; r < rows; r++) {
        const u = (c - (cols - 1) / 2) * 1.2, k = WINDOWS.length + b * 7
        WINDOWS.push({
          pos: [x + nx * (w / 2 + 0.02) + nz * u, 1.4 + r * 1.5, z + nz * (d / 2 + 0.02) + nx * u],
          size: nx ? [0.05, 0.7, 0.5] : [0.5, 0.7, 0.05],
          color: rand(k + 300) < 0.35 ? LIT[Math.floor(rand(k + 400) * LIT.length)] : C.ground,
        })
      }
  }
})

// Immeuble de la cellule centrée en (x, z) ; undefined = place d'un quartier. Pour caler le perso sur les toits et les façades (Hero).
export const buildingAt = (x: number, z: number) => BUILDINGS.find(({ pos }) => pos[0] === x && pos[2] === z)
export const roofAt = (x: number, z: number) => {
  const b = buildingAt(x, z)!
  return b.pos[1] + b.size[1] / 2
}

// Une liste de boîtes = 1 draw call (+1 pour les contours).
function Boxes({ items, outline, lit }: { items: Box[]; outline?: boolean; lit?: boolean }) {
  const ref = useRef<InstancedMesh>(null!)
  useLayoutEffect(() => {
    const o = new Object3D(), c = new Color()
    items.forEach((b, i) => {
      o.position.set(...b.pos)
      o.scale.set(...b.size)
      o.updateMatrix()
      ref.current.setMatrixAt(i, o.matrix)
      ref.current.setColorAt(i, c.set(b.color))
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.instanceColor!.needsUpdate = true
  }, [items])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
      <boxGeometry />
      {lit ? <meshBasicMaterial /> : <meshToonMaterial gradientMap={toonGradient} />}
      {outline && <Outlines thickness={0.06} color={C.ground} />}
    </instancedMesh>
  )
}

export default function City() {
  const size = (GRID * 2 + 1) * CELL + 40
  return (
    <group>
      {/* asphalte = rues */}
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[size, size]} />
        <meshToonMaterial color={C.ground} gradientMap={toonGradient} />
      </mesh>
      <Boxes items={SIDEWALKS} />
      <Boxes items={BUILDINGS} outline />
      <Boxes items={WINDOWS} lit />
      {/* repère au sol de chaque quartier, en attendant les zones */}
      {(Object.keys(SPOTS) as ZoneId[]).map((id) => (
        <mesh key={id} position={[SPOTS[id][0], 0.25, SPOTS[id][2]]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[2.5, 6]} />
          <meshToonMaterial color={SPOT_COLORS[id]} gradientMap={toonGradient} />
        </mesh>
      ))}
    </group>
  )
}
