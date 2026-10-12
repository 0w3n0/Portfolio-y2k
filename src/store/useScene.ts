import { create } from 'zustand'

export type ZoneId = 'projects' | 'skills' | 'about' | 'contact'

type SceneState = {
  mode: 'overview' | 'zone'
  zoneId: ZoneId | null
  scrollProgress: number // 0→1 sur le rail de la zone
  isTransitioning: boolean
  projectId: string | null // produit sorti du distributeur → panel ouvert
  sprayColor: string // bombe choisie pour le mur About
  wallKey: number // +1 = repeindre le mur About à neuf
}

// Mise à jour via useScene.setState({ ... }) tant qu'aucune action dédiée n'est nécessaire.
export const useScene = create<SceneState>(() => ({
  mode: 'overview',
  zoneId: null,
  scrollProgress: 0,
  isTransitioning: false,
  projectId: null,
  sprayColor: '#FF3EA5',
  wallKey: 0,
}))
