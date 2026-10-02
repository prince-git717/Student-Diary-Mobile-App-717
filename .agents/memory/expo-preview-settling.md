---
name: Expo preview settling
description: A transient blank frame observed immediately after restarting the Student Diary Expo web preview.
---

An Expo web preview can briefly show a blank white frame immediately after a workflow restart or screen hot reload, then render correctly once Metro finishes bundling. Check for the completed bundle in workflow logs and take another preview capture before treating the first blank frame as an app failure.

**Why:** This happened more than once during screen verification; a follow-up capture showed the expected UI without a code fix.

**How to apply:** For this Expo artifact, if the first screenshot after restart is blank but Metro is running, wait for the bundle log and retry the screenshot once.