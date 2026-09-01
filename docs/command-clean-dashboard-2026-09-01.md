# Command clean dashboard checkpoint

Branch: feature/command-clean-dashboard-2026-09-01

Preview function: rescue-command-clean-dashboard-preview

Goals implemented in preview:
- Dense team cards using available width; 6 columns on large screens.
- Remove empty mini-map/profile-button space from team cards; whole card opens profile.
- More Rescuers expands only the selected team and uses the same detailed card format.
- Team cards show phone, GPS coordinates, online/offline, mission status, and TEAM LEADER marker.
- Large dashboard map remains Leaflet/OpenStreetMap and is moved below team sections.
- Coordinator email, Refresh, and Logout positioned on the right; cyan live date/time centered in header.
- Rescuer profile gets an Operational Log & Route Detail section using activity and gps_track APIs.
- Explicit Close button added in profile header.

This is a preview checkpoint only. Do not promote to production without explicit approval and verification.