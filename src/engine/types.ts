// Data interface
export interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: {
    contributionDays: ContributionDay[];
  }[];
}
