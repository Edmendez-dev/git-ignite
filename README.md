# GitIgnite

![Banner GitIgnite](./assets/gitignite_banner.png)

<div align="center" style="margin-top: 30px">

[![GitHub release](https://img.shields.io/github/v/release/Edmendez-dev/git-ignite?include_prereleases)](https://github.com/Edmendez-dev/git-ignite/releases)
[![License](https://img.shields.io/github/license/Edmendez-dev/git-ignite)](./LICENSE)
[![GitHub Action](https://img.shields.io/badge/GitHub%20Action-GitIgnite-orange)](https://github.com/Edmendez-dev/git-ignite)
[![Node 20](https://img.shields.io/badge/Node-20-green)](https://nodejs.org/)
![Status](https://img.shields.io/badge/Status-Active-28a745?style=flat-square)

GitIgnite is a GitHub Action that automatically generates animated SVG cards to display profile statistics, such as your **day streak** and your **top languages**, using workflows.

[What is GitIgnite?](#what-is-gitIgnite?) • [Main Features](#main-features) • [Themes](#themes) • [How to Use](#how-to-use) • [Inputs](#inputs) • [Outputs](#outputs) • [Generated Files](#generated-files) • [Project Structure](#project-structure) • [Development](#development) • [Documentación extra](#documentación-extra) • [Contributing](#contributing) • [Guidelines](#guidelines) • [License](#license) • [Author](#author) • [Acknowledgments](#acknowledgments)

</div>

## What is GitIgnite?

GitIgnite queries GitHub data (contributions and languages), calculates useful metrics, and generates two SVG cards:

1. **Streak Card**: current streak, intensity level, and cumulative contributions.
2. **Language Card**: top languages ​​with bars and an animated donut chart.

It's ideal for profile READMEs, personal repositories, or dashboards based on GitHub Actions.

## Main Features

- Streak calculation with continuity logic.
- Top languages ​​by actual usage (bytes added).
- 6 ready-to-use themes.
- Lightweight, embeddable animated SVGs in the README.
- Simple integration into existing workflows.

## Themes

GitIgnite includes six themes designed for different personal branding styles:

- **`Classic`**: A professional, clean, and balanced GitHub-style look.
- **`Neon`**: A cyberpunk aesthetic with high contrast and visual energy.
- **`Obsidian`**: High-end, dark minimalism with elegant details.
- **`Emerald`**: Intense green with a fresh and modern feel.
- **`Pink`**: Vibrant, creative, and full of personality.
- **`Terminal`**: A retro-hacker style, perfect for command-line enthusiasts.

### Classic

<div align="center">
  <img src="./assets/classic-theme/ignite-streak.svg" alt="GitIgnite Classic Streak" style="display:block;margin:0 auto;max-width:100%;" />
  <img src="./assets/classic-theme/ignite-languages.svg" alt="GitIgnite Classic Languages" style="display:block;margin:12px auto 0;max-width:100%;" />
</div>

### Neon

<div align="center">
  <img src="./assets/neon-theme/ignite-streak.svg" alt="GitIgnite Neon Streak" style="display:block;margin:0 auto;max-width:100%;" />
  <img src="./assets/neon-theme/ignite-languages.svg" alt="GitIgnite Neon Languages" style="display:block;margin:12px auto 0;max-width:100%;" />
</div>

### Obsidian

<div align="center">
  <img src="./assets/obsidian-theme/ignite-streak.svg" alt="GitIgnite Obsidian Streak" style="display:block;margin:0 auto;max-width:100%;" />
  <img src="./assets/obsidian-theme/ignite-languages.svg" alt="GitIgnite Obsidian Languages" style="display:block;margin:12px auto 0;max-width:100%;" />
</div>

### Emerald

<div align="center">
  <img src="./assets/emerald-theme/ignite-streak.svg" alt="GitIgnite Emerald Streak" style="display:block;margin:0 auto;max-width:100%;" />
  <img src="./assets/emerald-theme/ignite-languages.svg" alt="GitIgnite Emerald Languages" style="display:block;margin:12px auto 0;max-width:100%;" />
</div>

### Rose

<div align="center">
  <img src="./assets/rose-theme/ignite-streak.svg" alt="GitIgnite Rose Streak" style="display:block;margin:0 auto;max-width:100%;" />
  <img src="./assets/rose-theme/ignite-languages.svg" alt="GitIgnite Rose Languages" style="display:block;margin:12px auto 0;max-width:100%;" />
</div>

### Terminal

<div align="center">
  <img src="./assets/terminal-theme/ignite-streak.svg" alt="GitIgnite Terminal Streak" style="display:block;margin:0 auto;max-width:100%;" />
  <img src="./assets/terminal-theme/ignite-languages.svg" alt="GitIgnite Terminal Languages" style="display:block;margin:12px auto 0;max-width:100%;" />
</div>

## How to Use

GitIgnite is a GitHub Action that generates SVG cards with your GitHub statistics (contribution streak, most used languages, etc.) to display in your profile's README.

There are two ways to use this repository depending on what you want to do:

- **[Normal Use](#-normal-use)** — if you only want to display your statistics in your GitHub profile.

- **[Contribute to the project](#-contribute-test)** — if you want to modify GitIgnite and test your changes before opening a Pull Request.

---

### Normal Use

#### 1. Create (or use) your profile repository

If you don't already have one, create a repository with the same name as your GitHub username (e.g., `Edmendez-dev/Edmendez-dev`). This is the special repository whose README is displayed in your profile.

#### 2. Create a dedicated branch for the result.

GitIgnite generates SVG files that are saved in the repository. To prevent this from cluttering your commit history in `main`, we recommend using a dedicated branch:

```bash
git checkout --orphan gitignite-output
git commit --allow-empty -m "init: gitignite output branch"
git push origin gitignite-output
```

`--orphan` creates a branch with no shared history from `main`, completely isolated. This branch will only contain the generated SVGs — never your code or other files.

#### 3. Generate a Personal Access Token (PAT)

GitIgnite needs to read your statistics (including private repositories if you want them to count). Go to:

**GitHub → Settings → Developer settings → Personal access tokens** and generate a token with the scope `repo`.

Save it—it's only displayed once.

#### 4. Add the token as a secret

In your profile repository: **Settings → Secrets and variables → Actions → New repository secret**.

- **Name:** `GH_PAT`
- **Value:** the token you generated

#### 5. Create the workflow

In your profile repository, create the file `.github/workflows/gitignite.yml`:

```yaml
name: GitIgnite Profile Stats

on:
  schedule:
    - cron: "0 */12 * * *" # It is updated every 12 hours
  workflow_dispatch: # You can also run it manually

permissions:
  contents: write

jobs:
  generate-stats:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: gitignite-output

      - name: Restore years cache
        uses: actions/cache/restore@v4
        with:
          path: .gitignite-cache
          key: gitignite-years-${{ github.repository_owner }}-${{ github.run_id }}
          restore-keys: |
            gitignite-years-${{ github.repository_owner }}-

      - name: Generate GitIgnite cards
        uses: Edmendez-dev/git-ignite@v1
        with:
          gh_token: ${{ secrets.GH_PAT }}
          user_name: ${{ github.repository_owner }}
          theme: classic
          output_path: stats

      - name: Commit y push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add stats/*.svg
          git diff --staged --quiet || (git commit --amend --no-edit && git push --force)

      - name: Save years cache
        if: always()
        uses: actions/cache/save@v4
        with:
          path: .gitignite-cache
          key: gitignite-years-${{ github.repository_owner }}-${{ github.run_id }}
```

> 💡 This workflow **never touches `main`** — it only reads from and writes to the `gitignite-output` branch. Furthermore, instead of creating a new commit each time it runs, it rewrites the same commit (`--amend --no-edit`), so even if it runs several times a day, your history won't be filled with duplicate commits.

#### 6. Run the workflow for the first time

Go to the **Actions** tab of your repo → select "GitIgnite Profile Stats" → **Run workflow**. This generates the SVGs for the first time in the `gitignite-output` branch.

#### 7. Display the images in your README

In the README of your profile repo (main branch), add:

```md
![GitIgnite Streak](https://raw.githubusercontent.com/TU-USUARIO/TU-USUARIO/gitignite-output/stats/ignite-streak.svg)

![GitIgnite Languages](https://raw.githubusercontent.com/TU-USUARIO/TU-USUARIO/gitignite-output/stats/ignite-languages.svg)
```

Replace `YOUR-USERNAME` with your GitHub username in both parts of the URL. Done — your cards will automatically update every 12 hours.

### Inputs

| Input         | Required | Default   | Description                              |
| ------------- | -------- | --------- | ---------------------------------------- |
| `gh_token`    | Yes      | -         | GitHub token to query statistics.        |
| `user_name`   | yes      | -         | GitHub user to analyze.                  |
| `theme`       | No       | `classic` | Output visual theme.                     |
| `show_levels` | No       | `true`    | Support for displaying intensity levels. |
| `output_path` | No       | `stats`   | Output directory for SVGs.               |

#### Changing the theme

By default, GitIgnite uses the `classic` theme. If you want a different style, simply change the value of the `theme` input in your workflow, **[list of themes](#themes)**:

```yaml
- name: Generate GitIgnite cards
  uses: Edmendez-dev/git-ignite@v1
  with:
    gh_token: ${{ secrets.GH_PAT }}
    user_name: ${{ github.repository_owner }}
    theme: neon # <-- Change it here
    output_path: stats
```

> 💡 If you misspell a theme name (or use one that doesn't exist), GitIgnite won't fail—it will automatically revert to `classic` and alert you with a `warning` in the workflow logs, showing the complete list of available themes.

You don't need to recreate the secret or change anything else—just change the value of `theme`, push the workflow, and run the action again (or wait for the next scheduled execution).

---

## Generated Files

By default, the following are created:

- `stats/ignite-streak.svg`
- `stats/ignite-languages.svg`

## Project Structure

```txt
git-ignite/
├─ action.yml
├─ src/
│  ├─ index.ts
│  ├─ data/
│  │  └─ language-colors.json
│  ├─ engine/
│  │  ├─ calculator.ts
│  │  ├─ github.ts
│  │  ├─ languages.ts
│  │  └─ types.ts
│  └─ renderer/
│     ├─ streak-builder.ts
│     ├─ languages-builder.ts
│     ├─ flame-frames.ts
│     └─ themes/
│        ├─ index.ts
│        ├─ classic.ts
│        ├─ neon.ts
│        ├─ obsidian.ts
│        ├─ emerald.ts
│        ├─ rose.ts
│        └─ terminal.ts
├─ assets/
├─ dist/
└─ test/
   └─ test-local.ts
```

## Development

### Requirements

- Node.js 22+
- npm

### Commands

```bash
npm install
npm run build
npm run format
npm run lint
```

### Testing

```bash
npm run test
```

## Contributing

Contributions are welcome! Please follow these steps:

#### 1. **Fork the repository**

#### 2. **Create a feature branch**

```bash
git checkout -b feature/amazing-feature
```

#### 3. **Install dependencies and make your changes** with clear commit messages

```bash
npm install
```

Edit what you need inside `src/`.

#### 4. **Compile the bundle**

GitHub Actions do not execute `src/` directly — they need the code already packaged in `dist/`:

```bash
npm run build
```

This generates `dist/index.js`, which **must be uploaded to the repo** (unlike other projects, here `dist/` does not go in `.gitignore`, because it is what GitHub Actions actually executes).

#### 5. **Add the test secret**

In your fork: **Settings → Secrets and variables → Actions**, add a secret `GH_PAT` with one of your tokens (scope `repo`), so that the action has something to authenticate with during testing.

#### 6. **Use the test workflow**

This repo includes `.github/workflows/test-action.yml`, designed specifically for this flow — it runs the action **from the local source code** (`uses: ./`), without depending on any tags or releases:

```yaml
name: Test GitIgnite

on:
  workflow_dispatch:
  push:
    branches:
      - feature/amazing-feature # <-- Write your development branch here

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run GitIgnite (local build)
        uses: ./
        with:
          gh_token: ${{ secrets.GH_PAT }}
          user_name: Edmendez-dev
          theme: classic
          output_path: stats

      - name: Upload SVG for review
        uses: actions/upload-artifact@v4
        with:
          name: gitignite-preview
          path: stats/*.svg
```

> ⚠️ Adjust the branch name in `branches:` to match yours (e.g., `feat/my-change`), or simply trigger the workflow manually without relying on the push.

This workflow **doesn't commit or push anywhere** — it only generates the SVGs and uploads them as a downloadable artifact, so you can review them visually without affecting any branch.

#### 7. **Run the workflow and review the result**

1. Push your branch: `git push origin feat/my-change`

2. Go to the **Actions** tab of your fork → select "Test GitIgnite" → **Run workflow**, choosing your branch.

3. When it finishes, scroll down to the **Artifacts** section of that run and download `gitignite-preview`.

4. Open the SVG and confirm that it looks correct.

Repeat the cycle (edit → `npm run build` → commit → push → run workflow) until your change is ready.

#### 8. Open the Pull Request

Once you've visually confirmed that your change works, open the pull request against `main`. Include a screenshot of the SVG generated during your testing in the description—it greatly helps with the review.

---

### Why two different workflows?

|                                  | `gitignite.yml` (production)                     | `test-action.yml` (contribution)           |
| -------------------------------- | ------------------------------------------------ | ------------------------------------------ |
| Where you live                   | In the repo of **each user** who uses GitIgnite  | Within **this repo**                       |
| Source of the action             | `Edmendez-dev/git-ignite@v1` (published version) | `./` (local code, unpublished)             |
| What does he do with the result? | Commit it to the `gitignite-output` branch       | Upload it as an artifact for manual review |
| Touch `main`/`gitignite-output`  | Only `gitignite-output`, never `main`            | It doesn't touch any branch of the repo    |

This separation exists so that trusting GitIgnite is easy to verify: the action never writes directly to your repo on its own — it's the workflow (which you control and can read) that decides what to do with the result.

### Guidelines

- Write clean, commented code
- Add tests for new functionality
- Update documentation
- Follow existing code patterns

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Eduardo Méndez**  
GitHub: [@Edmendez-dev](https://github.com/Edmendez-dev)

## Acknowledgments

- GitHub Actions for automation infrastructure.
- GitHub GraphQL API for the contribution and language data feed.
- Open source community to inspire continuous improvements to profiling tools.

<div align="center">

**⭐ If you find this project helpful, please consider giving it a star!**

[Report Bug](https://github.com/Edmendez-dev/git-ignite/issues) • [Request Feature](https://github.com/Edmendez-dev/git-ignite/issues)

</div>
