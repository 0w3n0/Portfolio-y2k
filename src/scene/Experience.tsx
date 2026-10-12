import { Canvas } from '@react-three/fiber'
import CameraRig from './CameraRig'
import City from './City'
import About from './zones/About'
import Contact from './zones/Contact'
import Projects from './zones/Projects'
import Skills from './zones/Skills'
import { useScene } from '../store/useScene'
if (import.meta.env.DEV) Object.assign(window, { useScene })

export default function Experience() {
  return (
    <div style={{ position: 'fixed', inset: 0, touchAction: 'none', background: '#F2F0EA' }}>
      <Canvas dpr={[1, 1.5]} camera={{ position: [26, 22, 30], fov: 45 }}>
        <CameraRig />
        {/* ciel en aplat = couleur du brouillard : le lointain se fond dedans */}
        <color attach="background" args={['#F2F0EA']} />
        <fog attach="fog" args={['#F2F0EA', 40, 95]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 2]} intensity={2.5} />
        <City />
        <Projects />
        <Skills />
        <About />
        <Contact />
      </Canvas>
    </div>
  )
}
