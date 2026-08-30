# Production baseline — 2026-08-30

Supabase project: `fkxbohbrfotbwmqalzyw`
Vercel project: `rawusa-rapid`

Critical live Edge Function versions at capture time:
- rescue-command-center v38 — sha256 `94f0703ffc3102ea06eb16ba6d113e867900329ae38e3a7898cbf796e33a472b`
- rescue-field v17 — sha256 `8c7559ee172d60f581becb8a8177a1ebd540c9453ac330e5f7d1ba35787cc2f1`
- rescue-tracker-api v8 — sha256 `b0a9acb3f2e2e7f4699dc07e908cad791425de110d44cf22ba334a9d0db181ed`
- rescue-deployment-api v1 — sha256 `74f84f9864caf465ebf4ddda55464f0a7d4defb1ea992abf3a530f922d8bd420`
- rescue-team-leader-roster v1 — sha256 `f04439a87790bf2c67a21f4d5dc0549f6e90784e0be677c763dc0fcb96fb14ef`
- rescue-tracking-consent-api v1 — sha256 `70de99a476dc996a480ca72c22daf5d7819ef0a271b61dd5a050f0953344b644`
- rescue-register-link v1 — sha256 `546915a1a55beeb092602403ee6a41cfa75ebb4ed54957cb04627a0d84b04537`
- scout-logo v2 — currently failing and scheduled for replacement with the exact uploaded Nepal Scouts PNG.

The database already contains timestamped GPS history in `rescue_locations` with `recorded_at`, `received_at`, latitude, longitude, accuracy, battery, event type and note.

This branch is a recovery marker for the state immediately before the GPS-history/team/export/logo change set.
