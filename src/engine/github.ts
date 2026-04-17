import { getOctokit } from "@actions/github";

export const FETCH_CONTRIBUTIONS_QUERY = `
query($login: String!) {
    user(login: $login) {
        contributionsCollection {
            contributionsCalendar {
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

export async function fetchUserStats(username: string, token: string) {
  const octokit = getOctokit(token);
  try {
    const response: any = await octokit.graphql(FETCH_CONTRIBUTIONS_QUERY, {
      login: username,
    });
    return response.user.contributionsCollection.contributionsCalendar;
  } catch (error) {
    throw new Error(
      `Error fetching GitHub stats:" ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
