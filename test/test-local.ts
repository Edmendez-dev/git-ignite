import { describe, it, expect } from "vitest";
import { calculateStreak } from "../src/engine/calculator";
import { generateSVG } from "../src/renderer/streak-builder";
import { generateLanguagesSVG } from "../src/renderer/languages-builder";
import { getTheme } from "../src/renderer/themes";
import {
  RawContributionCalendar,
  RawContributionDay,
} from "../src/engine/types";
import * as fs from "fs";
import * as path from "path";

// Helpers for building simulated calendars

/** Returns the ISO date (YYYY-MM-DD) from `n` days ago, in UTC. */
function daysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().split("T")[0];
}

/**
 * Builds a RawContributionCalendar from a pattern of counts,
 * where countsFromToday[0] = today, countsFromToday[1] = yesterday, etc.
 *
 * This allows simulating any scenario (active streak, grace day,
 * broken streak, different tiers) without having to manually write tier/level —
 * calculateStreak() calculates them the same way as in production.
 */
function buildCalendar(countsFromToday: number[]): RawContributionCalendar {
  const days: RawContributionDay[] = countsFromToday.map((count, i) => ({
    date: daysAgo(i),
    contributionCount: count,
    color: count > 0 ? "#39d353" : "#161b22",
  }));

  const totalContributions = days.reduce(
    (sum, d) => sum + d.contributionCount,
    0,
  );

  return {
    totalContributions,
    weeks: [{ contributionDays: days }],
  };
}

/**
 * Generates a pattern with an active streak of `streakLength` days (excluding today),
 * followed by 2 days with zero contributions to cleanly close the streak.
 */
function streakPattern(streakLength: number, todayCount = 0): number[] {
  return [todayCount, ...Array(streakLength).fill(6), 0, 0];
}

function writeDebugSVG(svg: string, filename: string) {
  const outputPath = path.join(__dirname, filename);
  fs.writeFileSync(outputPath, svg);
  return outputPath;
}

// Tests

describe("Streak calculation + SVG generation (real logic, no hardcoded tier/level)", () => {
  const theme = getTheme("classic");

  it("Short streak (5 days) -> ignition tier, no activity today -> level 0 but active flame", () => {
    const calendar = buildCalendar(streakPattern(5, /* todayCount */ 0));
    const stats = calculateStreak(calendar);

    expect(stats.currentStreak).toBe(5);
    expect(stats.tier).toBe("ignition");
    expect(stats.level).toBe(0); // No push today yet

    const svg = generateSVG(stats, theme);
    expect(svg).toContain("<svg");
    writeDebugSVG(svg, "ignite-streak-5days-ignition.svg");
  });

  it("Medium streak (34 days) -> short-circuit tier (blue)", () => {
    const calendar = buildCalendar(streakPattern(34, 8));
    const stats = calculateStreak(calendar);

    expect(stats.currentStreak).toBe(34);
    expect(stats.tier).toBe("short-circuit");
    expect(stats.level).toBe(2); // 8 contributions today -> Steady

    const svg = generateSVG(stats, theme);
    writeDebugSVG(svg, "ignite-streak-34days-shortcircuit.svg");
  });

  it("Long streak (95 days) -> overload tier (purple) + Best Mode level", () => {
    const calendar = buildCalendar(streakPattern(95, 12));
    const stats = calculateStreak(calendar);

    expect(stats.currentStreak).toBe(95);
    expect(stats.tier).toBe("overload");
    expect(stats.level).toBe(3); // 12 contributions today -> Best Mode

    const svg = generateSVG(stats, theme);
    writeDebugSVG(svg, "ignite-streak-95days-overload.svg");
  });

  it("Grace day: yesterday at zero, but the previous streak remains alive", () => {
    const pattern = [0, 0, 6, 6, 6, 6, 6, 0, 0];
    const calendar = buildCalendar(pattern);
    const stats = calculateStreak(calendar);

    expect(stats.currentStreak).toBe(5);
    expect(stats.tier).toBe("ignition");

    const svg = generateSVG(stats, theme);
    expect(svg).toContain("<svg");
    writeDebugSVG(svg, "ignite-streak-grace-day.svg");
  });

  it("Broken streak: two consecutive days at zero -> currentStreak 0, gray flame", () => {
    const pattern = [0, 0, 0, 6, 6, 6];
    const calendar = buildCalendar(pattern);
    const stats = calculateStreak(calendar);

    expect(stats.currentStreak).toBe(0);
    expect(stats.tier).toBe("ignition");

    const svg = generateSVG(stats, theme);
    writeDebugSVG(svg, "ignite-streak-broken.svg");
  });

  it("Respects minDate: Does not count streak days prior to the adoption date", () => {
    // "Real" streak of 100 days, but the user adopted GitIgnite only 5 days ago.
    const calendar = buildCalendar(streakPattern(100, 6));
    const adoptedAt = daysAgo(5);

    const stats = calculateStreak(calendar, adoptedAt);

    expect(stats.currentStreak).toBe(5);
    expect(stats.currentStreak).toBeLessThan(100);
  });
});

describe("Languages SVG Generation", () => {
  const theme = getTheme("classic");

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

  it("generates languages SVG successfully", () => {
    const languagesSvg = generateLanguagesSVG(mockLanguageStats, theme);
    expect(languagesSvg).toBeDefined();
    expect(typeof languagesSvg).toBe("string");
    expect(languagesSvg).toContain("<svg");

    writeDebugSVG(languagesSvg, "ignite-languages.svg");
  });
});
