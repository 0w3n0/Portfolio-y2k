import { Outlines } from '@react-three/drei'
import { useLayoutEffect, useRef } from 'react'
import { Color, InstancedMesh, Object3D } from 'three'
import type { ZoneId } from '../store/useScene'
import { toonGradient } from './toon'

export type V3 = [number, number, number]
type Box = { pos: V3; size: V3; color: string }

const CELL = 12 // pas de la grille : bloc de 8 + rue de 4
const BLOCK = 8
const GRID = 3 // cellules de -GRID à +GRID sur x et z

// Centre de chaque quartier = une cellule laissée vide (place) au milieu des blocs.
export const SPOTS: Record<ZoneId, V3> = {
  projects: [-CELL, 0, CELL],
  skills: [CELL, 0, CELL],
  about: [-CELL, 0, -CELL],
  contact: [CELL, 0, -CELL],
}
const SPOT_COLORS: Record<ZoneId, string> = { projects: '#E5002B', skills: '#FF3EA5', about: '#F2F0EA', contact: '#0A0A0A' }

const PALETTE = ['#F2F0EA', '#F2F0EA', '#C9C6BE', '#8F8C86', '#E5002B']
const rand = (i: number) => (((Math.sin(i * 127.1) * 43758.5453) % 1) + 1) % 1 // pseudo-aléatoire stable

const SIDEWALKS: Box[] = []
const BUILDINGS: Box[] = []
for (let i = -GRID; i <= GRID; i++)
  for (let j = -GRID; j <= GRID; j++) {
    const x = i * CELL, z = j * CELL, k = SIDEWALKS.length
    SIDEWALKS.push({ pos: [x, 0.1, z], size: [BLOCK, 0.2, BLOCK], color: '#C9C6BE' })
    if (Object.values(SPOTS).some(([sx, , sz]) => sx === x && sz === z)) continue
    const h = 4 + rand(k + 100) * 12
    BUILDINGS.push({
      pos: [x, h / 2 + 0.2, z],
      size: [BLOCK - 1 - rand(k) * 2, h, BLOCK - 1 - rand(k + 50) * 2],
      color: PALETTE[Math.floor(rand(k + 200) * PALETTE.length)],
    })
  }

// Une liste de boîtes = 1 draw call (+1 pour les contours).
function Boxes({ items, outline }: { items: Box[]; outline?: boolean }) {
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
      <meshToonMaterial gradientMap={toonGradient} />
      {outline && <Outlines thickness={0.06} color="#0A0A0A" />}
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
        <meshToonMaterial color="#2A2A2A" gradientMap={toonGradient} />
      </mesh>
      <Boxes items={SIDEWALKS} />
      <Boxes items={BUILDINGS} outline />
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
