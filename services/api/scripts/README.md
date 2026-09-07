# Seed CLI

This repository includes a small seed script to create the database schema and insert a default agency and admin user.

Usage
------
From the project root run with `PYTHONPATH` set so the `app` package imports correctly.

Windows (PowerShell):

```powershell
Set-Location -LiteralPath "e:/CAllMind AI/call mind GENTIC-GEMINI"
$env:PYTHONPATH='.'
python scripts/seed.py --create-schema
```

Options
-------
- `--create-schema` : creates the database tables before seeding.

Behavior
--------
- Creates `Agency` and `User` records using the configured `DATABASE_URL` (or defaults from `app/core/config.py`).
- Prints the seeded agency and user IDs to STDOUT.

Notes
-----
- If you want to seed a test-specific database, set `DATABASE_URL` in the environment before running.
- The script is intentionally simple; consider using `typer` or `click` for more advanced CLI needs.
