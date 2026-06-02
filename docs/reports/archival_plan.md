# Project Sync & Archival Plan

## Goal
Review the `docs/projects/` directory, `EPICS.md` roadmap, and `ACTIVE_CYCLE.md` logs, ensure they are synchronized, and archive anything completed 2 weeks or more ago (on or before **2026-05-19**) into a new `docs/archive/` folder so it can be safely backed up and removed.

## 1. Project Specifications to Archive
Based on our review, 23 epic specifications in `docs/projects/` were completed on or before `2026-05-19`. 

We will create `docs/archive/projects/` and move the following files:
- E02_Three_View_Design_System.md
- E03_Auth_Staff_Roles.md
- E04_Inventory_Schema_Intake.md
- E05_Three_View_Storefronts.md
- E06_eBay_Cross_Posting.md
- E07_Pawn_Form_Inbox.md
- E08_Click_Collect_Contact.md
- E09_Quality_Security_Accessibility.md
- E10_Analytics_Feature_Flags_Admin_Dashboard.md
- E11_Compliance_Programme.md
- E12_Alerts_Notifications_Remaining.md
- E13_Merchandising_Engine.md
- E14_Seasonal_Campaign_Scheduler.md
- E15_CRM_Retention.md
- E16_Post_Sale_Operations.md
- E17_Conversion_Optimisation.md
- E18_AI_Assistant.md
- E19_Editorial_CMS.md
- E20_Staff_Management_Scheduling.md
- E23_Unified_Header.md
- E24_CI_CD_Pipeline.md
- E25_Header_Navigation.md
- E38_Admin_Desktop_Portal.md

*Recent projects (E01, E26, E39, E41–E47) were completed between May 20th and June 2nd, falling within the 2-week active window. They will remain in the active directory.*

## 2. Roadmap Synchronization (`EPICS.md`)
I will verify that all 23 of the archived Epics are fully ticked off (`[x]`) in `EPICS.md`. Since `EPICS.md` acts as our high-level roadmap, I recommend keeping the text in `EPICS.md` as a historical record of what has been built (so we don't accidentally lose track of shipped features), but ensuring their status perfectly reflects "Completed".

## 3. Active Cycle Clean-up (`ACTIVE_CYCLE.md`)
Currently, `ACTIVE_CYCLE.md` contains historical sprint logs dating back to Cycle 19.
- Cycles **19 through 24** were all completed on `2026-05-19` or earlier.
- I will cut these older cycles out of `ACTIVE_CYCLE.md` and move them into a new file: `docs/archive/past_cycles_log.md`.
- `ACTIVE_CYCLE.md` will cleanly retain only Cycle 25 through the current Cycle 32.

---

## Open Questions for the User
1. Does this list of files align with your expectations? 
2. Do you want me to keep the completed tasks visible in `EPICS.md` (just ticked off) or do you want me to literally delete the older E02–E25 sections from `EPICS.md` as well? (I recommend keeping them in `EPICS.md` for architectural context, but archiving the detailed project spec files).
