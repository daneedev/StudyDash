import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getSelectedDashboardId } from "../utils/selectedDashboard";

export type Subject = {
  id: string;
  name: string;
  icon: string;
  status: "Poznámky";
};

export type Note = {
  id: string;
  name: string;
  subjectId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type NoteFile = {
  id: string;
  noteId: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
};

type DashboardNotesContextValue = {
  subjects: Subject[];
  notes: Note[];
  notesLoading: boolean;
  notesError: string | null;
  noteFilesByNoteId: Record<string, NoteFile[]>;
  filesLoadingNoteIds: string[];
  addSubject: (name: string) => Promise<Subject>;
  updateSubject: (subjectId: string, name: string) => Promise<Subject>;
  deleteSubject: (subjectId: string) => Promise<void>;
  createNote: (input: {
    name: string;
    subjectId: string;
    content: string;
  }) => Promise<Note>;
  updateNote: (noteId: string, input: {
    name: string;
    content: string;
    subjectId?: string;
  }) => Promise<Note>;
  deleteNote: (noteId: string) => Promise<void>;
  getNoteById: (noteId: string) => Note | undefined;
  loadFiles: (noteId: string) => Promise<NoteFile[]>;
  uploadFile: (noteId: string, file: File) => Promise<NoteFile[]>;
  deleteFile: (fileId: string, noteId: string) => Promise<void>;
  downloadFile: (fileId: string, filename?: string) => Promise<void>;
};

type SubjectApiItem = {
  id?: string;
  name?: string;
};

type NoteApiItem = {
  id?: string;
  name?: string;
  title?: string;
  subjectId?: string;
  content?: string | Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

type FileApiItem = {
  id?: string;
  name?: string;
  filename?: string;
  originalName?: string;
  noteId?: string;
  size?: number;
  mimeType?: string;
  type?: string;
  createdAt?: string;
};

type SubjectsApiResponse = {
  data?: SubjectApiItem[] | SubjectApiItem;
  message?: string;
};

type NotesApiResponse = {
  data?: NoteApiItem[] | NoteApiItem;
  message?: string;
};

type FilesApiResponse = {
  data?: FileApiItem[] | FileApiItem;
  message?: string;
};

function extractItems<T extends object>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  if ("data" in payload) {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) {
      return data as T[];
    }
    if (data && typeof data === "object") {
      return [data as T];
    }
    return [];
  }

  return [payload as T];
}

function normalizeSubject(item: SubjectApiItem): Subject | null {
  if (!item.id) {
    return null;
  }

  return {
    id: item.id,
    name: item.name ?? "Bez názvu",
    icon: "jazyky.svg",
    status: "Poznámky",
  };
}

function normalizeNote(
  item: NoteApiItem,
  fallbackSubjectId = "",
): Note | null {
  if (!item.id) {
    return null;
  }

  return {
    id: item.id,
    name: item.name ?? item.title ?? "Bez názvu",
    subjectId: item.subjectId ?? fallbackSubjectId,
    content:
      typeof item.content === "string"
        ? item.content
        : item.content
          ? JSON.stringify(item.content)
          : "",
    createdAt: item.createdAt ?? "",
    updatedAt: item.updatedAt ?? item.createdAt ?? "",
  };
}

function normalizeFile(item: FileApiItem, noteId: string): NoteFile | null {
  if (!item.id) {
    return null;
  }

  return {
    id: item.id,
    noteId: item.noteId ?? noteId,
    name: item.name ?? item.filename ?? item.originalName ?? "Příloha",
    size: typeof item.size === "number" ? item.size : 0,
    mimeType: item.mimeType ?? item.type ?? "",
    createdAt: item.createdAt ?? "",
  };
}

function sortNotes(items: Note[]) {
  return [...items].sort((a, b) => {
    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bTime - aTime || a.name.localeCompare(b.name, "cs");
  });
}

function upsertNote(items: Note[], nextNote: Note) {
  const nextItems = items.some((item) => item.id === nextNote.id)
    ? items.map((item) => (item.id === nextNote.id ? nextNote : item))
    : [...items, nextNote];

  return sortNotes(nextItems);
}

