import { classicTheme } from "./classic";
import { neonTheme } from "./neon";
import { Theme } from "../../engine/types";

export const THEMES: Record<string, Theme> = {
  classic: classicTheme,
  neon: neonTheme,
};

export function getTheme(name: string): Theme {
  return THEMES[name] ?? THEMES.classic;
}
