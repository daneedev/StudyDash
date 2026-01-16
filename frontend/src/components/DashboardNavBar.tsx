import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type DashboardNavBarProps = {
    username: string;
}


export const DashboardNavBar = ({username} : DashboardNavBarProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navWidthClasses = isExpanded ? "w-48" : "w-14 md:w-18";
    const visibilityClass = isExpanded ? "block" : "hidden";
    const isExpandedClass = isExpanded ? "w-[160px] justify-start gap-3" : "w-[38px]";
    const marginLeftClass = isExpanded ? "ml-3" : "ml-0";
    const toggleIcon = isExpanded ? "/web_images/Arrow_Left.svg" : "/web_images/Arrow_Right.svg";
    const handleNavClick = () => setIsExpanded(false);
    const user = username;
    const role = "Správce";
    const zkratka = user.slice(0, 2).toUpperCase();   
    const navItemBaseClass = `rounded-[14px] bg-[var(--card-bg)] ${isExpandedClass} h-[38px] flex justify-center items-center text-center shadow-[0_0_1.5px_0_#18B4A6]`;
    const navItems = [
        { to: "/dashboard", icon: "/web_images/Home.svg", alt: "home", label: "Dashboard" },
        { to: "/dashboard/notes", icon: "/web_images/Notebook2.svg", alt: "notes", label: "Poznámky" },
        { to: "/dashboard/todo", icon: "/web_images/Checklist.svg", alt: "to-do", label: "To-do list" },
        { to: "/dashboard/calendar", icon: "/web_images/Calendar.svg", alt: "calendar", label: "Kalendář" },
        { to: "/dashboard/settings", icon: "/web_images/Settings.svg", alt: "settings", label: "Nastavení" },
    ];

    useEffect(() => {
        const handleOutsideClick = () => {
            setIsProfileOpen(false);
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    return (
    <nav className="fixed h-dvh flex justify-center items-center select-none">
        <div className={`relative flex justify-between items-center text-center flex-col h-dvh ${navWidthClasses} bg-[rgba(21,22,24,0.84)] border-r-1 border-[#353535] pt-5 pb-7 transition-all duration-200`}>
            <div className="flex justify-center items-center text-center flex-col">
                <div className="flex items-center text-center">
                    <img src="/web_images/logo-new.png" className="w-[42px] h-[42px]" alt="logo" />
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
                className="flex items-center text-center cursor-pointer"
                onClick={(event) => {
                    event.preventDefault();
                    setIsProfileOpen(prev => !prev);
                }}
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="w-[40px] h-[40px] rounded-[14px] flex justify-center text-center items-center"
                style={{ backgroundImage: 'url("/web_images/pastel.png")', backgroundSize: "cover" }}>
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
)};
