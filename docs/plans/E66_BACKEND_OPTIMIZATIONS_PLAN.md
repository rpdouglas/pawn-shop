# Plan: E66_BACKEND_OPTIMIZATIONS

## Persona Impact Statement
- **Staff:** Will experience drastically reduced loading spinners when submitting AI metadata processing requests (Intake), as functions will stay warm and handle concurrent requests.
- **Developers:** Reduced architecture costs and modernized v2 deployment pipeline.

## Compliance Checklist
- **Function IAM:** Ensure the v2 Cloud Run instances inherit the correct service account permissions for Vertex AI and Firestore.

## Schema Audit
No database schema changes required.

## Strategies

### Strategy A: Minimal
- Migrate only the most heavily used functions (e.g., `processImageUpload`) to v2, leaving the rest on v1.

### Strategy B: Recommended
- Migrate the entire functions suite to v2. Set `concurrency: 80` and `minInstances: 0`. This allows multiple requests to share a single Cloud Run instance, virtually eliminating cold starts during business hours without paying for 24/7 idle time.

### Strategy C: Robust
- Strategy B + Set `minInstances: 1` to guarantee absolute zero cold starts even in the middle of the night (discarded via /grill-me to save cost).
