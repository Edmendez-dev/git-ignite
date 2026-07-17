import * as core from "@actions/core";
import * as fs from "fs";
import * as path from "path";
import { fetchUserStats } from "./engine/github";
import { calculateStreak } from "./engine/calculator";
import { generateSVG } from "./renderer/svg-builder";

async function run() {
  try {
    const token = core.getInput("gh_token", { required: true });
    const username = core.getInput("user_name", { required: true });
    const theme = core.getInput("theme") || "classic";
    const outputPath = core.getInput("output_path") || "stats";

    core.info(`Starting GitIgnite for user: ${username} with theme: ${theme}`);

    const calendarData = await fetchUserStats(username, token);
    core.info(
      `Successfully fetched ${calendarData.totalContributions} contributions!`,
    );

    const streakStats = calculateStreak(calendarData);
    core.info(`Current streak: ${streakStats.currentStreak}`);
    core.info(`Today's points: ${streakStats.todayPoints}`);
    core.info(`Level: ${streakStats.level}`);
    core.setOutput("streak", streakStats.currentStreak.toString());
    core.setOutput("level", streakStats.level.toString());

    // Generate SVG
    const svg = generateSVG(streakStats);
    core.setOutput("svg", svg);
    const dir = path.join(process.cwd(), outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, "ignite-streak.svg");
    fs.writeFileSync(filePath, svg);

    // TODO: Generate SVG based on fetched data
    core.info("Generating animated SVG...");

    core.info(`GitIgnite completed successfully! File saved to: ${filePath}`);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`GitIgnite failed: ${error.message}`);
    }
  }
}

run();
