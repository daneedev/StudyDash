import { Calendar } from "@heroui/calendar";
import { h1 } from "framer-motion/client";

import { isWoman, vocative } from "czech-vocative";

type DashboardOverviewProps = {
  username: string;
};

export function DashboardOverview({ username }: DashboardOverviewProps) {
  const usernameVocative = username
    ? capitalizeFirstLetter(vocative(username, isWoman(username)))
    : "Uživateli";

  return (
    <main className="h-full w-full flex flex-col gap-4">
      <h1 className="text-2xl shrink-0">Ahoj {usernameVocative},</h1>

      <article className="grid min-h-0 flex-1 w-full grid-cols-2 grid-rows-[1.8fr_1.2fr] gap-6">
        <section className="min-h-0 flex items-center overflow-hidden">
          <Calendar aria-label="Date (No Selection)" calendarWidth={820} />
        </section>

        <section className="min-h-0 bg-[var(--card-bg)] rounded-xl border border-[#18b4a6]" />

        <section className="col-span-2 min-h-0 bg-[var(--card-bg)] rounded-xl border border-[#18b4a6]" />
      </article>
    </main>
  );
}

function capitalizeFirstLetter(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
