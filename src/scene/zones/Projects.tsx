import { Outlines, useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useRef, useState } from 'react'
import type { Group } from 'three'
import { COLS, PROJECTS } from '../../data/projects'
import { useScene } from '../../store/useScene'
import { SPOTS } from '../City'
import { toonGradient } from '../toon'

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
        onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.1, 0.1, 0.28, 12]} />
        <meshToonMaterial color={p.color} gradientMap={toonGradient} />
        <Outlines thickness={0.02} color="#0A0A0A" />
      </mesh>
    </group>
  )
}

// Distributeur au bord de la place, tourné vers la fin du rail caméra (CameraRig).
export default function Projects() {
  return (
    <group position={[X - 2, 0.2, Z - 3]} rotation-y={1.15}>
      <mesh position-y={1.3}>
        <boxGeometry args={[1.8, 2.6, 1]} />
        <meshToonMaterial color="#E5002B" gradientMap={toonGradient} />
        <Outlines thickness={0.04} color="#0A0A0A" />
      </mesh>
      {/* vitre */}
      <mesh position={[WIN_X, 1.65, 0.505]}>
        <planeGeometry args={[1.2, 1.5]} />
        <meshBasicMaterial color="#0A0A0A" />
      </mesh>
      {/* bac de sortie */}
      <mesh position={[WIN_X, 0.42, 0.505]}>
        <planeGeometry args={[1.2, 0.35]} />
        <meshBasicMaterial color="#0A0A0A" />
      </mesh>
      {/* plaque du clavier (le vrai clavier est le panel DOM) */}
      <mesh position={[0.62, 1.7, 0.505]}>
        <planeGeometry args={[0.36, 0.7]} />
        <meshBasicMaterial color="#F2F0EA" />
      </mesh>
      {PROJECTS.map((p, i) => (
        <Product key={p.id} i={i} />
      ))}
    </group>
  )
}
