OWEN DONNARS, c'est le portfolio d'Owen : une ville de nuit qu'on traverse. L'interface emprunte au brutalisme des menus de Persona (aplats francs, coupes en biais, typo affiche), le monde 3D emprunte au cel-shading street de Bomb Rush Cyberfunk, et l'hyperpop et le Y2K donnent la palette : des pastels (lavande d'abord, puis rose et menthe) tenus par un noir profond, un sticker, un reflet chrome. Ce sont des inspirations de style : aucun personnage, logo, graffiti ou asset de ces jeux n'est repris.

**Thèse : des interfaces qu'on traverse.** Chaque règle ci-dessous sert à garder l'écran lisible pendant que tout bouge.

## Voix

- Court et direct, à l'impératif pour les actions : « Entrer en ville », « Ouvrir le projet », « Retour ».
- Capitales seulement là où le style `hero`, `menu`, `title` ou `label` les impose ; le texte courant reste en casse normale.
- Vocabulaire de la ville et du jeu pour la navigation (quartier, distributeur, fiche perso, LV.), vocabulaire précis et sobre pour les projets (ce qui a été fait, avec qui, avec quoi).
- Tutoiement dans l'interface, première personne dans les descriptions de projet (« J'ai conçu… »).
- Pas d'emoji, pas de points d'exclamation, pas de superlatifs (« incroyable », « innovant »).

| Oui | Non |
| --- | --- |
| ENTRER EN VILLE | Découvrez mon univers ! |
| Escape game VR, conçu en trio pour le cours de XR. | Un projet VR immersif et innovant 🚀 |
| LV. 02 / 10 · EN QUÊTE | Débutant |

## Couleur

Nuit est le thème principal ; Jour sert aux pages de lecture longue et aux exports.

- Fond `ground`, surfaces `slab`, texte `ink`, texte secondaire `ink-muted`. Bordures épaisses en `edge` (3px).
- `lavender` est la couleur de la marque : aplats de menu actif, bouton principal, bandes de balayage, logo. En texte, toujours `lavender-text`. Sur un aplat `lavender`, texte en `on-lavender` (foncé : les pastels portent du texte sombre, jamais blanc).
- Un seul accent pastel par écran en plus de la lavande : `pop-pink` **ou** `pop-mint`. Texte posé dessus en `on-pop`.
- Les pastels restent brutalistes grâce au noir : sur Jour, tout aplat pastel porte une bordure `edge` de 3px ou une ombre `shadow-slab`, sinon il se dissout dans le papier.
- `chrome` est réservé au Y2K (stickers, cadre du distributeur, reflets 3D).
- Le focus clavier est toujours `focus-ring`, jamais retiré.
- Proportions d'un écran type : 70 % `ground`/`slab`, 20 % `ink`, 8 % `lavender`, 2 % accent pop.

## Typographie

- **Anton** (`--font-display`) pour l'affiche : `hero`, `menu`, `title`. Toujours en capitales, penché de `tilt-type` sur les menus et les titres.
- **Archivo** (`--font-body`) pour lire : `heading` en 800, `body`, `small`. Colonne de 65 caractères au plus.
- **JetBrains Mono** (`--font-mono`) pour tout ce qui ressemble à une UI de jeu : `label` (codes de slot, catégories), `stat` (niveaux, dates).
- Ne jamais composer un paragraphe en Anton ni un titre en mono.

## Formes : la coupe

- Angles vifs (`radius-none`) partout. `radius-key` pour les touches du distributeur, `radius-bubble` pour les stickers, rien d'autre.
- La coupe en biais est la signature : aplats, boutons et bandes penchés de `cut` (12°) via `skewX` ou `clip-path`, contenu contre-penché pour rester droit.
- Profondeur par ombres pleines décalées (`shadow-slab`, `shadow-pop`), jamais d'ombres floues ni de dégradés.
- Les panels se superposent en couches décalées (noir, lavande, papier) comme les écrans de résultat de Persona.

## Mouvement

- **Balayage** entre deux sections : une bande `lavender` coupée à `cut` traverse l'écran de gauche à droite en 0,45 à 0,7 s, easing `cubic-bezier(.76,0,.24,1)` ; le contenu change pendant qu'elle couvre l'écran, puis le vol caméra démarre.
- Micro-interactions courtes (120 à 220 ms) : décalage de 4 à 16px, ombre qui s'allonge.
- Une chorégraphie par transition, pas d'animation en boucle dans l'UI (la ville bouge déjà derrière).
- `prefers-reduced-motion` : fondu de 150 ms, coupe directe de la caméra.

## Le monde 3D

- Cel-shading : `MeshToonMaterial` avec une gradient map de 3 à 4 tons, contours noirs épais (`<Outlines>`).
- Palette de la ville tirée des tokens : façades sombres proches de `slab`, néons et enseignes en `lavender`, `pop-pink`, `pop-mint`, métal en `chrome`. Brouillard lavande sombre, teinté vers `ground`, pour une nuit douce plutôt qu'inquiétante.
- Les tags, affiches et enseignes de la ville sont des créations originales qui reprennent le monogramme, les codes de quartier et la typo Anton.
- Les avatars hyperpop sont des personnages originaux inspirés de l'esthétique de la scène, jamais le visage ni l'image d'artistes réels.

## Logo

- `wordmark-paper.svg` sur `ground` Nuit, `wordmark-ink.svg` sur `ground` Jour. Hauteur minimale 24px.
- `lockup-slab.svg` (le nom en encre sur un aplat lavande à ombre rose) pour l'écran d'arrivée, les miniatures et les réseaux.
- `monogram.svg` (OD) pour le favicon, les tags dans la ville et les stickers.
- Ne pas redresser le logo, le recolorer hors de ces versions ni l'entourer.

## Iconographie

Aucune bibliothèque d'icônes. Les flèches et symboles sont des caractères de la typo (→ ← ↑ ↓, ·, /) en `label` ; les états passent par la couleur et un mot. Un pictogramme indispensable se dessine au trait de 3px, angles vifs, dans `ink`.
