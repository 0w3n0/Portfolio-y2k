import { DataTexture, NearestFilter, RedFormat } from 'three'

// Dégradé 4 tons partagé par tous les MeshToonMaterial de la ville (cel-shading façon BRC).
export const toonGradient = new DataTexture(new Uint8Array([60, 130, 200, 255]), 4, 1, RedFormat)
toonGradient.minFilter = toonGradient.magFilter = NearestFilter
toonGradient.generateMipmaps = false
toonGradient.needsUpdate = true
