import { Theme } from "../../engine/types";

export const classicTheme: Theme = {
  name: "classic",
  background: "#0D1117", // rect de fondo en ambos SVGs
  surface: "#161B22", // bar track, chip pill bg, donut track
  border: "#21262D", // línea separadora en languages-builder
  textAccent: "#FFFFFF", // streak-text (streak-builder) y bar-label (languages-builder)
  textPrimary: "#E6EDF3", // stat-value, username-text, donut-center-name
  textSecondary: "#8B949E", // label-text, title-text
  textMuted: "#484F58", // stat-label, donut-center-sub, empty-state
  textSubtle: "#6e7681", // pct-label, chip-pct
  textBody: "#C9D1D9", // chip-label
};
