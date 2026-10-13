import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { animate, type AnimationPlaybackControls } from 'motion'
import { useEffect, useMemo } from 'react'
import { CatmullRomCurve3, MathUtils, Vector3 } from 'three'
import { useScene, type ZoneId } from '../store/useScene'
import { SPOTS, type V3 } from './City'
import { heroAt } from './Hero'

type Rail = { pos: CatmullRomCurve3; look: CatmullRomCurve3 }

const curve = (pts: V3[]) => new CatmullRomCurve3(pts.map((p) => new Vector3(...p)))

// Rail relatif au centre du quartier : arrivée depuis la rue au sud (+z), puis on entre dans la place.
const rail = ([x, , z]: V3): Rail => ({
  pos: curve([[x, 2.5, z + 6], [x + 1.5, 1.8, z + 2], [x + 2.5, 1.6, z - 1]]),
  look: curve([[x, 1, z], [x - 0.5, 1, z - 2], [x - 2, 1, z - 4]]),
})

// Vue plongeante sur le centre, le perso (Hero) au premier plan à droite ; le brouillard estompe les bords.
const OVERVIEW = { pos: [30, 14, 22] as V3, look: [0, 2, 0] as V3 }
const ABOVE = new Vector3(0, 22, 8) // pendant les dashs du perso : vue plongeante qui survole la ville, au-dessus des toits (≤ 16 m)

// Point 0 de chaque rail = plan d'arrivée dans la zone.
const RAILS = Object.fromEntries(Object.entries(SPOTS).map(([id, p]) => [id, rail(p)])) as Record<ZoneId, Rail>

// Skills : écran de perso HSR, le perso (Hero) en pied dans le tiers gauche, la fiche DOM à droite ; le scroll rapproche.
{
  const [x, , z] = SPOTS.skills
  RAILS.skills = {
    pos: curve([[x + 0.9, 1.2, z + 3.6], [x + 0.8, 1.35, z + 3], [x + 0.7, 1.5, z + 2.4]]),
    look: curve([[x + 0.9, 1.1, z], [x + 0.6, 1.4, z]]),
  }
}

// About : face au mur graffiti (zones/About, en z - 3.2), le scroll rapproche pour peindre les détails.
{
  const [x, , z] = SPOTS.about
  RAILS.about = {
    pos: curve([[x, 2.2, z + 5], [x, 1.9, z + 3], [x, 1.8, z + 1.3]]),
    look: curve([[x, 1.8, z - 3], [x, 1.7, z - 3.2]]),
  }
}

// Contact : face à la cabine (zones/Contact, en z - 2), le scroll avance jusqu'au clavier du téléphone.
{
  const [x, , z] = SPOTS.contact
  RAILS.contact = {
    pos: curve([[x, 2.2, z + 5], [x, 1.8, z + 2], [x, 1.55, z - 0.9]]),
    look: curve([[x, 1.4, z - 2], [x, 1.45, z - 2.45]]),
  }
}

const WHEEL_PER_RAIL = 3000 // px de molette pour parcourir un rail entier
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

// Avance automatique sur le rail (ouverture d'un projet, arrivée sur Contact) ; coupée par le scroll manuel.
let tween: AnimationPlaybackControls | null = null
const scrollTo = (to: number, duration = 1) => {
  tween?.stop()
  const from = useScene.getState().scrollProgress
  if (reducedMotion) return useScene.setState({ scrollProgress: to })
  tween = animate(from, to, { duration, ease: [0.76, 0, 0.24, 1], onUpdate: (v) => useScene.setState({ scrollProgress: v }) })
}

// Règle 1 : scroll ignoré hors zone (et pendant les dashs). Le reset à 0 est fait par le menu.
const advance = (d: number) => {
  const { mode, scrollProgress, dashing } = useScene.getState()
  if (mode !== 'zone' || dashing || !d) return
  tween?.stop()
  useScene.setState({ scrollProgress: MathUtils.clamp(scrollProgress + d, 0, 1) })
}

// Les changements de plan se font sous le balayage du Menu : coupe franche, pas de vol de caméra.
let cut = true

const SHAKE = 0.5 // amplitude de la secousse au pic (m)
const SHAKE_S = 0.25
const shake = new Vector3()
useScene.subscribe((s, prev) => {
  if (s.mode !== prev.mode || s.dashing !== prev.dashing) cut = true
  if (s.zoneId !== prev.zoneId) tween?.stop() // sinon un tween en cours écraserait le reset à 0 du menu
  const arrived = s.mode === 'zone' && !s.dashing && (prev.dashing || prev.mode !== 'zone')
  if (arrived && s.zoneId === 'contact') scrollTo(1) // zoom sur le téléphone dès l'arrivée
  else if (s.zoneId === 'projects' && !!s.projectId !== !!prev.projectId) scrollTo(s.projectId ? 1 : 0) // ouvrir → 1, fermer (Échap) → 0
})

export default function CameraRig() {
  const [target, lookTarget, look] = useMemo(() => [new Vector3(), new Vector3(), new Vector3()], [])

  useEffect(() => {
    let touchY = 0
    const onWheel = (e: WheelEvent) => advance((e.deltaY * (e.deltaMode ? 40 : 1)) / WHEEL_PER_RAIL) // deltaMode 1 = lignes (Firefox)
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0].clientY)
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY
      advance((touchY - y) / (WHEEL_PER_RAIL / 3))
      touchY = y
    }
    const onKey = (e: KeyboardEvent) => advance(e.key === 'ArrowDown' ? 0.1 : e.key === 'ArrowUp' ? -0.1 : 0)
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  useFrame(({ camera, clock }, dt) => {
    camera.position.sub(shake) // retire la secousse de la frame précédente avant de viser
    const { mode, zoneId, scrollProgress, isTransitioning, dashing, journey, hopAt } = useScene.getState()
    const r = mode === 'zone' && zoneId ? RAILS[zoneId] : null
    if (r && dashing) {
      heroAt(journey, lookTarget)
      target.copy(lookTarget).add(ABOVE)
    } else if (r) {
      r.pos.getPoint(scrollProgress, target)
      r.look.getPoint(scrollProgress, lookTarget)
    } else {
      target.set(...OVERVIEW.pos)
      lookTarget.set(...OVERVIEW.look)
    }

    if (reducedMotion || cut) {
      cut = false
      camera.position.copy(target)
      look.copy(lookTarget)
    } else {
      if (!r) {
        const t = clock.elapsedTime
        target.x += Math.sin(t * 0.3) * 0.6
        target.y += Math.sin(t * 0.5) * 0.25
      }
      const lag = dashing ? 0.25 : 0.8 // dashs : suivre de près, mais lisser le zigzag
      easing.damp3(camera.position, target, lag, dt)
      easing.damp3(look, lookTarget, lag, dt)
    }
    // secousse brève à chaque téléportation (Hero), qui s'amortit en SHAKE_S
    const k = Math.max(0, 1 - (performance.now() - hopAt) / 1000 / SHAKE_S) ** 2
    shake.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(SHAKE * k)
    camera.position.add(shake)
    camera.lookAt(look)

    const moving = camera.position.distanceTo(target) > 0.5
    if (moving !== isTransitioning) useScene.setState({ isTransitioning: moving })
  })

  return null
}
