import { Link } from "@tanstack/react-router";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { setSelectedDashboardId } from "../utils/selectedDashboard";
type Props = {
  title: string;
  onDelete?: () => void;
  classId?: string;
  isAdmin?: boolean;
  showAlert?: (title: string, message: string) => void;
};

export function ClassCard({
  title,
  onDelete,
  classId,
  isAdmin,
  showAlert,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const fetchInviteCode = async () => {
    if (!classId || !isAdmin || inviteCode) return;

    setLoadingInvite(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/classes/${classId}/invite`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        const json = await res.json();
        const code = json.data?.inviteCode || json.inviteCode || json.data;
        if (code && typeof code === "string") {
          setInviteCode(code);
        }
      } else {
        console.error("Failed to fetch invite code:", res.status);
      }
    } catch (error) {
      console.error("Error fetching invite code:", error);
    } finally {
      setLoadingInvite(false);
    }
  };

  const copyInviteCode = async () => {
    if (!inviteCode) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(inviteCode);
        showAlert?.("Úspěch", `Pozvánkový kód zkopírován: ${inviteCode}`);
        setMenuOpen(false);
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = inviteCode;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand("copy"); //fallback
      document.body.removeChild(textarea);

      if (successful) {
        showAlert?.("Úspěch", `Pozvánkový kód zkopírován: ${inviteCode}`);
        setMenuOpen(false);
      } else {
        showAlert?.(
          "Chyba",
          `Nepodařilo se zkopírovat pozvánkový kód. Zkopírujte jej prosím ručně: ${inviteCode}`,
        );
      }
    } catch (error) {
      console.error("Failed to copy invite code:", error);
      showAlert?.(
        "Chyba",
        `Nepodařilo se zkopírovat pozvánkový kód. Zkopírujte jej prosím ručně: ${inviteCode}`,
      );
    }
  };

  const handleMenuOpen = () => {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    setMenuOpen(true);
    if (isAdmin && !inviteCode) {
      fetchInviteCode();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const classInitials = title
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <Link
        to={`/dashboard/${classId}`}
        onClick={() => {
          if (classId) {
            setSelectedDashboardId(classId);
          }
        }}
      >
        <div
          ref={containerRef}
          className="relative w-full h-full p-4 bg-[#272727] rounded-lg shadow-lg hover:shadow-xl hover:scale-99 transition duration-150 flex flex-col justify-center items-center gap-8 hover:cursor-pointer"
        >
          {(onDelete || isAdmin) && (
            <button
              type="button"
              aria-label="Otevřít nabídku"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMenuOpen();
              }}
              className="absolute top-2 right-2 z-30 inline-flex items-center justify-center p-1 rounded-full hover:bg-white/10"
            >
              <FontAwesomeIcon
                icon={faEllipsisVertical}
                className="text-white text-2xl"
              />
            </button>
          )}

          {menuOpen && (
            <div className="absolute top-12 right-2 z-40 w-48 bg-[#2d2b2b] border border-[#3a3a3a] text-white rounded-lg shadow-lg py-1">
              {isAdmin && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    copyInviteCode();
                  }}
                  disabled={loadingInvite || !inviteCode}
                  className="w-full text-left px-3 py-2 text-sm text-[#18b4a6] hover:bg-white/10 disabled:opacity-50"
                >
                  {loadingInvite
                    ? "Načítám..."
                    : inviteCode
                      ? "Kopírovat pozvánku"
                      : "Načítám..."}
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpen(false);
                    setConfirmDelete(true);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/10"
                >
                  Smazat
                </button>
              )}
            </div>
          )}

          <div className="w-[50%] aspect-square rounded-md flex justify-center items-center bg-[#18b4a6]">
            <h3 className="text-text font-inria font-extrabold text-[5vw] md:text-[3vw] lg:text-[2.3vw]">
              {classInitials}
            </h3>
          </div>

          <div className="text-white text-2xl font-semibold truncate text-center">
            {title}
          </div>
        </div>
      </Link>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 cursor-default"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setConfirmDelete(false);
          }}
        >
          <div
            className="bg-[#272727] border border-[#3a3a3a] rounded-xl p-4 sm:p-6 w-[calc(100vw-2rem)] max-w-80 text-center shadow-xl"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <h2 className="text-white text-lg font-semibold mb-2">
              Smazat třídu
            </h2>
            <p className="text-zinc-400 text-sm mb-6">
              Opravdu chcete smazat třídu{" "}
              <span className="text-white font-medium">{title}</span>? Tuto akci
              nelze vrátit zpět.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setConfirmDelete(false);
                }}
                className="px-4 py-2 rounded-lg bg-[#3a3a3a] text-white text-sm hover:bg-[#4a4a4a] transition-colors hover:cursor-pointer"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setConfirmDelete(false);
                  onDelete?.();
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-colors hover:cursor-pointer"
              >
                Smazat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
