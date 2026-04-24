import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";

import { faGreaterThan } from "@fortawesome/free-solid-svg-icons";
import { faLessThan } from "@fortawesome/free-solid-svg-icons";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";

import { faDna } from "@fortawesome/free-solid-svg-icons";

library.add(faGreaterThan, faLessThan, faSquarePlus, faDna);

import { isWoman, vocative } from "czech-vocative";
import { useDashboardNotes } from "../context/DashboardNotesContext";
import { createContentPreview } from "../utils/notePreview";

type DashboardOverviewProps = {
  username: string;
  classId?: string;
  className?: string;
};

type OverviewAssignment = {
  id: string | number;
  name: string;
  subjectName: string;
  description: string;
  dueDate: string;
};

type AssignmentsResponse = {
  success: boolean;
  statusCode: number;
  data?: unknown;
  message?: string;
};

function normalizeOverviewAssignment(item: any): OverviewAssignment {
  const nestedSubject =
    typeof item?.subject === "object" && item?.subject !== null ? item.subject : null;

  return {
    id: item?.id ?? "",
    name: item?.name ?? item?.title ?? "Bez názvu",
    subjectName:
      item?.subjectName ??
      (typeof item?.subject === "string" ? item.subject : null) ??
      nestedSubject?.name ??
      "—",
    description: item?.description ?? "",
    dueDate: item?.dueDate ?? new Date().toISOString(),
  };
}

function normalizeOverviewAssignments(payload: AssignmentsResponse): OverviewAssignment[] {
  const data = payload?.data;
  if (!data) return [];
  const items = Array.isArray(data) ? data : [data];
  return items.map((item) => normalizeOverviewAssignment(item));
}

function formatAssignmentDate(date: string): string {
  return new Date(date).toLocaleDateString("cs-CZ", { timeZone: "UTC" });
}

function getDueDateStatus(
  dueDate: string,
  now: Date,
): "overdue" | "today" | "future" {
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) {
    return "future";
  }

  const nowUtcDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dueUtcDay = Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());

  if (dueUtcDay < nowUtcDay) return "overdue";
  if (dueUtcDay === nowUtcDay) return "today";
  return "future";
}

