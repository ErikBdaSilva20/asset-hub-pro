import { useEffect } from "react";
import { useLocalStorage } from "./use-local-storage";

export type Theme = "light" | "dark";

export function useTheme() {
  const { value, setValue, hydrated } = useLocalStorage<Theme>("assethub.theme", "light");

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", value === "dark");
  }, [value, hydrated]);

  return {
    theme: value,
    toggle: () => setValue(value === "dark" ? "light" : "dark"),
  };
}
