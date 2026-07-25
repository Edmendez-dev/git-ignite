// Data interface
export interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
  tier: "ignition" | "short-circuit" | "overload";
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: {
    contributionDays: ContributionDay[];
  }[];
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
