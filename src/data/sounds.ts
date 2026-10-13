// Tous les sons du site. Pour brancher un son : déposer le fichier dans public/sounds/ et mettre son chemin dans `src`
// (ex. '/sounds/dash.mp3'). src vide = son muet en attendant, rien ne casse.
// volume = niveau propre au son (0→1), multiplié par le volume général réglé par le visiteur (contrôle en haut à droite).
// Sons originaux ou libres de droits (CC0) uniquement : rien de repris de Persona, HSR ou BRC.
export type Sound = { src: string; volume: number; loop?: boolean }

export const SOUNDS = {
  // Ambiance — boucles, lancées au premier clic (les navigateurs bloquent le son avant)
  music: { src: '', volume: 0.35, loop: true }, // boucle funk / hyperpop
  city: { src: '', volume: 0.25, loop: true }, // rumeur de la ville la nuit

  // Interface (menu, boutons, panels)
  hover: { src: '', volume: 0.3 }, // survol : entrée de menu, touche du clavier projets, onglet, produit, touche du téléphone
  select: { src: '', volume: 0.6 }, // clic sur une catégorie du menu
  back: { src: '', volume: 0.5 }, // Retour / Échap
  swipe: { src: '', volume: 0.6 }, // balayage plein écran (aller, arrivée, retour)

  // Trajet du perso (Hero)
  dash: { src: '', volume: 0.5 }, // chaque téléportation
  arrive: { src: '', volume: 0.6 }, // arrivée dans le quartier, sous le 2e balayage
  stamp: { src: '', volume: 0.7 }, // le titre du quartier tombe en tampon (impact)

  // Projets : distributeur
  machineButton: { src: '', volume: 0.6 }, // touche du distributeur pressée
  productDrop: { src: '', volume: 0.7 }, // le produit tombe dans le bac (la fiche s'ouvre)
  panelClose: { src: '', volume: 0.4 }, // fiche projet fermée

  // Skills : fiche perso
  kiosk: { src: '', volume: 0.6 }, // le perso appuie sur la borne à l'arrivée
  tab: { src: '', volume: 0.5 }, // changement d'onglet (Stats / Compétences / Équipement)

  // About : mur à graffer
  sprayShake: { src: '', volume: 0.5 }, // changement de bombe (bille qui claque)
  spray: { src: '', volume: 0.4, loop: true }, // pschhh, tant qu'on peint
  wipe: { src: '', volume: 0.5 }, // repeindre le mur à neuf

  // Contact : cabine
  phoneKey: { src: '', volume: 0.6 }, // touche du téléphone
} satisfies Record<string, Sound>

export type SoundId = keyof typeof SOUNDS
