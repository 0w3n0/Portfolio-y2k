import { Outlines, useCursor } from '@react-three/drei'
import { useState } from 'react'
import { CONTACTS, dial } from '../../data/contact'
import { useScene } from '../../store/useScene'
import { SPOTS } from '../City'
import { toonGradient } from '../toon'
import { C } from '../../tokens'

const [X, , Z] = SPOTS.contact
const BOOTH_Z = Z - 2 // fond de la place, ouverture face au rail caméra (RAILS.contact dans CameraRig)
const W = 1.2, H = 2.4, D = 1.2
const FACE_Z = -D / 2 + 0.2 // façade du téléphone, contre la paroi du fond
const POSTS: [number, number][] = [[-1, -1], [1, -1], [-1, 1], [1, 1]]

function Key({ i }: { i: number }) {
  const c = CONTACTS[i]
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  const press = () => {
    const { zoneId, isTransitioning } = useScene.getState()
    if (zoneId === 'contact' && !isTransitioning) dial(c.href)
  }

  return (
    <mesh
      position={[((i % 2) - 0.5) * 0.2, 1.3 - Math.floor(i / 2) * 0.16, FACE_Z + 0.02]}
      scale={hovered ? 1.2 : 1}
      onClick={(e) => (e.stopPropagation(), press())}
      onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[0.14, 0.11, 0.04]} />
      <meshToonMaterial color={c.color} gradientMap={toonGradient} />
      <Outlines thickness={0.01} color={C.ground} />
    </mesh>
  )
}

// Cabine téléphonique ouverte devant ; chaque touche du clavier compose un lien (data/contact).
export default function Contact() {
  return (
    <group position={[X, 0.2, BOOTH_Z]}>
      {POSTS.map(([sx, sz]) => (
        <mesh key={`${sx}${sz}`} position={[(sx * W) / 2, H / 2, (sz * D) / 2]}>
          <boxGeometry args={[0.1, H, 0.1]} />
          <meshToonMaterial color={C.lavender} gradientMap={toonGradient} />
          <Outlines thickness={0.03} color={C.ground} />
        </mesh>
      ))}
      {/* toit + bandeau enseigne */}
      <mesh position-y={H + 0.1}>
        <boxGeometry args={[W + 0.2, 0.2, D + 0.2]} />
        <meshToonMaterial color={C.lavender} gradientMap={toonGradient} />
        <Outlines thickness={0.04} color={C.ground} />
      </mesh>
      <mesh position={[0, H - 0.12, D / 2 + 0.06]}>
        <planeGeometry args={[W, 0.22]} />
        <meshBasicMaterial color={C['pop-mint']} />
      </mesh>
      {/* paroi du fond pleine, côtés vitrés */}
      <mesh position={[0, H / 2, -D / 2]}>
        <boxGeometry args={[W, H, 0.04]} />
        <meshToonMaterial color={C.chrome} gradientMap={toonGradient} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * W) / 2, H / 2 + 0.2, 0]} rotation-y={Math.PI / 2}>
          <planeGeometry args={[D, H - 0.6]} />
          <meshBasicMaterial color={C['pop-mint']} transparent opacity={0.18} depthWrite={false} />
        </mesh>
      ))}
      {/* téléphone : boîtier, combiné, clavier */}
      <mesh position={[0, 1.25, -D / 2 + 0.1]}>
        <boxGeometry args={[0.5, 0.8, 0.16]} />
        <meshToonMaterial color={C.ground} gradientMap={toonGradient} />
        <Outlines thickness={0.015} color={C.ink} />
      </mesh>
      <mesh position={[0, 1.55, FACE_Z + 0.04]} rotation-z={Math.PI / 2}>
        <capsuleGeometry args={[0.04, 0.3, 4, 8]} />
        <meshToonMaterial color={C['pop-mint']} gradientMap={toonGradient} />
        <Outlines thickness={0.01} color={C.ground} />
      </mesh>
      {CONTACTS.map((c, i) => (
        <Key key={c.id} i={i} />
      ))}
    </group>
  )
}
