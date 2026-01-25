import { h1 } from "framer-motion/client";
import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";

import { faGreaterThan } from "@fortawesome/free-solid-svg-icons";
import { faLessThan } from "@fortawesome/free-solid-svg-icons";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";

import { faDna } from "@fortawesome/free-solid-svg-icons";

library.add(faGreaterThan, faLessThan, faSquarePlus, faDna);

import { isWoman, vocative } from "czech-vocative";

type DashboardOverviewProps = {
  username: string;
};

export function DashboardOverview({ username }: DashboardOverviewProps) {
  const usernameVocative = username
    ? capitalizeFirstLetter(vocative(username, isWoman(username)))
    : "Uživateli";

  const now = new Date();

  // displayedDate controls which month is shown; initialize to current month
  const [displayedDate, setDisplayedDate] = useState(
    () => new Date(now.getFullYear(), now.getMonth(), 1),
  );

  const displayedYear = displayedDate.getFullYear();
  const displayedMonth = displayedDate.getMonth();

  const firstDay = new Date(displayedYear, displayedMonth, 1);
  const lastDay = new Date(displayedYear, displayedMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  // Shift so week starts on Monday: Monday=0..Sunday=6
  const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

  const monthName = firstDay.toLocaleDateString("cs-CZ", {
    month: "long",
    year: "numeric",
  });
  const dayLabels = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

  // Build 5x7 grid (35 cells) and include previous/next month days.
  type Cell = { day: number; inMonth: boolean };
  const cells: Cell[] = [];

  // previous month last day
  const prevLastDay = new Date(displayedYear, displayedMonth, 0).getDate();
  // fill with previous month's trailing days (grayed)
  const prevStart = prevLastDay - startingDayOfWeek + 1;
  for (let d = prevStart; d <= prevLastDay; d++)
    cells.push({ day: d, inMonth: false });

  // current month days
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, inMonth: true });

  // next month leading days
  let nextDay = 1;
  while (cells.length < 35) {
    cells.push({ day: nextDay++, inMonth: false });
  }

  function prevMonth() {
    setDisplayedDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setDisplayedDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  return (
    <main className="h-full w-full flex flex-col ">
      <h1 className="text-3xl shrink-0 mb-1 font-semibold">
        Ahoj {usernameVocative},
      </h1>
      <p className="mb-3">
        Dnes je{" "}
        {now.toLocaleDateString("cs-CZ", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </p>

      <article className="grid min-h-0 flex-1 w-full grid-cols-2 grid-rows-[1.9fr_1.2fr] grid-cols-[1fr_1.5fr] gap-6">
        <section className="min-h-0 bg-[var(--card-bg)] rounded-xl border border-[#18b4a6] flex flex-col p-4 overflow-hidden">
          <article className="flex items-center justify-between ">
            <h3 className="font-bold text-3xl capitalize">{monthName}</h3>
            <section className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                aria-label="Previous month"
                className="p-1"
              >
                <FontAwesomeIcon
                  icon={faLessThan}
                  size="lg"
                  className="font-extrabold hover:cursor-pointer"
                />
              </button>
              <button
                onClick={nextMonth}
                aria-label="Next month"
                className="p-1"
              >
                <FontAwesomeIcon
                  icon={faGreaterThan}
                  size="lg"
                  className="font-extrabold hover:cursor-pointer"
                />
              </button>
            </section>
          </article>

          <div className="mt-2 grid grid-cols-7 gap-0 text-center text-sm text-[#18b4a6]">
            {dayLabels.map((d) => (
              <div key={d} className="pb-1 font-semibold text-xl">
                {d}
              </div>
            ))}
          </div>

          <div className=" grid grid-cols-7 grid-rows-5 gap-0.5 flex-1 min-h-0 text-center">
            {cells.map((cell, i) => {
              const isToday =
                cell.inMonth &&
                cell.day === now.getDate() &&
                displayedMonth === now.getMonth() &&
                displayedYear === now.getFullYear();
              return (
                <div
                  key={i}
                  className={` flex items-center justify-center rounded ${
                    isToday
                      ? "bg-[#18b4a6] text-white hover:scale-95 transition-colors duration-50 cursor-pointer"
                      : cell.inMonth
                        ? "hover:bg-black/5 transition-colors duration-50 cursor-pointer text-[#e6e6e6] hover:scale-95"
                        : "text-gray-400"
                  }`}
                >
                  <span
                    className={`${cell.inMonth ? "text-3xl font-bold" : "text-base"}`}
                  >
                    {cell.day}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="min-h-0 bg-[var(--card-bg)] rounded-xl border border-[#18b4a6]"></section>

        <section className="col-span-2 min-h-0 bg-[var(--card-bg)] rounded-xl border border-[#18b4a6] grid grid-cols-2 grid-rows-[1fr_3fr] gap-4 overflow-hidden">
          <h2 className="font-bold text-3xl capitalize p-4">Poznámky</h2>
          <div className="flex justify-end items-start p-6">
            <FontAwesomeIcon
              icon={faSquarePlus}
              className="text-[#18b4a6] scale-200 hover:scale-190 cursor-pointer transition-transform duration-100"
            />
          </div>
          <article className=" flex flex-col flex-1 mb-4 ml-4  border border-[#353535] rounded-lg">
            <section className="flex justify-between items-center m-4">
              <h4 className="font-semibold text-xl">
                Fyzika - Výpočet kapacity kondenzátorů
              </h4>
              <FontAwesomeIcon
                icon={faDna}
                className="text-[#18b4a6] scale-200 hover:scale-190 cursor-pointer transition-transform duration-100"
              />
            </section>
            <section className="m-4 pt-6 flex-1">
              <p>
                Kapacita kondenzátoru se vypočítá jako poměr náboje a napětí: C
                rovná se Q děleno U, jednotka farad v SI soustavě...
              </p>
            </section>
            <section className="flex flex-1 justify-end items-center pr-2 text-md">
              <p>25-1-26</p>
            </section>
          </article>
          <article className="flex flex-col flex-1 mb-4 mr-4  border border-[#353535] rounded-lg">
            <section className="flex justify-between items-center m-4">
              <h4 className="font-semibold text-xl">
                Fyzika - Výpočet kapacity kondenzátorů
              </h4>
              <FontAwesomeIcon
                icon={faDna}
                className="text-[#18b4a6] scale-200 hover:scale-190 cursor-pointer transition-transform duration-100"
              />
            </section>
            <section className="m-4 pt-6 flex-1">
              <p>
                Kapacita kondenzátoru se vypočítá jako poměr náboje a napětí: C
                rovná se Q děleno U, jednotka farad v SI soustavě...
              </p>
            </section>
            <section className="flex flex-1 justify-end items-center pr-2 text-md">
              <p>25-1-26</p>
            </section>
          </article>
        </section>
      </article>
    </main>
  );
}

function capitalizeFirstLetter(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
