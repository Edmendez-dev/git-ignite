import { generateSVG } from "../src/renderer/svg-builder";
import * as fs from "fs";

const mockStats = {
  currentStreak: 15,
  todayPoints: 12,
  level: 3,
};

const svg = generateSVG(mockStats);
fs.writeFileSync("test-output.svg", svg);
console.log("SVG generated and saved as test-output.svg");
