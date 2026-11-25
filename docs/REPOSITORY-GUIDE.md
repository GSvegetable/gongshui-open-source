# Repository guide

> Repository: `GSvegetable/gongshui-open-source`  
> Checked: 2026-11-26

## Scope

This is a multi-project repository for independently runnable works. It is not a mirror of every work displayed on [Gongshui.com](https://xn--3bts89a.com/).

The repository currently contains two independent projects:

| Project | Source of truth | Current project version | Terms |
|---|---|---:|---|
| Pixel Daylight Switch | `projects/pixel-daylight-switch/` | npm package `3.1.1` | Unlicense; see the project's `LICENSE` |
| Pixel Orbit | `projects/pixel-orbit/` | `1.2.3` | No license is specified; copyright remains with the author. Do not redistribute or reuse without permission. |

There is deliberately no repository-wide product version or blanket license. A project’s version and license are defined by that project, not inferred from the repository name.

## Portfolio integration

The first two portfolio cards on `gongshui-pages` embed the published project pages:

- Pixel Daylight Switch: `https://gsvegetable.github.io/gongshui-open-source/pixel-daylight-switch/preview.html`
- Pixel Orbit: `https://gsvegetable.github.io/gongshui-open-source/showcase.html?scene=planet&composition=art`

The other three works currently belong to the website repository:

- Contributors Globe: `gongshui-pages/scripts/globe.js` plus its styles, data and assets.
- The Bookmark Hall: `gongshui-pages/scripts/bookmarks-corridor.js` plus its website bookmark-state integration.
- Navigation Interaction System: markup in `gongshui-pages/index.html`, behavior in `scripts/portfolio-preview.js`, and styles in `styles/portfolio-works.css`.

See the [website architecture document](https://github.com/GSvegetable/gongshui-pages/blob/main/docs/ARCHITECTURE.md) for file-level ownership and the criteria for extracting website-coupled works.

## Repository layout

```text
.github/workflows/                 # Active monorepo CI and deployment workflows
projects/
  pixel-daylight-switch/           # Package, browser component, mobile builds and docs
  pixel-orbit/                     # Three scenes, showcase, lab, docs and smoke tests
docs/
  REPOSITORY-GUIDE.md              # This repository's boundaries and maintenance rules
README.md                          # Repository entry point
```

## GitHub Actions

Only workflow files placed directly under the repository-root `.github/workflows/` directory are active GitHub Actions workflows for this repository.

The `.github/workflows/` folders nested inside individual project directories are retained standalone-project workflow snapshots from the imported project histories. GitHub does not execute those nested files as repository workflows. The active root workflows are adapted for this monorepo and set the correct `working-directory` or copy the project into the GitHub Pages artifact.

The root Pages workflow assembles the published site as follows:

1. Copy `projects/pixel-orbit/` to the published site root.
2. Copy `projects/pixel-daylight-switch/` to the published `pixel-daylight-switch/` subdirectory.
3. Deploy the assembled `_site/` directory.

This is why the live URLs omit the source-only `projects/` prefix. Do not change the portfolio iframe URLs to include `/projects/` unless the deployment assembly is changed at the same time.

## Versioning

- Pixel Daylight Switch: update `projects/pixel-daylight-switch/package.json`, its project changelog and the `pixel-daylight-v<version>` release tag together.
- Pixel Orbit: update its README version, `CHANGELOG.md`, and any release metadata together.
- The monorepo itself has no single semantic version.
- URL query values used for cache invalidation or embed composition are not automatically project release versions.

## Adding or extracting a project

Before adding a project here, make sure it has:

1. A standalone entry point that works without the portfolio host.
2. Its own assets and data paths.
3. No hidden dependency on website globals, private localStorage keys or host DOM selectors.
4. A project README and explicit license / usage terms.
5. A project-level changelog and versioning policy.
6. Tests or smoke checks appropriate to its runtime.
7. A root workflow configured for the monorepo paths and working directory.

Do not copy a site-owned implementation here while leaving the original active in `gongshui-pages`. First define which repository owns the source of truth and a stable integration API, then move the implementation and update the host embed in one coordinated change.
