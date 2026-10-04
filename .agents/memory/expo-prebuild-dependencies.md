---
name: Expo prebuild dependency changes
description: Expo prebuild can alter dependency placement and cause unrelated pnpm lockfile changes.
---

After `expo prebuild`, inspect package.json and the workspace lockfile. The command may promote Expo, React, and React Native from devDependencies into runtime dependencies. Lockfile-only refreshes can also rewrite unrelated peer snapshots, so keep only the required importer changes.

**Why:** A native APK build needs the app's runtime packages available during prebuild and bundling, but unrelated lockfile changes add risk outside the mobile artifact.

**How to apply:** Review package.json and pnpm-lock.yaml after prebuild; verify the lockfile is synchronized and unrelated workspace resolutions remain unchanged.