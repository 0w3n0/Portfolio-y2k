import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { animate, type AnimationPlaybackControls } from 'motion'
import { useMemo, useRef, type ComponentRef } from 'react'
import { AdditiveBlending, MathUtils, Object3D, Vector3, type Group, type InstancedMesh } from 'three'
import { play } from '../audio'
import { useScene, type ZoneId } from '../store/useScene'
import { C } from '../tokens'
import Avatar, { WALL_ARM, ghostGeometry } from './Avatar'
import { CELL, SPOTS, buildingAt, roofAt, type V3 } from './City'
import { MACHINE } from './zones/Projects'

// Le perso du visiteur : au premier plan sur un toit (derrière l'image du Menu) en overview.
// Au clic : balayage → il se téléporte en zigzag de façade en façade jusqu'au quartier (vu d'en haut), en laissant des hologrammes → balayage → il est à sa place.
// Retour en overview : directement sur son toit.

const local = (x: number, z: number) => new Vector3(x, 0, z).applyAxisAngle(new Vector3(0, 1, 0), MACHINE.rotY).add(new Vector3(...MACHINE.pos))
const face = (from: Vector3, to: Vector3) => Math.atan2(to.x - from.x, to.z - from.z)
const at = (id: ZoneId, dx: number, dz: number) => new Vector3(SPOTS[id][0] + dx, 0.2, SPOTS[id][2] + dz)

// Où il se tient dans chaque quartier, et vers où il regarde (0 = vers +z, côté arrivée du rail caméra).
const PROJECTS_STAND = local(0.9, 0.7) // à droite de la vitre, pour ne pas la masquer depuis le rail caméra
const STANDS: Record<ZoneId, { pos: Vector3; face: number }> = {
  projects: { pos: PROJECTS_STAND, face: face(PROJECTS_STAND, local(-0.25, 0.5)) },
  skills: { pos: at('skills', 0, 0), face: 0 }, // au centre, face au bouton (zones/Skills)
  about: { pos: at('about', 3.4, -2.6), face: -0.5 }, // juste à droite du mur
  contact: { pos: at('contact', 1.3, -1.4), face: -0.4 }, // à côté de la cabine
}

const START = new Vector3(26, roofAt(24, 12), 14) // coin du toit le plus proche de la caméra d'overview
const START_FACE = 0.46 // vers la caméra d'overview (CameraRig)

export const DASH_S = 2 // durée de toute la séquence de téléportations, quelle que soit la distance
const DASH_Y = 3 // hauteur des appuis (abaissée sur les immeubles bas pour garder la tête sous le toit)
const GAP = 0.35 // du centre du corps à la façade : la main tendue (WALL_ARM) touche le mur

// Points de téléportation : il apparaît d'un coup à chacun, en pose, et laisse un hologramme là où il a pris appui (toit ou façade).
// wall = direction de la façade sur laquelle il prend appui ; ghost = hologramme quand il le quitte (pas aux carrefours, où il ne touche rien).
type Pt = { pos: Vector3; wall: Vector3 | null; ghost: boolean; rot: number }
const route: Pt[] = []
const pt = (pos: Vector3, ghost: boolean, wall: Vector3 | null = null): Pt => ({ pos, wall, ghost, rot: 0 })

// Carrefour d'indice (a, b) : rue entre les cellules a et a + 1.
const cross = (a: number, b: number) => new Vector3((a + 0.5) * CELL, DASH_Y, (b + 0.5) * CELL)
// Rue de départ (s) et d'arrivée (t) sur un axe : le côté de chaque cellule qui fait face à l'autre ; même rangée → la rue la plus proche de v.
const streets = (s: number, t: number, v: number) => (t > s ? [s, t - 1] : t < s ? [s - 1, t] : Array(2).fill(Math.round(v / CELL - 0.5)))

// Le long d'une rue, du carrefour `from` au carrefour `to` : un appui par bloc, plaqué sur la vraie façade (City),
// en alternant les côtés ; côté place (pas d'immeuble) → l'autre côté. Tout reste dans le couloir de la rue : rien ne traverse un immeuble.
function run(from: [number, number], to: [number, number], pts: Pt[]) {
  const ax = from[0] !== to[0] ? 0 : 1 // axe parcouru : 0 = x, 1 = z
  const step = Math.sign(to[ax] - from[ax]), lane = from[1 - ax]
  for (let c = from[ax]; c !== to[ax]; c += step) {
    const along = (step > 0 ? c + 1 : c) * CELL // milieu du bloc
    const prefer = pts.filter((p) => p.wall).length % 2 ? -1 : 1
    for (const s of [prefer, -prefer]) {
      const k = s > 0 ? lane + 1 : lane // cellule de ce côté de la rue
      const b = ax ? buildingAt(k * CELL, along) : buildingAt(along, k * CELL)
      if (!b) continue
      const u = k * CELL - s * (b.size[ax ? 0 : 2] / 2 + GAP) // façade tournée vers la rue, moins l'écart
      const y = Math.min(DASH_Y, b.pos[1] + b.size[1] / 2 - 2)
      pts.push(pt(ax ? new Vector3(u, y, along) : new Vector3(along, y, u), true, ax ? new Vector3(s, 0, 0) : new Vector3(0, 0, s)))
      break
    }
  }
}

