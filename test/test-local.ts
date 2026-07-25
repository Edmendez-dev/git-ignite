import { generateSVG } from "../src/renderer/streak-builder";
import { generateLanguagesSVG } from "../src/renderer/languages-builder";
import * as fs from "fs";

// Mock data: Streak card
const mockStreakStats = {
  currentStreak: 15,
  todayPoints: 12,
  level: 3,
  tier: "ignition" as const,
  totalContributions: 150,
  startDate: "2023-01-01",
};

// Mock data: Languages card
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

// Generate & write Streak SVG
const streakSvg = generateSVG(mockStreakStats);
fs.writeFileSync("ignite-streak.svg", streakSvg);
console.log("SVG generated and saved as ignite-streak.svg");

// Generate & write Languages SVG
const languagesSvg = generateLanguagesSVG(mockLanguageStats);
fs.writeFileSync("ignite-languages.svg", languagesSvg);
console.log("SVG generated and saved as ignite-languages.svg");
