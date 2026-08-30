# DMT Rescue

Production recovery repository for Nepal Scouts DMT rescue operations.

## Change policy
- `main` is the stable/recoverable baseline.
- Functional changes are developed on named branches and reviewed through pull requests before merging.
- Supabase Edge Function source, database migrations, deployment notes, and recovery instructions are committed here before/with production changes.
- Never commit service-role keys, passwords, raw device tokens, or other secrets.

Initial repository bootstrap: 2026-08-30.
