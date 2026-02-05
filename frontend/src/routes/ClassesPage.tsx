import {
  createRoute,
  redirect,
  type AnyRoute,
  Link,
} from "@tanstack/react-router";
import "../assets/css/index.css";
import { rootRoute, checkAuthToken } from "./rootRoute";
import { useEffect, useState } from "react";
import { ClassCard } from "../components/ClassCard";

const route = createRoute({
  getParentRoute: () => rootRoute,
  path: "classes",
  component: ClassesPage,
  beforeLoad: async ({ location }) => {
    const authResult = await checkAuthToken();
    if (!authResult.isValid) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
    return { userData: authResult.userData };
  },
});

type ClassItem = {
  id: number;
  name: string;
  inviteCode: string;
  isAdmin: boolean;
};

export function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem("auth_token");

  const loadClasses = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.error("No auth token found");
      return;
    }

    try {
      const res = await fetch("https://api.studydash.app/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Failed to fetch classes:", res.status, res.statusText);
        return;
      }

      const json = await res.json();
      console.log("API Response JSON:", JSON.stringify(json, null, 2));

      const list = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.data?.classes)
            ? json.data.classes
            : [];

      console.log("Parsed class list JSON:", JSON.stringify(list, null, 2));

      const mappedClasses = list.map((item: any) => {
        const mapped = {
          id: item.class?.id || item.id,
          name: item.class?.name || item.name,
          inviteCode: item.class?.inviteCode || item.inviteCode,
          isAdmin: item.role === "admin",
        };
        console.log("Mapping item:", item, "to:", mapped);
        return mapped;
      });

      console.log("Final mapped classes:", mappedClasses);
      setClasses(mappedClasses);
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const createClass = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token || !name.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("https://api.studydash.app/classes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        alert("Nepodařilo se vytvořit třídu");
        return;
      }

      setName("");
      setShowCreateModal(false);
      await loadClasses();
    } catch (error) {
      alert("Chyba při vytváření třídy");
    } finally {
      setLoading(false);
    }
  };

  const deleteClass = async (id: number) => {
    console.log("Attempting to delete class with ID:", id);
    if (!confirm("Opravdu chcete smazat tuto třídu?")) return;

    const token = getToken();
    if (!token) {
      console.error("No auth token for deletion");
      return;
    }

    try {
      const res = await fetch(`https://api.studydash.app/classes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Delete response:", res.status, res.statusText);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Delete failed:", errorData);
        alert("Nepodařilo se smazat třídu");
        return;
      }

      console.log("Class deleted successfully, reloading...");

      await loadClasses();
    } catch (error) {
      console.error("Error deleting class:", error);
      alert("Chyba při mazání třídy");
    }
  };

  const joinClass = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token || !inviteCode.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(
        `https://api.studydash.app/classes/join/${inviteCode.trim()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        if (res.status === 404) {
          alert("Neplatný pozvánkový kód :/");
        } else {
          alert("Nepodařilo se připojit do třídy :/");
        }
        return;
      }

      setInviteCode("");
      setShowJoinModal(false);
      await loadClasses();
    } catch (error) {
      alert("Chyba při připojování do třídy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <article className="w-auto bg-[#1c1c1c] min-h-screen">
        <header className="flex items-center justify-between p-6">
          <h1 className="text-3xl font-semibold text-[#18b4a6]">Třídy</h1>

          <Link to="/dashboard" className="text-white">
            provizorní odkaz na dashboard zde
          </Link>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 bg-[#18b4a6] text-white rounded-md shadow-lg hover:scale-95"
            >
              Připojit se do třídy
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-[var(--color-primary)] text-white shadow-lg hover:scale-95"
            >
              <span className="text-2xl font-bold">+</span>
            </button>
          </div>
        </header>

        <main
          className="grid gap-4 p-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
          }}
        >
          {classes.map((c) => (
            <div key={c.id} className="w-full aspect-square">
              <ClassCard
                title={c.name}
                onDelete={c.isAdmin ? () => deleteClass(c.id) : undefined}
                classId={c.id}
                isAdmin={c.isAdmin}
              />
            </div>
          ))}
        </main>
      </article>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Nová třída
            </h2>
            <input
              className="w-full border px-3 py-2 rounded mb-3 text-black"
              placeholder="Název třídy"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Zrušit
              </button>
              <button
                onClick={createClass}
                disabled={loading || !name}
                className="px-4 py-2 bg-[#18b4a6] text-white rounded disabled:opacity-50"
              >
                {loading ? "Vytvářím…" : "Vytvořit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Připojit se do třídy
            </h2>
            <input
              className="w-full border px-3 py-2 rounded mb-3 text-black"
              placeholder="Invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Zrušit
              </button>
              <button
                onClick={joinClass}
                disabled={loading || !inviteCode.trim()}
                className="px-4 py-2 bg-[#18b4a6] text-white rounded disabled:opacity-50"
              >
                {loading ? "Připojuji…" : "Připojit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type ClassesPageComponent = typeof ClassesPage & { route?: AnyRoute };
(ClassesPage as ClassesPageComponent).route = route;

export default ClassesPage;
