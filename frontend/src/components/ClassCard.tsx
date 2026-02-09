import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
library.add(faEllipsisVertical);
type Props = {
  title: string;
  onDelete?: () => void;
  classId?: number;
  isAdmin?: boolean;
};

export function ClassCard({ title, onDelete, classId, isAdmin }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
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
        alert(`Pozvánkový kód zkopírován: ${inviteCode}`);
        setMenuOpen(false);
        return;
      }

      // Fallback copy mechanism for environments without Clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = inviteCode;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (successful) {
        alert(`Pozvánkový kód zkopírován: ${inviteCode}`);
        setMenuOpen(false);
      } else {
        alert(
          `Nepodařilo se zkopírovat pozvánkový kód. Zkopírujte jej prosím ručně: ${inviteCode}`,
        );
      }
    } catch (error) {
      console.error("Failed to copy invite code:", error);
      alert(
        `Nepodařilo se zkopírovat pozvánkový kód. Zkopírujte jej prosím ručně: ${inviteCode}`,
      );
    }
  };

  const handleMenuOpen = () => {
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
        <div className="absolute top-12 right-2 z-40 w-48 bg-white text-black rounded shadow-md py-1">
          {isAdmin && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                copyInviteCode();
              }}
              disabled={loadingInvite || !inviteCode}
              className="w-full text-left px-3 py-2 text-sm text-[#18b4a6] hover:bg-gray-100 disabled:opacity-50"
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
                onDelete();
                setMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Smazat
            </button>
          )}
        </div>
      )}

      <div
        className="w-[50%] aspect-square rounded-2xl flex justify-center items-center"
        style={{
          backgroundImage: 'url("/web_images/pastel.png")',
          backgroundSize: "cover",
        }}
      >
        <h3 className="text-[#1B1919] font-inria font-extrabold text-[5vw] md:text-[3vw] lg:text-[2.3vw]">
          {classInitials}
        </h3>
      </div>

      <div className="text-white text-2xl font-semibold truncate text-center">
        {title}
      </div>
    </div>
  );
}
