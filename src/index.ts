import * as core from "@actions/core";
import { fetchUserStats } from "./engine/github";
import { calculateStreak } from "./engine/calculator";

async function run() {
  try {
    const token = core.getInput("gh_token", { required: true });
    const username = core.getInput("user_name", { required: true });
    const theme = core.getInput("theme") || "classic";

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

    // TODO: Generate SVG based on fetched data
    core.info("Generating animated SVG...");

    core.info("GitIgnite completed successfully!");
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`GitIgnite failed: ${error.message}`);
    }
  }
}

run();
