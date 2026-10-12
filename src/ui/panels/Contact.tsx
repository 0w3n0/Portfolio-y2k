import type { CSSProperties } from 'react'
import { CONTACTS } from '../../data/contact'
import './Contact.css'

// Vrais liens (clavier, lecteurs d'écran) en miroir des touches du téléphone (scene/zones/Contact).
export default function ContactPanel() {
  return (
    <nav className="dial-box" aria-label="Contact">
      <span className="hint">Compose un numéro</span>
      <ul>
        {CONTACTS.map((c) => (
          <li key={c.id}>
            <a
              href={c.href}
              style={{ '--key': c.color } as CSSProperties}
              {...(c.href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            >
              {c.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
