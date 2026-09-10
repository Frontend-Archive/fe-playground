"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const OPTIONS = [
  { value: "light", label: "라이트", Icon: Sun },
  { value: "system", label: "시스템", Icon: Monitor },
  { value: "dark", label: "다크", Icon: Moon },
] as const satisfies ReadonlyArray<{
  value: Theme;
  label: string;
  Icon: typeof Sun;
}>;

function apply(theme: Theme) {
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = resolved;
}

export default function ThemeToggle() {
  const groupName = useId();
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    setTheme(stored === "light" || stored === "dark" ? stored : "system");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const select = (next: Theme) => {
    setTheme(next);
    if (next === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", next);
    apply(next);
  };

  return (
    <fieldset className="inline-flex items-center gap-0.5 rounded-full border border-border bg-background/70 p-0.5 backdrop-blur-sm">
      <legend className="sr-only">색상 테마</legend>

      {OPTIONS.map(({ value, label, Icon }) => (
        <label key={value} className="cursor-pointer">
          <input
            type="radio"
            name={groupName}
            value={value}
            // 마운트 전에는 저장된 값을 알 수 없어 아무것도 선택하지 않은 상태로 그린다.
            checked={mounted && theme === value}
            onChange={() => select(value)}
            className="peer sr-only"
          />
          <span
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors duration-200",
              "hover:bg-muted hover:text-foreground",
              "peer-checked:bg-foreground peer-checked:text-background",
              "peer-focus-visible:outline-2 peer-focus-visible:outline-brand peer-focus-visible:outline-offset-2",
            )}
          >
            <Icon className="size-4" strokeWidth={1.75} aria-hidden />
          </span>
          <span className="sr-only">{label} 테마</span>
        </label>
      ))}
    </fieldset>
  );
}
