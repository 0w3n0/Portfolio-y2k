import { Outlines } from '@react-three/drei'
import { useLayoutEffect, useRef, type ComponentProps, type ReactNode, type Ref } from 'react'
import { BoxGeometry, BufferGeometry, CapsuleGeometry, Euler, Matrix4, Object3D, SphereGeometry, Vector3, type Group, type InstancedMesh } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { V3 } from './City'
import { toonGradient } from './toon'
import { C } from '../tokens'

// shortcut: avatar en primitives, à remplacer par le .glb Blender (scene/models/) quand il sera modélisé.
const SKIN = '#D9A27E' // à ajuster
const HAIR = '#3B2416' // à ajuster
export const PINK = C['pop-pink']
const INK = C.ground
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

export function Part({ color, outline = 0.02, children, ...props }: { color: string; outline?: number; children: ReactNode } & ComponentProps<'mesh'>) {
  return (
    <mesh {...props}>
      {children}
      <meshToonMaterial color={color} gradientMap={toonGradient} />
      <Outlines thickness={outline} color={INK} />
    </mesh>
  )
}

// Le perso, pieds en y = 0, regard vers +z. rightArm = pivot à l'épaule (geste « appuyer », Hero).
export default function Avatar({ rightArm, ...props }: { rightArm?: Ref<Group> } & ComponentProps<'group'>) {
  return (
    <group {...props}>
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
        <group key={s} ref={s === -1 ? rightArm : undefined} position={[s * 0.3, 1.4, 0]} rotation-z={s * 0.12}>
          <Part color={PINK} position-y={-0.28}>
            <capsuleGeometry args={[0.065, 0.45, 4, 8]} />
          </Part>
        </group>
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

// Bras droit tendu vers -x, pour prendre appui sur la façade (dashs, Hero).
export const WALL_ARM = -1.5

// Même silhouette d'un seul tenant, en pose « appui au mur » : hologrammes des dashs (Hero), 1 draw call pour tous.
export const ghostGeometry = (() => {
  const at = (g: BufferGeometry, [x, y, z]: V3, hang = 0, rx = 0, rz = 0) =>
    g.translate(0, -hang, 0).applyMatrix4(new Matrix4().makeRotationFromEuler(new Euler(rx, 0, rz))).translate(x, y, z)
  const g = mergeGeometries([
    at(new BoxGeometry(0.16, 0.85, 0.18), [-0.1, 0.85, 0], 0.425, 0, -0.3), // jambes écartées
    at(new BoxGeometry(0.16, 0.85, 0.18), [0.1, 0.85, 0], 0.425, 0, 0.3),
    at(new BoxGeometry(0.44, 0.6, 0.24), [0, 1.15, 0]),
    at(new CapsuleGeometry(0.065, 0.45, 4, 8), [-0.3, 1.4, 0], 0.28, 0, WALL_ARM), // main sur le mur
    at(new CapsuleGeometry(0.065, 0.45, 4, 8), [0.3, 1.4, 0], 0.28, 0.9), // bras gauche lancé en arrière
    at(new SphereGeometry(0.24, 12, 8), [0, HEAD_Y, 0]), // tête + cheveux
  ])
  return g.rotateX(0.2) // penché en avant, prêt à rebondir
})()
