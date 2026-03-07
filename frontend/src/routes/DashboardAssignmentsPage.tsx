import { useEffect, useMemo, useRef, useState } from "react";
import { getSelectedDashboardId } from "../utils/selectedDashboard";

type Assignment = {
  id: number;
  name: string;
  subject: string;
  description: string;
  dueDate: string;
  classId: number;
  type: string;
  addedBy: number;
  createdAt: string;
  updatedAt: string;
};

type AssignmentsResponse = {
  success: boolean;
  statusCode: number;
  data?: Assignment[] | Assignment;
  message?: string;
};

type AssignmentPayload = {
  name: string;
  subject: string;
  description: string;
  dueDate: string;
  classId: number;
  type: string;
};

const ASSIGNMENT_TYPE_VALUES = ["homework", "exam"] as const;

function normalizeAssignment(item: Partial<Assignment> & { title?: string }): Assignment {
  return {
    id: Number(item.id ?? 0),
    name: item.name ?? item.title ?? "Bez názvu",
    subject: item.subject ?? "General",
    description: item.description ?? "",
    dueDate: item.dueDate ?? new Date().toISOString(),
    classId: Number(item.classId ?? 0),
    type: item.type?.toLowerCase() ?? "homework",
    addedBy: Number(item.addedBy ?? 0),
    createdAt: item.createdAt ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? new Date().toISOString(),
  };
}

function normalizeAssignments(payload: AssignmentsResponse): Assignment[] {
  if (!payload.data) {
    return [];
  }

  const items = Array.isArray(payload.data) ? payload.data : [payload.data];
  return items.map((item) => normalizeAssignment(item));
}

function getAssignmentTypeLabel(type: string): string {
  switch (type.toLowerCase()) {
    case "homework":
      return "Úkol";
    case "exam":
      return "Test";
    default:
      return type;
  }
}

function resolveSelectedClassId(): number | null {
  const rawDashboardId = getSelectedDashboardId();
  if (!rawDashboardId) {
    return null;
  }

  const parsedDashboardId = Number(rawDashboardId);
  return Number.isFinite(parsedDashboardId) ? parsedDashboardId : null;
}

function formatDraftDateInput(value: string): string {
  const digitsOnly = value.replace(/\D/g, "").slice(0, 8);
  const day = digitsOnly.slice(0, 2);
  const month = digitsOnly.slice(2, 4);
  const year = digitsOnly.slice(4, 8);

  return [day, month, year].filter(Boolean).join(" ");
}

function formatIsoDateToDraftInput(value: string): string {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return "";
  }

  return `${day} ${month} ${year}`;
}

