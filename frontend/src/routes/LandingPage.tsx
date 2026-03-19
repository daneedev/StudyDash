import { NavBar } from "../components/NavBar";
import "../assets/css/landing.css";
import { useEffect, useState } from "react";
import { checkAuthToken } from "./rootRoute";


export const LandingPage = () => {
  const [authButtons, setAuthButtons] = useState([
    { label: "Přihlášení", href: "/login", asButton: false },
    { label: "Registrace", href: "/register", asButton: true },
  ]);

  useEffect(() => {
    const htmlEl = document.documentElement
    htmlEl.classList.add('landing-theme')

    checkAuthToken()
      .then(result => {
        if (result.isValid) {
          // User is logged in
          setAuthButtons([
            { label: "Dashboard", href: "/dashboard", asButton: true },
          ]);
        }
      })
      .catch(error => {
        console.error('Error checking auth:', error);
      });

    return () => {
      htmlEl.classList.remove('landing-theme')
    }
  }, [])

  const navLinks = [
    { href: "#", label: "Úvod" },
    { href: "#funkce", label: "Funkce" },
    { href: "#poznamky", label: "Poznámky" },
    { href: "#kontakty", label: "Kontakty" },
  ];


  return (
    <div className="landing-page">
      <NavBar links={navLinks} authButtons={authButtons} />
      <main className="pt-20">
        <section id="uvod" className="px-6">
          <h1 className="pt-40 text-center text-4xl font-semibold sm:text-5xl md:text-5xl">
            StudyDash – přehled o studiu
          </h1>
          <p className="pt-2 text-center text-lg font-semibold sm:pt-4 sm:text-xl md:text-2xl">
            Třídy, předměty, poznámky a úkoly na jednom místě
          </p>
          <div className="flex flex-wrap items-stretch justify-center gap-8 px-3 pt-28">
            <div className="krok flex flex-col items-center md:items-start">
              <div className="flex items-center">
                <img
                  loading="lazy"
                  src="/web_images/User_Add.svg"
                  alt="Vytvoř si účet"
                />
                <h3 className="pl-3 text-2xl font-semibold">
                  1. Vytvoř si účet
                </h3>
              </div>
              <p className="pb-4 pt-1 text-center text-xl font-medium md:text-left">
                Zaregistruj se zdarma a přihlas se během pár vteřin – bez zbytečných komplikací.
              </p>
            </div>
            <div className="krok flex flex-col items-center md:items-start">
              <div className="flex items-center">
                <img
                  loading="lazy"
                  src="/web_images/landing-academic.svg"
                  alt="Přidej si předměty"
                />
                <h3 className="pl-3 text-2xl font-semibold">
                  2. Přidej si předměty
                </h3>
              </div>
              <p className="pb-4 pt-1 text-center text-xl font-medium md:text-left">
                Vytvoř nebo se připoj do třídy, přidej si předměty a měj pro
                každý z nich vlastní prostor.
              </p>
            </div>
            <div className="krok flex flex-col items-center md:items-start">
              <div className="flex items-center">
                <img
                  loading="lazy"
                  src="/web_images/landing-checklist.svg"
                  alt="Nic ti neuteče"
                />
                <h3 className="pl-3 text-2xl font-semibold">
                  3. Nic ti neuteče
                </h3>
              </div>
              <p className="pb-4 pt-1 text-center text-xl font-medium md:text-left">
                V dashboardu máš přehled o úkolech, testech i termínech, takže
                víš, co tě čeká.
              </p>
            </div>
          </div>
        </section>

        <section id="funkce" className="px-10">
          <h2 className="text-center text-4xl font-semibold sm:text-5xl md:text-5xl">
            Co ti StudyDash umožní
          </h2>
          <p className="pt-2 text-center text-lg font-semibold sm:pt-4 sm:text-xl md:text-2xl">
            Místo, kde máš studium pod kontrolou
          </p>

          <div className="vyhody flex flex-wrap items-center justify-center gap-8 px-5 pt-28">
            <div className="vyhoda flex-2 max-w-xs border border-[rgba(81,83,89,1)] p-4">
              <img
                loading="lazy"
                src="/web_images/Note_Edit.svg"
                alt="Poznámky podle předmětů"
              />
              <h3 className="text-xl font-semibold text-[var(--color-primary)]">
                Poznámky rozdělené podle předmětů
              </h3>
              <p className="pt-1 text-lg text-[var(--color-text)]">
                Předměty se načítají pro vybranou třídu a můžeš si k nim
                vytvářet vlastní poznámky v přehledném rozhraní.
              </p>
            </div>

            <div className="vyhoda flex-2 max-w-xs border border-[rgba(81,83,89,1)] p-4">
              <img
                loading="lazy"
                src="/web_images/Calendar_Check.svg"
                alt="Úkoly a testy"
              />
              <h3 className="text-xl font-semibold text-[var(--color-primary)]">
                Úkoly a testy na jednom místě
              </h3>
              <p className="pt-1 text-lg text-[var(--color-text)]">
                To-do sekce umožňuje přidávat a spravovat úkoly i
                testy v rámci konkrétní třídy.
              </p>
            </div>

            <div className="vyhoda flex-2 max-w-xs border border-[rgba(81,83,89,1)] p-4">
                <img
                loading="lazy"
                src="/web_images/landing-academic.svg"
                alt="Třídy a dashboardy"
              />
              <h3 className="text-xl font-semibold text-[var(--color-primary)]">
                Třídy, dashboardy a rychlé přepínání
              </h3>
              <p className="pt-1 text-lg text-[var(--color-text)]">
                Vytvoř si třídu nebo se do ní připoj přes kód a pracuj vždy v
                dashboardu ve správné skupině.
              </p>
            </div>

            <div className="vyhoda flex-2 max-w-xs border border-[rgba(81,83,89,1)] p-4">
              <img
                loading="lazy"
                src="/web_images/landing-settings.svg"
                alt="Profil a účet"
              />
              <h3 className="text-xl font-semibold text-[var(--color-primary)]">
                Správa profilu a účtu
              </h3>
              <p className="pt-1 text-lg text-[var(--color-text)]">
                V aplikaci lze upravovat profilové údaje a spravovat svůj
                účet bez přecházení jinam.
              </p>
            </div>
          </div>
        </section>

        <section id="poznamky" className="px-10 md:px-5">
          <h2 className="text-center text-4xl font-semibold sm:text-5xl md:text-5xl">
            Tvoje poznámky, tvůj styl.
          </h2>
          <p className="pt-2 text-center text-lg font-semibold sm:pt-4 sm:text-xl md:text-2xl">
            Editor ti dá přesně ty nástroje, které při psaní poznámek potřebuješ.
          </p>

          <div className="funkcee flex flex-wrap items-center justify-center gap-8 pt-28">
            <div className="funkce max-w-s rounded-3xl p-7">
              <div className="flex items-center">
                <img
                  loading="lazy"
                  src="/web_images/landing-bold.svg"
                  className="w-16"
                  alt="Formátování textu"
                />
                <h3 className="pl-3 text-2xl font-semibold">
                  Formátování textu
                </h3>
              </div>
              <p className="py-4 text-xl italic">
                Tučné písmo, kurzíva, podtržení i přeškrtnutí přímo v editoru.
              </p>
            </div>
            <div className="funkce max-w-s rounded-3xl p-7">
              <div className="flex items-center">
                <img
                  loading="lazy"
                  src="/web_images/landing-link.svg"
                  className="w-16"
                  alt="Zarovnání a odkazy"
                />
                <h3 className="pl-3 text-2xl font-semibold">
                  Zarovnání a odkazy
                </h3>
              </div>
              <p className="py-4 text-xl italic">
                Text si srovnáš podle potřeby a doplníš ho o odkazy.
              </p>
            </div>
            <div className="funkce max-w-s rounded-3xl p-7">
              <div className="flex items-center">
                <img
                  loading="lazy"
                  src="/web_images/landing-upload.svg"
                  className="w-16"
                  alt="Přílohy"
                />
                <h3 className="pl-3 text-2xl font-semibold">
                  Přílohy k poznámkám
                </h3>
              </div>
              <p className="py-4 text-xl italic">
                Obrázky, soubory i další materiály přidáš přímo k poznámce.
              </p>
            </div>
            <div className="funkce max-w-s rounded-3xl p-7">
              <div className="flex items-center">
                <img
                  loading="lazy"
                  src="/web_images/landing-list.svg"
                  className="w-16"
                  alt="Seznamy a citace"
                />
                <h3 className="pl-3 text-2xl font-semibold">
                  Seznamy a citace
                </h3>
              </div>
              <p className="py-4 text-xl italic">
                Odrážky, číslované seznamy a citace pomůžou udržet obsah jasný a čitelný.
              </p>
            </div>
            <div className="funkce max-w-s rounded-3xl p-7">
              <div className="flex items-center">
                <img
                  loading="lazy"
                  src="/web_images/landing-code.svg"
                  className="w-16"
                  alt="Bloky kódu"
                />
                <h3 className="pl-3 text-2xl font-semibold">Bloky kódu</h3>
              </div>
              <p className="py-4 text-xl italic">
                Pro technické předměty už editor obsahuje i samostatný blok pro kód.
              </p>
            </div>
          </div>
        </section>

        <section id="kontakty">
          <h2 className="text-center text-4xl font-semibold sm:text-5xl md:text-5xl">
            Kontakuj nás
          </h2>
          <p className="pt-2 text-center text-lg font-semibold sm:pt-4 sm:text-xl md:text-2xl">
            Máš nápad na vylepšení? Dej nám vědět
          </p>

          <button
            className="flex items-center justify-center gap-3 sm:gap-4 px-4 sm:px-5 py-2.5 sm:py-3 cursor-pointer"
            id="discord-btn"
            type="button"
          >
            <img
              loading="lazy"
              src="/web_images/discord-new.svg"
              alt="Discord"
              className="w-7 h-7 sm:w-8 sm:h-8"
            />
            <h3 className="text-lg sm:text-xl font-semibold">Připoj se na Discord</h3>
          </button>

        </section>
      </main>

      <footer className="flex h-16 w-full items-center justify-center mt-8">
        <p className="text-center text-md font-semibold">
          © 2026 StudyDash. Všechna práva vyhrazena.
        </p>
      </footer>
    </div>
  );
};
