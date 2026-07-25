import { getOctokit } from "@actions/github";
import { LanguageEntry, LanguageStats } from "./types";
import languageColors from "../data/language-colors.json";

const FETCH_LANGUAGES_QUERY = `
query($login: String!, $cursor: String) {
  user(login: $login) {
    repositories(
      first: 100
      after: $cursor
      ownerAffiliations: OWNER
      isFork: false
      orderBy: { field: PUSHED_AT, direction: DESC }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges {
            size
            node {
              name
              color
            }
          }
        }
      }
    }
  }
}`;

interface GQLLanguageEdge {
  size: number;
  node: { name: string; color: string | null };
}

interface GQLRepo {
  languages: { edges: GQLLanguageEdge[] };
}

interface GQLResponse {
  user: {
    repositories: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: GQLRepo[];
    };
  };
}

export async function fetchLanguageStats(
  username: string,
  token: string,
  topN = 8,
): Promise<LanguageStats> {
  const octokit = getOctokit(token);
  const colorMap = languageColors as Record<string, string>;
  const byteMap = new Map<string, { bytes: number; color: string }>();

  let cursor: string | null = null;
  let page = 0;
  const maxPages = 5;

  do {
    const response: GQLResponse = await octokit.graphql(FETCH_LANGUAGES_QUERY, {
      login: username,
      cursor,
    });

    const { nodes, pageInfo } = response.user.repositories;

    for (const repo of nodes) {
      for (const edge of repo.languages.edges) {
        const { name, color } = edge.node;
        const prev = byteMap.get(name);
        byteMap.set(name, {
          bytes: (prev?.bytes ?? 0) + edge.size,
          color: prev?.color ?? color ?? colorMap[name] ?? "#6e7681",
        });
      }
    }

    cursor = pageInfo.hasNextPage ? pageInfo.endCursor : null;
    page++;
  } while (cursor !== null && page < maxPages);

  // Sort descending by byte count
  const sorted = [...byteMap.entries()]
    .sort(([, a], [, b]) => b.bytes - a.bytes)
    .slice(0, topN);

  const totalBytes = sorted.reduce((sum, [, v]) => sum + v.bytes, 0);

  const languages: LanguageEntry[] = sorted.map(([name, v]) => ({
    name,
    bytes: v.bytes,
    color: v.color,
    percentage: totalBytes > 0 ? (v.bytes / totalBytes) * 100 : 0,
  }));

  return { languages, username };
}
