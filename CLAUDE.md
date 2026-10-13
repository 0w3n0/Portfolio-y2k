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
2. Clic sur une catégorie du menu → balayage (DOM) → `mode = 'zone'`, `dashing` : téléportations du perso vues de haut → 2ᵉ balayage → coupe directe sur la zone (règle 6).
3. En zone : le scroll fait avancer la caméra sur un rail (CatmullRomCurve3 propre à la zone), via `scrollProgress` 0→1.
4. Retour (Échap / bouton) → balayage + coupe directe en overview, scroll de nouveau bloqué.
5. Zones = quartiers de la ville : **Projets = distributeur automatique au coin d'une rue** (chaque projet = un produit, clic = il tombe → panel), **Skills = fiche perso HSR** : le perso 3D en pied à gauche appuie sur une borne, la fiche (onglets Stats / Compétences / Équipement, `ui/panels/Skills.tsx`) glisse à droite ; accent menthe, About, Contact.
6. **Cible finale — le perso d'Owen (`scene/Hero.tsx`) fait le voyage** : en overview l'**image à droite** (`.hero-art` du Menu, à garder) le montre, le perso 3D attend derrière, au premier plan ; au clic, le balayage enlève l'image, il **se téléporte en zigzag de façade en façade** dans les rues (≥ 3 sauts, ~2 s), une traînée lavande unique entre deux points, un **hologramme lavande en pose d'appui au mur** reste à chaque point quitté, caméra **vue de haut**, puis 2ᵉ balayage et **coupe directe** sur la zone (pas de chemin caméra) ; retour : coupe directe sur son toit. Projets : il finit devant le distributeur et **appuie sur le projet choisi** avant que le produit tombe. Skills : il appuie sur une borne et les skills apparaissent autour de lui (pas d'avatar fixe dans Skills). Fait : téléportations + hologrammes dans les rues depuis son toit (`plan()` dans `Hero.tsx`), avatar en primitives ; à faire : vraie anim (.glb), lien image 2D → perso 3D.
7. Les avatars hyperpop traînent dans les quartiers (sur un toit, contre un mur tagué…) comme habitants de la ville.

## Direction artistique
**Source de vérité : `design-system/`.** Lire `design-system/README.md` avant tout travail d'UI ou de couleur. Ne jamais écrire une couleur, une police ou un espacement en dur : utiliser les variables de `design-system/tokens.css` (importé une fois dans `src/main.tsx`). Pour changer une valeur, modifier `tokens.json` puis régénérer `tokens.css`, jamais l'inverse.
- Résumé : brutalisme Persona en pastel. Lavande `--lavender` en couleur principale, accents `--pop-pink` / `--pop-mint` (un seul par écran), `--chrome` pour le Y2K, fonds `--ground` / `--slab` presque noirs. Texte foncé sur les pastels, jamais blanc.
- Typo : Anton (affiche, capitales), Archivo (texte), JetBrains Mono (UI de jeu). Polices locales dans `design-system/fonts/`.
- Thème Nuit par défaut (`data-theme="nuit"` sur `<html>`), Jour pour la lecture longue.
- Composants de référence : `design-system/components/od-components.css` (bouton en biais, entrée de menu, slot du distributeur, jauge de stat, sticker) — à porter en composants React dans `src/ui/`.
- Logos SVG dans `design-system/logos/` (usage dans son README).
- Y2K : chrome, bulles/stickers, bruit/scanlines en post-process (léger).
- Monde 3D façon BRC : cel-shading (`MeshToonMaterial` + gradient map 3–4 tons), contours noirs épais (`<Outlines>` de drei), néons et enseignes dans les couleurs du design system, brouillard lavande sombre, pas de réalisme.
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
- [x] Skills : fiche perso HSR à onglets (constellation testée et rejetée : pas lisible)
- [ ] Où mettre la touche Y2K (UI ? post-process ? objets de la scène ?)
