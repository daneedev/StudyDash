import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDashboardNotes } from "../context/DashboardNotesContext";
import { createContentPreview } from "../utils/notePreview";

type DashboardNotesPageProps = {
  subjectId?: string;
};

export function DashboardNotesPage({ subjectId }: DashboardNotesPageProps) {
  const navigate = useNavigate();
  const {
    subjects,
    notes,
    notesLoading,
    notesError,
    addSubject,
    updateSubject,
    deleteSubject,
  } = useDashboardNotes();

  const subjectMap = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );

  const selectedSubject = subjectId ? subjectMap.get(subjectId) : undefined;

  const visibleNotes = useMemo(() => {
    const filteredNotes = subjectId
      ? notes.filter((note) => note.subjectId === subjectId)
      : notes;

    return filteredNotes.filter((note) => subjectMap.has(note.subjectId));
  }, [notes, subjectId, subjectMap]);

  const subjectsScrollerRef = useRef<HTMLDivElement | null>(null);
  const subjectMenuContainerRef = useRef<HTMLDivElement | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isSubjectEditorOpen, setIsSubjectEditorOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [draftSubjectName, setDraftSubjectName] = useState("");
  const [isSavingSubject, setIsSavingSubject] = useState(false);
  const [subjectEditorError, setSubjectEditorError] = useState<string | null>(null);
  const [subjectMenuId, setSubjectMenuId] = useState<string | null>(null);
  const [subjectPendingDelete, setSubjectPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeletingSubject, setIsDeletingSubject] = useState(false);

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

  const closeSubjectEditor = () => {
    setIsSubjectEditorOpen(false);
    setEditingSubjectId(null);
    setDraftSubjectName("");
    setSubjectEditorError(null);
    setIsSavingSubject(false);
  };

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        target &&
        subjectMenuContainerRef.current?.contains(target)
      ) {
        return;
      }

      setSubjectMenuId(null);
    };

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const handleSaveSubject = async () => {
    if (!draftSubjectName.trim()) {
      setSubjectEditorError("Vyplň název předmětu.");
      return;
    }

    setIsSavingSubject(true);
    setSubjectEditorError(null);

    try {
      if (editingSubjectId) {
        await updateSubject(editingSubjectId, draftSubjectName);
      } else {
        await addSubject(draftSubjectName);
      }
      closeSubjectEditor();
    } catch (error) {
      setSubjectEditorError(
        (error as Error).message || "Nepodařilo se vytvořit předmět.",
      );
      setIsSavingSubject(false);
    }
  };

  const openCreateSubjectEditor = () => {
    setEditingSubjectId(null);
    setDraftSubjectName("");
    setSubjectEditorError(null);
    setIsSubjectEditorOpen(true);
  };

  const openRenameSubjectEditor = (subjectIdToEdit: string, subjectName: string) => {
    setEditingSubjectId(subjectIdToEdit);
    setDraftSubjectName(subjectName);
    setSubjectEditorError(null);
    setSubjectMenuId(null);
    setIsSubjectEditorOpen(true);
  };

  const handleDeleteSubject = async () => {
    if (!subjectPendingDelete) {
      return;
    }

    setIsDeletingSubject(true);

    try {
      await deleteSubject(subjectPendingDelete.id);
      if (subjectId === subjectPendingDelete.id) {
        await navigate({ to: "/dashboard/notes" });
      }
      setSubjectEditorError(null);
      setSubjectPendingDelete(null);
    } catch (error) {
      setSubjectEditorError(
        (error as Error).message || "Nepodařilo se smazat předmět.",
      );
    } finally {
      setIsDeletingSubject(false);
    }
  };

  return (
    <div className="w-full max-w-[1160px] mx-[5%] mt-12">
      <div className="flex flex-row justify-between gap-4">
        <div className="flex flex-col text-start">
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--text-white)]">
            {selectedSubject ? selectedSubject.name : "Poznámky"}
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-darkgray)] font-medium">
            {selectedSubject
              ? "Poznámky vybraného předmětu"
              : `Vítej zpět, dnes je ${new Date().toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" })}`}
          </p>
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
              <div
                onClick={() => navigate({ to: "/dashboard/notes" })}
                className={[
                  "bg-[var(--card-bg)] border-1 cursor-pointer flex flex-col justify-center items-center w-[150px] h-[170px] px-4 py-8 rounded-3xl flex-none",
                  subjectId
                    ? "border-[var(--border-card)]"
                    : "border-[var(--color-primary)]",
                ].join(" ")}
              >
                <img className="pt-2" src="/web_images/subjIcons/jazyky.svg" alt="Poznámky" />
                <h3 className="text-[var(--text-semiwhite)] font-semibold text-base pt-2 w-full text-center truncate">
                  Všechny poznámky
                </h3>
                <p className="text-[var(--text-darkgray)] font-medium text-sm">
                  {notes.length} položek
                </p>
              </div>

              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  ref={subjectMenuId === subject.id ? subjectMenuContainerRef : null}
                  className={[
                    "relative bg-[var(--card-bg)] border-1 flex flex-col justify-center items-center w-[150px] h-[170px] px-4 py-8 rounded-3xl flex-none",
                    subjectId === subject.id
                      ? "border-[var(--color-primary)]"
                      : "border-[var(--border-card)]",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSubjectMenuId((currentId) =>
                        currentId === subject.id ? null : subject.id,
                      );
                    }}
                    className="absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.04)]"
                    aria-label="Akce předmětu"
                  >
                    <span className="text-lg leading-none text-[var(--text-semiwhite)]">•••</span>
                  </button>
                  {subjectMenuId === subject.id ? (
                    <div
                      className="absolute right-2 top-11 z-20 w-[150px] rounded-lg border border-[var(--border-card)] bg-[var(--card-bg-notp)] py-2 shadow-lg"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => openRenameSubjectEditor(subject.id, subject.name)}
                        className="flex w-full cursor-pointer items-center justify-start px-3 py-2 text-sm text-[var(--text-semiwhite)] hover:bg-[rgba(255,255,255,0.04)]"
                      >
                        Přejmenovat
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSubjectEditorError(null);
                          setSubjectPendingDelete({ id: subject.id, name: subject.name });
                          setSubjectMenuId(null);
                        }}
                        className="flex w-full cursor-pointer items-center justify-start px-3 py-2 text-sm text-red-400 hover:bg-[rgba(255,255,255,0.04)]"
                      >
                        Smazat
                      </button>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/dashboard/notes/subj/$subjectId",
                        params: { subjectId: subject.id },
                      })
                    }
                    className="flex h-full w-full cursor-pointer flex-col items-center justify-center"
                  >
                  <img className="pt-2" src={`/web_images/subjIcons/${subject.icon}`} alt="Předmět" />
                  <h3
                    title={subject.name}
                    className="text-[var(--text-semiwhite)] font-semibold text-base pt-2 w-full text-center truncate"
                  >
                    {subject.name}
                  </h3>
                  <p className="text-[var(--text-darkgray)] font-medium text-sm">
                    {notes.filter((note) => note.subjectId === subject.id).length} pozn.
                  </p>
                  </button>
                </div>
              ))}

              <div
                className="bg-[var(--card-bg)] border-1 border-[var(--border-card)] cursor-pointer flex flex-col justify-center items-center w-[150px] h-[170px] px-6 py-10 rounded-3xl flex-none"
                onClick={openCreateSubjectEditor}
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

      <section className="mt-14 select-none w-full md:px-8">
        <div className="border-l-3 border-[var(--color-primary)] pl-1.5">
          <h2 className="text-xl font-semibold text-[var(--text-semiwhite)]">Poznámky</h2>
        </div>

        {notesLoading ? (
          <div className="pt-6 text-[var(--text-darkgray)]">Načítám poznámky...</div>
        ) : visibleNotes.length === 0 ? (
          <div className="pt-6 text-[var(--text-darkgray)]">
            {selectedSubject
              ? "Tento předmět zatím nemá žádné poznámky."
              : "Zatím tu nejsou žádné poznámky."}
          </div>
        ) : (
          <div className="pt-4">
            {notesError ? (
              <div className="pb-4 text-sm text-red-400">{notesError}</div>
            ) : null}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {visibleNotes.map((note) => {
              const subject = subjectMap.get(note.subjectId);
              if (!subject) {
                return null;
              }

              const contentPreview = createContentPreview(note.content);

              return (
                <div
                  key={note.id}
                  onClick={() =>
                    navigate({
                      to: "/dashboard/notes/$noteId",
                      params: { noteId: note.id },
                    })
                  }
                  className="flex flex-col gap-3 border-1 border-l-5 border-[var(--border-card)] rounded-2xl p-4 w-full cursor-pointer bg-[var(--card-bg)]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`/web_images/subjIcons/${subject.icon}`}
                      alt="subj icon"
                      className="max-h-[36px]"
                    />
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-[var(--text-semiwhite)] font-semibold text-lg truncate">
                        {note.name}
                      </h3>
                      <p className="text-[var(--text-darkgray)] text-sm">{subject.name}</p>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--text-darkgray)] line-clamp-3">
                    {contentPreview || "Prázdná poznámka"}
                  </p>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </section>

      {isSubjectEditorOpen && (
        <div
          className="fixed inset-0 z-[60] bg-[rgba(0,0,0,0.30)]"
          onClick={closeSubjectEditor}
        >
          <div
            className="fixed left-[calc(3.5rem+0.75rem)] right-3 top-1/2 z-[70] w-auto -translate-y-1/2 rounded-2xl border border-[var(--border-card)] bg-[var(--card-bg-notp)] p-5 md:top-1/2 md:left-1/2 md:right-auto md:bottom-auto md:w-[360px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[var(--text-white)]">
              {editingSubjectId ? "Přejmenovat předmět" : "Nový předmět"}
            </h3>
            <input
              type="text"
              value={draftSubjectName}
              onChange={(event) => setDraftSubjectName(event.target.value)}
              placeholder="Název předmětu"
              className="mt-4 w-full border-b border-[var(--border-card)] bg-transparent pb-2 text-[var(--text-semiwhite)] outline-none placeholder:text-[var(--text-darkgray)]"
            />
            {subjectEditorError && (
              <p className="mt-2 text-sm text-red-400">{subjectEditorError}</p>
            )}
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-start">
              <button
                type="button"
                onClick={closeSubjectEditor}
                disabled={isSavingSubject}
                className="cursor-pointer rounded-lg border border-[var(--border-card)] px-3 py-1.5 text-sm text-[var(--text-semiwhite)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 font-bold"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleSaveSubject}
                disabled={isSavingSubject}
                className="cursor-pointer rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-sm text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 font-bold"
              >
                {isSavingSubject
                  ? "Ukládám..."
                  : editingSubjectId
                    ? "Uložit"
                    : "Vytvořit předmět"}
              </button>
            </div>
          </div>
        </div>
      )}

      {subjectPendingDelete ? (
        <div
          className="fixed inset-0 z-[60] bg-[rgba(0,0,0,0.30)]"
          onClick={() => {
            if (!isDeletingSubject) {
              setSubjectPendingDelete(null);
            }
          }}
        >
          <div
            className="fixed left-[calc(3.5rem+0.75rem)] right-3 top-1/2 z-[70] w-auto -translate-y-1/2 rounded-2xl border border-[var(--border-card)] bg-[var(--card-bg-notp)] p-5 md:top-1/2 md:left-1/2 md:right-auto md:bottom-auto md:w-[320px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[var(--text-white)]">Smazat předmět?</h3>
            <p className="mt-2 text-sm text-[var(--text-darkgray)]">
              Tato akce je nevratná. Předmět <span className="text-[var(--text-semiwhite)]">"{subjectPendingDelete.name}"</span> bude trvale odstraněn.
            </p>
            {subjectEditorError ? (
              <p className="mt-2 text-sm text-red-400">{subjectEditorError}</p>
            ) : null}
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-start">
              <button
                type="button"
                onClick={() => {
                  setSubjectEditorError(null);
                  setSubjectPendingDelete(null);
                }}
                disabled={isDeletingSubject}
                className="cursor-pointer rounded-lg border border-[var(--border-card)] px-3 py-1.5 text-sm text-[var(--text-semiwhite)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleDeleteSubject}
                disabled={isDeletingSubject}
                className="cursor-pointer rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 font-bold"
              >
                {isDeletingSubject ? "Mazání..." : "Smazat"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
