import { classicTheme } from "./classic";
import { neonTheme } from "./neon";
import { obsidianTheme } from "./obsidian";
import { emeraldTheme } from "./emerald";
import { roseTheme } from "./rose";
import { terminalTheme } from "./terminal";
import { Theme } from "../../engine/types";

export const THEMES: Record<string, Theme> = {
  classic: classicTheme,
  neon: neonTheme,
  obsidian: obsidianTheme,
  emerald: emeraldTheme,
  rose: roseTheme,
  terminal: terminalTheme,
};

export function getTheme(name: string): Theme {
  return THEMES[name] ?? THEMES.classic;
}
