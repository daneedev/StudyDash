import { Button } from "@heroui/react";
import { useState } from "react";
import { Input } from "@heroui/input";
import studydashLogo from "./assets/studydashLogoBlue.svg";

export default function LoginPage() {
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
          <h2 className="text-left text-3xl font-bold tracking-tight text-text">
            Vítejte zpět
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <Input
              label="Email"
              variant="bordered"
              radius="md"
              color="primary"
            />

            <div className="flex w-full flex-wrap md:flex-nowrap gap-4 ">
              <Input
                label="Heslo"
                variant="bordered"
                radius="md"
                type="password"
                classNames={{
                  base: "bg-[#1c1c1c] border-[#39b6ab]",
                  input:
                    "text-[#f6f7fb] placeholder:text-[#f6f7fb] bg-[#1c1c1c]",
                  label: "text-[#f6f7fb]",
                  innerWrapper: "bg-[#1c1c1c]",
                }}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#39b6ab] font-medium rounded-md hover:scale-99 transition-all text-[#f6f7fb] "
          >
            Přihlásit se
          </Button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-[#f6f7fb] ">
            Ještě nemáte účet?{" "}
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
