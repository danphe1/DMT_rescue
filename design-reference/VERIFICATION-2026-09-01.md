# Command Dashboard Design Verification — 2026-09-01

Branch: `feature/rescue-approved-ui-and-tracking`

Production promotion: **NOT APPROVED / NOT PERFORMED**

## Approved references

- `side menu.png` — left Command sidebar and System Status reference.
- `team.png` — compact team header reference.
- `f340149c-56e5-4431-a723-75442d27675d.png` — approved dashboard/profile/details reference.

## Verified dashboard requirements

- [x] Desktop dashboard uses a fixed left sidebar with **All Teams** at top.
- [x] Sidebar contains **All Rescuer Details, Team Details, Messages, Reports, Alerts, Settings**.
- [x] **System Status** block is anchored at the bottom of the sidebar.
- [x] Dashboard top header shows **Last Updated date and time**.
- [x] Top-header **Refresh** is an interactive button and calls the existing `load()` data refresh before updating the timestamp.
- [x] Team dashboard header shows **team name + member count**, not the permanent team code.
- [x] **Team Code, Copy Code, Export** are removed from the team dashboard header.
- [x] Permanent team code, **Copy Code**, and **Export** remain available inside **Team Details**.
- [x] Team header retains collapse/expand, team-management/add, and archive controls.
- [x] Team headers retain distinct solid colors.
- [x] Rescuer mini cards retain profile photo/fallback, ONLINE/OFFLINE state, mission state, square mini map, and three-dot actions.
- [x] GPS indicator only receives the blinking class when a recent GPS timestamp and valid coordinates are present; login/authentication alone does not trigger GPS blinking.
- [x] Existing production Command backend remains the data source; the preview wrapper does not replace authentication, teams, GPS history, messages, SOS, approvals, exports, or profile administration.
- [x] Responsive rules are present for desktop, tablet and mobile dashboard layouts.

## Source verification

Preview Edge Function: `rescue-command-approved-ui-preview`

The preview is a wrapper around the existing `rescue-command-center` function. It injects only the approved dashboard/navigation presentation and calls the existing Command API/functions for data and actions.

## Live safety gate

Do **not** promote this preview to `rescue-command-center` until the design has been reviewed/approved. Production must remain untouched until then.
