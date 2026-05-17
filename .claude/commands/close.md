Run the ticket close process for: $ARGUMENTS

First check if a pre-filled ticket close doc exists:
- docs/ticket_close.md — if the argument matches E01 or no argument is given and E01 is active
- docs/projects/<EPIC_ID>_ticket_close.md — for other epics

If a pre-filled doc exists: read it and execute the phases as written, filling in any [list] placeholders with real findings from the codebase.

If no pre-filled doc exists: read the template at docs/prompts/TICKET_CLOSE.md and execute it for the stated epic. The input block at the top must be completed before the four-point checklist runs.

All four phases must complete before sign-off: Drift Checklist → Compliance Verification → Sync Script → PR Description Draft.
