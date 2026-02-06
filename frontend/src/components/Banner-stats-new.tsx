export function BannerStats() {
  return (
    <div className="w-full min-h-[190px] mt-8 hidden md:flex flex-row flex-nowrap justify-between items-center bg-[var(--card-bg)] border border-[#27272a] rounded-2xl p-8 md:p-10 shadow-sm relative overflow-hidden gap-10">
      
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)] opacity-[0.03] blur-[80px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col text-start max-w-[400px] w-auto shrink-0">
        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--text-white)] tracking-tight">Přehled platformy</h2>
        <p className="text-sm text-[var(--text-darkgray)] font-medium mt-2 leading-relaxed">
          Platforma od studentů pro studenty, která skutečně funguje a nebrzdí vás při studiu.
        </p>
      </div>

      <div className="relative z-10 flex flex-nowrap gap-10 mt-2 lg:mt-0 w-full lg:w-auto">
        
        <div className="flex flex-col items-start md:items-center">
          <p className="text-3xl md:text-4xl font-bold text-[var(--color-primary)]">90+</p>
          <p className="text-xs text-[var(--text-darkgray)] font-bold uppercase tracking-wider mt-1 text-center">
            Aktivních<br/>uživatelů
          </p>
        </div>

        <div className="flex flex-col items-start md:items-center">
          <p className="text-3xl md:text-4xl font-bold text-[var(--color-primary)]">70+</p>
          <p className="text-xs text-[var(--text-darkgray)] font-bold uppercase tracking-wider mt-1 text-center">
            Hotových<br/>úkolů
          </p>
        </div>

        <div className="flex flex-col items-start md:items-center max-[950px]:hidden">
          <p className="text-3xl md:text-4xl font-bold text-[var(--color-primary)]">130+</p>
          <p className="text-xs text-[var(--text-darkgray)] font-bold uppercase tracking-wider mt-1 text-center">
            Vytvořených<br/>poznámek
          </p>
        </div>

        <div className="flex flex-col items-start md:items-center max-[1150px]:hidden">
          <p className="text-3xl md:text-4xl font-bold text-[var(--color-primary)]">50+</p>
          <p className="text-xs text-[var(--text-darkgray)] font-bold uppercase tracking-wider mt-1 text-center">
            Naplánovaných<br/>událostí
          </p>
        </div>

      </div>
    </div>
  );
}
