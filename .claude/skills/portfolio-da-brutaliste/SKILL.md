---
name: portfolio-da-brutaliste
description: Use when designing or coding any UI of the portfolio (menu, panels, vending machine, skills screen): Persona-style brutalist UI, Bomb Rush Cyberfunk street vibe, hyperpop/Y2K accents, swipe transitions.
---

# Direction artistique — brutalisme Persona × Bomb Rush Cyberfunk × hyperpop

Inspiration de style uniquement : aucun personnage, graffiti, logo, police ou asset repris de Persona ou de BRC.

## Source de vérité : `design-system/`
- Lire `design-system/README.md` (voix, couleur, typo, formes, mouvement, logo) avant de dessiner quoi que ce soit.
- Couleurs, polices, espacements, ombres et angles : uniquement les variables de `design-system/tokens.css` (`var(--lavender)`, `var(--space-4)`, `var(--cut)`…). Aucune valeur en dur.
- Palette : lavande `--lavender` principale, `--pop-pink` ou `--pop-mint` (un seul par écran), `--chrome` pour le Y2K. Texte sur pastel : `--on-lavender` / `--on-pop` (foncé). En thème Jour, tout aplat pastel garde une bordure `--edge` ou une ombre `--shadow-slab`.
- Typo : classes `.t-hero`, `.t-menu`, `.t-title` (Anton), `.t-heading`, `.t-body`, `.t-small` (Archivo), `.t-label`, `.t-stat` (JetBrains Mono).
- Composants de référence : `design-system/components/od-components.css` — partir de là pour écrire les composants React.

## Grammaire visuelle
- Persona (UI) : découpes en biais à `--cut` (12°), jamais d'arrondis ; titres Anton penchés de `--tilt-type` ; blocs noir/lavande/papier superposés ; ombres pleines décalées (`--shadow-slab`, `--shadow-pop`).
- BRC (ambiance) : énergie street — stickers, tags et affiches originaux, textures de mur, éléments qui « débordent » du cadre.
- Le menu est le point focal : grand, typographique, chaque entrée réagit au survol (décalage + accent).

## Transitions « balayage »
- Bande `--lavender` pleine en biais qui traverse l'écran (motion : `initial={{x:'-110%'}} animate={{x:'110%'}}`) ; le contenu change pendant que la bande couvre l'écran.
- Durée 0.45–0.7 s, easing `[0.76, 0, 0.24, 1]`.
- La bande démarre, puis le store déclenche le vol caméra.
- `prefers-reduced-motion` → fondu 150 ms.

## Composants signature
- **Distributeur automatique (Projets)**, au coin d'une rue : grille de produits = projets ; clavier de sélection (code type « B3 ») ; le produit tombe dans le bac, clic = panel du projet. Garder une liste accessible des projets en parallèle.
- **Écran de perso façon HSR/Genshin (Skills)** : à gauche le « personnage », à droite onglets Stats / Compétences / Équipement ; jauges `.od-stat` (segments `--meter`, losanges de rang). Pas de dégradés dorés.

## Y2K (en touche, pas en fond)
- `--chrome` sur quelques objets 3D, bulles et stickers sur les panels, scanlines + grain léger en post-process.

## Avatars hyperpop
- Avatars stylisés originaux dans leur esthétique, jamais le visage réel des artistes.

## Accessibilité
- Contraste AA minimum sur tout texte lisible, focus visible (contour accent épais), navigation clavier complète du menu.