function parseDraftInputToIsoDate(value: string): string | null {
  const digitsOnly = value.replace(/\D/g, "");
  if (digitsOnly.length !== 8) {
    return null;
  }

  const day = Number(digitsOnly.slice(0, 2));
  const month = Number(digitsOnly.slice(2, 4));
  const year = Number(digitsOnly.slice(4, 8));
  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return `${year.toString().padStart(4, "0")}-${month
    .toString()
    .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function createDueDateFromIsoDate(isoDate: string): string {
  return `${isoDate}T23:59:59Z`;
}

function formatAssignmentDate(date: string): string {
  return new Date(date).toLocaleDateString("cs-CZ", { timeZone: "UTC" });
}

export function DashboardAssignmentsPage() {
  const selectedClassId = resolveSelectedClassId();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftSubject, setDraftSubject] = useState("General");
  const initialDraftDateIso = new Date().toISOString().slice(0, 10);
  const [draftDueDate, setDraftDueDate] = useState(
    formatIsoDateToDraftInput(initialDraftDateIso),
  );
  const [draftDueDateIso, setDraftDueDateIso] = useState(initialDraftDateIso);
  const [draftType, setDraftType] = useState<string>("exam");
  const draftDatePickerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectedClassId === null) {
      setAssignments([]);
      setError("Není vybraný žádný dashboard.");
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("auth_token");

    if (!token) {
      setError("Chybí přihlašovací token.");
      return;
    }

    const controller = new AbortController();
    const loadAssignments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/assignments/${selectedClassId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          const failedPayload = (await response.json().catch(() => null)) as
            | AssignmentsResponse
            | null;
          throw new Error(
            failedPayload?.message ?? "Nepodařilo se načíst assignmenty.",
          );
        }

        const payload = (await response.json()) as AssignmentsResponse;
        setAssignments(normalizeAssignments(payload));
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") {
          return;
        }
        setAssignments([]);
        setError(
          (fetchError as Error).message || "Nepodařilo se načíst assignmenty.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignments();
    return () => controller.abort();
  }, [selectedClassId]);

  const resetDraft = () => {
    const nextDraftDateIso = new Date().toISOString().slice(0, 10);
    setDraftName("");
    setDraftDescription("");
    setDraftSubject("General");
    setDraftDueDate(formatIsoDateToDraftInput(nextDraftDateIso));
    setDraftDueDateIso(nextDraftDateIso);
    setDraftType("exam");
    setEditingAssignmentId(null);
    setEditorError(null);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditorError(null);
    setIsSaving(false);
    setIsDeleting(false);
  };

  const openNewAssignmentEditor = () => {
    resetDraft();
    setIsEditorOpen(true);
  };

  const openAssignmentEditor = (assignment: Assignment) => {
    setEditingAssignmentId(assignment.id);
    setDraftName(assignment.name);
    setDraftDescription(assignment.description);
    setDraftSubject(assignment.subject || "General");
    setDraftDueDate(formatIsoDateToDraftInput(assignment.dueDate.slice(0, 10)));
    setDraftDueDateIso(assignment.dueDate.slice(0, 10));
    setDraftType(assignment.type || "exam");
    setEditorError(null);
    setIsEditorOpen(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setEditorError("Chybí přihlašovací token.");
      return;
    }

    if (selectedClassId === null) {
      setEditorError("Není vybraný žádný dashboard.");
      return;
    }

    const parsedIsoDate = parseDraftInputToIsoDate(draftDueDate) ?? draftDueDateIso;
    if (!draftName.trim()) {
      setEditorError("Vyplň název deadlinu.");
      return;
    }

    if (!parsedIsoDate) {
      setEditorError("Vyplň validní datum.");
      return;
    }

    const payload: AssignmentPayload = {
      name: draftName.trim(),
      subject: draftSubject.trim() || "General",
      description: draftDescription.trim(),
      dueDate: createDueDateFromIsoDate(parsedIsoDate),
      classId: selectedClassId,
      type: draftType,
    };

    setIsSaving(true);
    setEditorError(null);

    try {
      const response = await fetch(
        editingAssignmentId === null
          ? `${import.meta.env.VITE_API_BASE_URL}/assignments`
          : `${import.meta.env.VITE_API_BASE_URL}/assignments/${editingAssignmentId}`,
        {
          method: editingAssignmentId === null ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(
            editingAssignmentId === null
              ? payload
              : {
                  name: payload.name,
                  subject: payload.subject,
                  description: payload.description,
                  dueDate: payload.dueDate,
                  type: payload.type,
                },
          ),
        },
      );

      const responsePayload = (await response.json().catch(() => null)) as
        | AssignmentsResponse
        | null;

      if (!response.ok) {
        throw new Error(responsePayload?.message ?? "Uložení selhalo.");
      }

      const savedAssignment =
        responsePayload?.data && !Array.isArray(responsePayload.data)
          ? normalizeAssignment(responsePayload.data)
          : normalizeAssignment({
              id: editingAssignmentId ?? Date.now(),
              ...payload,
            });

      setAssignments((currentAssignments) => {
        if (editingAssignmentId === null) {
          return [...currentAssignments, savedAssignment].sort(
            (a, b) =>
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
          );
        }

        return currentAssignments
          .map((assignment) =>
            assignment.id === editingAssignmentId ? savedAssignment : assignment,
          )
          .sort(
            (a, b) =>
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
          );
      });

      closeEditor();
    } catch (saveError) {
      setEditorError((saveError as Error).message || "Uložení selhalo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (editingAssignmentId === null) {
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setEditorError("Chybí přihlašovací token.");
      return;
    }

    setIsDeleting(true);
    setEditorError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/assignments/${editingAssignmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const responsePayload = (await response.json().catch(() => null)) as
        | AssignmentsResponse
        | null;

      if (!response.ok) {
        throw new Error(responsePayload?.message ?? "Mazání selhalo.");
      }

      setAssignments((currentAssignments) =>
        currentAssignments.filter(
          (assignment) => assignment.id !== editingAssignmentId,
        ),
      );
      closeEditor();
    } catch (deleteError) {
      setEditorError((deleteError as Error).message || "Mazání selhalo.");
    } finally {
      setIsDeleting(false);
    }
  };

  const upcomingAssignments = useMemo(() => {
    const now = Date.now();
    return assignments
      .filter((assignment) => new Date(assignment.dueDate).getTime() >= now)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [assignments]);

  const pastAssignments = useMemo(() => {
    const now = Date.now();
    return assignments
      .filter((assignment) => new Date(assignment.dueDate).getTime() < now)
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [assignments]);

  return (
    <div className="w-full max-w-[1160px] mx-[5%] mt-12">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col text-start">
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--text-white)]">Úkoly & testy</h1>
          <p className="text-lg md:text-xl text-[var(--text-darkgray)] font-medium">Vítej zpět, dnes je {new Date().toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>

        <button
          onClick={openNewAssignmentEditor}
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
          Nový deadline
        </button>
      </div>

      <section className="flex flex-col md:flex-row justify-start gap-12 mt-14 select-none w-full">
        <div className="flex flex-col w-full md:flex-1 md:max-w-[500px] min-w-0">
          <div className="border-l-3 border-[var(--color-primary)] pl-1.5">
            <h2 className="text-xl font-semibold text-[var(--text-semiwhite)]">Aktuální deadliny</h2>
          </div>

          <div className="flex flex-col pt-4 w-full max-h-[450px] overflow-y-auto border-b-1 border-[var(--border-card)]">
            {isLoading && <p className="text-[var(--text-darkgray)] text-sm">Načítám assignmenty...</p>}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {!isLoading && !error && upcomingAssignments.length === 0 && (
              <p className="text-[var(--text-darkgray)] text-sm">Žádné aktuální deadliny.</p>
            )}
            {!isLoading && !error && upcomingAssignments.map((assignment) => (
              <div
                key={assignment.id}
                onClick={() => openAssignmentEditor(assignment)}
                className="flex flex-row border-t-1 border-[var(--border-card)] py-2 cursor-pointer"
              >
                <div className="flex">
                  <div className="w-[16px] h-[16px] rounded-full bg-[var(--card-bg)] shadow-[0_0_1.5px_0_#18B4A6] m-2" ></div>
                </div>
                <div>
                  <h3 className="text-[var(--text-white)] font-medium text-lg">{assignment.name}</h3>
                  <div className="flex flex-row justify-start items-center gap-2">
                    <div className="flex flex-row gap-0.5 items-center">
                      <img src="/web_images/Calendar.svg" alt="alarm" className="mr-1" />
                      <p className="text-[var(--text-darkgray)] text-md text-center ">
                        {formatAssignmentDate(assignment.dueDate)}
                      </p>
                    </div>
                    <img src="/web_images/dot.svg" className="w-[5px] h-[5px]" alt="dot" />
                    <p className="text-md text-[var(--text-semiwhite)]">{getAssignmentTypeLabel(assignment.type)}</p>
                  </div>
                  
                </div>
                
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col w-full md:flex-1 md:max-w-[500px] min-w-0 mt-14 md:mt-0">
          <div className="border-l-3 border-[var(--color-primary)] pl-1.5">
            <h2 className="text-xl font-semibold text-[var(--text-semiwhite)]">Minulé deadliny</h2>
          </div>

          <div className="flex flex-col pt-4 w-full max-h-[450px] overflow-y-auto border-b-1 { border-[var(--border-card)]">
            {isLoading && <p className="text-[var(--text-darkgray)] text-sm">Načítám assignmenty...</p>}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {!isLoading && !error && pastAssignments.length === 0 && (
              <p className="text-[var(--text-darkgray)] text-sm">Žádné minulé deadliny.</p>
            )}
            {!isLoading && !error && pastAssignments.map((assignment) => (
              <div
                key={assignment.id}
                onClick={() => openAssignmentEditor(assignment)}
                className="flex flex-row border-t-1 border-[var(--border-card)] py-2 cursor-pointer"
              >
                <div className="flex">
                  <div className="w-[16px] h-[16px] rounded-full bg-[var(--dark-primary)] shadow-[0_0_1.5px_0_#18B4A6] m-2" ></div>
                </div>
                <div>
                  <h3 className="text-[var(--text-white)] font-medium text-lg">{assignment.name}</h3>
                  <div className="flex flex-row items-center gap-2 justify-start">
                    <div className="flex flex-row gap-0.5 items-center">
                      <img src="/web_images/Alarm.svg" alt="alarm" />
                      <p className="text-[var(--text-darkgray)] text-md text-center ">
                        {formatAssignmentDate(assignment.dueDate)}
                      </p>
                    </div>
                    <img src="/web_images/dot.svg" className="w-[5px] h-[5px]" alt="dot" />
                    <p className="text-md text-[var(--text-semiwhite)]">{getAssignmentTypeLabel(assignment.type)}</p>
                  </div>
                  
                </div>
                
              </div>
            ))}
          </div>
        </div>

      </section>

      {isEditorOpen && (
        <div
          className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.42)]"
          onClick={closeEditor}
        >
          <div
            className="
              fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              z-50
              bg-[var(--card-bg)] border border-[var(--border-card)]
              rounded-xl w-[380px] h-[170px] flex flex-row justify-between
            "
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col select-none">
              <div className="flex flex-col mt-4 px-4">
                <input
                  type="text"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  placeholder="Název deadlinu"
                  className="placeholder:text-[var(--text-semiwhite)] text-[var(--text-semiwhite)] text-lg border-b-1 border-[var(--border-card)] outline-none bg-transparent"
                />
                <textarea
                  value={draftDescription}
                  onChange={(event) => setDraftDescription(event.target.value)}
                  placeholder="Detail deadlinu"
                  className="placeholder:text-[var(--text-darkgray)] text-[var(--text-darkgray)] text-md mt-1 h-[80px] w-full text-left resize-none outline-none bg-transparent"
                ></textarea>
                <div className="flex flex-row items-center gap-2">
                  <div className="relative">
                    <input
                      type="date"
                      value={draftDueDateIso}
                      onChange={(event) => {
                        setDraftDueDateIso(event.target.value);
                        setDraftDueDate(formatIsoDateToDraftInput(event.target.value));
                      }}
                      className="absolute h-0 w-0 opacity-0"
                      ref={draftDatePickerRef}
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={draftDueDate}
                      onChange={(event) => {
                        const formattedValue = formatDraftDateInput(event.target.value);
                        setDraftDueDate(formattedValue);

                        const parsedIsoDate = parseDraftInputToIsoDate(formattedValue);
                        if (parsedIsoDate) {
                          setDraftDueDateIso(parsedIsoDate);
                        }
                      }}
                      placeholder="dd mm yyyy"
                      inputMode="numeric"
                      className="w-[126px] rounded-md border border-[var(--border-card)] bg-transparent px-2 py-1 pr-9 text-sm text-[var(--text-darkgray)] outline-none placeholder:text-[var(--text-darkgray)]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof draftDatePickerRef.current?.showPicker === "function") {
                          draftDatePickerRef.current.showPicker();
                          return;
                        }

                        draftDatePickerRef.current?.focus();
                        draftDatePickerRef.current?.click();
                      }}
                      className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center opacity-80 transition-opacity hover:opacity-100"
                      aria-label="Otevřít kalendář"
                    >
                      <img
                        src="/web_images/Calendar.svg"
                        alt="calendar"
                        className="h-4 w-4"
                      />
                    </button>
                  </div>
                  <img src="/web_images/dot.svg" className="w-[5px] h-[5px]" alt="dot" />
                  <select
                    value={draftType}
                    onChange={(event) => setDraftType(event.target.value)}
                    className="rounded-md border border-[var(--border-card)] bg-[var(--card-bg)] px-2 py-1 text-sm text-[var(--text-semiwhite)] outline-none"
                  >
                    {ASSIGNMENT_TYPE_VALUES.map((type) => (
                      <option key={type} value={type}>
                        {getAssignmentTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>
                {editorError && (
                  <p className="mt-2 text-sm text-red-400">{editorError}</p>
                )}
              </div>
              <div className=""></div>
            </div>
            <div className="m-2.5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || isDeleting}
                className="rounded-[14px] bg-[var(--card-bg)] h-[38px] w-[38px] flex justify-center items-center text-center shadow-[0_0_1.5px_0_#18B4A6] cursor-pointer disabled:opacity-50"
              >
                <img src="/web_images/Save.svg" className="w-[24px] h-[24px]" alt="save" />
              </button>
              {editingAssignmentId !== null && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSaving || isDeleting}
                  className="rounded-[14px] bg-[var(--card-bg)] h-[38px] w-[38px] flex justify-center items-center text-center shadow-[0_0_1.5px_0_#18B4A6] cursor-pointer disabled:opacity-50"
                >
                  <img src="/web_images/Trash.svg" className="w-[24px] h-[24px]" alt="trash" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
