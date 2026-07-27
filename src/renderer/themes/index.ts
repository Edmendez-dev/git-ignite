import { classicTheme } from "./classic";
import { neonTheme } from "./neon";
import { obsidianTheme } from "./obsidian";
import { emeraldTheme } from "./emerald";
import { Theme } from "../../engine/types";

export const THEMES: Record<string, Theme> = {
  classic: classicTheme,
  neon: neonTheme,
  obsidian: obsidianTheme,
  emerald: emeraldTheme,
};

export function getTheme(name: string): Theme {
  return THEMES[name] ?? THEMES.classic;
}