function plan(id: ZoneId) {
  const cell = (v: number) => Math.round(v / CELL)
  const [a0, a1] = streets(cell(START.x), cell(SPOTS[id][0]), START.x)
  const [b0, b1] = streets(cell(START.z), cell(SPOTS[id][2]), START.z)
  const p0 = cross(a0, b0)
  // bord de son toit, au coin côté carrefour : en sautant vers le carrefour, la traînée sort tout de suite de l'immeuble
  const home = buildingAt(cell(START.x) * CELL, cell(START.z) * CELL)!
  const corner = (i: 0 | 2) => home.pos[i] + (Math.sign(p0.getComponent(i) - home.pos[i]) * home.size[i]) / 2
  const pts: Pt[] = [pt(START.clone(), true), pt(new Vector3(corner(0), START.y, corner(2)), true), pt(p0, false)]
  run([a0, b0], [a1, b0], pts)
  if (a0 !== a1 && b0 !== b1) pts.push(pt(cross(a1, b0), false)) // virage
  run([a1, b0], [a1, b1], pts)
  if (a0 !== a1 || b0 !== b1) pts.push(pt(cross(a1, b1), false)) // carrefour du quartier
  pts.push(pt(STANDS[id].pos.clone(), false))
  pts.forEach((p, i) => {
    // main droite (-x local) vers la façade ; sinon tourné vers le point suivant
    p.rot = p.wall ? Math.atan2(p.wall.z, -p.wall.x) : i < pts.length - 1 ? face(p.pos, pts[i + 1].pos) : STANDS[id].face
  })
  route.splice(0, route.length, ...pts)
}

// Point où il se trouve à l'avancée t (0→1) : chaque point est tenu le même temps, le dernier (sa place) compris.
const slot = (t: number) => Math.min(Math.floor(MathUtils.clamp(t, 0, 1) * route.length), route.length - 1)
export function heroAt(t: number, out: Vector3) {
  return out.copy(route.length ? route[slot(t)].pos : START)
}

let tween: AnimationPlaybackControls | null = null
useScene.subscribe((s, prev) => {
  if (s.dashing === prev.dashing) return
  tween?.stop()
  if (!s.dashing || !s.zoneId) return
  plan(s.zoneId)
  tween = animate(0, 1, { duration: DASH_S, ease: 'linear', onUpdate: (v) => useScene.setState({ journey: v }) })
})

const FLAT: V3[] = [
  [0, 0, 0],
  [0, 0, 0],
]
const MAX_GHOSTS = 32

export default function Hero() {
  const ref = useRef<Group>(null!)
  const arm = useRef<Group>(null!)
  const trail = useRef<ComponentRef<typeof Line>>(null)
  const ghosts = useRef<InstancedMesh>(null)
  const dashing = useScene((s) => s.dashing)
  const [o, buf] = useMemo(() => [new Object3D(), new Float32Array(6)], [])
  const press = useRef({ key: '' as string | null, at: -9, reach: 1.4 })
  const lastSlot = useRef(0)

  useFrame(({ clock }) => {
    const { mode, dashing, journey, projectId, zoneId } = useScene.getState()
    const g = ref.current
    arm.current.rotation.z = -0.12 // repos (Avatar)
    if (mode !== 'zone' || !zoneId) {
      g.position.copy(START)
      g.rotation.y = START_FACE
    } else if (!dashing) {
      g.position.copy(STANDS[zoneId].pos)
      g.rotation.y = STANDS[zoneId].face
    } else if (route.length) {
      const k = slot(journey), p = route[k]
      if (k > lastSlot.current) {
        // une fois par téléportation : son + effets (CameraRig, Effects, ui/SpeedLines)
        play('dash')
        useScene.setState({ hopAt: performance.now() })
      }
      lastSlot.current = k
      g.position.copy(p.pos)
      g.rotation.y = p.rot
      if (p.wall) arm.current.rotation.z = WALL_ARM

      // Hologrammes : un par appui déjà quitté (toit, façade), jusqu'au balayage d'arrivée.
      if (ghosts.current) {
        const left = route.slice(0, k).filter((q) => q.ghost)
        left.forEach((q, j) => {
          o.position.copy(q.pos)
          o.rotation.y = q.rot
          o.updateMatrix()
          ghosts.current!.setMatrixAt(j, o.matrix)
        })
        ghosts.current.count = Math.min(left.length, MAX_GHOSTS)
        ghosts.current.instanceMatrix.needsUpdate = true
      }
      // Traînée : du point quitté au point d'arrivée, s'efface avant la téléportation suivante.
      if (trail.current && k) {
        const a = route[k - 1].pos
        buf.set([a.x, a.y + 1, a.z, p.pos.x, p.pos.y + 1, p.pos.z])
        trail.current.geometry.setPositions(buf)
        trail.current.material.opacity = 1 - (journey * route.length - k)
      }
      if (trail.current) trail.current.visible = !!k
    }

    // Appuyer : sur le produit choisi (Projets), ou sur le bouton qui fait apparaître les skills à l'arrivée.
    const key = mode === 'zone' && zoneId === 'skills' && !dashing ? 'skills' : projectId
    if (key !== press.current.key) press.current = { key, at: key ? clock.elapsedTime : -9, reach: key === 'skills' ? 1 : 1.4 }
    const k = (clock.elapsedTime - press.current.at) / 0.6
    arm.current.rotation.x = k < 1 ? -press.current.reach * Math.sin(Math.PI * k) : 0
  })

  return (
    <>
      <Avatar ref={ref} rightArm={arm} />
      {dashing && (
        <>
          <Line ref={trail} points={FLAT} color={C.lavender} lineWidth={8} transparent />
          <instancedMesh ref={ghosts} args={[ghostGeometry, undefined, MAX_GHOSTS]} count={0} frustumCulled={false}>
            <meshBasicMaterial color={C.lavender} transparent opacity={0.45} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
          </instancedMesh>
        </>
      )}
    </>
  )
}
