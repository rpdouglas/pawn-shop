# E57 — Cannabis Database Seeding Plan

## Objective
Establish a reliable and scalable method to ingest public/open cannabis dataset records into our internal `cannabisStrains` Firestore collection, ensuring high-quality reference data for our AI Intake extraction process.

---

## Strategy A: Minimal (Static Hardcoded Seed)
Create a basic Node.js script that downloads a known static JSON/CSV dataset and performs simple mapping without extensive data cleaning. Any malformed rows are dropped.

* **Pros:** Extremely fast to implement. Good enough for an MVP.
* **Cons:** Brittle. Dirty data from public sources (like trailing spaces or weird comma formats) will pollute the database. Hardcoded to one specific dataset format.
* **Persona Impact (Staff):** Will occasionally encounter AI hallucinations or missing fields if the reference data was imported poorly.
* **Compliance Checklist:** No PII handling required (public strain data only).
* **Schema Audit:** Uses existing `cannabisStrains` schema.

---

## Strategy B: Recommended (Batched ETL Pipeline Script)
Write a robust Node.js seeder script (`scripts/seed-public-dataset.mjs`) that acts as an ETL (Extract, Transform, Load) pipeline. It fetches the public data, aggressively cleans and normalizes it (converting CSV strings to arrays, normalizing ranges, enforcing types), and securely bulk-loads the data into Firestore using batched writes (500 docs per batch).

* **Pros:** Ensures high data integrity. Handles large datasets (10k+ strains) gracefully without hitting rate limits. Executable safely from the developer environment.
* **Cons:** Requires a developer to run the script when new datasets need to be imported.
* **Persona Impact (Staff):** Excellent. Staff get highly reliable, normalized data during AI intake, reducing manual edits.
* **Compliance Checklist:** Validates all data against strict TypeScript interfaces before insertion, preventing schema drift.
* **Schema Audit:** perfectly aligns with the `cannabisStrains` schema.

---

## Strategy C: Robust (Admin Portal CSV Uploader UI)
Build a complete Admin UI in the staff portal allowing non-technical managers to upload CSV files. The UI passes the file to a scheduled/background Cloud Function that parses the CSV, cleans the data, and updates Firestore while tracking progress in a new `datasetJobs` collection.

* **Pros:** Zero developer dependency for future updates. Non-technical staff can manage the database.
* **Cons:** Significant engineering overhead to build a reliable, chunked CSV upload UI and a robust background job runner. Overkill if the dataset rarely changes.
* **Persona Impact (Admin Staff):** Full autonomy to update strain data without touching code.
* **Compliance Checklist:** Requires locking down the UI and Cloud Function to `admin` custom claims only.
* **Schema Audit:** Requires extending `docs/firestore-schema.md` with a new `datasetJobs/{id}` tracking collection.

---

## Recommendation
**Strategy B** is the clear winner for our current scale. The cannabis strain catalog (historical lineages and profiles) does not change frequently enough to justify building an entire Admin UI (Strategy C). A robust developer script gives us the data integrity we need with minimal overhead.
