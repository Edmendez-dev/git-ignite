import { getOctokit } from "@actions/github";
import { ContributionsResponse, RawContributionCalendar } from "./types";

export const FETCH_USER_CREATED_QUERY = `
query($login: String!) {
  user(login: $login) {
    createdAt
  }
}`;

export const FETCH_CONTRIBUTIONS_QUERY = `
query($login: String!) {
    user(login: $login) {
        contributionsCollection {
            contributionCalendar {
                totalContributions 
                weeks {
                    contributionDays {
                        contributionCount 
                        date 
                        color
                    }
                }
            }
        }
    }
}`;

export async function fetchUserStats(
  username: string,
  token: string,
): Promise<RawContributionCalendar> {
  const octokit = getOctokit(token);
  try {
    const createdAtResponse: any = await octokit.graphql(
      FETCH_USER_CREATED_QUERY,
      {
        login: username,
      },
    );
    const createdAt = new Date(createdAtResponse.user.createdAt);
    const today = new Date();

    const ranges: { from: string; to: string }[] = [];
    let cursor = new Date(createdAt);
    while (cursor < today) {
      const from = new Date(cursor);
      const to = new Date(cursor);
      to.setFullYear(to.getFullYear() + 1);
      if (to > today) {
        to.setTime(today.getTime());
      }

      ranges.push({ from: from.toISOString(), to: to.toISOString() });
      cursor.setFullYear(cursor.getFullYear() + 1);
    }

    const response = await Promise.all(
      ranges.map((range) =>
        octokit.graphql<ContributionsResponse>(FETCH_CONTRIBUTIONS_QUERY, {
          login: username,
          from: range.from,
          to: range.to,
        }),
      ),
    );

    const mergedCalendar: RawContributionCalendar = {
      totalContributions: 0,
      weeks: [],
    };

    for (const result of response) {
      const calendar = result.user.contributionsCollection.contributionCalendar;
      mergedCalendar.totalContributions += calendar.totalContributions;
      mergedCalendar.weeks.push(...calendar.weeks);
    }

    return mergedCalendar;
  } catch (error) {
    throw new Error(
      `Error fetching GitHub stats: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
