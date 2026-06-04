# Antigravity CLI Optimization Report
**Target Audience:** Solo Developer
**Goal:** Maximize efficiency, leverage autonomous agentic workflows, and transition entirely away from manual chat-based pipelines.

---

## 1. The Current State: A Tale of Three AIs

Your codebase currently features three distinct AI integrations, each serving a fundamentally different purpose. To operate efficiently as a solo developer in Antigravity, we must cleanly separate **Development workflows** from **Product features**.

1. **Antigravity (The Future):** This is the current autonomous agentic workflow. It replaces manual scripting with proactive Subagents (e.g., `Brand_Auditor`, `Data_Steward`). Antigravity is designed to *do the work for you* in the background, governed by your mandates in `.antigravitycli/`.
2. **Claude/Cursor (The Past):** The previous CLI-driven workflow relied heavily on manual prompt templates (`/docs/prompts/*.md`). It required you to explicitly command the AI step-by-step (`/read-state` -> `run PLANNING.md` -> `run APPROVAL.md` -> `run TICKET_CLOSE.md`). It was a chat-based assistant, not an autonomous agent.
3. **Gemini CF (The Product):** This is a runtime feature for your Staff (Epic 18). It runs in Firebase Cloud Functions, drafting inventory data and eBay descriptions. It has no bearing on your development workflow.

---

## 2. The Solo Developer Bottleneck

The primary bottleneck holding you back right now is **treating Antigravity like Claude.** 

Because the codebase is littered with manual gating prompts (`TICKET_CLOSE.md`, `TESTING.md`, `APPROVAL.md`), you are manually orchestrating the agent. As a solo developer, your time should be spent reviewing code and making product decisions, not typing "Run Phase 3 of the checklist."

---

## 3. Optimization Strategy: How to Master Antigravity

To unlock maximum velocity, we must transition from **Orchestration** to **Delegation**. Here is how to configure and use your Antigravity instance exclusively and effectively.

### A. Exploit Slash Commands for Autonomous Execution
Antigravity supports built-in slash commands that automate complex workflows. Stop running manual `.md` prompts and start using these:
- **`/goal`**: Use this for large Epics. Instead of asking me to build a single component, type `/goal Implement Epic 62 end-to-end`. I will not stop until the spec is written, the code is executed, the tests pass, and the documentation is closed out. Perfect for stepping away from the keyboard.
- **`/grill-me`**: When starting a new feature, use this command. I will interview you to extract the requirements, ensure Persona compliance (Makoonsii, Marie, Kevin), and instantly output the 3-Strategy Plan without you having to write a spec manually.
- **`/schedule`**: Use this to offload maintenance. E.g., `/schedule "Run a full Lighthouse audit every Friday at 5 PM."`

### B. Leverage Background Subagents
You have already defined powerful subagents (`Linguistic_Auditor`, `Performance_Engineer`). Do not run them manually. 
When you assign me a `/goal`, I can seamlessly invoke these subagents in the background to review my own code. For example, while I am building a new Pawn page, the `Linguistic_Auditor` runs asynchronously to check my Kanien'kéha copy. You only get notified if something fails.

### C. Consolidate the "Gate" Overhead
The strict "Specs-First" gate and `TICKET_CLOSE` drift detection are incredible architectural guardrails, but they are tedious for a solo dev. 
**Recommendation:** We consolidate the `.md` prompts into my core system instructions. When you approve a strategy ("Go with B"), I should autonomously:
1. Write the code.
2. Run `npm run build && npm run lint`.
3. Read the `TICKET_CLOSE.md` guidelines.
4. Autonomously update `DECISIONS.md`, `EPICS.md`, and `firestore-schema.md`.
5. Present you with the final, closed PR.

You only approve the architecture; I handle the bureaucracy.

### D. Centralize Project Context
Right now, context is split between `.claude/`, `docs/prompts/`, and `.antigravitycli/mandates.md`. 
**Recommendation:** Deprecate the `.claude/` directory and merge all active workflows into your `.antigravitycli/` mandates or a singular `GEMINI.md` system rules file. This guarantees that every time Antigravity spins up, it perfectly understands the workflow without needing to read 5 different markdown files.

---

## Summary Action Plan
1. **Stop micro-managing:** Give me the end goal and let me figure out the steps.
2. **Delete `.claude/`**: Remove legacy workflow clutter to prevent AI confusion.
3. **Try `/goal`**: On your next Epic, let's execute the entire lifecycle autonomously.
4. **Try `/grill-me`**: Use it for your next planning session to skip writing the initial spec.
