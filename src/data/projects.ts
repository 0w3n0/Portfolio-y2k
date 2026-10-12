export type Project = {
  id: string
  title: string
  year: number
  tags: string[]
  description: string
  url?: string
  color: string // couleur du produit dans le distributeur
}

// Contenu factice : à remplacer par les vrais projets (max 9 = grille 3×3 du distributeur).
export const PROJECTS: Project[] = [
  { id: 'p1', title: 'Projet Un', year: 2026, tags: ['React', 'Three.js'], description: 'Description courte du projet.', color: '#E5002B' },
  { id: 'p2', title: 'Projet Deux', year: 2025, tags: ['Design'], description: 'Description courte du projet.', color: '#FF3EA5' },
  { id: 'p3', title: 'Projet Trois', year: 2025, tags: ['TypeScript'], description: 'Description courte du projet.', color: '#B6FF00' },
  { id: 'p4', title: 'Projet Quatre', year: 2024, tags: ['Motion'], description: 'Description courte du projet.', color: '#F2F0EA' },
  { id: 'p5', title: 'Projet Cinq', year: 2024, tags: ['WebGL'], description: 'Description courte du projet.', color: '#E5002B' }, // pas #0A0A0A : invisible sur la vitre noire
]

export const COLS = 3
// Code de sélection façon distributeur : rangée en lettre, colonne en chiffre (A1, A2, … B1).
export const projectCode = (i: number) => `${'ABC'[Math.floor(i / COLS)]}${(i % COLS) + 1}`
