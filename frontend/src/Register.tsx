import { Button } from "@heroui/button";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1c1c1c]">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-[#272727] p-8 shadow-lg">
        <div>
          <h2 className="text-left text-3xl font-bold tracking-tight text-[#f6f7fb]">
            Vítejte!
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#39b6ab] focus:outline-none focus:ring-[#39b6ab]"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#39b6ab]  focus:outline-none focus:ring-[#39b6ab]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-[#39b6ab]">
            Přihlásit se
          </Button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-[#f6f7fb]">
            Ještě nemáte účet?{" "}
            <a href="/register" className="font-medium text-[#39b6ab]">
              Registrujte se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