export function DashboardOverview({
  username,
  classId,
  className,
}: DashboardOverviewProps) {
  const navigate = useNavigate({ from: "/dashboard/$classId" });
  const { notes, subjects } = useDashboardNotes();

  const usernameVocative = username
    ? capitalizeFirstLetter(vocative(username, isWoman(username)))
    : "Uživateli";

  const now = new Date();

  // displayedDate controls which month is shown; initialize to current month
  const [displayedDate, setDisplayedDate] = useState(
    () => new Date(now.getFullYear(), now.getMonth(), 1),
  );

  const displayedYear = displayedDate.getFullYear();
  const displayedMonth = displayedDate.getMonth();

  const firstDay = new Date(displayedYear, displayedMonth, 1);
  const lastDay = new Date(displayedYear, displayedMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  // Shift so week starts on Monday: Monday=0..Sunday=6
  const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

  const monthName = firstDay.toLocaleDateString("cs-CZ", {
    month: "long",
    year: "numeric",
  });
  const dayLabels = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
  const subjectMap = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );
  const latestNotes = useMemo(() => notes.slice(0, 2), [notes]);

  // Build 6x7 grid (42 cells) and include previous/next month days.
  type Cell = { day: number; inMonth: boolean };
  const cells: Cell[] = [];

  // previous month last day
  const prevLastDay = new Date(displayedYear, displayedMonth, 0).getDate();
  // fill with previous month's trailing days (grayed)
  const prevStart = prevLastDay - startingDayOfWeek + 1;
  for (let d = prevStart; d <= prevLastDay; d++)
    cells.push({ day: d, inMonth: false });

  // current month days
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, inMonth: true });

  // next month leading days
  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({ day: nextDay++, inMonth: false });
  }

  function prevMonth() {
    setDisplayedDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setDisplayedDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  const [assignments, setAssignments] = useState<OverviewAssignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);

  useEffect(() => {
    if (!classId) {
      setAssignments([]);
      setAssignmentsError("Chybí ID třídy.");
      setAssignmentsLoading(false);
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setAssignments([]);
      setAssignmentsError("Chybí přihlašovací token.");
      setAssignmentsLoading(false);
      return;
    }

    const controller = new AbortController();
    const loadAssignments = async () => {
      setAssignmentsLoading(true);
      setAssignmentsError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/assignments/${classId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          },
        );

        const payload = (await response.json().catch(() => null)) as
          | AssignmentsResponse
          | null;

        if (!response.ok) {
          throw new Error(payload?.message ?? "Nepodařilo se načíst assignmenty.");
        }

        setAssignments(normalizeOverviewAssignments(payload ?? { success: true, statusCode: 200 }));
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setAssignments([]);
        setAssignmentsError(
          (error as Error).message || "Nepodařilo se načíst assignmenty.",
        );
      } finally {
        setAssignmentsLoading(false);
      }
    };

    loadAssignments();
    return () => controller.abort();
  }, [classId]);

  const sortedAssignments = useMemo(() => {
    return [...assignments].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
  }, [assignments]);

  return (
    <main className="w-full max-w-400 flex flex-col min-h-0 h-[calc(100dvh-48px)] overflow-y-auto pb-6">
      <h1 className="text-3xl shrink-0 mb-1 font-semibold">
        Ahoj {usernameVocative}
        {className && ` - ${className}`},
      </h1>
      <p className="mb-3">
        Dnes je{" "}
        {now.toLocaleDateString("cs-CZ", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </p>

      <article className="grid min-h-0 flex-1 w-full gap-6 grid-cols-1 xl:grid-cols-[minmax(0,460px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)] xl:grid-rows-[minmax(0,1.9fr)_minmax(0,1.2fr)]">
        <section className="min-h-0 min-w-0 bg-[var(--card-bg)] rounded-xl border border-[#18b4a6] flex flex-col p-3 sm:p-4 overflow-hidden">
          <article className="flex items-center justify-between gap-2">
            <h3 className="font-bold capitalize text-xl sm:text-2xl lg:text-3xl truncate">{monthName}</h3>
            <section className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={prevMonth}
                aria-label="Previous month"
                className="p-1 sm:p-1.5"
              >
                <FontAwesomeIcon
                  icon={faLessThan}
                  size="lg"
                  className="font-extrabold hover:cursor-pointer"
                />
              </button>
              <button
                onClick={nextMonth}
                aria-label="Next month"
                className="p-1 sm:p-1.5"
              >
                <FontAwesomeIcon
                  icon={faGreaterThan}
                  size="lg"
                  className="font-extrabold hover:cursor-pointer"
                />
              </button>
            </section>
          </article>

          <div className="mt-2 grid grid-cols-7 gap-0 text-center text-[#18b4a6]">
            {dayLabels.map((d) => (
              <div key={d} className="pb-1 font-semibold text-xs sm:text-sm lg:text-base">
                {d}
              </div>
            ))}
          </div>

          <div
            className="grid grid-cols-7 grid-rows-6 gap-0.5 sm:gap-1 flex-1 min-h-0 text-center"
          >
            {cells.map((cell, i) => {
              const isToday =
                cell.inMonth &&
                cell.day === now.getDate() &&
                displayedMonth === now.getMonth() &&
                displayedYear === now.getFullYear();
              return (
                <div
                  key={i}
                  className={`aspect-square w-full flex items-center justify-center rounded-md cursor-pointer ${
                    isToday
                      ? "bg-[#18b4a6] text-white transition-colors duration-150 "
                      : cell.inMonth
                        ? "hover:bg-black/3 transition-colors duration-150 text-[#e6e6e6]"
                        : "text-gray-400"
                  }`}
                >
                  <span
                    className={`${
                      cell.inMonth
                        ? "font-bold text-base sm:text-xl lg:text-3xl leading-none"
                        : "text-xs sm:text-sm lg:text-base leading-none"
                    }`}
                  >
                    {cell.day}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="min-h-0 bg-[var(--card-bg)] rounded-xl border border-[#18b4a6] flex flex-col p-4 overflow-hidden">
          <header className="flex items-start justify-between gap-4">
            <h2 className="font-bold text-3xl">Deadliny</h2>
            <button
              type="button"
              onClick={() => navigate({ to: "/dashboard/todo", search: { create: "1" } })}
              className="flex items-center gap-2 rounded-lg  px-3 py-2 text-[#18b4a6] hover:bg-black/5 transition-colors"
            >
              <FontAwesomeIcon
              icon={faSquarePlus}
              className="text-[#18b4a6] scale-200 hover:scale-190 cursor-pointer transition-transform duration-100"
            />
              
            </button>
          </header>

          <div className="mt-3 flex-1 min-h-0 overflow-y-auto rounded-lg border border-[#353535]">
            {assignmentsLoading && (
              <p className="p-3 text-sm text-gray-400">Načítám assignmenty...</p>
            )}
            {!assignmentsLoading && assignmentsError && (
              <p className="p-3 text-sm text-red-400">{assignmentsError}</p>
            )}
            {!assignmentsLoading && !assignmentsError && sortedAssignments.length === 0 && (
              <p className="p-3 text-sm text-gray-400">Žádné aktuální deadliny.</p>
            )}

            {!assignmentsLoading && !assignmentsError && sortedAssignments.length > 0 && (
              <ul className="divide-y divide-[#353535]">
                {sortedAssignments.map((assignment) => {
                  const dueStatus = getDueDateStatus(assignment.dueDate, now);
                  const dueDateClassName =
                    dueStatus === "overdue"
                      ? "text-red-400  font-semibold"
                      : dueStatus === "today"
                        ? "text-amber-400"
                        : "text-gray-300";

                  return (
                    <li
                      key={assignment.id}
                      className="px-1"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigate({
                            to: "/dashboard/todo",
                            search: { open: String(assignment.id) },
                          })
                        }
                        className="grid w-full grid-cols-1 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1.4fr)_minmax(0,0.6fr)] items-center gap-1 sm:gap-3 rounded-lg px-2 py-2 text-left hover:bg-black/5 hover:cursor-pointer transition-colors duration-150"
                      >
                        <p className="truncate text-lg font-semibold text-[#e6e6e6]">
                          {assignment.name}
                        </p>
                        <p className="truncate text-sm text-gray-300">
                          {assignment.subjectName || "—"}
                        </p>
                        <p className="truncate text-sm text-gray-400">
                          {assignment.description || "—"}
                        </p>
                        <p className={`text-sm sm:text-right ${dueDateClassName}`}>
                          {formatAssignmentDate(assignment.dueDate)}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="xl:col-span-2 min-h-0 bg-[var(--card-bg)] rounded-xl border border-[#18b4a6] grid grid-cols-1 md:grid-cols-2 grid-rows-[auto_auto_auto_auto] md:grid-rows-[1fr_3fr] gap-4 overflow-hidden">
          <h2 className="font-bold text-3xl capitalize p-4">Poznámky</h2>
          <div className="flex justify-end items-start p-6">
            <FontAwesomeIcon
              icon={faSquarePlus}
              className="text-[#18b4a6] scale-200 hover:scale-190 cursor-pointer transition-transform duration-100"
            />
          </div>
          {latestNotes.length === 0 ? (
            <div className="col-span-2 flex items-center px-4 pb-6 text-[var(--text-darkgray)]">
              Zatím tu nejsou žádné poznámky.
            </div>
          ) : (
            latestNotes.map((note, index) => {
              const subject = subjectMap.get(note.subjectId);

              return (
                <article
                  key={note.id}
                  onClick={() =>
                    navigate({
                      to: "/dashboard/notes/$noteId",
                      params: { noteId: note.id },
                    })
                  }
                  className={[
                    "flex flex-col flex-1 mb-4 border border-[#353535] rounded-lg cursor-pointer",
                    index === 0 ? "ml-4" : "mr-4",
                  ].join(" ")}
                >
                  <section className="flex justify-between items-center m-4 gap-4">
                    <h4 className="font-semibold text-xl truncate">{note.name}</h4>
                    <FontAwesomeIcon
                      icon={faDna}
                      className="text-[#18b4a6] scale-200 hover:scale-190 cursor-pointer transition-transform duration-100"
                    />
                  </section>
                  <section className="m-4 pt-2 flex-1">
                    <p className="line-clamp-4">
                      {createContentPreview(note.content)}
                    </p>
                  </section>
                  <section className="flex flex-1 justify-between items-center px-4 pb-4 text-md text-[var(--text-darkgray)]">
                    <p>{subject?.name ?? "Bez předmětu"}</p>
                    <p>
                      {note.updatedAt
                        ? new Date(note.updatedAt).toLocaleDateString("cs-CZ")
                        : ""}
                    </p>
                  </section>
                </article>
              );
            })
          )}
        </section>
      </article>
    </main>
  );
}

function capitalizeFirstLetter(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
