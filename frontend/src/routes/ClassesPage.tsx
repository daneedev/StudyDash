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
import { ClassesNavBar } from "../components/ClassesNavBar";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";

import { Alert, Input, Spinner } from "@heroui/react";

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
  const { userData } = route.useRouteContext();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [alerts, setAlerts] = useState<
    Array<{ id: number; title: string; message: string }>
  >([]);
  const [nextAlertId, setNextAlertId] = useState(0);

  const showAlert = (title: string, message: string) => {
    const id = nextAlertId;
    setNextAlertId(id + 1);
    setAlerts((prev) => [...prev, { id, title, message }]);
  };

  const removeAlert = (id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const getToken = () => localStorage.getItem("auth_token");

  const loadClasses = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setIsLoadingClasses(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        return;
      }

      const json = await res.json();

      const list = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.data?.classes)
            ? json.data.classes
            : [];

      const mappedClasses = list.map((item: any) => {
        const mapped = {
          id: item.class?.id || item.id,
          name: item.class?.name || item.name,
          inviteCode: item.class?.inviteCode || item.inviteCode,
          isAdmin: item.role === "admin",
        };
        return mapped;
      });

      setClasses(mappedClasses);
    } catch (error) {
    } finally {
      setIsLoadingClasses(false);
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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/classes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        showAlert("Chyba", "Nepodařilo se vytvořit třídu");
        return;
      }

      showAlert("Úspěch", "Třída byla úspěšně vytvořena");

      setName("");
      setShowCreateModal(false);
      await loadClasses();
    } catch (error) {
      showAlert("Chyba", "Chyba při vytváření třídy");
    } finally {
      setLoading(false);
    }
  };

  const deleteClass = async (id: number) => {
    const token = getToken();
    if (!token) {
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/classes/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        showAlert("Chyba", "Nepodařilo se smazat třídu");
        return;
      }

      showAlert("Úspěch", "Třída byla úspěšně smazána");

      await loadClasses();
    } catch (error) {
      showAlert("Chyba", "Chyba při mazání třídy");
    }
  };

  const joinClass = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token || !inviteCode.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/classes/join/${inviteCode.trim()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        if (res.status === 404) {
          showAlert("Chyba", "Neplatný pozvánkový kód");
        } else {
          showAlert("Chyba", "Nepodařilo se připojit do třídy");
        }
        return;
      }

      showAlert("Úspěch", "Úspěšně jste se připojili do třídy");

      setInviteCode("");
      setShowJoinModal(false);
      await loadClasses();
    } catch (error) {
      showAlert("Chyba", "Chyba při připojování do třídy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ClassesNavBar
        username={userData ? userData.username : ""}
        isExpanded={isNavExpanded}
        onToggle={setIsNavExpanded}
        onJoinClass={() => setShowJoinModal(true)}
        onCreateClass={() => setShowCreateModal(true)}
      />

      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md transition-all duration-300">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            description={alert.message}
            isVisible={true}
            title={alert.title}
            variant="faded"
            onClose={() => removeAlert(alert.id)}
            style={{
              backgroundColor: "white",
              borderColor: "#18b4a6",
              color: "#18b4a6",
            }}
          />
        ))}
      </div>

      <article
        className={`bg-[#141414] min-h-screen transition-all duration-200 ${isNavExpanded ? "ml-48" : "ml-14 md:ml-18"}`}
      >
        <header className="flex items-center justify-between p-6 pt-4">
          <h1 className="text-4xl font-semibold text-text">Třídy</h1>

          <Link to="/dashboard" className="text-white">
            provizorní odkaz na dashboard zde
          </Link>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 bg-[#18b4a6] text-white rounded-md shadow-lg hover:scale-95"
            >
              <FontAwesomeIcon icon={faLink} />
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
          className="grid gap-4 p-6 pl-7"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
          }}
        >
          {isLoadingClasses ? (
            <div
              className="col-span-full flex justify-center items-center"
              style={{ minHeight: "calc(100vh - 150px)" }}
            >
              <Spinner
                size="lg"
                classNames={{
                  circle1: "border-b-[#18b4a6]",
                  circle2: "border-b-[#18b4a6]",
                }}
              />
            </div>
          ) : (
            classes.map((c: ClassItem) => (
              <div key={c.id} className="w-full aspect-square">
                <ClassCard
                  title={c.name}
                  onDelete={c.isAdmin ? () => deleteClass(c.id) : undefined}
                  classId={c.id}
                  isAdmin={c.isAdmin}
                  showAlert={showAlert}
                />
              </div>
            ))
          )}
        </main>
      </article>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#272727] rounded-xl p-6 w-96">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Nová třída
            </h2>
            <Input
              isClearable
              type="text"
              placeholder="Zadejte název třídy"
              value={name}
              onValueChange={setName}
              classNames={{
                inputWrapper:
                  "relative !bg-[#1C1C1C] border border-zinc-700 rounded-lg transition-colors focus-within:border-[#18b4a6] focus-within:ring-2 focus-within:ring-[#18b4a6]",
                input:
                  "bg-transparent !text-[#f6f7fb] placeholder-zinc-400 focus:outline-none py-2 px-2 rounded-lg",
                clearButton: "text-zinc-400 hover:text-zinc-200",
              }}
            />
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-150"
              >
                Zrušit
              </button>
              <button
                onClick={createClass}
                disabled={loading || !name}
                className="px-4 py-2 bg-[#18b4a6] text-white rounded  hover:bg-[#159a8d] transition-colors duration-150"
              >
                {loading ? "Vytvářím…" : "Vytvořit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#272727] rounded-xl p-6 w-96">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Připojit se do třídy
            </h2>
            <Input
              isClearable
              type="text"
              placeholder="Zadejte kód"
              value={inviteCode}
              onValueChange={setInviteCode}
              classNames={{
                inputWrapper:
                  "relative !bg-[#1C1C1C] border border-zinc-700 rounded-lg transition-colors focus-within:border-[#18b4a6] focus-within:ring-2 focus-within:ring-[#18b4a6]",
                input:
                  "bg-transparent !text-[#f6f7fb] placeholder-zinc-400 focus:outline-none py-2 px-2 rounded-lg",

                clearButton: "text-zinc-400 hover:text-zinc-200",
              }}
            />
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-150"
              >
                Zrušit
              </button>
              <button
                onClick={joinClass}
                disabled={loading || !inviteCode.trim()}
                className="px-4 py-2 bg-[#18b4a6] text-white rounded hover:bg-[#159a8d] transition-colors duration-150"
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
