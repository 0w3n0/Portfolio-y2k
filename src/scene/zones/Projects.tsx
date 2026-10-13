import { Outlines, useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CanvasTexture, Object3D, SRGBColorSpace, Vector3, type Group, type InstancedMesh, type MeshBasicMaterial } from 'three'
import { COLS, PROJECTS, projectCode } from '../../data/projects'
import { play } from '../../audio'
import { useScene } from '../../store/useScene'
import { SPOTS } from '../City'
import { toonGradient } from '../toon'
import { C } from '../../tokens'

const [X, , Z] = SPOTS.projects
const WIN_X = -0.25 // centre de la vitre (le monnayeur est à droite)
const TRAY: [number, number, number] = [WIN_X, 0.42, 0.62]
const slot = (i: number): [number, number, number] => [WIN_X + ((i % COLS) - 1) * 0.38, 2.15 - Math.floor(i / COLS) * 0.45, 0.62]
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

function Product({ i }: { i: number }) {
  const p = PROJECTS[i]
  const ref = useRef<Group>(null!)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  // Le produit choisi tombe dans le bac ; les autres restent (ou remontent) dans leur case.
  useFrame((_, dt) => {
    const target = useScene.getState().projectId === p.id ? TRAY : slot(i)
    if (reducedMotion) ref.current.position.set(...target)
    else easing.damp3(ref.current.position, target, 0.15, dt)
  })

  const pick = () => {
    const { zoneId, isTransitioning } = useScene.getState()
    if (zoneId === 'projects' && !isTransitioning) useScene.setState({ projectId: p.id })
  }

  return (
    <group ref={ref} position={slot(i)}>
      <mesh
        scale={hovered ? 1.15 : 1}
        onClick={(e) => (e.stopPropagation(), pick())}
        onPointerOver={(e) => (e.stopPropagation(), setHovered(true), play('hover'))}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.1, 0.1, 0.28, 12]} />
        <meshToonMaterial color={p.color} gradientMap={toonGradient} />
        <Outlines thickness={0.02} color={C.ground} />
      </mesh>
    </group>
  )
}

// Petit écran au-dessus de la plaque du clavier : le code du produit choisi (A1…), qui clignote à la sélection.
function Lcd() {
  const projectId = useScene((s) => s.projectId)
  const mat = useRef<MeshBasicMaterial>(null!)
  const at = useRef(-1e9)
  const [canvas, tex] = useMemo(() => {
    const c = Object.assign(document.createElement('canvas'), { width: 256, height: 96 })
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace // couleurs du design system telles quelles
    return [c, t] as const
  }, [])

  useEffect(() => {
    const i = PROJECTS.findIndex((p) => p.id === projectId)
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = C.ground
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = C['pop-pink']
    ctx.font = '700 64px "JetBrains Mono", monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(i < 0 ? '--' : projectCode(i), canvas.width / 2, canvas.height / 2)
    tex.needsUpdate = true
    if (i >= 0 && !reducedMotion) at.current = performance.now()
  }, [projectId, canvas, tex])

  // 3 clignotements en 0,6 s, puis fixe
  useFrame(() => {
    const t = (performance.now() - at.current) / 1000
    mat.current.color.setScalar(t > 0.6 || Math.floor(t / 0.1) % 2 ? 1 : 0.2)
  })

  return (
    <mesh position={[0.62, 2.3, 0.506]}>
      <planeGeometry args={[0.36, 0.135]} />
      <meshBasicMaterial ref={mat} map={tex} toneMapped={false} />
    </mesh>
  )
}

// Éclats qui jaillissent du bac quand le produit y tombe (DROP_S après le choix) : un seul draw call.
const DROP_S = 0.35 // même délai que le son productDrop (audio.ts) et la fiche (ui/panels/Projects)
const BURST_S = 0.5
const SHARDS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI - Math.PI / 2 + Math.sin(i * 12.9) * 0.3 // éventail vers le haut et les côtés
  return new Vector3(Math.sin(a), 0.8 + Math.abs(Math.cos(i * 7.3)) * 0.8, 0.6 + Math.abs(Math.sin(i * 3.1)))
})

function Burst() {
  const ref = useRef<InstancedMesh>(null!)
  const at = useRef(-1e9)
  const o = useMemo(() => new Object3D(), [])

  useEffect(
    () =>
      useScene.subscribe((s, p) => {
        if (s.projectId && s.projectId !== p.projectId) at.current = performance.now() + DROP_S * 1000
      }),
    [],
  )

  useFrame(() => {
    const t = (performance.now() - at.current) / 1000, m = ref.current
    m.visible = t >= 0 && t <= BURST_S
    if (!m.visible) return
    SHARDS.forEach((d, i) => {
      o.position.set(...TRAY).addScaledVector(d, t * 2.2)
      o.position.y -= 4 * t * t // retombent
      o.rotation.set(t * 9 + i, t * 7, i)
      o.scale.setScalar(0.07 * (1 - t / BURST_S))
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, SHARDS.length]} visible={false} frustumCulled={false}>
      <tetrahedronGeometry />
      <meshBasicMaterial color={C['pop-pink']} />
    </instancedMesh>
  )
}

export const MACHINE = { pos: [X - 2, 0.2, Z - 3] as [number, number, number], rotY: 1.15 }

// Distributeur au bord de la place, tourné vers la fin du rail caméra (CameraRig).
export default function Projects() {
  return (
    <group position={MACHINE.pos} rotation-y={MACHINE.rotY}>
      <mesh position-y={1.3}>
        <boxGeometry args={[1.8, 2.6, 1]} />
        <meshToonMaterial color={C.chrome} gradientMap={toonGradient} />
        <Outlines thickness={0.04} color={C.ground} />
      </mesh>
      {/* vitre */}
      <mesh position={[WIN_X, 1.65, 0.505]}>
        <planeGeometry args={[1.2, 1.5]} />
        <meshBasicMaterial color={C.ground} />
      </mesh>
      {/* bac de sortie */}
      <mesh position={[WIN_X, 0.42, 0.505]}>
        <planeGeometry args={[1.2, 0.35]} />
        <meshBasicMaterial color={C.ground} />
      </mesh>
      {/* plaque du clavier (le vrai clavier est le panel DOM) */}
      <mesh position={[0.62, 1.7, 0.505]}>
        <planeGeometry args={[0.36, 0.7]} />
        <meshBasicMaterial color={C.chrome} />
      </mesh>
      <Lcd />
      {!reducedMotion && <Burst />}
      {PROJECTS.map((p, i) => (
        <Product key={p.id} i={i} />
      ))}
    </group>
  )
}
