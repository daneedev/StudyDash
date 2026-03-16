import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getSelectedDashboardId } from "../utils/selectedDashboard";

type Subject = {
  id: string;
  name: string;
  icon: string;
  status: "Soukromé" | "Sdílené";
};

type Note = {
  id: string;
  name: string;
  subjectId: string;
  visibility: "private" | "shared";
};

type DashboardNotesContextValue = {
  subjects: Subject[];
  notes: Note[];
  addSubject: (name: string) => Promise<Subject>;
};

type SubjectApiItem = {
  id?: string;
  name?: string;
};

type SubjectsApiResponse = {
  data?: SubjectApiItem[] | SubjectApiItem;
};

const notes: Note[] = [
  { id: "ac78-5465-51cb-4a89", name: "Integrály a muzikály", subjectId: "4f53-45df-78ae-142c", visibility: "private" },
  { id: "bd12-3345-67de-8f90", name: "Kysličníky", subjectId: "1752-a4e3-8c21-4273", visibility: "private" },
  { id: "ef34-5678-90ab-cdef", name: "Buněčná struktura", subjectId: "9b87-65de-4f12-9832", visibility: "private" },
  { id: "gh56-7890-abcd-ef12", name: "Renesance v Evropě", subjectId: "d4e5-23bc-9a87-6543", visibility: "private" },
  { id: "ij78-90ab-cdef-1234", name: "Mapa světa", subjectId: "a1b2-c3d4-e5f6-7890", visibility: "private" },
  { id: "4787-1234-5678-90ab", name: "Lom světla", subjectId: "12cd-84ae-7b24-8712", visibility: "shared" },
  { id: "9c87-65de-4f12-9832", name: "Druhá světová válka", subjectId: "d4e5-23bc-9a87-6543", visibility: "shared" },
  { id: "d4e5-23bc-9a87-6543", name: "Státy a jejich hlavní města", subjectId: "a1b2-c3d4-e5f6-7890", visibility: "shared" },
];

const DashboardNotesContext = createContext<DashboardNotesContextValue | null>(null);

export function DashboardNotesProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
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

    if (!selectedDashboardId || !token) {
      setSubjects([]);
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
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data)
            ? payload.data
            : payload.data
              ? [payload.data]
              : [];

        setSubjects(
          items
            .map((item) => ({
              id: item.id ?? "",
              name: item.name ?? "Bez názvu",
              icon: "jazyky.svg",
              status: "Soukromé" as const,
            }))
            .filter((item) => item.id),
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

  const addSubject = async (name: string) => {
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
      throw new Error("Nepodařilo se vytvořit předmět.");
    }

    const item: SubjectApiItem | undefined =
      payload && "data" in payload
        ? Array.isArray(payload.data)
          ? payload.data[0]
          : payload.data
        : (payload as SubjectApiItem);

    if (!item?.id) {
      throw new Error("Nepodařilo se načíst vytvořený předmět.");
    }

    const createdSubject: Subject = {
      id: item.id ?? "",
      name: item.name ?? "Bez názvu",
      icon: "jazyky.svg",
      status: "Soukromé",
    };

    setSubjects((currentSubjects) => [...currentSubjects, createdSubject]);
    return createdSubject;
  };

  const value = useMemo(() => ({ subjects, notes, addSubject }), [subjects]);
  return <DashboardNotesContext.Provider value={value}>{children}</DashboardNotesContext.Provider>;
}

export function useDashboardNotes() {
  const context = useContext(DashboardNotesContext);
  if (!context) {
    throw new Error("useDashboardNotes must be used within DashboardNotesProvider");
  }
  return context;
}
