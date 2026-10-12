import { Html, Outlines } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Object3D, Vector3, type Group, type InstancedMesh } from 'three'
import { PROJECTS } from '../../data/projects'
import { SKILLS } from '../../data/skills'
import { useScene } from '../../store/useScene'
import { SPOTS } from '../City'
import { toonGradient } from '../toon'

const [X, , Z] = SPOTS.skills
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

// shortcut: avatar en primitives, à remplacer par le .glb Blender (scene/models/) quand il sera modélisé.
const SKIN = '#D9A27E' // à ajuster
const HAIR = '#3B2416' // à ajuster
const PINK = '#FF3EA5'
const INK = '#0A0A0A'
const HEAD_Y = 1.65

// Boucles = petites sphères sur le haut et l'arrière du crâne, en laissant le visage dégagé.
const CURLS: Vector3[] = []
for (let i = 0, n = 70; i < n; i++) {
  const y = 1 - (i / (n - 1)) * 1.3 // spirale de Fibonacci, de y=1 à y=-0.3
  const r = Math.sqrt(1 - y * y), a = i * 2.39996
  const d = new Vector3(Math.cos(a) * r, y, Math.sin(a) * r)
  if (d.z > 0.35 && d.y < 0.5) continue // visage
  CURLS.push(d.multiplyScalar(0.2))
}

function Hair() {
  const ref = useRef<InstancedMesh>(null!)
  useLayoutEffect(() => {
    const o = new Object3D()
    CURLS.forEach((p, i) => {
      o.position.copy(p)
      o.updateMatrix()
      ref.current.setMatrixAt(i, o.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, CURLS.length]} position-y={HEAD_Y}>
      <sphereGeometry args={[0.075, 8, 6]} />
      <meshToonMaterial color={HAIR} gradientMap={toonGradient} />
      <Outlines thickness={0.012} color={INK} />
    </instancedMesh>
  )
}

function Part({ color, outline = 0.02, children, ...props }: { color: string; outline?: number; children: React.ReactNode } & React.ComponentProps<'mesh'>) {
  return (
    <mesh {...props}>
      {children}
      <meshToonMaterial color={color} gradientMap={toonGradient} />
      <Outlines thickness={outline} color={INK} />
    </mesh>
  )
}

function Avatar() {
  const ref = useRef<Group>(null!)
  useFrame(({ clock }) => {
    if (reducedMotion) return
    const t = clock.elapsedTime
    ref.current.position.y = 0.26 + Math.sin(t * 2) * 0.015 // respiration
    ref.current.rotation.y = Math.sin(t * 0.4) * 0.08
  })

  return (
    <group ref={ref} position={[X, 0.26, Z]}>
      {/* pantalon noir */}
      {[-0.1, 0.1].map((x) => (
        <Part key={x} color={INK} position={[x, 0.425, 0]}>
          <boxGeometry args={[0.16, 0.85, 0.18]} />
        </Part>
      ))}
      <Part color={PINK} position-y={1.15}>
        <boxGeometry args={[0.44, 0.6, 0.24]} />
      </Part>
      {[-1, 1].map((s) => (
        <Part key={s} color={PINK} position={[s * 0.3, 1.12, 0]} rotation-z={s * 0.12}>
          <capsuleGeometry args={[0.065, 0.45, 4, 8]} />
        </Part>
      ))}
      <Part color={SKIN} position-y={HEAD_Y}>
        <sphereGeometry args={[0.2, 16, 12]} />
      </Part>
      <Hair />
      {/* yeux bleus */}
      {[-0.075, 0.075].map((x) => (
        <mesh key={x} position={[x, HEAD_Y + 0.02, 0.185]}>
          <sphereGeometry args={[0.032, 8, 6]} />
          <meshBasicMaterial color="#2F8CFF" />
        </mesh>
      ))}
    </group>
  )
}

// Anneau de compétences façon HSR : des boules qui tournent autour de l'avatar, données en étiquette DOM.
const CENTER = new Vector3(X, 1.45, Z) // assez haut pour que la boule du bas ne passe pas sous le sol
const RADIUS = 1.15

function Orbit() {
  const ring = useRef<Group>(null!)
  const labels = useRef<HTMLDivElement[]>([])
  const v = useMemo(() => new Vector3(), [])
  useFrame(({ camera }, dt) => {
    if (!reducedMotion) ring.current.rotation.x += dt * 0.3
    // étiquette estompée quand sa boule passe derrière l'avatar
    const d = camera.position.distanceTo(CENTER)
    ring.current.children.forEach((c, i) => {
      const el = labels.current[i]
      if (el) el.style.opacity = c.getWorldPosition(v).distanceTo(camera.position) > d ? '0.35' : '1'
    })
  })

  return (
    // roue verticale tournée sur Y : vue de 3/4 depuis la caméra au lieu d'être vue par la tranche
    <group position={CENTER.toArray()} rotation-y={0.6}>
      <group ref={ring}>
        {SKILLS.map((s, i) => {
          const a = (i / SKILLS.length) * Math.PI * 2
          return (
            <group key={s.name} position={[0, Math.cos(a) * RADIUS, Math.sin(a) * RADIUS]}>
              <Part color={PINK}>
                <sphereGeometry args={[0.11, 16, 12]} />
              </Part>
              {/* zIndexRange sous le menu (10) et le balayage (100) */}
              <Html center position-y={0.25} distanceFactor={4} zIndexRange={[5, 0]}>
                <div className="skill-tag" ref={(el) => void (labels.current[i] = el!)}>
                  <strong>{s.name}</strong>
                  <span aria-label={`${s.stars} sur 5`}>{'★'.repeat(s.stars)}</span>
                  {s.projects.length > 0 && (
                    <ul>
                      {s.projects.map((id) => (
                        <li key={id}>{PROJECTS.find((p) => p.id === id)?.title}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </Html>
            </group>
          )
        })}
      </group>
    </group>
  )
}

// L'anneau n'existe qu'en zone : ses étiquettes DOM ignorent le brouillard et seraient visibles depuis l'overview.
export default function Skills() {
  const active = useScene((s) => s.zoneId === 'skills')
  return (
    <>
      <Avatar />
      {active && <Orbit />}
    </>
  )
}
