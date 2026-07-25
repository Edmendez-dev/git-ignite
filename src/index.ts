import * as core from "@actions/core";
import * as fs from "fs";
import * as path from "path";
import { fetchUserStats } from "./engine/github";
import { fetchLanguageStats } from "./engine/languages";
import { calculateStreak } from "./engine/calculator";
import { generateSVG } from "./renderer/streak-builder";
import { generateLanguagesSVG } from "./renderer/languages-builder";

async function run() {
  try {
    const token = core.getInput("gh_token", { required: true });
    const username = core.getInput("user_name", { required: true });
    const theme = core.getInput("theme") || "classic";
    const outputPath = core.getInput("output_path") || "stats";

    core.info(`Starting GitIgnite for user: ${username} with theme: ${theme}`);

    // Fetch both data sources in parallel
    const [calendarData, languageStats] = await Promise.all([
      fetchUserStats(username, token),
      fetchLanguageStats(username, token),
    ]);

    core.info(
      `Successfully fetched ${calendarData.totalContributions} contributions!`,
    );
    core.info(
      `Top language: ${languageStats.languages[0]?.name ?? "none"} (${languageStats.languages[0]?.percentage.toFixed(1) ?? 0}%)`,
    );

    // Calculate streak stats
    const streakStats = calculateStreak(calendarData);
    core.info(`Current streak: ${streakStats.currentStreak}`);
    core.info(`Today's points: ${streakStats.todayPoints}`);
    core.info(`Level: ${streakStats.level}`);

    // Generate both SVGs
    const streakSvg = generateSVG(streakStats);
    const languagesSvg = generateLanguagesSVG(languageStats);

    // Expose outputs
    core.setOutput("streak", streakStats.currentStreak.toString());
    core.setOutput("level", streakStats.level.toString());
    core.setOutput("svg", streakSvg);
    core.setOutput("languages_svg", languagesSvg);

    // Write files
    const dir = path.join(process.cwd(), outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const streakPath = path.join(dir, "ignite-streak.svg");
    const languagesPath = path.join(dir, "ignite-languages.svg");

    fs.writeFileSync(streakPath, streakSvg);
    fs.writeFileSync(languagesPath, languagesSvg);

    core.info(`GitIgnite completed successfully!`);
    core.info(`  Streak card  → ${streakPath}`);
    core.info(`  Languages card → ${languagesPath}`);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`GitIgnite failed: ${error.message}`);
    }
  }
}

run();
