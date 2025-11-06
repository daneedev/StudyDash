import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/css/index.css";
import { HeroUIProvider } from "@heroui/react";
import { AppRouter } from "./utils/AppRouter";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HeroUIProvider>
      <AppRouter />
    </HeroUIProvider>
  </StrictMode>
);
