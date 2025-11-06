import { createRoute, type AnyRoute } from "@tanstack/react-router";
import { Button, Input } from "@heroui/react";
import { useState } from "react";
import studydashLogo from "../assets/studydashBlue.svg";
import { Eye, EyeOff } from "lucide-react";

import { rootRoute } from "./rootRoute";
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // handle login logic
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

        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          autoComplete="off"
          autoSave="off"
        >
          <div className="space-y-4 rounded-md">
            <Input
              isClearable
              id="email"
              name="email"
              type="email"
              label="Emailová adresa"
              labelPlacement="outside-top"
              isRequired
              errorMessage="Please enter a valid email"
              isInvalid={false}
              value={email}
              onValueChange={setEmail}
              classNames={{
                inputWrapper:
                  "relative !bg-[#1C1C1C] border border-zinc-700 rounded-lg transition-colors focus-within:border-[#39b6dd] focus-within:ring-2 focus-within:ring-[#39b6ab]",
                input:
                  "bg-transparent !text-[#f6f7fb] placeholder-zinc-400 focus:outline-none py-2 px-2 rounded-lg",
                label: "text-[#f6f7fb] font-medium py-1",
                errorMessage: "text-[#ff6b6b] mt-1 ",
                clearButton: "text-zinc-400 hover:text-zinc-200",
              }}
            />

            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              label="Heslo"
              labelPlacement="outside-top"
              isRequired
              value={password}
              onValueChange={setPassword}
              errorMessage="Please enter a valid password"
              isInvalid={false}
              classNames={{
                inputWrapper:
                  "text-[#f6f7fb] relative !bg-[#1C1C1C] border border-zinc-700 rounded-lg transition-colors focus-within:border-[#39b6dd] focus-within:ring-2 focus-within:ring-[#39b6ab] ",
                input:
                  "text-[#f7f6fb] bg-transparent !text-[#f6f7fb] placeholder-zinc-400 focus:outline-none py-2 px-2 rounded-lg",
                label: "text-[#f6f7fb] font-medium py-1",
                errorMessage: "text-[#ff6b6b] mt-1 ",
              }}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-400 hover:text-zinc-200 focus:outline-none transition-transform duration-200 scale-60 hover:scale-55 absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <span
                    className="transition-opacity duration-200 ease-in-out"
                    key={showPassword ? "eyeoff" : "eye"}
                  >
                    {showPassword ? (
                      <EyeOff color="#f6f7fb" strokeWidth={1.5} />
                    ) : (
                      <Eye color="#f6f7fb" strokeWidth={1.5} />
                    )}
                  </span>
                </button>
              }
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#39b6ab] text-white hover:scale-[0.98] transition-all font-semibold rounded-lg shadow-md py-3 relative overflow-hidden"
          >
            Přihlásit se
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-[#f6f7fb]">
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

const route = createRoute({
  getParentRoute: () => rootRoute,
  path: "login",
  component: LoginPage,
});

type LoginComponent = typeof LoginPage & { route?: AnyRoute };
(LoginPage as LoginComponent).route = route;

export default LoginPage;
