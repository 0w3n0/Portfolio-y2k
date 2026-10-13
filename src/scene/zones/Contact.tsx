import { Outlines, useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CanvasTexture, SRGBColorSpace, type Mesh, type MeshBasicMaterial } from 'three'
import { CONTACTS, dial } from '../../data/contact'
import { play } from '../../audio'
import { trick } from '../../tricks'
import { useScene } from '../../store/useScene'
import { SPOTS } from '../City'
import { toonGradient } from '../toon'
import { C } from '../../tokens'

const [X, , Z] = SPOTS.contact
const BOOTH_Z = Z - 2 // fond de la place, ouverture face au rail caméra (RAILS.contact dans CameraRig)
const W = 1.2, H = 2.4, D = 1.2
const FACE_Z = -D / 2 + 0.2 // façade du téléphone, contre la paroi du fond
const POSTS: [number, number][] = [[-1, -1], [1, -1], [-1, 1], [1, 1]]

const keyPos = (i: number): [number, number, number] => [((i % 2) - 0.5) * 0.2, 1.3 - Math.floor(i / 2) * 0.16, FACE_Z + 0.02]
const DIAL_DELAY_MS = 400 // le lien s'ouvre après l'onde et l'affichage du numéro (encore dans le délai d'un geste pour les bloqueurs de popups)
const WAVE_S = 0.45
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
const pressed = { i: -1, at: -1e9 } // dernière touche pressée : l'onde la lit à chaque image

// Écran du téléphone : chiffres composés (touche n = chiffre n + 1) et nom du lien appelé.
function Lcd({ typed }: { typed: number[] }) {
  const [canvas, screen] = useMemo(() => {
    const c = Object.assign(document.createElement('canvas'), { width: 256, height: 80 })
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    return [c, t] as const
  }, [])

  useEffect(() => {
    const g = canvas.getContext('2d')!
    g.fillStyle = C.ground
    g.fillRect(0, 0, canvas.width, canvas.height)
    g.fillStyle = C['pop-mint']
    g.textAlign = 'left'
    g.font = '700 36px "JetBrains Mono", monospace'
    g.fillText(typed.length ? typed.slice(-7).map((n) => n + 1).join('') : '_', 16, 40)
    g.font = '700 18px "JetBrains Mono", monospace'
    if (typed.length) g.fillText(`› ${CONTACTS[typed.at(-1)!].label.toUpperCase()}`, 16, 68)
    screen.needsUpdate = true
  }, [typed, canvas, screen])

  return (
    <mesh position={[0, 1.45, FACE_Z - 0.015]}>
      <planeGeometry args={[0.32, 0.1]} />
      <meshBasicMaterial map={screen} toneMapped={false} />
    </mesh>
  )
}

// Onde qui part de la touche pressée, de sa couleur.
function Wave() {
  const ref = useRef<Mesh>(null!)
  const mat = useRef<MeshBasicMaterial>(null!)
  useFrame(() => {
    const t = (performance.now() - pressed.at) / 1000 / WAVE_S
    ref.current.visible = t < 1 && pressed.i >= 0
    if (!ref.current.visible) return
    ref.current.position.set(...keyPos(pressed.i)).setZ(FACE_Z + 0.045)
    ref.current.scale.setScalar(1 + t * 4)
    mat.current.color.set(CONTACTS[pressed.i].color)
    mat.current.opacity = 1 - t
  })
  return (
    <mesh ref={ref} visible={false}>
      <ringGeometry args={[0.07, 0.085, 32]} />
      <meshBasicMaterial ref={mat} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function Key({ i, onPress }: { i: number; onPress: (i: number) => void }) {
  const c = CONTACTS[i]
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  const press = () => {
    const { zoneId, isTransitioning } = useScene.getState()
    if (zoneId !== 'contact' || isTransitioning) return
    play('phoneKey')
    trick('call')
    onPress(i)
    if (!reducedMotion) Object.assign(pressed, { i, at: performance.now() })
    setTimeout(() => dial(c.href), DIAL_DELAY_MS)
  }

  return (
    <mesh
      position={keyPos(i)}
      scale={hovered ? 1.2 : 1}
      onClick={(e) => (e.stopPropagation(), press())}
      onPointerOver={(e) => (e.stopPropagation(), setHovered(true), play('hover'))}
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
  const [typed, setTyped] = useState<number[]>([])
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
      <Lcd typed={typed} />
      <Wave />
      {CONTACTS.map((c, i) => (
        <Key key={c.id} i={i} onPress={(n) => setTyped((t) => [...t, n])} />
      ))}
    </group>
  )
}
