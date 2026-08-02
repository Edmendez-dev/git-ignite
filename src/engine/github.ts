import * as fs from "fs";
import * as path from "path";
import { getOctokit } from "@actions/github";
import {
  ContributionsResponse,
  RawContributionCalendar,
  YearCache,
  fetchUserStatsResponse,
} from "./types";

export const FETCH_USER_CREATED_QUERY = `
query($login: String!) {
  user(login: $login) {
    createdAt
  }
}`;

export const FETCH_CONTRIBUTIONS_QUERY = `
query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
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

const CACHE_FILE = path.join(process.cwd(), ".gitignite-cache", "years.json");

function loadYearCache(): YearCache {
  if (!fs.existsSync(CACHE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
  } catch (error) {
    console.error("Error parsing cache file:", error);
    return {};
  }
}

function saveYearCache(cache: YearCache) {
  const dir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
}

export async function fetchAllContributions(
  octokit: ReturnType<typeof getOctokit>,
  username: string,
  ranges: { from: string; to: string; year: number }[],
): Promise<Map<number, RawContributionCalendar>> {
  const results = new Map<number, RawContributionCalendar>();

  // Threshold: if it's a few years, in parallel; if it's many, sequential so as not to hit the GraphQL rate limit all at once.
  const PARALLEL_THRESHOLD = 4;

  if (ranges.length <= PARALLEL_THRESHOLD) {
    const response = await Promise.all(
      ranges.map((range) =>
        octokit.graphql<ContributionsResponse>(FETCH_CONTRIBUTIONS_QUERY, {
          login: username,
          from: range.from,
          to: range.to,
        }),
      ),
    );

    response.forEach((res, i) => {
      results.set(
        ranges[i].year,
        res.user.contributionsCollection.contributionCalendar,
      );
    });
  } else {
    // Sequential: one query at a time, avoids rate limit bursts
    for (const range of ranges) {
      const res = await octokit.graphql<ContributionsResponse>(
        FETCH_CONTRIBUTIONS_QUERY,
        {
          login: username,
          from: range.from,
          to: range.to,
        },
      );
      results.set(
        range.year,
        res.user.contributionsCollection.contributionCalendar,
      );
    }
  }
  return results;
}

export async function fetchUserStats(
  username: string,
  token: string,
): Promise<RawContributionCalendar> {
  const octokit = getOctokit(token);

  try {
    const createdAtResponse: fetchUserStatsResponse = await octokit.graphql(
      FETCH_USER_CREATED_QUERY,
      {
        login: username,
      },
    );
    const createdAt = new Date(createdAtResponse.user.createdAt);
    const today = new Date();
    const currentYear = today.getFullYear();

    const allRanges: { from: string; to: string; year: number }[] = [];
    let cursor = new Date(createdAt);
    while (cursor < today) {
      const from = new Date(cursor);
      const to = new Date(cursor);
      to.setFullYear(to.getFullYear() + 1);
      if (to > today) {
        to.setTime(today.getTime());
      }

      allRanges.push({
        from: from.toISOString(),
        to: to.toISOString(),
        year: cursor.getFullYear(),
      });
      cursor.setFullYear(cursor.getFullYear() + 1);
      cursor.setDate(cursor.getDate() + 1);
    }

    // Load cache and check if we have cached data for the years we need
    const cache = loadYearCache();

    const rangesToFetch = allRanges.filter(
      (range) => range.year === currentYear || !(range.year in cache),
    );

    const fetched =
      rangesToFetch.length > 0
        ? await fetchAllContributions(octokit, username, rangesToFetch)
        : new Map<number, RawContributionCalendar>();

    let cacheChanged = false;
    for (const [year, calendar] of fetched) {
      if (year !== currentYear) {
        cache[year] = calendar;
        cacheChanged = true;
      }
    }
    if (cacheChanged) saveYearCache(cache);

    const mergedCalendar: RawContributionCalendar = {
      totalContributions: 0,
      weeks: [],
    };
    for (const range of allRanges) {
      const calendar = fetched.get(range.year) ?? cache[range.year];
      if (!calendar) {
        throw new Error(`Missing contribution data for year ${range.year}`);
      }
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
