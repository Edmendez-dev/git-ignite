import { describe, it, expect } from "vitest";
import { generateSVG } from "../src/renderer/streak-builder";
import { generateLanguagesSVG } from "../src/renderer/languages-builder";
import { getTheme } from "../src/renderer/themes";
import * as fs from "fs";
import * as path from "path";

describe("Local SVG Generation", () => {
  const theme = getTheme("classic");

  const mockStreakStats = {
    currentStreak: 15,
    todayPoints: 12,
    level: 3,
    tier: "ignition" as const,
    totalContributions: 150,
    startDate: "2023-01-01",
  };

  const mockLanguageStats = {
    username: "octocat",
    languages: [
      { name: "TypeScript", bytes: 412000, color: "#3178c6", percentage: 41.2 },
      { name: "Python", bytes: 231000, color: "#3572A5", percentage: 23.1 },
      { name: "Rust", bytes: 148000, color: "#dea584", percentage: 14.8 },
      { name: "Go", bytes: 98000, color: "#00ADD8", percentage: 9.8 },
      { name: "Shell", bytes: 61000, color: "#89e051", percentage: 6.1 },
      { name: "HTML", bytes: 35000, color: "#e34c26", percentage: 3.5 },
      { name: "CSS", bytes: 15000, color: "#563d7c", percentage: 1.5 },
    ],
  };

  it("generates streak SVG successfully", () => {
    const streakSvg = generateSVG(mockStreakStats, theme);
    expect(streakSvg).toBeDefined();
    expect(typeof streakSvg).toBe("string");
    expect(streakSvg).toContain("<svg");

    const outputPath = path.join(__dirname, "ignite-streak.svg");
    fs.writeFileSync(outputPath, streakSvg);
    expect(fs.existsSync(outputPath)).toBe(true);
  });

  it("generates languages SVG successfully", () => {
    const languagesSvg = generateLanguagesSVG(mockLanguageStats, theme);
    expect(languagesSvg).toBeDefined();
    expect(typeof languagesSvg).toBe("string");
    expect(languagesSvg).toContain("<svg");

    const outputPath = path.join(__dirname, "ignite-languages.svg");
    fs.writeFileSync(outputPath, languagesSvg);
    expect(fs.existsSync(outputPath)).toBe(true);
  });
});
