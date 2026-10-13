import { Canvas } from '@react-three/fiber'
import CameraRig from './CameraRig'
import City from './City'
import Hero from './Hero'
import About from './zones/About'
import Contact from './zones/Contact'
import Projects from './zones/Projects'
import Skills from './zones/Skills'
import { useScene } from '../store/useScene'
import { C } from '../tokens'

const SKY = C.sky // le brouillard a la couleur du ciel : le lointain se fond dedans
if (import.meta.env.DEV) Object.assign(window, { useScene })

export default function Experience() {
  return (
    <div style={{ position: 'fixed', inset: 0, touchAction: 'none', background: SKY }}>
      <Canvas dpr={[1, 1.5]} camera={{ position: [30, 14, 22], fov: 45 }}>
        <CameraRig />
        <color attach="background" args={[SKY]} />
        <fog attach="fog" args={[SKY, 40, 150]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 2]} intensity={2.5} />
        <City />
        <Hero />
        <Projects />
        <Skills />
        <About />
        <Contact />
      </Canvas>
    </div>
  )
}
