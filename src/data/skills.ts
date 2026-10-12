// Écran de perso façon HSR/Genshin. Contenu factice : à remplacer par le vrai.
export const PROFILE = { name: 'Pseudo', role: 'Dev créatif', level: 26, stars: 5 }

// Boules en orbite autour de l'avatar (scene/zones/Skills)
export type Skill = { name: string; stars: number; projects: string[] } // stars 1→5, projects = ids de data/projects
export const SKILLS: Skill[] = [
  { name: 'React', stars: 5, projects: ['p1', 'p3'] },
  { name: 'TypeScript', stars: 4, projects: ['p3'] },
  { name: 'Three.js / R3F', stars: 4, projects: ['p1', 'p5'] },
  { name: 'Blender', stars: 3, projects: [] },
  { name: 'Figma', stars: 4, projects: ['p2', 'p4'] },
]
