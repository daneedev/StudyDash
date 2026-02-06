export function BannerStats() {
  return (
    <div className="max-w-[1160px] hidden md:max-h-[190px] md:flex flex-col md:flex-row justify-between items-center bg-[var(--card-bg)] border-1 border-[var(--border-card)] rounded-xl mt-16 p-10 shadow-md gap-8 md:gap-0 select-none">
      <div className="flex flex-col text-start">
        <h2 className="text-3xl font-semibold">Přehled platformy</h2>
        <p className="text-sm text-[var(--text-darkgray)] font-medium max-w-[300px] mt-1">
          Platforma od studentů pro studenty, která skutečně funguje a nebrzdí vás při studiu.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-[1000px]:grid-cols-1">
        <div className="bg-[var(--card-bg)] border-1 border-[var(--border-card)] rounded-lg p-4 flex flex-row items-center justify-center shadow-sm">
          <p className="text-4xl font-semibold text-[var(--dark-primary)]">90+</p>
          <p className="text-sm text-[var(--text-darkgray)] font-semibold leading-tight ml-2">
            <span className="block">Aktivních</span>
            <span className="block">uživatelů</span>
          </p>
        </div>

        <div className="bg-[var(--card-bg)] border-1 border-[var(--border-card)] rounded-lg p-4 flex flex-row items-center justify-center shadow-sm max-[1000px]:hidden">
          <p className="text-4xl font-semibold text-[var(--dark-primary)]">70+</p>
          <p className="text-sm text-[var(--text-darkgray)] font-semibold leading-tight ml-2">
            <span className="block">TO-DOs na</span>
            <span className="block">platformě</span>
          </p>
        </div>

        <div className="bg-[var(--card-bg)] border-1 border-[var(--border-card)] rounded-lg p-4 flex flex-row items-center justify-center shadow-sm">
          <p className="text-4xl font-semibold text-[var(--dark-primary)]">130+</p>
          <p className="text-sm text-[var(--text-darkgray)] font-semibold leading-tight ml-2">
            <span className="block">Vytvořených</span>
            <span className="block">poznámek</span>
          </p>
        </div>

        <div className="bg-[var(--card-bg)] border-1 border-[var(--border-card)] rounded-lg p-4 flex flex-row items-center justify-center shadow-sm max-[1000px]:hidden">
          <p className="text-4xl font-semibold text-[var(--dark-primary)]">50+</p>
          <p className="text-sm text-[var(--text-darkgray)] font-semibold leading-tight ml-2">
            <span className="block">Vytvořených</span>
            <span className="block">událostí</span>
          </p>
        </div>
      </div>

      <img
        src="/web_images/logo.webp"
        alt="studydash logo"
        className="max-h-[140px] opacity-63 rounded-3xl hidden xl:block"
      />
    </div>
  );
}
