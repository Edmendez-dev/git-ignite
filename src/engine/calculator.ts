import {
  RawContributionCalendar,
  RawContributionDay,
  StreakStats,
} from "./types";

export function calculateStreak(
  calendar: RawContributionCalendar,
): StreakStats {
  const allDays: RawContributionDay[] = calendar.weeks
    .flatMap((week) => week.contributionDays)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let currentStreak = 0;
  let tier: "ignition" | "short-circuit" | "overload" = "ignition";
  const todayDateStr = new Date().toISOString().split("T")[0];

  // Streak logic with "Grace Day"
  let startIndex = 0;
  if (
    allDays[0]?.date === todayDateStr &&
    allDays[0]?.contributionCount === 0
  ) {
    startIndex = 1;
  }

  for (let i = startIndex; i < allDays.length; i++) {
    if (allDays[i].contributionCount > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Point and Level Logic
  const todayData = allDays.find((d) => d.date === todayDateStr);
  const todayPoints = todayData ? todayData.contributionCount : 0;

  let level = 1;
  if (todayPoints >= 10)
    level = 3; // Best Mode
  else if (todayPoints >= 5)
    level = 2; // Steady
  else if (todayPoints >= 1)
    level = 1; // Spark
  else level = 0; // No contributions or Inactive

  // Tier Logic
  if (currentStreak > 90) {
    tier = "overload";
  } else if (currentStreak >= 30) {
    tier = "short-circuit";
  }

  // Total contributions up to today
  const totalContributions = calendar.totalContributions;

  // Earliest day with at least one contribution
  const daysWithContribs = allDays
    .filter((d) => d.contributionCount > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const startDate =
    daysWithContribs.length > 0 ? daysWithContribs[0].date : null;

  return {
    currentStreak,
    todayPoints,
    level,
    tier,
    totalContributions,
    startDate,
  };
}
