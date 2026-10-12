# Portfolio — brief projet

> Fichier lu au début de chaque session. Court exprès : chaque ligne coûte des tokens à chaque échange.

## Concept
Portfolio brutaliste inspiré de Persona (5/3 Reload) pour l'UI, et de Bomb Rush Cyberfunk pour le monde 3D (ville cel-shadée, culture graffiti/street, énergie funk). Univers hyperpop + touche Y2K.
Une scène 3D unique : **une ville**, découpée en quartiers ; la caméra voyage d'un quartier à l'autre.
Inspiration de style uniquement : aucun personnage, graffiti, logo ou asset repris de BRC ou de Persona.

## Stack (ne pas en changer sans le dire)
- Vite + React 19 + TypeScript (R3F v9 exige React 19)
- 3D : @react-three/fiber, @react-three/drei, @react-three/postprocessing
- Animations UI : motion (ex-framer-motion) pour les transitions DOM ; GSAP seulement pour les timelines caméra complexes
- État global : zustand (un seul store : `src/store/useScene.ts`)
- Assets 3D : Blender → .glb, compressés avec gltf-transform (Draco + textures KTX2/WebP), < 3 Mo par modèle

## Architecture
```
src/
  store/useScene.ts        # mode: 'overview' | 'zone', zoneId, scrollProgress
  scene/Experience.tsx     # Canvas, lumières, post-process
  scene/CameraRig.tsx      # SEUL composant qui bouge la caméra
  scene/zones/<Zone>.tsx   # une zone = un fichier (Projects, Skills, About, Contact)
  scene/models/            # composants générés par gltfjsx
  ui/Menu.tsx              # menu brutaliste, transitions balayage
  ui/panels/<Panel>.tsx    # overlays DOM par zone
  data/projects.ts, data/skills.ts  # contenu, jamais en dur dans les composants
```

## Règles d'interaction (cœur du concept)
1. Arrivée : vue d'ensemble, caméra en idle léger, **scroll désactivé**.
2. Clic sur une catégorie du menu → transition balayage (DOM) + vol caméra vers la zone → `mode = 'zone'`.
3. En zone : le scroll fait avancer la caméra sur un rail (CatmullRomCurve3 propre à la zone), via `scrollProgress` 0→1.
4. Retour (Échap / bouton) → caméra revient en overview, scroll de nouveau bloqué.
5. Zones = quartiers de la ville : **Projets = distributeur automatique au coin d'une rue** (chaque projet = un produit, clic = il tombe → panel), **Skills = écran de perso façon HSR/Genshin** (stats, niveaux, "équipement"), About, Contact.
6. Les avatars hyperpop traînent dans les quartiers (sur un toit, contre un mur tagué…) comme habitants de la ville.

## Direction artistique
- Brutalisme Persona : aplats, diagonales, typo massive en capitales, contrastes durs, découpes en biais.
- Palette de base : noir #0A0A0A, blanc cassé #F2F0EA, accent rouge #E5002B + 1 accent hyperpop (rose #FF3EA5 ou vert acide #B6FF00) — un seul à la fois par écran.
- Y2K : chrome, bulles/stickers, bruit/scanlines en post-process (léger).
- Monde 3D façon BRC : cel-shading (`MeshToonMaterial` + gradient map 3–4 tons), contours noirs épais (`<Outlines>` de drei), couleurs saturées, ciel en aplat ou dégradé simple, pas de réalisme.
- Ville : kit modulaire low-poly (immeubles, toits, rampes, escaliers, panneaux), tags et affiches originaux en textures/decals, brouillard coloré pour masquer le lointain.
- Personnages hyperpop : **avatars stylisés originaux** dans leur esthétique (pas leur visage réel), low-poly cel-shadés ou en 2D billboard, poses fixes ou boucle d'animation courte.

## Performance (budget)
- 60 fps sur laptop milieu de gamme, < 150 draw calls, DPR plafonné à 1.5.
- Lazy-load des zones et des modèles (`Suspense` + `useGLTF.preload` ciblé).
- Ville : instancier les modules répétés, cacher ce qui est hors du quartier actif, brouillard + caméra contrainte (jamais de vue d'ensemble de toute la ville en haute définition).
- `prefers-reduced-motion` : transitions remplacées par des fondus, caméra en coupe directe.
- Fallback mobile : scène simplifiée, pas de post-process lourd.

## Façon de travailler avec Claude (économie de tokens)
- Une session = une fonctionnalité. `/clear` entre deux fonctionnalités.
- Toujours citer le fichier visé (`src/scene/CameraRig.tsx`) plutôt que coller du code.
- Demander des diffs/éditions ciblées, pas des réécritures de fichiers entiers.
- Ne pas relire `scene/models/` (code généré) sauf besoin explicite.

## À faire par l'utilisateur (commandes slash, Claude ne peut pas les lancer)
```
/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
```
Ponytail en niveau full par défaut ; « normal mode » pour les sessions d'apprentissage 3D.

## Décisions
- [x] Ville (quartiers compacts, pas de monde ouvert)
- [x] Avatars hyperpop stylisés, pas de ressemblance réelle
- [x] Monde 3D inspiré de Bomb Rush Cyberfunk
- [ ] Menu skills HSR/Genshin : oui / non
- [ ] Où mettre la touche Y2K (UI ? post-process ? objets de la scène ?)
