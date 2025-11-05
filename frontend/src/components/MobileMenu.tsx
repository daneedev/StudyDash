import { useEffect } from 'react'

export type NavLink = {
  href: string
  label: string
}

export type MenuButton = {
  label: string
  href?: string
  variant?: 'outlined' | 'filled'
}

type MobileMenuProps = {
  open?: boolean
  onClose?: () => void
  links?: NavLink[]
  buttons?: MenuButton[]
}

export const MobileMenu = ({
  open = false,
  onClose = () => {},
  links = [],
  buttons = [],
}: MobileMenuProps) => {
  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const baseStyles =
    'fixed inset-0 z-50 flex flex-col items-center justify-center bg-[rgba(28,28,28,0.9)] backdrop-blur-sm p-8 transition-opacity duration-300'
  const stateStyles = open ? 'opacity-100' : 'opacity-0 pointer-events-none'

  return (
    <div id="mobile-menu" className={`${baseStyles} ${stateStyles}`} aria-hidden={!open}>
      <button
        id="mobile-menu-close"
        className="absolute top-6 right-6 text-3xl leading-none"
        onClick={onClose}
        aria-label="Zavřít menu"
        type="button"
      >
        <img loading="lazy" src="/web_images/Close_MD.svg" alt="Zavřít" />
      </button>

      <ul className="mb-8 space-y-6 text-center">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="text-3xl font-semibold transition hover:scale-105"
              onClick={onClose}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex w-full max-w-xs flex-col space-y-4 border-t border-[var(--color-primary)] pt-6">
        {buttons.map((button, idx) => {
          const commonStyles = 'block rounded-lg px-4 py-3 text-center text-xl transition'
          const variantStyles =
            button.variant === 'filled'
              ? 'bg-[var(--color-primary)] text-[var(--color-darkgray)] hover:opacity-90 text-[var(--color-text)] font-semibold'
              : 'border border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-darkgray) text-[var(--color-primary)] font-semibold'
          return (
            <a
              key={`${button.label}-${idx}`}
              href={button.href ?? '#'}
              className={`${commonStyles} ${variantStyles}`}
              onClick={onClose}
            >
              {button.label}
            </a>
          )
        })}
      </div>
    </div>
  )
}
