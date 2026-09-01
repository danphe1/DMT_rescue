# Approved Rescue UI Reference

This branch implements the approved Nepal Scouts rescue UI supplied by the user on 2026-09-01.

Reference attachments used as the visual source of truth:

- `side menu.png` — 242×922 — desktop Command sidebar and System Status layout.
- `team.png` — 964×62 — compact team header reference.
- `f340149c-56e5-4431-a723-75442d27675d.png` — 2048×751 — approved three-screen reference for Command Dashboard, Rescuer Profile, and All Rescuer Details.

Required dashboard changes from the approved reference:

- Fixed desktop sidebar with All Teams, All Rescuer Details, Team Details, Messages, Reports, Alerts, Settings, and System Status.
- Team code, Copy Code, and Export must not appear in the team header; they belong in Team Details.
- Team headers retain collapse/expand/add/manage/archive controls and solid team colors.
- Top header shows Last Updated date/time and a working Refresh action.
- Dashboard cards retain profile photo, online/offline state, mission state, mini-map, and three-dot actions.
- GPS indicator blinks only while GPS data is actively arriving.
- Existing authentication, teams, GPS history, messaging, SOS, approvals, exports, and admin behavior must be preserved.

The full functional specification is the user-provided `Pasted text (2).txt` in the project conversation. No production promotion is allowed until the preview is design-verified and approved.