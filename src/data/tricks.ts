// Figures façon BRC : chaque interaction fait jaillir une étiquette près du curseur et rapporte des points,
// multipliés par le combo en cours (interactions enchaînées à moins de COMBO_MS d'écart). Score total caché sur le mur About.
export const COMBO_MS = 3000

export const TRICKS = {
  spot: { label: 'New spot', pts: 300 }, // arrivée dans un quartier (une fois par visite)
  grab: { label: 'Grab', pts: 100 }, // produit pris au distributeur
  tag: { label: 'Tag', pts: 50 }, // un trait de bombe sur le mur
  shake: { label: 'Shake', pts: 20 }, // changement de bombe
  buff: { label: 'Buff', pts: 30 }, // mur repeint à neuf
  call: { label: 'Call', pts: 80 }, // touche du téléphone
  flip: { label: 'Flip', pts: 40 }, // changement d'onglet dans Skills
} satisfies Record<string, { label: string; pts: number }>

export type TrickId = keyof typeof TRICKS
