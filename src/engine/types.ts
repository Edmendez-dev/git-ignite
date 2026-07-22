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
   * 2: Stedy (5-9 commits)
   * 3: Best Mode (10+ commits)
   */
  level: number;
}
