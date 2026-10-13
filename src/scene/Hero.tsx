import { useFrame } from '@react-three/fiber'
import { animate, type AnimationPlaybackControls } from 'motion'
import { useMemo, useRef } from 'react'
import { MathUtils, Vector3, type Group } from 'three'
import { useScene, type ZoneId } from '../store/useScene'
import Avatar from './Avatar'
import { CELL, GRID, SPOTS, roofAt } from './City'
import { MACHINE } from './zones/Projects'

// Le perso du visiteur : au premier plan sur un toit (derrière l'image du Menu) en overview,
// puis il va de quartier en quartier en sautant de toit en toit. Retour en overview : il reste où il est.

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
type Leg = { to: Vector3; arc: number }
const route = { from: START.clone(), legs: [] as Leg[], face: 0.46 } // 0.46 = vers la caméra d'overview (CameraRig)

// Plus court chemin de toits (8 voisins) d'une cellule à une autre ; les places des quartiers ne se traversent pas.
const isSpot = (i: number, j: number) => Object.values(SPOTS).some(([x, , z]) => x === i * CELL && z === j * CELL)
function roofPath(a: [number, number], b: [number, number]) {
  const key = (c: [number, number]) => c.join()
  const prev = new Map<string, [number, number] | null>([[key(a), null]])
  const queue = [a]
  while (queue.length) {
    const c = queue.shift()!
    if (key(c) === key(b)) break
    for (let di = -1; di <= 1; di++)
      for (let dj = -1; dj <= 1; dj++) {
        const n: [number, number] = [c[0] + di, c[1] + dj]
        if (prev.has(key(n)) || Math.abs(n[0]) > GRID || Math.abs(n[1]) > GRID) continue
        if (isSpot(...n) && key(n) !== key(b)) continue
        prev.set(key(n), c)
        queue.push(n)
      }
  }
  const cells: [number, number][] = []
  for (let c = prev.get(key(b)); c && key(c) !== key(a); c = prev.get(key(c))) cells.unshift(c)
  return cells
}

// Saut en parabole : plus la marche est haute, plus il saute haut (sinon il traverserait la façade).
const jump = (from: Vector3, to: Vector3): Leg => ({ to, arc: 3 + Math.abs(to.y - from.y) / 2 })

function plan(from: Vector3, id: ZoneId) {
  const cell = (v: Vector3): [number, number] => [Math.round(v.x / CELL), Math.round(v.z / CELL)]
  const dest = SPOTS[id], stand = STANDS[id]
  const legs: Leg[] = []
  let p = from
  for (const [i, j] of roofPath(cell(from), cell(new Vector3(...dest)))) {
    const roof = new Vector3(i * CELL, roofAt(i * CELL, j * CELL), j * CELL)
    legs.push(jump(p, roof))
    p = roof
  }
  // atterrissage sur la place, du côté d'où il arrive, puis marche jusqu'à sa place
  const land = new Vector3(p.x - dest[0], 0, p.z - dest[2]).setLength(2.5).add(new Vector3(dest[0], 0.2, dest[2]))
  legs.push(jump(p, land), { to: stand.pos, arc: 0 })
  Object.assign(route, { from: from.clone(), legs, face: stand.face })
}

// Position du perso à l'avancée t (0→1) du trajet en cours : chaque étape = même durée.
export function heroAt(t: number, out: Vector3) {
  const { from, legs } = route
  if (!legs.length) return out.copy(from)
  const f = MathUtils.clamp(t, 0, 1) * legs.length
  const i = Math.min(Math.floor(f), legs.length - 1), s = f - i
  out.lerpVectors(i ? legs[i - 1].to : from, legs[i].to, s)
  out.y += legs[i].arc * 4 * s * (1 - s)
  return out
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
const here = new Vector3()
let tween: AnimationPlaybackControls | null = null
useScene.subscribe((s, prev) => {
  if (s.zoneId === prev.zoneId || !s.zoneId) return // retour overview : le trajet en cours se termine
  tween?.stop()
  plan(heroAt(prev.journey, here), s.zoneId) // repart d'où il est, même en plein saut
  if (reducedMotion) return useScene.setState({ journey: 1 })
  useScene.setState({ journey: 0 })
  tween = animate(0, 1, { duration: route.legs.length * 0.8, ease: 'linear', onUpdate: (v) => useScene.setState({ journey: v }) })
})

export default function Hero() {
  const ref = useRef<Group>(null!)
  const arm = useRef<Group>(null!)
  const ahead = useMemo(() => new Vector3(), [])
  const press = useRef({ key: '' as string | null, at: -9, reach: 1.4 })

  useFrame(({ clock }) => {
    const { journey, projectId, zoneId } = useScene.getState()
    const pos = heroAt(journey, ref.current.position)
    if (!route.legs.length || journey > 0.99) ref.current.rotation.y = route.face
    else ref.current.rotation.y = face(pos, heroAt(journey + 0.01, ahead))

    // Appuyer : sur le produit choisi (Projets), ou sur le bouton qui fait apparaître les skills à l'arrivée.
    const key = zoneId === 'skills' && journey >= 1 ? 'skills' : projectId
    if (key !== press.current.key) press.current = { key, at: key ? clock.elapsedTime : -9, reach: key === 'skills' ? 1 : 1.4 }
    const k = (clock.elapsedTime - press.current.at) / 0.6
    arm.current.rotation.x = k < 1 ? -press.current.reach * Math.sin(Math.PI * k) : 0
  })

  return <Avatar ref={ref} rightArm={arm} />
}
