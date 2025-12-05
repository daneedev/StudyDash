import {
  createRoute,
  type AnyRoute,
  useNavigate,
} from "@tanstack/react-router";
import { Button, Input } from "@heroui/react";
import { useState } from "react";
import studydashLogo from "../assets/studydashBlue.svg";
import { Eye, EyeOff } from "lucide-react";
import { rootRoute } from "./rootRoute";

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError("Zadejte uživatelské jméno a heslo.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://api.studydash.app/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.message || "Přihlášení selhalo.");
        setLoading(false);
        return;
      }

      const token = data?.token || data?.accessToken;
      if (!token) {
        setError("Server nevrátil přístupový token.");
        setLoading(false);
        return;
      }

      localStorage.setItem("accessToken", token);

      navigate({ to: "/dashboard" });
    } catch (err) {
      setError("Síťová chyba: nelze se připojit k API.");
    } finally {
      setLoading(false);
    }
  }

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

        {error && <p className="text-red-400 text-center text-sm">{error}</p>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <Input
              isClearable
              id="username"
              label="Uživatelské jméno"
              labelPlacement="outside-top"
              isRequired
              value={username}
              onValueChange={setUsername}
              classNames={{
                inputWrapper:
                  "relative !bg-[#1C1C1C] border border-zinc-700 rounded-lg transition-colors focus-within:border-[#39b6dd] focus-within:ring-2 focus-within:ring-[#39b6ab]",
                input:
                  "bg-transparent !text-[#f6f7fb] placeholder-zinc-400 py-2 px-2 rounded-lg",
                label: "text-[#f6f7fb] font-medium py-1",
              }}
            />

            <Input
              id="password"
              label="Heslo"
              labelPlacement="outside-top"
              isRequired
              type={showPassword ? "text" : "password"}
              value={password}
              onValueChange={setPassword}
              classNames={{
                inputWrapper:
                  "text-[#f6f7fb] !bg-[#1C1C1C] border border-zinc-700 rounded-lg transition-colors focus-within:border-[#39b6dd] focus-within:ring-2 focus-within:ring-[#39b6ab]",
                input:
                  "bg-transparent !text-[#f6f7fb] placeholder-zinc-400 py-2 px-2 rounded-lg",
                label: "text-[#f6f7fb] font-medium py-1",
              }}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-400 hover:text-zinc-200 transition-transform duration-200 absolute right-2 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff color="#f6f7fb" strokeWidth={1.5} />
                  ) : (
                    <Eye color="#f6f7fb" strokeWidth={1.5} />
                  )}
                </button>
              }
            />
          </div>

          <Button
            type="submit"
            isDisabled={loading}
            className="w-full bg-[#39b6ab] text-white hover:scale-[0.98] transition-all font-semibold rounded-lg shadow-md py-3"
          >
            {loading ? "Přihlašuji..." : "Přihlásit se"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-[#f6f7fb]">
            Ještě nemáte účet?{" "}
            <a
              href="/register"
              className="font-medium text-[#39b6ab] hover:text-cyan-300"
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
