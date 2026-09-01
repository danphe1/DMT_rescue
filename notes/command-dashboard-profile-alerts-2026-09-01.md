Command dashboard/profile/alert preview checkpoint

Requirements implemented in preview:
- Dashboard should show operational rescue status at a glance.
- Clickable Active, Live, In Mission, Returning, Safe and SOS cards open matching rescuer lists.
- Large OpenStreetMap remains on dashboard below team sections.
- Team +N More expands only that team's additional rescuers and collapses with Show Less.
- Rescuer profile uses one unified responsive screen, not overlapping old/new profile modals.
- Mission, Returning, Safe and SOS states use distinct colors and icons.
- Profile includes current GPS/tracking data and operational activity in one practical view.
- Broadcast Center includes quick SAFE Reminder, Return to Base and Emergency Alert buttons.
- Quick alerts use the production broadcast backend and attempt phone push notifications for active subscriptions.

Preview edge function: rescue-command-dashboard-profile-alerts-preview
Production Command not changed by this checkpoint.