async function readErrorMessage(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as
    | { message?: string }
    | null;
  return payload?.message ?? fallback;
}

function getPayloadMessage(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("message" in payload)) {
    return undefined;
  }

  const message = (payload as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}

function normalizeErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

const DashboardNotesContext = createContext<DashboardNotesContextValue | null>(null);

export function DashboardNotesProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [noteFilesByNoteId, setNoteFilesByNoteId] = useState<Record<string, NoteFile[]>>({});
  const [filesLoadingNoteIds, setFilesLoadingNoteIds] = useState<string[]>([]);
  const [selectedDashboardId, setSelectedDashboardId] = useState<string | null>(
    () => getSelectedDashboardId(),
  );

  useEffect(() => {
    const handleDashboardChange = (event: Event) => {
      const detail = (event as CustomEvent).detail as
        | { dashboardId?: string | null }
        | undefined;
      setSelectedDashboardId(detail?.dashboardId ?? getSelectedDashboardId());
    };

    window.addEventListener("selected-dashboard-changed", handleDashboardChange);
    return () =>
      window.removeEventListener(
        "selected-dashboard-changed",
        handleDashboardChange,
      );
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    setNotes([]);
    setNotesLoading(Boolean(selectedDashboardId && token));
    setNotesError(null);
    setNoteFilesByNoteId({});
    setFilesLoadingNoteIds([]);

    if (!selectedDashboardId || !token) {
      setSubjects([]);
      setNotesLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadSubjects = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/subjects/${selectedDashboardId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          setSubjects([]);
          return;
        }

        const payload = (await response.json()) as
          | SubjectsApiResponse
          | SubjectApiItem[];

        setSubjects(
          extractItems<SubjectApiItem>(payload)
            .map(normalizeSubject)
            .filter((item): item is Subject => item !== null),
        );
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSubjects([]);
        }
      }
    };

    loadSubjects();
    return () => controller.abort();
  }, [selectedDashboardId]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setNotes([]);
      setNotesLoading(false);
      setNotesError("Chybí přihlašovací token.");
      return;
    }

    if (subjects.length === 0) {
      setNotes([]);
      setNotesLoading(false);
      setNotesError(null);
      return;
    }

    const controller = new AbortController();
    let active = true;

    const loadNotes = async () => {
      setNotesLoading(true);
      setNotesError(null);

      try {
        const noteGroups = await Promise.all(
          subjects.map(async (subject) => {
            try {
              const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/notes/${subject.id}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  signal: controller.signal,
                },
              );

              if (response.status === 404) {
                return [] as Note[];
              }

              if (!response.ok) {
                throw new Error(
                  await readErrorMessage(
                    response,
                    `Nepodařilo se načíst poznámky pro ${subject.name}.`,
                  ),
                );
              }

              const payload = (await response.json()) as NotesApiResponse | NoteApiItem[];
              return extractItems<NoteApiItem>(payload)
                .map((item) => normalizeNote(item, subject.id))
                .filter((item): item is Note => item !== null);
            } catch (error) {
              if ((error as Error).name === "AbortError") {
                throw error;
              }

              console.error(
                `Failed to load notes for subject ${subject.id}`,
                error,
              );

              setNotesError((currentError) =>
                currentError ??
                normalizeErrorMessage(
                  error,
                  `Nepodařilo se načíst poznámky pro ${subject.name}.`,
                ),
              );
              return [] as Note[];
            }
          }),
        );

        if (!active) {
          return;
        }

        const deduped = new Map<string, Note>();
        noteGroups.flat().forEach((note) => {
          deduped.set(note.id, note);
        });

        setNotes(sortNotes(Array.from(deduped.values())));
      } catch (error) {
        if ((error as Error).name === "AbortError" || !active) {
          return;
        }

        setNotes([]);
        setNotesError(
          (error as Error).message ?? "Nepodařilo se načíst poznámky.",
        );
      } finally {
        if (active) {
          setNotesLoading(false);
        }
      }
    };

    loadNotes();

    return () => {
      active = false;
      controller.abort();
    };
  }, [subjects]);

  const addSubject = useCallback(async (name: string) => {
    const token = localStorage.getItem("auth_token");

    if (!selectedDashboardId || !token) {
      throw new Error("Chybí vybraný dashboard nebo token.");
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/subjects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name.trim(),
        classId: selectedDashboardId,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | SubjectsApiResponse
      | SubjectApiItem
      | null;

    if (!response.ok) {
      throw new Error(getPayloadMessage(payload) ?? "Nepodařilo se vytvořit předmět.");
    }

    const createdSubject = extractItems<SubjectApiItem>(payload)
      .map(normalizeSubject)
      .find((item): item is Subject => item !== null);

    if (!createdSubject) {
      throw new Error("Nepodařilo se načíst vytvořený předmět.");
    }

    setSubjects((currentSubjects) => [...currentSubjects, createdSubject]);
    return createdSubject;
  }, [selectedDashboardId]);

  const updateSubject = useCallback(async (subjectId: string, name: string) => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Chybí přihlašovací token.");
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/subjects/${subjectId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      },
    );

    const payload = (await response.json().catch(() => null)) as
      | SubjectsApiResponse
      | SubjectApiItem
      | null;

    if (!response.ok) {
      throw new Error(getPayloadMessage(payload) ?? "Nepodařilo se upravit předmět.");
    }

    const updatedSubject = extractItems<SubjectApiItem>(payload)
      .map(normalizeSubject)
      .find((item): item is Subject => item !== null) ?? {
      id: subjectId,
      name: name.trim(),
      icon: "jazyky.svg",
      status: "Poznámky" as const,
    };

    setSubjects((currentSubjects) =>
      currentSubjects.map((subject) =>
        subject.id === subjectId ? { ...subject, ...updatedSubject } : subject,
      ),
    );

    return updatedSubject;
  }, []);

  const deleteSubject = useCallback(async (subjectId: string) => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Chybí přihlašovací token.");
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/subjects/${subjectId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        await readErrorMessage(response, "Nepodařilo se smazat předmět."),
      );
    }

    setSubjects((currentSubjects) =>
      currentSubjects.filter((subject) => subject.id !== subjectId),
    );
    setNotes((currentNotes) =>
      currentNotes.filter((note) => note.subjectId !== subjectId),
    );
  }, []);

  const createNote = useCallback(async (input: {
    name: string;
    subjectId: string;
    content: string;
  }) => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Chybí přihlašovací token.");
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: input.name.trim(),
        subjectId: input.subjectId,
        content: input.content,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | NotesApiResponse
      | NoteApiItem
      | null;

    if (!response.ok) {
      throw new Error(getPayloadMessage(payload) ?? "Nepodařilo se vytvořit poznámku.");
    }

    const createdNote =
      extractItems<NoteApiItem>(payload)
        .map((item) => normalizeNote(item, input.subjectId))
        .find((item): item is Note => item !== null);

    if (!createdNote) {
      throw new Error("Server nevrátil vytvořenou poznámku.");
    }

    setNotes((currentNotes) => upsertNote(currentNotes, createdNote));
    return createdNote;
  }, []);

  const updateNote = useCallback(async (noteId: string, input: {
    name: string;
    content: string;
    subjectId?: string;
  }) => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Chybí přihlašovací token.");
    }

    const existingNote = notes.find((item) => item.id === noteId);

    if (!existingNote) {
      throw new Error("Poznámka neexistuje.");
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/notes/${noteId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: input.name.trim(),
          content: input.content,
          ...(input.subjectId ? { subjectId: input.subjectId } : {}),
        }),
      },
    );

    const payload = (await response.json().catch(() => null)) as
      | NotesApiResponse
      | NoteApiItem
      | null;

    if (!response.ok) {
      throw new Error(getPayloadMessage(payload) ?? "Nepodařilo se uložit poznámku.");
    }

    const updatedNote =
      extractItems<NoteApiItem>(payload)
        .map((item) => normalizeNote(item, input.subjectId ?? existingNote.subjectId))
        .find((item): item is Note => item !== null) ?? {
        ...existingNote,
        name: input.name.trim(),
        subjectId: input.subjectId ?? existingNote.subjectId,
        content: input.content,
        updatedAt: new Date().toISOString(),
      };

    setNotes((currentNotes) => upsertNote(currentNotes, updatedNote));
    return updatedNote;
  }, [notes]);

  const deleteNote = useCallback(async (noteId: string) => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Chybí přihlašovací token.");
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/notes/${noteId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        await readErrorMessage(response, "Nepodařilo se smazat poznámku."),
      );
    }

    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== noteId));
    setNoteFilesByNoteId((currentFiles) => {
      const nextFiles = { ...currentFiles };
      delete nextFiles[noteId];
      return nextFiles;
    });
  }, []);

  const getNoteById = useCallback(
    (noteId: string) => notes.find((note) => note.id === noteId),
    [notes],
  );

  const setFilesLoadingState = useCallback((noteId: string, isLoading: boolean) => {
    setFilesLoadingNoteIds((currentIds) => {
      if (isLoading) {
        return currentIds.includes(noteId) ? currentIds : [...currentIds, noteId];
      }

      return currentIds.filter((currentId) => currentId !== noteId);
    });
  }, []);

  const loadFiles = useCallback(async (noteId: string) => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Chybí přihlašovací token.");
    }

    setFilesLoadingState(noteId, true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/files/${noteId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 404) {
        setNoteFilesByNoteId((currentFiles) => ({
          ...currentFiles,
          [noteId]: [],
        }));
        return [];
      }

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Nepodařilo se načíst přílohy."),
        );
      }

      const payload = (await response.json()) as FilesApiResponse | FileApiItem[];
      const files = extractItems<FileApiItem>(payload)
        .map((item) => normalizeFile(item, noteId))
        .filter((item): item is NoteFile => item !== null);

      setNoteFilesByNoteId((currentFiles) => ({
        ...currentFiles,
        [noteId]: files,
      }));
      return files;
    } finally {
      setFilesLoadingState(noteId, false);
    }
  }, [setFilesLoadingState]);

  const uploadFile = useCallback(async (noteId: string, file: File) => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Chybí přihlašovací token.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/files/${noteId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(
        await readErrorMessage(response, "Nepodařilo se nahrát přílohu."),
      );
    }

    return loadFiles(noteId);
  }, [loadFiles]);

  const deleteFile = useCallback(async (fileId: string, noteId: string) => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Chybí přihlašovací token.");
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/files/${fileId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        await readErrorMessage(response, "Nepodařilo se smazat přílohu."),
      );
    }

    setNoteFilesByNoteId((currentFiles) => ({
      ...currentFiles,
      [noteId]: (currentFiles[noteId] ?? []).filter((file) => file.id !== fileId),
    }));
  }, []);

  const downloadFile = useCallback(async (fileId: string, filename?: string) => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Chybí přihlašovací token.");
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/files/${fileId}/download`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        await readErrorMessage(response, "Nepodařilo se stáhnout přílohu."),
      );
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename ?? "priloha";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }, []);

  const value = useMemo(
    () => ({
      subjects,
      notes,
      notesLoading,
      notesError,
      noteFilesByNoteId,
      filesLoadingNoteIds,
      addSubject,
      updateSubject,
      deleteSubject,
      createNote,
      updateNote,
      deleteNote,
      getNoteById,
      loadFiles,
      uploadFile,
      deleteFile,
      downloadFile,
    }),
    [
      subjects,
      notes,
      notesLoading,
      notesError,
      noteFilesByNoteId,
      filesLoadingNoteIds,
      addSubject,
      updateSubject,
      deleteSubject,
      createNote,
      updateNote,
      deleteNote,
      getNoteById,
      loadFiles,
      uploadFile,
      deleteFile,
      downloadFile,
    ],
  );

  return <DashboardNotesContext.Provider value={value}>{children}</DashboardNotesContext.Provider>;
}

export function useDashboardNotes() {
  const context = useContext(DashboardNotesContext);
  if (!context) {
    throw new Error("useDashboardNotes must be used within DashboardNotesProvider");
  }
  return context;
}
