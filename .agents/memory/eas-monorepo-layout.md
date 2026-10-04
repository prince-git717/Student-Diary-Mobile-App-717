---
name: EAS monorepo layout
description: How to target the Student Diary app while keeping dependency installation rooted in the pnpm workspace.
---

EAS configuration for Student Diary belongs in `artifacts/student-diary`, the Expo app directory. The `pnpm-lock.yaml`, `pnpm-workspace.yaml`, and EAS ignore rules belong at the workspace Git root so EAS can archive the monorepo and install from its shared lockfile.

**Why:** The prior EAS setup was rooted at the monorepo package rather than the actual Expo app, while the dependency lockfile is intentionally shared by the workspace.

**How to apply:** Keep the app's `eas.json` and EAS project ID in the Student Diary directory; do not copy or regenerate the root pnpm lockfile.