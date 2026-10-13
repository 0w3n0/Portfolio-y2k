import { C } from '../tokens'

// Touches du téléphone de la cabine (zone Contact) : une touche = un lien, même couleur dans le panel DOM.
// Contenu factice : à remplacer par les vrais liens.
export const CONTACTS = [
  { id: 'mail', label: 'Email', href: 'mailto:hello@example.com', color: C['pop-mint'] },
  { id: 'github', label: 'GitHub', href: 'https://github.com/pseudo', color: C.chrome },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/pseudo', color: C.lavender },
  { id: 'cv', label: 'CV', href: '/cv.pdf', color: C.ink },
]

// mailto dans l'onglet courant (sinon onglet vide), le reste dans un nouvel onglet.
export const dial = (href: string) =>
  href.startsWith('mailto:') ? (location.href = href) : window.open(href, '_blank', 'noopener')
