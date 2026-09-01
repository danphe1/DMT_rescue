Command UI refinement preview checkpoint (2026-09-01)

Preview function: rescue-command-card-density-preview

Changes prepared:
- Responsive rescuer team grid targeting 6 cards on large screens, 7 on very wide screens, scaling down by viewport.
- Larger rectangular/square-ish profile photos, no circular cards.
- Rescuer cards show phone, GPS coordinates, mission status and team-leader badge.
- Expanded +More team members receive full detail cards instead of empty placeholders.
- Profile burger menu gains Full Details, Open in Google Maps and Close Profile.
- Full Details loads profile data through rescue-command-api profile action.
- Primary large rescue map remains Leaflet/OpenStreetMap. Google Maps is optional from profile menu only.
- Production not changed by this checkpoint.
