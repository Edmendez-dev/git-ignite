import * as core from "@actions/core";
import * as fs from "fs";
import * as path from "path";
import { fetchUserStats, getOrInitFirstRunDate } from "./engine/github";
import { fetchLanguageStats } from "./engine/languages";
import { calculateStreak } from "./engine/calculator";
import { generateSVG } from "./renderer/streak-builder";
import { generateLanguagesSVG } from "./renderer/languages-builder";
import { getTheme, THEMES } from "./renderer/themes";

async function run() {
  try {
    const token = core.getInput("gh_token", { required: true });
    const username = core.getInput("user_name", { required: true });
    const themeName = core.getInput("theme") || "classic";
    const outputPath = core.getInput("output_path") || "stats";

    if (!(themeName in THEMES)) {
      core.warning(
        `Theme "${themeName}" not found. Falling back to "classic". Available themes: ${Object.keys(THEMES).join(", ")}.`,
      );
    }
    const theme = getTheme(themeName);
    core.info(
      `Starting GitIgnite for user: ${username} with theme: ${theme.name}`,
    );

    const [calendarData, languageStats] = await Promise.all([
      fetchUserStats(username, token),
      fetchLanguageStats(username, token),
    ]);

    const firstRunDate = getOrInitFirstRunDate();

    // Calculate streak stats
    const streakStats = calculateStreak(calendarData, firstRunDate);
    core.info(`Current streak: ${streakStats.currentStreak}`);
    core.info(`Today's points: ${streakStats.todayPoints}`);
    core.info(`Level: ${streakStats.level}`);

    // Generate SVGs
    const streakSvg = generateSVG(streakStats, theme);
    const languagesSvg = generateLanguagesSVG(languageStats, theme);

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
