import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory paths in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

function printUsage() {
  console.log('\x1b[36m%s\x1b[0m', 'Pawn Shop Governance Plan Helper');
  console.log('Usage: npm run governance:plan <PROJECT_SPEC_FILENAME>');
  console.log('Example: npm run governance:plan E39_Admin_Audit_Logs');
}

async function run() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    printUsage();
    process.exit(1);
  }

  let specFilename = args[0];
  if (!specFilename.endsWith('.md')) {
    specFilename += '.md';
  }

  const specPath = path.join(projectRoot, 'docs/projects', specFilename);
  if (!fs.existsSync(specPath)) {
    console.error(`\x1b[31mError: Project spec not found at: ${specPath}\x1b[0m`);
    process.exit(1);
  }

  // Parse details from the Project Spec
  const specContent = fs.readFileSync(specPath, 'utf8');
  
  // Extract project name, epic, phase, personas
  const nameMatch = specContent.match(/# Project (E\d+): (.*)/);
  const epicMatch = specContent.match(/\*\*Epic:\*\* (.*)/);
  const phaseMatch = specContent.match(/\*\*Phase:\*\* (.*)/);
  const personaMatch = specContent.match(/\*\*Primary Persona:\*\* (.*)/);
  
  const epicId = nameMatch ? nameMatch[1] : 'E##';
  const featureName = nameMatch ? nameMatch[2].trim() : 'Feature';
  const epicName = epicMatch ? epicMatch[1].trim() : 'Epic Name';
  const phaseName = phaseMatch ? phaseMatch[1].trim() : 'Phase Name';
  const primaryPersona = personaMatch ? personaMatch[1].trim() : 'Staff';
  
  const featureSlug = featureName.replace(/\s+/g, '_');
  const planFilename = `${epicId}_${featureSlug}_PLAN.md`;
  const planPath = path.join(projectRoot, 'docs/plans', planFilename);

  if (fs.existsSync(planPath)) {
    console.error(`\x1b[31mError: Strategy plan already exists at: ${planPath}\x1b[0m`);
    process.exit(1);
  }

  // Generate strategy plan boilerplate
  const planContent = `# Feature Plan: ${featureName}

This plan details the implementation strategies for the ${featureName} feature, aligned to ${epicName}.

## User Review Required

> [!IMPORTANT]
> Document anything that requires user review or feedback, for example, breaking changes or significant design decisions.

## Open Questions

> [!WARNING]
> Highlight any clarifying questions for the user that will impact the implementation strategies.

---

## Phase 1 — Persona & Compliance Gate

### 1.1 Identify the Persona
*   **Primary Persona:** ${primaryPersona}
*   **UX Constraints Check:** Confirm alignment with the acceptance criteria defined in [${specFilename}](file:///workspaces/pawn-shop/docs/projects/${specFilename}).

### 1.2 Compliance Gate

State how the compliance requirements are met:
- **Age gate required?** (cannabis 19+, fireworks 18+) — [Describe routing/gate protection if applicable]
- **\`auditLogs\` events:** [Define eventType and log fields, or NONE]
- **PII exclusion:** [Confirm zero names, emails, phone numbers inside logs/analytics]
- **\`policeHold\` compliance:** [Confirm query filter or NONE]
- **\`aiDescription\` isolation:** [Confirm internal/ai draft storage or NONE]

---

## Phase 2 — Schema Audit

List all Firestore collections, security rules, and schemas involved.

\`\`\`
Collections impacted:
- [collection_path] — fields: [fields]

New fields required: NONE | [field name, type, collection — update schema first]
\`\`\`

---

## Phase 3 — Three-Strategy Proposal

### Strategy A — Minimalist Approach

**Summary:** [One sentence summary]

*   **Architecture:**
    *   Where does the logic live? (Cloud Function / client hook / etc.)
    *   What Firestore operations are required?
*   **Persona Lens:**
    *   How does this serve ${primaryPersona}?
*   **Compliance:**
    *   How does this satisfy the compliance gates?
*   **Trade-offs:**
    *   *Gains:* [gains]
    *   *Sacrifices:* [sacrifices]
*   **Estimated scope:** Small — [approximate component/file count]

---

### Strategy B — Recommended Balanced Approach

**Summary:** [One sentence summary]

*   **Architecture:**
    *   Full feature implementation utilizing standard frameworks and services.
*   **Persona Lens:**
    *   Best alignment with ${primaryPersona}'s hard UX requirements.
*   **Compliance:**
    *   Rigorous integration of all compliance checks.
*   **Trade-offs:**
    *   *Gains:* Long-term maintainability, complete compliance coverage, clean UX.
    *   *Sacrifices:* Slightly higher initial build scope.
*   **Estimated scope:** Medium — [approximate component/file count]

---

### Strategy C — Robust Scale Approach

**Summary:** [One sentence summary]

*   **Architecture:**
    *   High-availability, high-redundancy, or real-time event-driven approach.
*   **Persona Lens:**
    *   Extensive visual hooks, notifications, or real-time indicators.
*   **Compliance:**
    *   Strict transactional assertions or background sync pipelines.
*   **Trade-offs:**
    *   *Gains:* Peak scalability and performance.
    *   *Sacrifices:* High complexity and index overhead.
*   **Estimated scope:** Large — [approximate component/file count]

---

### Recommendation

State which strategy is recommended and in one paragraph explain why it best serves ${primaryPersona}'s UX constraints and compliance rules.

---

## Phase 4 — Anti-Regression Protocol

Verify against Pawn Shop active guardrails:
1.  **The Hardcoded Hex Trap:** All colours must use \`var(--color-primary)\` and \`.view-*\` cascade variables.
2.  **The Firestore Field Invention Trap:** Verify all field additions are logged in \`docs/firestore-schema.md\` before execution.
3.  **The Client-Side AI Key Trap:** Ensure all AI operations run inside Cloud Functions.
4.  **The Scarcity Manufacture Trap:** Check that all countdowns or tags are campaign-date or staff-bound only.
5.  **The PII Log Trap:** Double check that no customer data escapes to console or \`auditLogs\`.
6.  **The Motion Trap:** Confirm animations use \`--motion-speed-*\` tokens and approved visual patterns.

---

## Phase 5 — Output & Storage

The full plan is saved to this file: \`docs/plans/${planFilename}\`.

*The Pawn Shop · docs/plans/${planFilename} · v1.0*
`;

  fs.writeFileSync(planPath, planContent, 'utf8');

  console.log('\x1b[32m%s\x1b[0m', `✓ Strategy Plan template created successfully!`);
  console.log(`Path: docs/plans/${planFilename}`);
  console.log(`Linked spec: docs/projects/${specFilename}\n`);
  console.log(`Next step: Flesh out your 3 strategies inside the plan, then print the summary in chat:`);
  console.log(`  > "I have drafted the implementation plan and saved it to docs/plans/${planFilename}."`);
  console.log(`  And wait for explicit user approval before writing code.`);
}

run().catch((err) => {
  console.error('\x1b[31m%s\x1b[0m', 'Fatal Error:');
  console.error(err);
  process.exit(1);
});
