// Écran de perso façon HSR/Genshin. Contenu factice : à remplacer par le vrai.
export const PROFILE = { name: 'Pseudo', role: 'Dev créatif', level: 26, stars: 5 }

// Fiche perso (ui/panels/Skills), un onglet par liste. Contenu factice : à remplacer par le vrai.
export const STATS: { name: string; lv: number }[] = [ // lv 0→10
  { name: 'Front', lv: 8 },
  { name: '3D temps réel', lv: 6 },
  { name: 'Design UI', lv: 7 },
  { name: 'Animation', lv: 5 },
]

export type Skill = { name: string; stars: number; projects: string[] } // stars 1→5, projects = ids de data/projects
export const SKILLS: Skill[] = [
  { name: 'React', stars: 5, projects: ['p1', 'p3'] },
  { name: 'TypeScript', stars: 4, projects: ['p3'] },
  { name: 'Three.js / R3F', stars: 4, projects: ['p1', 'p5'] },
]

// Équipement = les outils
export const GEAR: { name: string; use: string; projects: string[] }[] = [
  { name: 'Blender', use: 'Modélisation, cel-shading', projects: [] },
  { name: 'Figma', use: 'Maquettes, design system', projects: ['p2', 'p4'] },
]
