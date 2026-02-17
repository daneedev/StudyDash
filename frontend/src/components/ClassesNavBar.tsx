import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";

type DashboardNavBarProps = {
  username: string;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
};

export const ClassesNavBar = ({
  username,
  isExpanded: externalIsExpanded,
  onToggle,
}: DashboardNavBarProps) => {
  const [internalIsExpanded, setInternalIsExpanded] = useState(true);
  const isExpanded =
    externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;

  const handleToggle = () => {
    const newState = !isExpanded;
    if (onToggle) {
      onToggle(newState);
    } else {
      setInternalIsExpanded(newState);
    }
  };
  const navWidthClasses = isExpanded ? "w-48" : "w-14 md:w-18";
  const visibilityClass = isExpanded ? "block" : "hidden";
  const isExpandedClass = isExpanded
    ? "w-[160px] justify-start gap-3 pl-3"
    : "w-[38px]";
  const marginLeftClass = isExpanded ? "ml-3" : "ml-0";
  const toggleIcon = isExpanded
    ? "/web_images/Arrow_Left.svg"
    : "/web_images/Arrow_Right.svg";
  const user = username;
  const role = "Správce";
  const zkratka = user.slice(0, 2).toUpperCase();

  return (
    <nav className="fixed h-dvh flex justify-center items-center">
      <div
        className={`flex justify-between items-center text-center flex-col h-dvh ${navWidthClasses} bg-[rgba(21,22,24,0.84)] border-r-1 border-[#353535] pt-5 pb-7 transition-all duration-200`}
      >
        <div className="flex justify-center items-center text-center flex-col">
          <div className="flex items-center text-center">
            <img
              src="/web_images/logo-new.png"
              className="w-[42px] h-[42px]"
              alt="logo"
            />
            <h2
              className={`ml-2 text-lg text-[var(--color-text)] ${visibilityClass} font-semibold font-montserrat`}
            >
              StudyDash
            </h2>
          </div>
          <img
            src="/web_images/dot.svg"
            className="w-[5px] h-[5px] my-5"
            alt="dot"
          />

          <div className="flex flex-col gap-4.5">
            <Link className="cursor-pointer" to="/dashboard/settings">
              <div
                className={`rounded-[14px] bg-[var(--card-bg)] ${isExpandedClass} h-[38px] flex justify-center items-center text-center shadow-[0_0_1.5px_0_#18B4A6]`}
              >
                <FontAwesomeIcon
                  icon={faLink}
                  className="text-[#18b4a6] my-5"
                />

                <p
                  className={`text-[var(--color-light-text)] font-montserrat font-md ${visibilityClass}`}
                >
                  Připojit se
                </p>
              </div>
            </Link>
            <Link className="cursor-pointer" to="/dashboard/settings">
              <div
                className={`rounded-[14px] bg-[var(--card-bg)] ${isExpandedClass} h-[38px] flex justify-center items-center text-center shadow-[0_0_1.5px_0_#18B4A6]`}
              >
                <span className="text-2xl font-bold text-[#18B4A6]">+</span>

                <p
                  className={`text-[var(--color-light-text)] font-montserrat font-md ${visibilityClass}`}
                >
                  Vytvořit třídu
                </p>
              </div>
            </Link>
          </div>

          <img
            src="/web_images/dot.svg"
            className="w-[5px] h-[5px] my-5"
            alt="dot"
          />
        </div>

        <Link
          className="flex items-center text-center cursor-pointer"
          to="/dashboard/profile"
        >
          <div
            className="w-[40px] h-[40px] rounded-[14px] flex justify-center text-center items-center"
            style={{
              backgroundImage: 'url("/web_images/pastel.png")',
              backgroundSize: "cover",
            }}
          >
            <h3 className="text-[#1B1919] font-inria font-bold text-xl ">
              {zkratka}
            </h3>
          </div>
          <div className={`ml-2 text-left w-[120px] ${visibilityClass}`}>
            <p className="text-[var(--color-text)] whitespace-nowrap overflow-hidden text-ellipsis w-[120px] h-[24px]">
              {user}
            </p>
            <p className="text-[var(--color-light-text)] text-sm whitespace-nowrap overflow-auto text-ellipsis">
              {role}
            </p>
          </div>
        </Link>
      </div>

      <div onClick={handleToggle}>
        <img
          src={`${toggleIcon}`}
          alt={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          className="cursor-pointer"
        />
      </div>
    </nav>
  );
};
