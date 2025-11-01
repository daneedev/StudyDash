import { Button } from "@heroui/react";
import { useState } from "react";
import { Input } from "@heroui/react";

import studydashLogo from "./assets/studydashLogoBlue.svg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1c1c1c]">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-[#272727] p-8 shadow-lg">
        <div className="flex flex-col items-center">
          <img
            src={studydashLogo}
            alt="Studydash Logo"
            className="h-20 w-auto mb-6"
          />
          <h2 className="text-left text-3xl font-bold tracking-tight text-[#f6f7fb]">
            Vítejte zpět
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#f6f7fb]"
              >
                Emailová adresa
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#39b6ab] focus:outline-none focus:ring-[#39b6ab] bg-[#1c1c1c] text-[#f6f7fb] "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#f6f7fb]"
              >
                Heslo
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#39b6ab]  focus:outline-none focus:ring-[#39b6ab] bg-[#1c1c1c]  text-[#f6f7fb]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#39b6ab] font-medium  rounded-md hover:scale-99 transition-all"
          >
            Registrovat se
          </Button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-[#f6f7fb] ">
            Již máte účet?{" "}
            <a
              href="/register"
              className="font-medium hover:text-[#2f9990] transition-all text-[#39b6ab] "
            >
              Zaregistrujte se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
