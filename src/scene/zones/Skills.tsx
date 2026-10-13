import { SPOTS } from '../City'
import { Part } from '../Avatar'
import { C } from '../../tokens'

const [X, , Z] = SPOTS.skills

// Borne-bouton devant la main droite du perso (Hero) : il appuie en arrivant, la fiche perso (ui/panels/Skills) s'ouvre.
// Menthe = accent de l'écran Skills (comme les jauges --meter).
export default function Skills() {
  return (
    <group position={[X - 0.3, 0.2, Z + 0.5]}>
      <Part color={C.ground} position-y={0.5}>
        <cylinderGeometry args={[0.04, 0.06, 1, 8]} />
      </Part>
      <Part color={C['pop-mint']} position-y={1.03}>
        <cylinderGeometry args={[0.1, 0.1, 0.06, 16]} />
      </Part>
    </group>
  )
}
