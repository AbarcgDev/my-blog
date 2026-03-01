#!/usr/bin/env node
// scripts/sync-projects.mjs
// Fetches pinned repos from GitHub profile and generates Astro content collection files.
// Usage: node scripts/sync-projects.mjs
// Optional: GITHUB_TOKEN env var for higher rate limits

import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PROJECTS_DIR = join(ROOT, 'src', 'content', 'projects');
const GITHUB_USER = 'AbarcgDev';

// ─── Config ────────────────────────────────────────────────────
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const headers = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'portfolio-sync-script',
};
if (GITHUB_TOKEN) {
  headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
}

// ─── Helpers ───────────────────────────────────────────────────
async function fetchJSON(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText} for ${url}`);
  }
  return res.json();
}

async function fetchReadme(owner, repo) {
  try {
    const data = await fetchJSON(`https://api.github.com/repos/${owner}/${repo}/readme`);
    // The content is base64 encoded
    return Buffer.from(data.content, 'base64').toString('utf-8');
  } catch {
    console.warn(`  ⚠ No README found for ${owner}/${repo}`);
    return '';
  }
}

async function fetchLanguages(owner, repo) {
  try {
    const data = await fetchJSON(`https://api.github.com/repos/${owner}/${repo}/languages`);
    return Object.keys(data);
  } catch {
    return [];
  }
}

// ─── Pinned Repos via Profile Scraping ─────────────────────────
// GitHub doesn't expose pinned repos via REST API.
// We scrape the profile page HTML to extract them, then enrich with REST API data.
async function fetchPinnedRepoNames() {
  const res = await fetch(`https://github.com/${GITHUB_USER}`, {
    headers: { 'User-Agent': 'portfolio-sync-script' },
  });
  const html = await res.text();

  // Extract pinned repo names from the profile HTML
  // Pattern: links like /AbarcgDev/repo-name in the pinned section
  const pinnedRegex = new RegExp(
    `/${GITHUB_USER}/([\\w.-]+)`,
    'g'
  );

  // Find the pinned section (between "Pinned" header and next section)
  const pinnedSection = html.match(
    /class="js-pinned-items-reorder-container"[\s\S]*?<\/ol>/
  );

  if (!pinnedSection) {
    console.warn('⚠ Could not find pinned section in profile. Falling back to starred repos.');
    return null;
  }

  const repoNames = new Set();
  let match;
  while ((match = pinnedRegex.exec(pinnedSection[0])) !== null) {
    repoNames.add(match[1]);
  }

  return [...repoNames];
}

async function fetchRepoDetails(owner, repo) {
  return fetchJSON(`https://api.github.com/repos/${owner}/${repo}`);
}

// ─── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('🔄 Syncing pinned GitHub projects...\n');

  // Step 1: Get pinned repo names
  let repoNames = await fetchPinnedRepoNames();

  if (!repoNames || repoNames.length === 0) {
    console.log('No pinned repos found. Fetching starred repos as fallback...');
    const starred = await fetchJSON(
      `https://api.github.com/users/${GITHUB_USER}/starred?per_page=10`
    );
    repoNames = starred
      .filter((r) => r.owner.login === GITHUB_USER && !r.fork)
      .map((r) => r.name);
  }

  console.log(`📌 Found ${repoNames.length} pinned repos: ${repoNames.join(', ')}\n`);

  // Step 2: Clean and recreate projects directory
  if (existsSync(PROJECTS_DIR)) {
    rmSync(PROJECTS_DIR, { recursive: true });
  }
  mkdirSync(PROJECTS_DIR, { recursive: true });

  // Step 3: For each pinned repo, fetch details + README and write .md
  for (const repoName of repoNames) {
    console.log(`📦 Processing ${repoName}...`);

    const [repo, readme, languages] = await Promise.all([
      fetchRepoDetails(GITHUB_USER, repoName),
      fetchReadme(GITHUB_USER, repoName),
      fetchLanguages(GITHUB_USER, repoName),
    ]);

    const slug = repo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const tags = [
      ...new Set([
        ...(repo.topics || []),
        ...(languages.slice(0, 3)),
        ...(repo.language ? [repo.language] : []),
      ]),
    ];

    const frontmatter = [
      '---',
      `title: "${repo.name}"`,
      `description: "${(repo.description || 'Sin descripción').replace(/"/g, '\\"')}"`,
      `pubDate: "${repo.created_at}"`,
      `updatedDate: "${repo.pushed_at}"`,
      `repoUrl: "${repo.html_url}"`,
      `language: "${repo.language || 'N/A'}"`,
      `stars: ${repo.stargazers_count}`,
      `tags: [${tags.map((t) => `"${t}"`).join(', ')}]`,
      '---',
    ].join('\n');

    const content = `${frontmatter}\n\n${readme}`;
    const filePath = join(PROJECTS_DIR, `${slug}.md`);

    writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✅ Written ${slug}.md (${tags.length} tags, ${readme.length} chars README)\n`);
  }

  console.log(`\n🎉 Done! ${repoNames.length} projects synced to src/content/projects/`);
}

main().catch((err) => {
  console.error('❌ Sync failed:', err.message);
  process.exit(1);
});
