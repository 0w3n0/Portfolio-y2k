---
name: r3f-scene-camera
description: Use when building or editing the portfolio's 3D city in React Three Fiber: camera transitions between districts, scroll-driven camera rails, cel-shading, loading/optimizing glb models, performance.
---

# Scène 3D du portfolio (React Three Fiber)

L'utilisateur débute en 3D navigateur : explique brièvement chaque concept nouveau (une phrase) avant le code, sans cours magistral.

## Principes
- Un seul composant contrôle la caméra : `src/scene/CameraRig.tsx`. Aucune autre partie du code ne fait `camera.position.set`.
- La caméra lit l'état dans le store zustand `useScene` : `mode` ('overview' | 'zone'), `zoneId`, `scrollProgress` (0→1).
- Chaque quartier exporte une config : `{ id, overviewTarget, rail: Vector3[], lookAt: Vector3[] }`. Le rail est une `CatmullRomCurve3`.

## Transitions entre quartiers
- Interpolation dans `useFrame` avec amortissement indépendant du framerate : `maath/easing` → `easing.damp3(camera.position, cible, 0.4, delta)`, idem pour la cible du regard. Préférer ça à GSAP pour les vols simples.
- GSAP uniquement pour une timeline à plusieurs étapes (ex. survol des toits puis plongée dans la rue).
- Bloquer les clics pendant un vol (`isTransitioning` dans le store).

## Scroll conditionnel
- `mode === 'overview'` : ne pas écouter le scroll (ou `preventDefault` sur `wheel`).
- `mode === 'zone'` : `wheel`/touch → accumuler dans `scrollProgress` (clamp 0..1), caméra placée à `rail.getPointAt(dampedProgress)`.
- Ne pas utiliser `ScrollControls` de drei ici : il prend tout le scroll de la page et complique le blocage.
- Toujours prévoir clavier (flèches) et Échap pour revenir à l'overview.

## Rendu façon Bomb Rush Cyberfunk (style seulement, aucun asset repris)
- `MeshToonMaterial` + `gradientMap` (texture 3–4 pixels, `NearestFilter`) pour le cel-shading.
- Contours : `<Outlines thickness={…} color="black" />` de drei sur les meshes principaux (pas sur les milliers de petits objets).
- Couleurs saturées, lumière directionnelle franche + ambiante, `<fog>` coloré, ciel en aplat/dégradé.

## Modèles
- Pipeline : Blender → .glb → `npx gltf-transform optimize in.glb out.glb --compress draco --texture-compress webp` → `npx gltfjsx out.glb -t -T`.
- Budget : < 3 Mo par modèle, textures 1024 max (2048 pour un élément héros).
- `useGLTF.preload` uniquement pour le quartier d'arrivée ; le reste en `Suspense` paresseux.
- Ville = kit modulaire : modules répétés en `<Instances>`, géométries statiques fusionnées.
- Avatars : low-poly cel-shadés ou sprites 2D en `<Billboard>` — bien moins chers qu'un perso riggé.

## Performance
- `<Canvas dpr={[1, 1.5]}>`, `<AdaptiveDpr pixelated />`, `<PerformanceMonitor>` pour couper le post-process si fps < 45.
- Cacher ce qui est hors du quartier actif ; caméra contrainte, pas de vue d'ensemble HD de toute la ville.
- `prefers-reduced-motion` → coupe directe au lieu du vol caméra.

## Économie de tokens
- Ne jamais lire `src/scene/models/` (code généré) sauf demande explicite.
- Éditer avec des remplacements ciblés, pas de réécriture de fichier complet.
