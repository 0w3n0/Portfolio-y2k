import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useEffect, useMemo } from 'react'
import { CatmullRomCurve3, MathUtils, Vector3 } from 'three'
import { useScene, type ZoneId } from '../store/useScene'
import { SPOTS, type V3 } from './City'

type Rail = { pos: CatmullRomCurve3; look: CatmullRomCurve3 }

const curve = (pts: V3[]) => new CatmullRomCurve3(pts.map((p) => new Vector3(...p)))

// Rail relatif au centre du quartier : arrivée depuis la rue au sud (+z), puis on entre dans la place.
const rail = ([x, , z]: V3): Rail => ({
  pos: curve([[x, 2.5, z + 6], [x + 1.5, 1.8, z + 2], [x + 2.5, 1.6, z - 1]]),
  look: curve([[x, 1, z], [x - 0.5, 1, z - 2], [x - 2, 1, z - 4]]),
})

// Vue plongeante sur le centre ; le brouillard (Experience) estompe les bords de la ville.
const OVERVIEW = { pos: [26, 22, 30] as V3, look: [0, 0, 0] as V3 }

// Point 0 de chaque rail = plan d'arrivée dans la zone.
const RAILS = Object.fromEntries(Object.entries(SPOTS).map(([id, p]) => [id, rail(p)])) as Record<ZoneId, Rail>

// Skills : écran de perso, le scroll tourne autour de l'avatar (zones/Skills) au lieu d'avancer dans la place.
{
  const [x, , z] = SPOTS.skills
  RAILS.skills = {
    pos: curve([[x, 1.5, z + 4.2], [x + 2.4, 1.4, z + 3.4], [x + 3.8, 1.3, z + 1.4]]),
    look: curve([[x, 1.15, z], [x, 1.1, z]]),
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

// Règle 1 : scroll ignoré hors zone. Le reset à 0 est fait par le menu.
const advance = (d: number) => {
  const { mode, scrollProgress } = useScene.getState()
  if (mode === 'zone') useScene.setState({ scrollProgress: MathUtils.clamp(scrollProgress + d, 0, 1) })
}

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
    const { mode, zoneId, scrollProgress, isTransitioning } = useScene.getState()
    const r = mode === 'zone' && zoneId ? RAILS[zoneId] : null
    if (r) {
      r.pos.getPoint(scrollProgress, target)
      r.look.getPoint(scrollProgress, lookTarget)
    } else {
      target.set(...OVERVIEW.pos)
      lookTarget.set(...OVERVIEW.look)
    }

    if (reducedMotion) {
      // coupe directe
      camera.position.copy(target)
      look.copy(lookTarget)
    } else {
      if (!r) {
        const t = clock.elapsedTime
        target.x += Math.sin(t * 0.3) * 0.6
        target.y += Math.sin(t * 0.5) * 0.25
      }
      easing.damp3(camera.position, target, 0.8, dt)
      easing.damp3(look, lookTarget, 0.8, dt)
    }
    camera.lookAt(look)

    const moving = camera.position.distanceTo(target) > 0.5
    if (moving !== isTransitioning) useScene.setState({ isTransitioning: moving })
  })

  return null
}
