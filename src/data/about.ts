import { C } from '../tokens'

// Bio peinte en tags sur le mur (zone About). x, y = position en fraction du mur ; size = fraction de sa hauteur.
// Contenu factice : à remplacer par la vraie bio.
export const TAGS = [
  { text: 'Salut !', x: 0.3, y: 0.3, size: 0.28, rotate: -8, fill: C['pop-pink'] },
  { text: 'Dev créatif', x: 0.65, y: 0.52, size: 0.16, rotate: 4, fill: C.ink },
  { text: 'Basé à ???', x: 0.28, y: 0.76, size: 0.11, rotate: -3, fill: C.lavender },
  { text: '3D • Web • Motion', x: 0.72, y: 0.84, size: 0.07, rotate: 0, fill: C.ink },
]

// Bombes de peinture proposées au visiteur
export const SPRAYS = [
  { name: 'Rose', color: C['pop-pink'] },
  { name: 'Lavande', color: C.lavender },
  { name: 'Menthe', color: C['pop-mint'] },
  { name: 'Blanc', color: C.ink },
]
