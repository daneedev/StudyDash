import { createContext, useContext, useMemo, type ReactNode } from "react";

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
};

// Bude se brát z API
const subjects: Subject[] = [
  { id: "1234-5678-90ab-cdef", name: "Český jazyk", icon: "jazyky.svg", status: "Soukromé" },
  { id: "4f53-45df-78ae-142c", name: "Matematika", icon: "matematika.svg", status: "Sdílené" },
  { id: "12cd-84ae-7b24-8712", name: "Fyzika", icon: "fyzika.svg", status: "Soukromé" },
  { id: "1752-a4e3-8c21-4273", name: "Chemie", icon: "chemie.svg", status: "Sdílené" },
  { id: "9b87-65de-4f12-9832", name: "Biologie", icon: "biologie.svg", status: "Soukromé" },
  { id: "d4e5-23bc-9a87-6543", name: "Dějepis", icon: "dejepis.svg", status: "Sdílené" },
  { id: "a1b2-c3d4-e5f6-7890", name: "Zeměpis", icon: "zemepis.svg", status: "Soukromé" },
  { id: "0a9b-8c7d-6e5f-4321", name: "Angličtina", icon: "jazyky.svg", status: "Sdílené" },
];

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
  const value = useMemo(() => ({ subjects, notes }), []);
  return <DashboardNotesContext.Provider value={value}>{children}</DashboardNotesContext.Provider>;
}

export function useDashboardNotes() {
  const context = useContext(DashboardNotesContext);
  if (!context) {
    throw new Error("useDashboardNotes must be used within DashboardNotesProvider");
  }
  return context;
}
