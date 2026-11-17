# Gongshui Open Source

A home for selected open-source projects by Gongshui.

## Projects

### Pixel Daylight Switch
A pixel-art day/night transition experience with a glass-effect engine, embeddable components, scene examples, and mobile build artifacts.

- Source and documentation: [projects/pixel-daylight-switch](projects/pixel-daylight-switch/)
- Chinese README: [README.zh-CN.md](projects/pixel-daylight-switch/README.zh-CN.md)
- Japanese README: [README.ja.md](projects/pixel-daylight-switch/README.ja.md)

### Pixel Orbit
A pixel-art orbital world with interactive scenes, experiments, demos, and smoke tests.

- Source and documentation: [projects/pixel-orbit](projects/pixel-orbit/)
- Development guide: [DEVELOPMENT.md](projects/pixel-orbit/docs/DEVELOPMENT.md)
- [Live demo on GitHub Pages](https://gsvegetable.github.io/gongshui-open-source/)

## Repository layout

```
projects/
  pixel-daylight-switch/
  pixel-orbit/
.github/
  workflows/
```

Both projects were imported as Git subtrees. Their original commit histories are retained in this repository, and project files remain isolated under their respective directories.

## Automation

- Pixel Daylight Switch: package/browser quality checks, Android and iOS simulator builds, and npm publishing.
- Pixel Orbit: smoke tests and GitHub Pages deployment.

To publish Pixel Daylight Switch to npm from this repository, add an Actions repository secret named `NPM_TOKEN`, then create a tag in the format `pixel-daylight-v<package-version>`.
