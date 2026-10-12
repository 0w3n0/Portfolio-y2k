---
name: portfolio-session-efficace
description: Use at the start of a coding session on the portfolio, or when the user asks how to work efficiently / save tokens: scope one feature, read only needed files, targeted edits.
---

# Travailler efficacement (et sobrement en tokens)

## Démarrer une session
1. `CLAUDE.md` est déjà chargé — ne pas relire tout le repo.
2. Reformuler en une phrase la fonctionnalité visée et lister les fichiers concernés (3–5 max).
3. Lire uniquement ces fichiers ; localiser avec Grep/Glob plutôt qu'ouvrir des dossiers entiers.

## Pendant
- Éditions ciblées (Edit) plutôt que réécriture complète.
- Ne pas lire `node_modules/`, `dist/`, `src/scene/models/`, ni les .glb.
- Vérifier avec `npm run build` ou `npx tsc --noEmit`, et ne montrer que les erreurs pertinentes.
- Si la tâche grossit, s'arrêter et proposer de la découper.

## Finir
- Résumer en 2–3 lignes ce qui a changé et la prochaine étape.
- Si une décision de design a été prise, proposer de mettre à jour la section « Décisions » de `CLAUDE.md` (une ligne).
- Conseiller `/clear` avant la fonctionnalité suivante.
