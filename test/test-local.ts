import { generateSVG } from "../src/renderer/svg-builder";
import * as fs from "fs";

const mockStats = {
  currentStreak: 15,
  todayPoints: 12,
  level: 3,
  tier: "ignition" as const,
  totalContributions: 150,
  startDate: "2023-01-01",
};

const svg = generateSVG(mockStats);
fs.writeFileSync("test-output.svg", svg);
console.log("SVG generated and saved as test-output.svg");
