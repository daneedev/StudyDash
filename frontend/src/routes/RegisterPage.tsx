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

function RegisterPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim() || !username.trim() || !password.trim()) {
      setError("Vyplňte všechna pole.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://api.studydash.app/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, username, password }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        const message =
          data?.message ||
          data?.error ||
          data?.errors?.[0] ||
          res.statusText ||
          "Registrace selhala.";
        throw new Error(message);
      }

      const token = data?.token || data?.accessToken || data?.data?.token;
      const user = data?.user || data?.data?.user;

      if (token) {
        localStorage.setItem("accessToken", token);
      }
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      navigate({ to: "/dashboard" });
    } catch (err: any) {
      if (err instanceof TypeError) {
        setError(
          "Síťová chyba: nelze se připojit k API. Zkontrolujte připojení nebo CORS."
        );
      } else {
        setError(err?.message || "Došlo k chybě při registraci.");
      }
    } finally {
      setLoading(false);
    }
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
            Založte si účet
          </h2>
        </div>

        {error && <p className="text-red-400 text-center text-sm">{error}</p>}

        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          autoComplete="off"
          autoSave="off"
        >
          <div className="space-y-4 rounded-md">
            <Input
              isClearable
              id="username"
              name="username"
              type="text"
              label="Uživatelské jméno"
              labelPlacement="outside-top"
              isRequired
              value={username}
              onValueChange={setUsername}
              classNames={{
                inputWrapper:
                  "relative !bg-[#1C1C1C] border border-zinc-700 rounded-lg transition-colors focus-within:border-[#39b6dd] focus-within:ring-2 focus-within:ring-[#39b6ab]",
                input:
                  "bg-transparent !text-[#f6f7fb] placeholder-zinc-400 focus:outline-none py-2 px-2 rounded-lg",
                label: "text-[#f6f7fb] font-medium py-1",
              }}
            />

            <Input
              isClearable
              id="email"
              name="email"
              type="email"
              label="Emailová adresa"
              labelPlacement="outside-top"
              isRequired
              value={email}
              onValueChange={setEmail}
              classNames={{
                inputWrapper:
                  "relative !bg-[#1C1C1C] border border-zinc-700 rounded-lg transition-colors focus-within:border-[#39b6dd] focus-within:ring-2 focus-within:ring-[#39b6ab]",
                input:
                  "bg-transparent !text-[#f6f7fb] placeholder-zinc-400 focus:outline-none py-2 px-2 rounded-lg",
                label: "text-[#f6f7fb] font-medium py-1",
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
              classNames={{
                inputWrapper:
                  "text-[#f6f7fb] relative !bg-[#1C1C1C] border border-zinc-700 rounded-lg transition-colors focus-within:border-[#39b6dd] focus-within:ring-2 focus-within:ring-[#39b6ab] ",
                input:
                  "text-[#f7f6fb] bg-transparent !text-[#f6f7fb] placeholder-zinc-400 focus:outline-none py-2 px-2 rounded-lg",
                label: "text-[#f6f7fb] font-medium py-1",
              }}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-400 hover:text-zinc-200 focus:outline-none transition-transform duration-200 scale-60 hover:scale-55 absolute right-2 top-1/2 -translate-y-1/2"
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
            className="w-full bg-[#39b6ab] text-white hover:scale-[0.98] transition-all font-semibold rounded-lg shadow-md py-3 relative overflow-hidden"
          >
            {loading ? "Registruji..." : "Registrovat se"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-[#f6f7fb]">
            Již máte účet?{" "}
            <a
              href="/login"
              className="font-medium hover:text-cyan-300 transition-all text-[#39b6ab]"
            >
              Přihlaste se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

const route = createRoute({
  getParentRoute: () => rootRoute,
  path: "register",
  component: RegisterPage,
});

type RegisterComponent = typeof RegisterPage & { route?: AnyRoute };
(RegisterPage as RegisterComponent).route = route;

export default RegisterPage;
