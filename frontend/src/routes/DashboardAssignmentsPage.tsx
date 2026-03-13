import { useEffect, useMemo, useRef, useState } from "react";
import { getSelectedDashboardId } from "../utils/selectedDashboard";
import { useDashboardNotes } from "../context/DashboardNotesContext";

type Assignment = {
  id: string | number;
  name: string;
  subjectId: string;
  subjectName: string;
  description: string;
  dueDate: string;
  classId: string;
  type: string;
  addedBy: string | number;
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
  subjectId: string;
  description: string;
  dueDate: string;
  classId: string;
  type: string;
};

const ASSIGNMENT_TYPE_VALUES = ["homework", "exam"] as const;
const CREATE_SUBJECT_OPTION = "__create_subject__";

function normalizeAssignment(
  item: Partial<Assignment> & {
    title?: string;
    subject?: string | { id?: string; name?: string };
  },
): Assignment {
  const nestedSubject =
    typeof item.subject === "object" && item.subject !== null ? item.subject : null;

  return {
    id: item.id ?? "",
    name: item.name ?? item.title ?? "Bez názvu",
    subjectId: item.subjectId ?? nestedSubject?.id ?? "",
    subjectName:
      typeof item.subject === "string"
        ? item.subject
        : nestedSubject?.name ?? item.subjectName ?? "Bez názvu",
    description: item.description ?? "",
    dueDate: item.dueDate ?? new Date().toISOString(),
    classId: item.classId ?? "",
    type: item.type?.toLowerCase() ?? "homework",
    addedBy: item.addedBy ?? "",
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

function resolveSelectedClassId(): string | null {
  return getSelectedDashboardId();
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
  const { subjects, addSubject } = useDashboardNotes();
  const selectedClassId = resolveSelectedClassId();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | number | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftSubjectId, setDraftSubjectId] = useState("");
  const initialDraftDateIso = new Date().toISOString().slice(0, 10);
  const [draftDueDate, setDraftDueDate] = useState(
    formatIsoDateToDraftInput(initialDraftDateIso),
  );
  const [draftDueDateIso, setDraftDueDateIso] = useState(initialDraftDateIso);
  const [draftType, setDraftType] = useState<string>("exam");
  const [isSubjectEditorOpen, setIsSubjectEditorOpen] = useState(false);
  const [draftSubjectName, setDraftSubjectName] = useState("");
  const [subjectEditorError, setSubjectEditorError] = useState<string | null>(null);
  const draftDatePickerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isEditorOpen || editingAssignmentId !== null || draftSubjectId || subjects.length === 0) {
      return;
    }

    setDraftSubjectId(subjects[0].id);
  }, [draftSubjectId, editingAssignmentId, isEditorOpen, subjects]);

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
    setDraftSubjectId(subjects[0]?.id ?? "");
    setDraftDueDate(formatIsoDateToDraftInput(nextDraftDateIso));
    setDraftDueDateIso(nextDraftDateIso);
    setDraftType("exam");
    setEditingAssignmentId(null);
    setIsDeleteConfirmOpen(false);
    setEditorError(null);
    setDraftSubjectName("");
    setSubjectEditorError(null);
    setIsSubjectEditorOpen(false);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setIsDeleteConfirmOpen(false);
    setEditorError(null);
    setSubjectEditorError(null);
    setIsSaving(false);
    setIsDeleting(false);
    setIsSubjectEditorOpen(false);
  };

  const openNewAssignmentEditor = () => {
    resetDraft();
    setIsEditorOpen(true);
  };

  const openAssignmentEditor = (assignment: Assignment) => {
    setEditingAssignmentId(assignment.id);
    setDraftName(assignment.name);
    setDraftDescription(assignment.description);
    setDraftSubjectId(assignment.subjectId);
    setDraftDueDate(formatIsoDateToDraftInput(assignment.dueDate.slice(0, 10)));
    setDraftDueDateIso(assignment.dueDate.slice(0, 10));
    setDraftType(assignment.type || "exam");
    setIsDeleteConfirmOpen(false);
    setEditorError(null);
    setDraftSubjectName("");
    setSubjectEditorError(null);
    setIsEditorOpen(true);
  };

  const saveAssignment = async (subjectId: string) => {
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

    setIsSaving(true);
    setEditorError(null);

    try {
      const selectedSubject = subjects.find((subject) => subject.id === subjectId);
      if (!selectedSubject) {
        throw new Error("Vyber platný předmět.");
      }

      const createPayload: AssignmentPayload = {
        name: draftName.trim(),
        subjectId,
        description: draftDescription.trim(),
        dueDate: createDueDateFromIsoDate(parsedIsoDate),
        classId: selectedClassId,
        type: draftType,
      };
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createPayload),
      });

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
              ...createPayload,
              subjectName: selectedSubject.name,
            });

      if (editingAssignmentId !== null) {
        const deleteResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/assignments/${editingAssignmentId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const deletePayload = (await deleteResponse.json().catch(() => null)) as
          | AssignmentsResponse
          | null;

        if (!deleteResponse.ok) {
          throw new Error(
            deletePayload?.message ??
              "Původní deadline se nepodařilo odstranit po vytvoření nové verze.",
          );
        }
      }

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

  const handleSave = async () => {
    if (draftSubjectId === CREATE_SUBJECT_OPTION) {
      setIsSubjectEditorOpen(true);
      setSubjectEditorError(null);
      return;
    }

    if (!draftSubjectId) {
      setEditorError("Vyber předmět.");
      return;
    }

    await saveAssignment(draftSubjectId);
  };

  const handleCreateSubjectAndSave = async () => {
    if (!draftSubjectName.trim()) {
      setSubjectEditorError("Vyplň název předmětu.");
      return;
    }

    setIsSaving(true);
    setSubjectEditorError(null);
    setEditorError(null);

    try {
      const createdSubject = await addSubject(draftSubjectName);
      setDraftSubjectId(createdSubject.id);
      setIsSubjectEditorOpen(false);
      setDraftSubjectName("");
      await saveAssignment(createdSubject.id);
    } catch (error) {
      setSubjectEditorError(
        (error as Error).message || "Nepodařilo se vytvořit předmět.",
      );
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
      setIsDeleteConfirmOpen(false);
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
    <div className="mt-8 w-full max-w-[1160px] px-4 md:mx-[5%] md:mt-12 md:px-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
            self-start
            max-h-[58px] md:max-h-[46px]
            px-3 py-2
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
                className="flex flex-row border-t-1 border-[var(--border-card)] py-2 cursor-pointer pr-2"
              >
                <div className="flex">
                  <div className="w-[16px] h-[16px] rounded-full bg-[var(--card-bg)] shadow-[0_0_1.5px_0_#18B4A6] m-2" ></div>
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-[var(--text-white)] font-medium text-lg">{assignment.name}</h3>
                  <div className="flex flex-wrap justify-start items-center gap-2">
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

          <div className="flex flex-col pt-4 w-full max-h-[450px] overflow-y-auto border-b-1 border-[var(--border-card)]">
            {isLoading && <p className="text-[var(--text-darkgray)] text-sm">Načítám assignmenty...</p>}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {!isLoading && !error && pastAssignments.length === 0 && (
              <p className="text-[var(--text-darkgray)] text-sm">Žádné minulé deadliny.</p>
            )}
            {!isLoading && !error && pastAssignments.map((assignment) => (
              <div
                key={assignment.id}
                onClick={() => openAssignmentEditor(assignment)}
                className="flex flex-row border-t-1 border-[var(--border-card)] py-2 cursor-pointer pr-2"
              >
                <div className="flex">
                  <div className="w-[16px] h-[16px] rounded-full bg-[var(--dark-primary)] shadow-[0_0_1.5px_0_#18B4A6] m-2" ></div>
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-[var(--text-white)] font-medium text-lg">{assignment.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 justify-start">
                    <div className="flex flex-row gap-0.5 items-center">
                      <img src="/web_images/Calendar.svg" alt="alarm" />
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
              fixed left-[calc(3.5rem+0.75rem)] right-3 top-1/2 -translate-y-1/2 md:top-1/2 md:left-1/2 md:right-auto md:bottom-auto md:-translate-x-1/2 md:-translate-y-1/2
              z-50
              bg-[var(--card-bg-notp)] border border-[var(--border-card)]
              rounded-2xl md:rounded-xl w-auto md:w-[520px] min-h-[230px] md:min-h-[186px] max-h-[85vh] overflow-y-auto flex flex-col md:flex-row justify-between p-4 md:p-0
            "
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col select-none flex-1 min-w-0">
              <div className="flex flex-col md:mt-4 md:px-4">
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
                  className="placeholder:text-[var(--text-darkgray)] text-[var(--text-darkgray)] text-md mt-2 h-[96px] md:h-[80px] w-full text-left resize-none outline-none bg-transparent"
                ></textarea>
                <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
                  <select
                    value={draftSubjectId}
                    onChange={(event) => setDraftSubjectId(event.target.value)}
                    className="w-full rounded-md border border-[var(--border-card)] bg-[var(--card-bg)] px-2 py-1 text-sm text-[var(--text-semiwhite)] outline-none"
                  >
                    <option value="" disabled>
                      Vyber předmět
                    </option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                    <option value={CREATE_SUBJECT_OPTION}>Nový předmět</option>
                  </select>
                  <div className="relative w-full sm:w-auto">
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
                      className="w-full rounded-md border border-[var(--border-card)] bg-transparent px-2 py-1 pr-9 text-sm text-[var(--text-darkgray)] outline-none placeholder:text-[var(--text-darkgray)]"
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
                  <select
                    value={draftType}
                    onChange={(event) => setDraftType(event.target.value)}
                    className="w-full rounded-md border border-[var(--border-card)] bg-[var(--card-bg)] px-2 py-1 text-sm text-[var(--text-semiwhite)] outline-none"
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
            <div className="mt-4 flex flex-row justify-start gap-2.5 md:m-2.5 md:flex-col">
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
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  disabled={isSaving || isDeleting}
                  className="rounded-[14px] bg-[var(--card-bg)] h-[38px] w-[38px] flex justify-center items-center text-center shadow-[0_0_1.5px_0_#18B4A6] cursor-pointer disabled:opacity-50"
                >
                  <img src="/web_images/Trash.svg" className="w-[24px] h-[24px]" alt="trash" />
                </button>
              )}
            </div>
          </div>

          {isDeleteConfirmOpen && (
            <div
              className="fixed inset-0 z-[60] bg-[rgba(0,0,0,0.30)]"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              <div
                className="fixed left-[calc(3.5rem+0.75rem)] right-3 top-1/2 z-[70] w-auto -translate-y-1/2 rounded-2xl border border-[var(--border-card)] bg-[var(--card-bg-notp)] p-5 md:top-1/2 md:left-1/2 md:right-auto md:bottom-auto md:w-[320px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl"
                onClick={(event) => event.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-[var(--text-white)]">Smazat assignment?</h3>
                <p className="mt-2 text-sm text-[var(--text-darkgray)]">
                  Tato akce je nevratná. Assignment <span className="text-[var(--text-semiwhite)]">"{draftName || "Bez názvu"}"</span> bude trvale odstraněn.
                </p>
                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-start">
                  <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    disabled={isDeleting}
                    className="cursor-pointer rounded-lg border border-[var(--border-card)] px-3 py-1.5 text-sm text-[var(--text-semiwhite)] transition-opacity hover:opacity-80 disabled:opacity-50"
                  >
                    Zrušit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="cursor-pointer rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {isDeleting ? "Mazání..." : "Smazat"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isSubjectEditorOpen && (
        <div
          className="fixed inset-0 z-[60] bg-[rgba(0,0,0,0.30)]"
          onClick={() => {
            if (!isSaving) {
              setIsSubjectEditorOpen(false);
              setSubjectEditorError(null);
            }
          }}
        >
          <div
            className="fixed left-[calc(3.5rem+0.75rem)] right-3 top-1/2 z-[70] w-auto -translate-y-1/2 rounded-2xl border border-[var(--border-card)] bg-[var(--card-bg-notp)] p-5 md:top-1/2 md:left-1/2 md:right-auto md:bottom-auto md:w-[360px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[var(--text-white)]">Nový předmět</h3>
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
                onClick={() => {
                  setIsSubjectEditorOpen(false);
                  setSubjectEditorError(null);
                }}
                disabled={isSaving}
                className="cursor-pointer rounded-lg border border-[var(--border-card)] px-3 py-1.5 text-sm text-[var(--text-semiwhite)] transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleCreateSubjectAndSave}
                disabled={isSaving}
                className="cursor-pointer rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-sm text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? "Ukládám..." : "Vytvořit a uložit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
