import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDashboardNotes } from "../context/DashboardNotesContext";

export function DashboardNotesPage() {
  const navigate = useNavigate({ from: "/dashboard/notes" });
  const { subjects, notes } = useDashboardNotes();

  const subjectMap = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );

  const privateNotes = useMemo(
    () => notes.filter((note) => note.visibility === "private"),
    [notes],
  );

  const sharedNotes = useMemo(
    () => notes.filter((note) => note.visibility === "shared"),
    [notes],
  );

  const subjectsScrollerRef = useRef<HTMLDivElement | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = subjectsScrollerRef.current;
    if (!el) return;
    const nextHasOverflow = el.scrollWidth > el.clientWidth + 1;
    const isAtStart = el.scrollLeft <= 1;
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
    setHasOverflow(nextHasOverflow);
    setCanScrollLeft(nextHasOverflow && !isAtStart);
    setCanScrollRight(nextHasOverflow && !isAtEnd);
  }, []);

  useEffect(() => {
    updateScrollState();

    const el = subjectsScrollerRef.current;
    if (!el) return;

    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => updateScrollState());
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
    };
  }, [subjects.length, updateScrollState]);

  const scrollSubjectsRight = () => {
    const el = subjectsScrollerRef.current;
    if (!el) return;
    const stepPx = 162 * 2;
    el.scrollBy({ left: stepPx, behavior: "smooth" });
  };

  const scrollSubjectsLeft = () => {
    const el = subjectsScrollerRef.current;
    if (!el) return;
    const stepPx = 162 * 2;
    el.scrollBy({ left: -stepPx, behavior: "smooth" });
  };

  return (
    <div className="w-full max-w-[1160px] mx-[5%] mt-12">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col text-start">
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--text-white)]">Poznámky</h1>
          <p className="text-lg md:text-xl text-[var(--text-darkgray)] font-medium">Vítej zpět, dnes je {new Date().toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>

        <button
          onClick={() => navigate({ to: "/dashboard/notes/new" })}
          className="
            border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-normal
            bg-transparent
            cursor-pointer
            rounded-xl
            max-h-[58px] md:max-h-[46px]
            px-3 md:py-2
            hover:scale-105
            transition-all duration-250 ease-in-out
          "
        >
          Nová poznámka
        </button>
      </div>

      <section className="mx-auto mt-16 select-none">
        <div>
          <div className="border-l-3 border-[var(--color-primary)] pl-1.5">
            <h2 className="text-xl font-semibold text-[var(--text-semiwhite)]">Předměty</h2>
          </div>
          <div className="flex flex-row pt-4 items-center">
            <div
              className={[
                "overflow-hidden transition-[width,margin-right,opacity] duration-200 ease-in-out",
                canScrollLeft ? "w-[25px] mr-3 opacity-100" : "w-0 mr-0 opacity-0",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={scrollSubjectsLeft}
                disabled={!canScrollLeft}
                className={[
                  "transition-all duration-150 w-[25px] h-[45px] shrink-0",
                  canScrollLeft ? "cursor-pointer hover:scale-105" : "pointer-events-none",
                ].join(" ")}
              >
                <img
                  src="/web_images/Arrow_Left.svg"
                  alt="arrow left"
                  className="w-[25px] h-[45px] shrink-0"
                />
              </button>
            </div>
            <div
              ref={subjectsScrollerRef}
              className="flex flex-row overflow-x-auto scrollbar-hide flex-1 min-w-0 gap-3"
            >
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => navigate({ to: "/dashboard/notes/subj/$subjectId", params: { subjectId: subject.id } })}
                  className="bg-[var(--card-bg)] border-1 border-[var(--border-card)] cursor-pointer flex flex-col justify-center items-center w-[150px] h-[170px] px-4 py-8 rounded-3xl flex-none"
                >
                  <img className="pt-2" src={`/web_images/subjIcons/${subject.icon}`} alt="Předmět" />
                  <h3 title={subject.name} className="text-[var(--text-semiwhite)] font-semibold text-base pt-2 w-full text-center truncate">{subject.name}</h3>
                  <p className="text-[var(--text-darkgray)] font-medium text-sm">{subject.status}</p>
                </div>
              ))}

              <div
                className="bg-[var(--card-bg)] border-1 border-[var(--border-card)] cursor-pointer flex flex-col justify-center items-center w-[150px] h-[170px] px-6 py-10 rounded-3xl flex-none"
                onClick={() => navigate({ to: "/dashboard/notes/subj/new" })}
              >
                <img src="/web_images/Add_Plus.svg" alt="plus" className="pt-6 pb-1" />
                <p className="text-[var(--text-darkgray)] text-center text-md">Přidat nový předmět</p>
              </div>
            </div>
            <div
              className={[
                "overflow-hidden transition-[width,margin-left,opacity] duration-200 ease-in-out",
                hasOverflow ? "w-[25px] ml-3 opacity-100" : "w-0 ml-0 opacity-0",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={scrollSubjectsRight}
                disabled={!canScrollRight}
                className={[
                  "transition-all duration-150 w-[25px] h-[45px] shrink-0",
                  canScrollRight ? "cursor-pointer hover:scale-105" : "cursor-not-allowed opacity-40",
                ].join(" ")}
              >
                <img
                  src="/web_images/Arrow_Right.svg"
                  alt="arrow right"
                  className="w-[25px] h-[45px] shrink-0"
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col md:flex-row justify-between gap-12 mt-14 select-none w-full md:px-8">
        <div className="flex flex-col w-full md:flex-1 md:max-w-[500px] min-w-0">
          <div className="border-l-3 border-[var(--color-primary)] pl-1.5">
            <h2 className="text-xl font-semibold text-[var(--text-semiwhite)]">Soukromé poznámky</h2>
          </div>

          <div className="flex flex-col pt-4 w-full max-h-[450px] overflow-y-auto">
            {privateNotes.map((note) => {
              const subject = subjectMap.get(note.subjectId);
              if (!subject) {
                return null;
              }

              return (
                <div
                  key={note.id}
                  onClick={() => navigate({ to: "/dashboard/notes/$noteId", params: { noteId: note.id } })}
                  className="flex flex-row justify-start items-center border-1 border-l-5 border-[var(--border-card)] rounded-2xl p-4 max-w-[350px] md:max-w-[500px] w-full cursor-pointer mb-2"
                >
                  <img src={`/web_images/subjIcons/${subject.icon}`} alt="subj icon" className="max-h-[36px]" />
                  <div className="flex flex-col pl-3">
                    <h3 className="text-[var(--text-semiwhite)] font-semibold text-lg">{note.name}</h3>
                    <p className="text-[var(--text-darkgray)] text-sm">{subject.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col w-full md:flex-1 md:max-w-[500px] min-w-0 mt-14 md:mt-0">
          <div className="border-l-3 border-[var(--color-primary)] pl-1.5">
            <h2 className="text-xl font-semibold text-[var(--text-semiwhite)]">Sdílené poznámky</h2>
          </div>

          <div className="flex flex-col pt-4 w-full max-h-[450px] overflow-y-auto">
            {sharedNotes.map((note) => {
              const subject = subjectMap.get(note.subjectId);
              if (!subject) {
                return null;
              }

              return (
                <div
                  key={note.id}
                  onClick={() => navigate({ to: "/dashboard/notes/$noteId", params: { noteId: note.id } })}
                  className="flex flex-row justify-start items-center border-1 border-l-5 border-[var(--border-card)] rounded-2xl p-4 max-w-[350px] md:max-w-[500px] w-full cursor-pointer mb-2"
                >
                  <img src={`/web_images/subjIcons/${subject.icon}`} alt="subj icon" className="max-h-[36px]" />
                  <div className="flex flex-col pl-3">
                    <h3 className="text-[var(--text-semiwhite)] font-semibold text-lg">{note.name}</h3>
                    <p className="text-[var(--text-darkgray)] text-sm">{subject.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
