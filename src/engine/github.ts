import { getOctokit } from "@actions/github";
import { ContributionsResponse, RawContributionCalendar } from "./types";

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
    const response = await octokit.graphql<ContributionsResponse>(
      FETCH_CONTRIBUTIONS_QUERY,
      {
        login: username,
      },
    );
    return response.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    throw new Error(
      `Error fetching GitHub stats: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
