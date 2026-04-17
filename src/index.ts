import * as core from "@actions/core";
import { fetchUserStats } from "./engine/github";

async function run() {
  try {
    const token = core.getInput("gh_token", { required: true });
    const username = core.getInput("username", { required: true });
    const theme = core.getInput("theme") || "classic";

    core.info(`Starting GitIgnite for user: ${username} with theme: ${theme}`);

    const calendarData = await fetchUserStats(username, token);
    core.info(
      `Successfully fetched ${calendarData.totalContributions} contributions!`,
    );

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
