---
name: portfolio-da-brutaliste
description: Use when designing or coding any UI of the portfolio (menu, panels, vending machine, skills screen): Persona-style brutalist UI, Bomb Rush Cyberfunk street vibe, hyperpop/Y2K accents, swipe transitions.
---

# Direction artistique — brutalisme Persona × Bomb Rush Cyberfunk × hyperpop

Inspiration de style uniquement : aucun personnage, graffiti, logo, police ou asset repris de Persona ou de BRC.

## Tokens (`src/styles/tokens.css`, ne pas inventer d'autres couleurs)
- `--ink: #0A0A0A`, `--paper: #F2F0EA`, `--accent: #E5002B`
- Accent hyperpop, un seul par écran : `--pop-pink: #FF3EA5` ou `--pop-acid: #B6FF00`
- Typo display : condensée, grasse, capitales (Anton, Bebas Neue ou grotesk lourde) ; texte courant : grotesk neutre (Inter, Space Grotesk).

## Grammaire visuelle
- Persona (UI) : découpes en biais (`clip-path: polygon(...)`, 8–15°), jamais d'arrondis ; titres pivotés (-4° à -8°) ; blocs noir/rouge superposés ; ombres pleines décalées (`box-shadow: 6px 6px 0 var(--ink)`).
- BRC (ambiance) : énergie street — stickers, tags et affiches originaux, textures de mur, éléments qui « débordent » du cadre.
- Le menu est le point focal : grand, typographique, chaque entrée réagit au survol (décalage + accent).

## Transitions « balayage »
- Bande pleine en biais qui traverse l'écran (motion : `initial={{x:'-110%'}} animate={{x:'110%'}}`) ; le contenu change pendant que la bande couvre l'écran.
- Durée 0.45–0.7 s, easing `[0.76, 0, 0.24, 1]`.
- La bande démarre, puis le store déclenche le vol caméra.
- `prefers-reduced-motion` → fondu 150 ms.

## Composants signature
- **Distributeur automatique (Projets)**, au coin d'une rue : grille de produits = projets ; clavier de sélection (code type « B3 ») ; le produit tombe dans le bac, clic = panel du projet. Garder une liste accessible des projets en parallèle.
- **Écran de perso façon HSR/Genshin (Skills)** : à gauche le « personnage » (l'utilisateur), à droite onglets Stats / Compétences / Équipement ; jauges de niveau, étoiles de maîtrise. Rester brutaliste : pas de dégradés dorés génériques, utiliser les tokens.

## Y2K (en touche, pas en fond)
- Chrome sur quelques objets 3D, bulles et stickers sur les panels, scanlines + grain léger en post-process.

## Avatars hyperpop
- Avatars stylisés originaux dans leur esthétique, jamais le visage réel des artistes.

## Accessibilité
- Contraste AA minimum sur tout texte lisible, focus visible (contour accent épais), navigation clavier complète du menu.
