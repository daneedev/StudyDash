import { Button, buttonGroup, Input } from "@heroui/react";
import { useState } from "react";
import studydashLogo from "./assets/studydashLogoBlue.svg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // handle login logic here
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1c1c1c] f">
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
        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          autoComplete="off"
          autoSave="off"
        >
          <div className="space-y-4 rounded-md">
            <Input
              id="email"
              name="email"
              type="email"
              label="Emailová adresa"
              labelPlacement="outside-top"
              isRequired
              errorMessage="Please enter a valid email"
              isInvalid={true}
              value={email}
              onValueChange={setEmail}
              classNames={{
                inputWrapper:
                  " bg-[#272727] border border-zinc-700 rounded-lg transition-colors focus-within:border-[#39b6dd] focus-within:ring-2 focus-within:ring-[#39b6ab]",
                input:
                  "bg-transparent text-[#f6f7fb] placeholder-zinc-400 focus:outline-none py-2 px-2 rounded-lg",
                label: "text-[#f6f7fb] font-medium py-1",
                errorMessage: "text-[#ff6b6b] mt-1 ",
              }}
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Heslo"
              labelPlacement="outside-top"
              isRequired
              value={password}
              onValueChange={setPassword}
              errorMessage="Please enter a valid password"
              isInvalid={true}
              classNames={{
                inputWrapper:
                  " bg-[#1c1c1c] border border-zinc-700 rounded-lg transition-colors focus-within:border-[#39b6dd] focus-within:ring-2 focus-within:ring-[#39b6ab]",
                input:
                  "bg-transparent text-[#f6f7fb] placeholder-zinc-400 focus:outline-none py-2 px-2 rounded-lg",
                label: "text-[#f6f7fb] font-medium py-1",
                errorMessage: "text-[#ff6b6b] mt-1 ",
              }}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#39b6ab]  text-white hover:scale-98 transition-all font-semibold rounded-lg shadow-md py-3 relative overflow-hidden"
          >
            Registrovat se
          </Button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-[#f6f7fb] ">
            Již máte účet?{" "}
            <a
              href="/register"
              className="font-medium hover:text-cyan-300 transition-all text-[#39b6ab]"
            >
              Zaregistrujte se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
