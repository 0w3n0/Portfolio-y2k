import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { C } from '../tokens'

export type ZoneId = 'projects' | 'skills' | 'about' | 'contact'
export type Trick = { key: number; label: string; pts: number; x: number; y: number } // étiquette BRC (ui/Tricks)

type SceneState = {
  mode: 'overview' | 'zone'
  zoneId: ZoneId | null
  scrollProgress: number // 0→1 sur le rail de la zone
  isTransitioning: boolean
  dashing: boolean // séquence de dashs vue de haut, entre les deux balayages (Menu) ; false = arrivé dans la zone
  journey: number // 0→1 : avancée des dashs du perso (Hero)
  hopAt: number // performance.now() de la dernière téléportation (Hero) → secousse, aberration, lignes de vitesse
  projectId: string | null // produit sorti du distributeur → panel ouvert
  sprayColor: string // bombe choisie pour le mur About
  wallKey: number // +1 = repeindre le mur About à neuf
  volume: number // 0→1, volume général (ui/SoundControl), mémorisé dans le navigateur
  muted: boolean
  score: number // total des points BRC (tricks.ts), mémorisé ; affiché en douce sur le mur About
  combo: number // interactions enchaînées ; 0 = pas de combo en cours
  tricks: Trick[] // dernières étiquettes à afficher
}

// Mise à jour via useScene.setState({ ... }) tant qu'aucune action dédiée n'est nécessaire.
export const useScene = create<SceneState>()(
  persist(
    (): SceneState => ({
      mode: 'overview',
      zoneId: null,
      scrollProgress: 0,
      isTransitioning: false,
      dashing: false,
      journey: 0,
      hopAt: -1e9,
      projectId: null,
      sprayColor: C['pop-pink'],
      wallKey: 0,
      volume: 0.7,
      muted: false,
      score: 0,
      combo: 0,
      tricks: [],
    }),
    { name: 'od-save', partialize: (s) => ({ volume: s.volume, muted: s.muted, score: s.score }) }, // survivent au rechargement : réglage du son, score
  ),
)
