import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDashboardNotes } from "../context/DashboardNotesContext";
import type { KeyboardEvent } from "react";

type DashboardNavBarProps = {
    username: string;
}


export const DashboardNavBar = ({username} : DashboardNavBarProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotesActionsMounted, setIsNotesActionsMounted] = useState(false);
    const [isNotesActionsVisible, setIsNotesActionsVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeResultIndex, setActiveResultIndex] = useState(-1);
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate({ from: "/dashboard" });
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const isNotesRoute = pathname.startsWith("/dashboard/notes");
    const navWidthClasses = isExpanded ? "w-48" : "w-14 md:w-18";
    const visibilityClass = isExpanded ? "block" : "hidden";
    const isExpandedClass = isExpanded ? "w-[160px] justify-start gap-3" : "w-[38px]";
    const marginLeftClass = isExpanded ? "ml-3" : "ml-0";
    const toggleIcon = isExpanded ? "/web_images/Arrow_Left.svg" : "/web_images/Arrow_Right.svg";
    const handleNavClick = () => setIsExpanded(false);
    const user = username;
    const role = "Správce";
    const zkratka = user.slice(0, 2).toUpperCase();   
    const navItemBaseClass = `rounded-[14px] bg-[var(--card-bg)] ${isExpandedClass} h-[38px] flex justify-center items-center text-center shadow-[0_0_1.5px_0_#18B4A6] cursor-pointer`;
    const navItems = [
        { to: "/dashboard", icon: "/web_images/Home.svg", alt: "home", label: "Dashboard" },
        { to: "/dashboard/notes", icon: "/web_images/Notebook2.svg", alt: "notes", label: "Poznámky" },
        { to: "/dashboard/todo", icon: "/web_images/Checklist.svg", alt: "to-do", label: "To-do list" },
        { to: "/dashboard/calendar", icon: "/web_images/Calendar.svg", alt: "calendar", label: "Kalendář" },
        { to: "/dashboard/settings", icon: "/web_images/Settings.svg", alt: "settings", label: "Nastavení" },
    ];

    const { subjects, notes } = useDashboardNotes();

    const searchIndex = useMemo(() => ({
        subjects: subjects.map((subject) => ({ id: subject.id, name: subject.name, icon: subject.icon })),
        notes: notes.map((note) => {
            const subject = subjects.find((item) => item.id === note.subjectId);
            return {
                id: note.id,
                name: note.name,
                subjectIcon: subject?.icon ?? "jazyky.svg",
            };
        }),
    }), [subjects, notes]);

    const normalizeSearchText = (value: string) =>
        value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

    const { subjectResults, noteResults } = useMemo(() => {
        const q = normalizeSearchText(searchQuery.trim());
        const subjects = q
            ? searchIndex.subjects.filter((s) => normalizeSearchText(s.name).includes(q)).slice(0, 3)
            : searchIndex.subjects.slice(0, 3);
        const notes = q
            ? searchIndex.notes.filter((n) => normalizeSearchText(n.name).includes(q)).slice(0, 5)
            : searchIndex.notes.slice(0, 5);
        return { subjectResults: subjects, noteResults: notes };
    }, [searchIndex, searchQuery]);

    const combinedResults = useMemo(
        () => [
            ...subjectResults.map((subject) => ({ type: "subject" as const, id: subject.id })),
            ...noteResults.map((note) => ({ type: "note" as const, id: note.id })),
        ],
        [subjectResults, noteResults],
    );

    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery("");
        setActiveResultIndex(-1);
    };

    const selectResult = (result: { type: "subject" | "note"; id: string }) => {
        if (result.type === "subject") {
            navigate({ to: "/dashboard/notes/subj/$subjectId", params: { subjectId: result.id } });
        } else {
            navigate({ to: "/dashboard/notes/$noteId", params: { noteId: result.id } });
        }

        closeSearch();
        handleNavClick();
    };

    const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") {
            event.preventDefault();
            closeSearch();
            return;
        }

        if (combinedResults.length === 0) {
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveResultIndex((prev) => (prev + 1) % combinedResults.length);
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveResultIndex((prev) => (prev <= 0 ? combinedResults.length - 1 : prev - 1));
            return;
        }

        if (event.key === "Enter" && activeResultIndex >= 0) {
            event.preventDefault();
            selectResult(combinedResults[activeResultIndex]);
        }
    };

    useEffect(() => {
        const handleOutsideClick = () => {
            setIsProfileOpen(false);
            setIsSearchOpen(false);
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    useEffect(() => {
        if (!isNotesRoute) {
            setIsSearchOpen(false);
            setSearchQuery("");
            setActiveResultIndex(-1);
        }
    }, [isNotesRoute]);

    useEffect(() => {
        let showTimeoutId: ReturnType<typeof setTimeout> | undefined;
        let hideTimeoutId: ReturnType<typeof setTimeout> | undefined;

        if (isNotesRoute) {
            setIsNotesActionsMounted(true);
            showTimeoutId = setTimeout(() => setIsNotesActionsVisible(true), 20);
        } else {
            setIsNotesActionsVisible(false);
            hideTimeoutId = setTimeout(() => setIsNotesActionsMounted(false), 220);
        }

        return () => {
            if (showTimeoutId) {
                clearTimeout(showTimeoutId);
            }
            if (hideTimeoutId) {
                clearTimeout(hideTimeoutId);
            }
        };
    }, [isNotesRoute]);

    useEffect(() => {
        if (!isSearchOpen) {
            setActiveResultIndex(-1);
            return;
        }

        searchInputRef.current?.focus();

        if (combinedResults.length > 0) {
            setActiveResultIndex(0);
        } else {
            setActiveResultIndex(-1);
        }
    }, [isSearchOpen, combinedResults.length, searchQuery]);

    return (
    <nav className="fixed left-0 top-0 h-dvh w-fit flex items-center select-none z-40">
        <div className={`relative flex justify-between items-center text-center flex-col h-dvh ${navWidthClasses} bg-[rgba(21,22,24,0.84)] border-r-1 border-[#353535] pt-5 pb-7 transition-all duration-200`}>
            <div className="flex justify-center items-center text-center flex-col">
                <div className="flex items-center text-center">
                    <img src="/web_images/logo-new.webp" className="w-[42px] h-[42px]" alt="logo" />
                    <h2 className={`ml-2 text-lg text-[var(--color-text)] ${visibilityClass} font-semibold font-montserrat`}>StudyDash</h2>
                </div>
                <img src="/web_images/dot.svg" className="w-[5px] h-[5px] my-5" alt="dot" />

                <div className="flex flex-col gap-4.5">
                    {navItems.map((item) => (
                        <Link key={item.to} className="cursor-pointer" onClick={handleNavClick} to={item.to}>
                            <div className={navItemBaseClass}>
                                <img src={item.icon} className={`${marginLeftClass} w-[24px] h-[24px] my-5`} alt={item.alt} />
                                <p className={`text-[var(--color-light-text)] font-montserrat font-md ${visibilityClass}`}>{item.label}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                <img src="/web_images/dot.svg" className="w-[5px] h-[5px] my-5" alt="dot" />

                {isNotesActionsMounted ? (
                    <div
                        className={`flex flex-col gap-4.5 transition-[opacity,transform] duration-[220ms] ease-out origin-top will-change-transform ${
                            isNotesActionsVisible
                                ? "opacity-100 translate-y-0 scale-100"
                                : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                        }`}
                    >
                        <button
                            type="button"
                            onClick={(event) => {
                                event.preventDefault();
                                setIsSearchOpen(prev => !prev);
                                setIsProfileOpen(false);
                                handleNavClick();
                            }}
                            onMouseDown={(event) => event.stopPropagation()}
                            className={`transition-all duration-200 ${isNotesActionsVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}
                        >
                            <div className={navItemBaseClass}>
                                <img src="/web_images/Magnifer.svg" className={`${marginLeftClass} w-[24px] h-[24px] my-5`} alt="search" />
                                <p className={`text-[var(--color-light-text)] font-montserrat font-md ${visibilityClass} truncate`}>Hledat poznámky</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                navigate({ to: "/dashboard/notes/new" });
                                handleNavClick();
                            }}
                            onMouseDown={(event) => event.stopPropagation()}
                            className={`transition-all duration-200 delay-75 ${isNotesActionsVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}
                        >
                            <div className={navItemBaseClass}>
                                <img src="/web_images/Add_Plus_light.svg" className={`${marginLeftClass} w-[24px] h-[24px] my-5`} alt="add note" />
                                <p className={`text-[var(--color-light-text)] font-montserrat font-md ${visibilityClass} truncate`}>Přidat poznámku</p>
                            </div>
                        </button>
                    </div>
                ) : null}
            </div>

            <div
                className={[
                    "fixed top-[15vh] left-1/2 -translate-x-1/2 z-50",
                    "w-[90%] max-w-[600px]",
                    "flex flex-col",
                    "bg-[var(--color-background)] backdrop-blur-xl",
                    "border border-[var(--border-card)] rounded-2xl shadow-2xl",
                    "transition-all duration-200 ease-out origin-center",
                    isSearchOpen 
                        ? "opacity-100 scale-100 translate-y-0" 
                        : "opacity-0 scale-95 -translate-y-4 pointer-events-none",
                ].join(" ")}
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="flex items-center gap-4 px-5 py-4 border-b border-[var(--border-card)]">
                    <img 
                        src="/web_images/Magnifer.svg" 
                        alt="search" 
                        className="w-5 h-5 opacity-50" 
                    />
                    <input
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Hledat poznámky a předměty..."
                        className="flex-1 bg-transparent outline-none text-lg text-[var(--color-text)] placeholder:text-[var(--text-darkgray)] font-medium font-montserrat"
                        autoFocus
                    />
                    <div className="hidden sm:flex px-2 py-1 rounded border border-[var(--border-card)] bg-[var(--color-background)]">
                        <span className="text-[10px] font-bold text-[var(--text-darkgray)] font-inria tracking-wider">ESC</span>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[var(--border-card)] scrollbar-track-transparent">
                    {subjectResults.length === 0 && noteResults.length === 0 && searchQuery !== "" && (
                        <div className="py-12 text-center">
                            <p className="text-[var(--text-darkgray)] text-sm">Nebyly nalezeny žádné výsledky</p>
                        </div>
                    )}

                    {subjectResults.length > 0 && (
                        <div className="mb-2">
                            <p className="px-3 py-2 text-[var(--text-darkgray)] text-xs font-bold uppercase tracking-wider font-inria">
                                Předměty
                            </p>
                            <div className="flex flex-col gap-1">
                                {subjectResults.map((subject, index) => (
                                    <Link
                                        key={subject.id}
                                        to="/dashboard/notes/subj/$subjectId"
                                        params={{ subjectId: subject.id }}
                                        onClick={() => selectResult({ type: "subject", id: subject.id })}
                                        className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 border ${
                                            activeResultIndex === index
                                                ? "bg-[var(--color-darkgray)] border-[var(--border-card)]"
                                                : "border-transparent hover:bg-[var(--color-darkgray)] hover:border-[var(--border-card)]"
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-[var(--color-lightgray)] flex items-center justify-center border border-[var(--border-card)] transition-colors overflow-hidden">
                                            <img src={`/web_images/subjIcons/${subject.icon}`} alt="subject icon" className="w-5 h-5" />
                                        </div>
                                        <p className="text-[var(--text-semiwhite)] group-hover:text-[var(--text-white)] text-sm font-medium transition-colors">
                                            {subject.name}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {noteResults.length > 0 && (
                        <div>
                            <p className="px-3 py-2 text-[var(--text-darkgray)] text-xs font-bold uppercase tracking-wider font-inria mt-2">
                                Poznámky
                            </p>
                            <div className="flex flex-col gap-1">
                                {noteResults.map((note, index) => (
                                    <Link
                                        key={note.id}
                                        to="/dashboard/notes/$noteId"
                                        params={{ noteId: note.id }}
                                        onClick={() => selectResult({ type: "note", id: note.id })}
                                        className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 border ${
                                            activeResultIndex === subjectResults.length + index
                                                ? "bg-[var(--color-darkgray)] border-[var(--border-card)]"
                                                : "border-transparent hover:bg-[var(--color-darkgray)] hover:border-[var(--border-card)]"
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-[var(--color-lightgray)] flex items-center justify-center border border-[var(--border-card)] transition-colors overflow-hidden">
                                            <span
                                                aria-label="note subject icon"
                                                className="w-5 h-5 bg-[var(--text-darkgray)]"
                                                style={{
                                                    WebkitMaskImage: `url(/web_images/subjIcons/${note.subjectIcon})`,
                                                    WebkitMaskRepeat: "no-repeat",
                                                    WebkitMaskPosition: "center",
                                                    WebkitMaskSize: "contain",
                                                    maskImage: `url(/web_images/subjIcons/${note.subjectIcon})`,
                                                    maskRepeat: "no-repeat",
                                                    maskPosition: "center",
                                                    maskSize: "contain",
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[var(--text-semiwhite)] group-hover:text-[var(--text-white)] text-sm font-medium transition-colors">
                                                {note.name}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="px-4 py-2 border-t border-[var(--border-card)] bg-[var(--color-background)] rounded-b-2xl">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[var(--text-darkgray)]">
                            {subjectResults.length + noteResults.length} výsledků
                        </span>
                        <div className="flex gap-4">
                            <span className="text-[10px] text-[var(--text-darkgray)] flex items-center gap-1">
                                <span className="w-4 h-4 rounded bg-[var(--color-lightgray)] flex items-center justify-center">↵</span> pro výběr
                            </span>
                            <span className="text-[10px] text-[var(--text-darkgray)] flex items-center gap-1">
                                <span className="w-4 h-4 rounded bg-[var(--color-lightgray)] flex items-center justify-center">↑↓</span> pro navigaci
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={`fixed bottom-[78px] left-[15px] w-[172px] border-1 border-[var(--border-card)] flex justify-start items-center text-center flex-col rounded-lg bg-[var(--card-bg)] transition-opacity duration-150 ease-out ${isProfileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onMouseDown={(event) => event.stopPropagation()}
            >
                <Link
                    to="/dashboard/profile"
                    className="flex w-full items-center justify-start gap-3 py-2 pl-3"
                    onClick={() => {
                        handleNavClick();
                        setIsProfileOpen(false);
                    }}
                >
                    <img src="/web_images/User_Rounded.svg" alt="user" className="max-w-[28px]" />
                    <p className={`text-[var(--color-text)] font-montserrat font-md font-medium`}>Správa profilu</p>
                </Link>


                <Link
                    to="/logout"
                    className="flex w-full items-center justify-start gap-3 py-2 pl-2.5"
                    onClick={() => {
                        handleNavClick();
                        setIsProfileOpen(false);
                    }}
                >
                    <img src="/web_images/Arrows_ALogout_2.svg" alt="user" className="max-w-[26px]" />
                    <p className={`text-[var(--color-text)] font-montserrat font-md font-medium`}>Odhlásit se</p>
                </Link>
            </div>

            <div
                className="flex items-center text-center cursor-pointer z-auto"
                onClick={(event) => {
                    event.preventDefault();
                    setIsProfileOpen(prev => !prev);
                }}
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="w-[40px] h-[40px] rounded-[14px] flex justify-center text-center items-center"
                style={{ backgroundImage: 'url("/web_images/pastel.webp")', backgroundSize: "cover" }}>
                    <h3 className="text-[#1B1919] font-inria font-bold text-xl ">{zkratka}</h3>
                </div>
                <div className={`ml-2 text-left w-[120px] ${visibilityClass}`}>
                    <p className="text-[var(--color-text)] whitespace-nowrap overflow-hidden text-ellipsis w-[120px] h-[24px]">{user}</p>
                    <p className="text-[var(--color-light-text)] text-sm whitespace-nowrap overflow-auto text-ellipsis">{role}</p>
                </div>
            </div>
        </div>
        
        <div
            onClick={() => setIsExpanded(prev => !prev)}>
            <img src={`${toggleIcon}`} alt="arrow rigt" className="cursor-pointer" />
        </div>
    </nav>
    )
};
