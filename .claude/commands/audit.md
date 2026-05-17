Read the full process at docs/prompts/CODEBASE_AUDIT.md and execute it.

$ARGUMENTS

Run all three phases: Codebase Ingestion (architecture trace + feature map + rules audit) → Documentation Comparison (schema, CONTEXT.md, EPICS.md, PERSONAS.md drift) → Gap Report.

Produce only the gap report — no code changes in this pass. Wait for explicit approval on which gaps to address before touching any file.
