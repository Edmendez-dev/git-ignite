import {
  RawContributionCalendar,
  RawContributionDay,
  StreakStats,
} from "./types";

export function calculateStreak(
  calendar: RawContributionCalendar,
  minDate: string | null = null,
): StreakStats {
  const allDays: RawContributionDay[] = calendar.weeks
    .flatMap((week) => week.contributionDays)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let currentStreak = 0;
  let tier: "ignition" | "short-circuit" | "overload" = "ignition";
  const todayDateStr = new Date().toISOString().split("T")[0];

  // Streak logic with "Grace Day"
  let startIndex = 0;
  let graceUsed = false;
  if (allDays[0]?.date === todayDateStr) {
    startIndex = 1;
  }

  while (startIndex < allDays.length) {
    const day = allDays[startIndex];

    if (minDate && day.date < minDate) break;

    if (day.contributionCount > 0) {
      currentStreak++;
      startIndex++;
    } else if (!graceUsed) {
      // First zero completed-day: forgive it once, don't break, don't count it
      graceUsed = true;
      startIndex++;
    } else {
      // Second zero completed-day in a row: streak truly broken
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

  // Tier Logic - based on current streak length
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
