// Data interface
export interface RawContributionDay {
  contributionCount: number;
  date: string;
  color: string;
}

export interface RawContributionCalendar {
  totalContributions: number;
  weeks: {
    contributionDays: RawContributionDay[];
  }[];
}

// Interface for the response from GitHub's GraphQL API for contributions
export interface ContributionsResponse {
  user: {
    contributionsCollection: {
      contributionCalendar: RawContributionCalendar;
    };
  };
}

export interface YearCache {
  [year: number]: RawContributionCalendar;
}

export interface fetchUserStatsResponse {
  user: {
    createdAt: string;
  };
}

export interface gitigniteMeta {
  firstRunDate: string;
}

export interface StreakStats {
  currentStreak: number;
  todayPoints: number;
  tier: "ignition" | "short-circuit" | "overload";
  /**
   * Calculated intensity level (0 to 3)
   * 0: Inactive (0 contributions)
   * 1: Spark (1-4 commits)
   * 2: Steady (5-9 commits)
   * 3: Best Mode (10+ commits)
   */
  level: number;
  /** Total contributions accumulated up to today */
  totalContributions: number;
  /** ISO date string (YYYY-MM-DD) of the first ever contribution */
  startDate: string | null;
}

// Languages
export interface LanguageEntry {
  /** Language display name (e.g. "TypeScript") */
  name: string;
  /** Approximate byte count across all repos */
  bytes: number;
  /** GitHub-provided color hex string (e.g. "#3178c6") */
  color: string;
  /** Percentage share of total bytes, 0-100 */
  percentage: number;
}

export interface LanguageStats {
  /** Top languages sorted descending by byte count */
  languages: LanguageEntry[];
  /** GitHub username */
  username: string;
}

// Themes
export interface Theme {
  /** Theme identifier, e.g. "classic" */
  name: string;
  /** Card background */
  background: string;
  /** Secondary panel bg: bar tracks, chip pills, donut track */
  surface: string;
  /** Separator lines / borders */
  border: string;
  /** High-emphasis accent text: streak number, bar-label */
  textAccent: string;
  /** Primary value text: username, stat values, donut center name */
  textPrimary: string;
  /** Secondary text: section titles, streak label */
  textSecondary: string;
  /** Muted text: stat labels, donut sub-label, empty state */
  textMuted: string;
  /** Subtle small text: percentages (pct-label, chip-pct) */
  textSubtle: string;
  /** Body text on chips */
  textBody: string;
}
