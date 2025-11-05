import { useState } from 'react'

import type { MenuButton, NavLink } from './MobileMenu'
import { MobileMenu } from './MobileMenu'

type NavBarProps = {
  brand?: {
    src: string
    label: string
  }
  links?: NavLink[]
  authButtons?: Array<
    MenuButton & {
      asButton?: boolean
    }
  >
}

export const NavBar = ({
  brand = { src: '/web_images/logo-new.png', label: 'StudyDash' },
  links = [],
  authButtons = [],
}: NavBarProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="flex h-20 w-full items-center justify-center px-4">
        <div className="flex w-full max-w-[1500px] items-center justify-between">
          <div className="flex items-center">
            <img loading="lazy" src={brand.src} alt="StudyDash logo" className="max-w-[50px] pr-2" />
            <h2 className="m-2 text-2xl">{brand.label}</h2>
          </div>

          <div id="nav-links" className="hidden items-center space-x-7 rounded-xl px-6 py-2 lg:flex">
            {links.map((link) => (
              <a key={link.href} className="text-lg" href={link.href}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center space-x-7 lg:flex">
            {authButtons.map((button, idx) =>
              button.asButton ? (
                <a key={`${button.label}-${idx}`} href={button.href ?? '#'}>
                  <button className="rounded-lg px-3 py-2" type="button">
                    {button.label}
                  </button>
                </a>
              ) : (
                <a key={`${button.label}-${idx}`} href={button.href ?? '#'}>
                  {button.label}
                </a>
              ),
            )}
          </div>

          <button
            id="mobile-menu-button"
            className="block rounded-md border border-[var(--color-primary)] p-2 lg:hidden"
            aria-label="Otevřít/zavřít menu"
            onClick={() => setOpen(true)}
            type="button"
          >
            <img loading="lazy" src="/web_images/menu.svg" alt="Menu" className="h-6 w-6" />
          </button>
        </div>
      </nav>

      <MobileMenu
        open={open}
        onClose={() => setOpen(false)}
        links={links}
        buttons={authButtons.map((button) => ({
          label: button.label,
          href: button.href,
          variant: button.asButton ? 'filled' : 'outlined',
        }))}
      />
    </>
  )
}
