import { NavBar } from './components/NavBar'
import './../../landing.css'

export const LandingPage = () => {
  const navLinks = [
    { href: '#uvod', label: 'Úvod' },
    { href: '#funkce', label: 'Funkce' },
    { href: '#poznamky', label: 'Poznámky' },
    { href: '#kontakty', label: 'Kontakty' },
  ]

  const authButtons = [
    { label: 'Přihlášení', href: '/login', asButton: false },
    { label: 'Registrace', href: '/register', asButton: true },
  ]

  return (
    <div className="landing-page">
      <NavBar links={navLinks} authButtons={authButtons} />
      <main className="pt-20">
        <section id="uvod" className="px-6">
          <h1 className="pt-40 text-center text-4xl font-semibold sm:text-5xl md:text-5xl">
            StudyDash – přehled o studiu
          </h1>
          <p className="pt-2 text-center text-lg font-semibold sm:pt-4 sm:text-xl md:text-2xl">
            Vše důležité ze školy na jednom místě
          </p>
          <div className="flex flex-wrap items-stretch justify-center gap-8 px-3 pt-28">
            <div className="krok flex flex-col items-center md:items-start">
              <div className="flex items-center">
                <img loading="lazy" src="/web_images/User_Add.svg" alt="Vytvoř si účet" />
                <h3 className="pl-3 text-2xl font-semibold">1. Vytvoř si účet</h3>
              </div>
              <p className="pb-4 pt-1 text-center text-xl font-medium md:text-left">
                Zaregistruj se zdarma a přihlas se během pár vteřin – bez zbytečností.
              </p>
            </div>
            <div className="krok flex flex-col items-center md:items-start">
              <div className="flex items-center">
                <img loading="lazy" src="/web_images/Notebook.svg" alt="Přidej si předměty" />
                <h3 className="pl-3 text-2xl font-semibold">2. Přidej si předměty</h3>
              </div>
              <p className="pb-4 pt-1 text-center text-xl font-medium md:text-left">
                Vyber si předměty a začni k nim přidávat poznámky, úkoly i testy – podle sebe.
              </p>
            </div>
            <div className="krok flex flex-col items-center md:items-start">
              <div className="flex items-center">
                <img loading="lazy" src="/web_images/Calendar_Days.svg" alt="Nic ti neuteče" />
                <h3 className="pl-3 text-2xl font-semibold">3. Nic ti neuteče</h3>
              </div>
              <p className="pb-4 pt-1 text-center text-xl font-medium md:text-left">
                Sleduj termíny, testy, změny v rozvrhu i školní akce – přehledně a bez stresu.
              </p>
            </div>
          </div>
        </section>

        <section id="funkce" className="px-10">
          <h2 className="text-center text-4xl font-semibold sm:text-5xl md:text-5xl">
            Co ti StudyDash umožní
          </h2>
          <p className="pt-2 text-center text-lg font-semibold sm:pt-4 sm:text-xl md:text-2xl">
            Víc než jen přehled – tvoje školní paměť
          </p>

          <div className="vyhody flex flex-wrap items-center justify-center gap-8 px-5 pt-28">
            <div className="vyhoda flex-2 max-w-xs border border-[rgba(81,83,89,1)] p-4">
              <img loading="lazy" src="/web_images/Note_Edit.svg" alt="Sdílej zápisky" />
              <h3 className="text-xl font-semibold text-[var(--color-primary)]">
                Sdílej zápisky a pomáhej ostatním
              </h3>
              <p className="pt-1 text-lg text-[var(--color-text)]">
                Nahraj své poznámky a zpřístupni je spolužákům. Vše přehledně podle předmětu, tématu
                a data.
              </p>
            </div>

            <div className="vyhoda flex-2 max-w-xs border border-[rgba(81,83,89,1)] p-4">
              <img loading="lazy" src="/web_images/Calendar_Check.svg" alt="Přehled o testech" />
              <h3 className="text-xl font-semibold text-[var(--color-primary)]">
                Měj přehled o testech a úkolech
              </h3>
              <p className="pt-1 text-lg text-[var(--color-text)]">
                Všechny termíny testů a úkolů na jednom místě. Připomeneme ti, co se blíží, takže tě
                nic nezaskočí.
              </p>
            </div>

            <div className="vyhoda flex-2 max-w-xs border border-[rgba(81,83,89,1)] p-4">
              <img loading="lazy" src="/web_images/Arrows_Reload_01.svg" alt="Změny v rozvrhu" />
              <h3 className="text-xl font-semibold text-[var(--color-primary)]">
                Změny v rozvrhu? Hned o nich víš
              </h3>
              <p className="pt-1 text-lg text-[var(--color-text)]">
                Změnila se ti hodina? Rozvrh se změnil? StudyDash tě včas upozorní a automaticky
                upraví, co je potřeba.
              </p>
            </div>

            <div className="vyhoda flex-2 max-w-xs border border-[rgba(81,83,89,1)] p-4">
              <img loading="lazy" src="/web_images/Users_Group.svg" alt="Školní akce" />
              <h3 className="text-xl font-semibold text-[var(--color-primary)]">
                Školní akce? Už o žádnou nepřijdeš
              </h3>
              <p className="pt-1 text-lg text-[var(--color-text)]">
                Výlet, projekt nebo den otevřených dveří – nic ti neunikne. Všechno máš přehledně na
                jednom místě.
              </p>
            </div>
          </div>
        </section>

        <section id="poznamky" className="px-10 md:px-5">
          <h2 className="text-center text-4xl font-semibold sm:text-5xl md:text-5xl">
            Tvoje poznámky, tvůj styl.
          </h2>
          <p className="pt-2 text-center text-lg font-semibold sm:pt-4 sm:text-xl md:text-2xl">
            StudyDash se přizpůsobí tomu, co právě potřebuješ.
          </p>

          <div className="funkcee flex flex-wrap items-center justify-center gap-8 pt-28">
            <div className="funkce max-w-s rounded-3xl p-7">
              <div className="flex items-center">
                <img
                  loading="lazy"
                  src="/web_images/mic-new.svg"
                  className="w-16"
                  alt="Převod řeči na text"
                />
                <h3 className="pl-3 text-2xl font-semibold">Převod řeči na text</h3>
              </div>
              <p className="py-4 text-xl italic">Učitel mluví, poznámky se zapisují samy.</p>
            </div>
            <div className="funkce max-w-s rounded-3xl p-7">
              <div className="flex items-center">
                <img
                  loading="lazy"
                  src="/web_images/bulb-new.svg"
                  className="w-16"
                  alt="Zvýrazňování textu"
                />
                <h3 className="pl-3 text-2xl font-semibold">Zvýrazňování textu</h3>
              </div>
              <p className="py-4 text-xl italic">Používej barevné zvýraznění a stylizaci textu.</p>
            </div>
            <div className="funkce max-w-s rounded-3xl p-7">
              <div className="flex items-center">
                <img
                  loading="lazy"
                  src="/web_images/img-new.svg"
                  className="w-16"
                  alt="Vkládání obrázků"
                />
                <h3 className="pl-3 text-2xl font-semibold">Vkládání obrázků</h3>
              </div>
              <p className="py-4 text-xl italic">Vkládej obrázky a diagramy přímo do poznámek.</p>
            </div>
            <div className="funkce max-w-s rounded-3xl p-7">
              <div className="flex items-center">
                <img
                  loading="lazy"
                  src="/web_images/list-new.svg"
                  className="w-16"
                  alt="Strukturované poznámky"
                />
                <h3 className="pl-3 text-2xl font-semibold">Strukturované poznámky</h3>
              </div>
              <p className="py-4 text-xl italic">
                Vytvářej seznamy, odrážky a tabulky pro dokonalý přehled.
              </p>
            </div>
            <div className="funkce max-w-s rounded-3xl p-7">
              <div className="flex items-center">
                <img
                  loading="lazy"
                  src="/web_images/code-new.svg"
                  className="w-16"
                  alt="Vkládání kódu"
                />
                <h3 className="pl-3 text-2xl font-semibold">Vkládání kódu</h3>
              </div>
              <p className="py-4 text-xl italic">
                Vkládej zdrojový kód s podporou zvýraznění syntaxe.
              </p>
            </div>
          </div>
        </section>

        <section id="kontakty">
          <h2 className="text-center text-4xl font-semibold sm:text-5xl md:text-5xl">Kontakuj nás</h2>
          <p className="pt-2 text-center text-lg font-semibold sm:pt-4 sm:text-xl md:text-2xl">
            Máš nápad na vylepšení? Dej nám vědět
          </p>

          <button className="flex items-center justify-center gap-4 px-5 py-3" id="discord-btn" type="button">
            <img loading="lazy" src="/web_images/discord-new.svg" alt="Discord" />
            <h3 className="text-xl font-semibold">Připoj se na Discord</h3>
          </button>
        </section>
      </main>

      <footer className="flex h-16 w-full items-center justify-center mt-8">
        <p className="text-center text-md font-semibold">© 2025 StudyDash. Všechna práva vyhrazena.</p>
      </footer>
    </div>
  )
}
