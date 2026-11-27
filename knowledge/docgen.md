# NGFT DocGen · WILCO_PRODUCT_GUIDE.md

### 1.1 What NGFT DocGen is

**Product name:** NGFT DocGen. Internal documents also call it "DocGen 2" or "DocGen Rebuild". It replaces the old PHP DocGen.

**Who it is for:** aviation operators, for example helicopter operators, airlines and CAMO organisations. It serves the people who write operations manuals and the people who must get them approved by the authority. It also serves NGFT, which maintains the manual templates.

**What work it supports:**

1. Writing and revising controlled manuals, for example OM-A, OM-B, OM-C, OM-D, CAME and SOP, one chapter at a time.
2. Taking every revision through a fixed approval route: author, Compliance Monitoring Manager (CMM), the authority when needed, the Accountable Manager (AM) when needed.
3. Linking chapters to articles of law (RegVault) and seeing which chapters comply.
4. Putting the revision in force with a controlled, frozen PDF (NGFT Print).
5. Publishing the revision to crews and tracking the reading confirmation ("read and understood").
6. Receiving updates of the NGFT templates and of company variables as proposals to decide.

**Surfaces:**

| Surface | What it covers | Status |
|---|---|---|
| DocGen web app (desktop) | All writing, review, approval and publishing work | Covered in full. TP1 asks for Chrome or Edge on a computer. |
| Phone and tablet | Below a certain width the menu becomes a drawer (source code) | TP1 says: "Phones and tablets are not part of this test". Tablet use not verified. |
| NGFT Reader (crew app) | Reading published manuals and confirming "read and understood" | Separate app, not in these repositories. This backend serves its data (Reader API, source code). |
| Workflows (separate NGFT product) | The Accountable Manager's decision, when switched on | On in the demo (source code, `approvalRuns: true`), off in production. |
| Administration | Company settings, registries, style sheets, NGFT team | Inside the web app, menu **Settings**. |

**What these repositories cover:**

- `docgen2-frontend`: the whole DocGen web interface.
- `docgen2-backend`: the API, the lifecycle rules, the Reader API for the crew app, the last step of the import and the link to NGFT Print.
- **Not covered:** the NGFT Reader app, Workflows, the NGFT AI backend (ai2) that reads imported PDFs, NGFT Print and RegVault. Wilco knows only how DocGen uses them.

**Availability:** the Import Guide (5 October 2026) says: "DocGen has no production release yet". The code holds a production configuration (source code, `docgen2.ngft.com`). The current state of production is an open check.

**Interface language:** the interface is in English. The account menu offers English, Deutsch and العربية. A language change translates only the account menu, the impersonation indicator and the company selection page. Everything else stays in English (source code).

### 1.2 Roles: who is who in DocGen

DocGen derives roles from the person's post in the company. The rule is in `docgen2-backend/src/modules/document/domain/roles.ts` and `docgen2-backend/src/modules/document/services/actor.service.ts`.

| Role in DocGen | How a person gets it | What they do |
|---|---|---|
| **Owner** | Named in the document's **Owner** field | Writes in Draft. Hands the revision over to Compliance Review. Decides proposals and other authors' changes. |
| **SME** (Subject Matter Expert) | Added to the revision from **File → People** | Writes in Draft together with the Owner. |
| **CMM** (Compliance Monitoring Manager) | Company post containing "Compliance Monitoring Manager" or "CMM" | Reviews every changed chapter. Closes Compliance Review and chooses the route. Manages registries and compliance. |
| **AM** (Accountable Manager) | Post containing "Accountable Manager" or "(AM)" | Approves the revision as a whole, when the route requires it. |
| **Inspector** (authority) | Post "Inspector (Authority)" or "Authority Inspector", as a guest in the operator's company | Decides In Review revisions of authority-supervised documents. Does not see people's names. |
| **Reader** (member) | Any active member of the company | Reads published manuals in the NGFT Reader app. Has very limited access in DocGen. |
| **NGFT Admin** | NGFT user with the superuser flag | May do everything, for support. Every action is recorded. |
| **NGFT Support** | NGFT support role in the token | Reaches every company for registries, style sheets and template law tags. Does not name the NGFT team. |
| **NGFT Writer / NGFT Reviewer** | Named by an NGFT Admin in **Settings → NGFT team** | On NGFT templates only: the Writer has the Owner's rights, the Reviewer the CMM's. |
| **Company Administrator, Safety Manager** | Company posts with these names | Manage style sheets, together with the CMM, the AM and NGFT staff. |

### 1.3 The states of a revision

A document has only one revision in work at a time. The rules are in `docgen2-backend/src/modules/document/domain/revision-state.ts`.

| State (label in the app) | Meaning | Who may edit the text | Who may comment |
|---|---|---|---|
| **Draft** | The revision is being written | Owner, SME, NGFT Admin | Owner, SME, CMM |
| **Compliance Review** | The CMM reviews the changed chapters | CMM, after pressing **Edit chapter** | Owner, SME, CMM |
| **In Review** | The authority decides (prior approval only) | Nobody | Inspector; the CMM may only reply |
| **With the AM** | The Accountable Manager decides | Nobody | AM, CMM |
| **Approved** | Approved, not yet in force | Nobody | Nobody |
| **Effective** | In force, with a frozen PDF | Nobody | Nobody in DocGen |
| **Previous** | Replaced by a later revision | Nobody | Nobody |

**Document class:**

- **Authority supervised**: changes go to the authority, for prior approval or for information.
- **Internal**: the CMM approves. The document never goes to the authority.

### 3.1 How do I find a manual and see where it stands?

**Feature:** document list (Documents, tab Manuals).

**Short answer for Wilco:** "Open Documents. Each row is a manual. The Status column shows which revision is in work and its state, or which one is in force. Click a row to open the manual in the editor."

**Context**

- Role: any company member.
- Device: computer with Chrome or Edge.
- Start screen: top menu **Documents**, or the **Documents** tile on the Dashboard.
- Prerequisites: a company is selected.

**Steps**

1. Click **Documents**. The **Manuals** tab opens, sorted by **Title**.
2. Read the columns: **Title**, **Short code**, **Type**, **Status**, **Changes available**, **Effective**, **Effective date**, **Revision date**, **Owner**, **Pagination**, **Style sheet**, **Language**, **Class**, **Revisions**, **Last change**.
3. The **Status** column shows "Rev. N" and the state of the revision in work, for example **Draft**. With no work in progress it shows the revision in force (**Effective**). A manual with no revision in force shows "No revision in force".
4. The **Changes available** column shows proposals: "N to decide" in orange and "N to take over" in blue.
5. To filter, use the column filter, for example **Status** = **Draft**.
6. To export, use **Export**. The CSV file holds the visible columns and the filtered rows.
7. Click a row to open the editor. The revision in work opens. If there is none, the one in force opens read only.
8. For other actions, click **⋮** at the end of the row, or right-click the row. The menu offers **Open in the editor**, **Document page (revisions, pages, labels)**, **Document parameters** and, when possible, **Start next revision**.

**Visible result:** the company's manuals with their state.

**If something is missing**

- The list is empty ("No documents yet."): the company has no manuals yet. They are created with **New from template** or **Import a manual**.
- An authority inspector sees fewer manuals: only **Authority supervised** documents, and only revisions from **In Review** on.
- In the CSV the **Status** column holds only the state, without "Rev. N". Dates are in ISO format.

**Verification.** behavior in source code, existing documentation.

### 3.2 How do I start a new revision of a manual?

**Feature:** Start next revision.

**Short answer for Wilco:** "On a manual in force with no work in progress, choose Start next revision. Give the number and the reason. The new revision opens in Draft as a copy of the latest one. Only one revision is in work at a time."

**Context**

- Role: the document's Owner, the CMM, the AM or NGFT staff.
- Device: computer.
- Start screen: **Documents**, the document page, or the editor on an Effective revision.
- Prerequisites: the document has a revision in force and no revision in **Draft**, **Compliance Review**, **In Review**, **With the AM** or **Approved**.

**Steps**

1. In **Documents**, click **⋮** on the manual's row and choose **Start next revision**. Alternatively:
   - on the document page, press the **Start next revision** button at the top;
   - in the editor of an Effective revision, open **File** and choose **Start next revision**.
2. The dialog **Start revision N** opens.
3. Check **Revision number**. It is proposed as the last number plus one. Change it if the company counts differently.
4. Type the **Reason**, for example "Regulatory change" (optional).
5. Press **Start revision**.

**Visible result**

- The new revision opens in the editor in state **Draft**.
- In **Documents**, the **Status** column shows the new revision in **Draft**.
- The revision takes the latest published version of the style sheet and the revision labels of the previous one.

**If the button is missing**

- Another revision is still in work. The dialog says "Revision N is still in work — one revision at a time" and offers **Open it**.
- The person is not the Owner, the CMM, the AM or NGFT staff. The dialog says "The document's Owner, the CMM, the AM or NGFT staff start a revision."
- In the list, the item is also missing when the document has no revision in force.
- An **Approved** revision counts as in work: put it in force first.
- Special case: with a revision **With the AM**, the document page shows neither the state nor the link to the revision, and the dialog shows the roles message instead of "still in work". This is a frontend inconsistency (`IN_WORK` lacks `am_approval`).

**Verification.** behavior in source code, existing documentation.

### 3.3 How do I edit and save a chapter?

**Feature:** revision editor: writing, saving, Major or Minor classification, Summary of Changes.

**Short answer for Wilco:** "Open the revision in Draft, pick the chapter on the left and type. Press Save chapter: every save creates a new version of the chapter. Then classify the change as Major or Minor."

**Context**

- Role: Owner or SME in **Draft**. In **Compliance Review** only the CMM writes, after pressing **Edit chapter**.
- Device: computer.
- Start screen: the revision editor (click a row in **Documents**).
- Prerequisites: revision in **Draft**. For an SME: being added in **File → People**.

**How the editor is laid out:** from top to bottom there is the title line with the state, the process line, the ribbon (**File**, **Home**, **Insert**, **References**, **Review**, **View**), the change bar, the work area and the status bar.

**Steps**

1. In the chapter list on the left, click a chapter.
2. Type in the text. The first change locks the chapter for you.
3. Use the **Home** tab for bold, italic, lists and styles such as **Note** and **Warning**.
4. Press **Save chapter** in the ribbon.
   - Message "Saved as chapter revision N." when the text changed.
   - Message "Nothing changed — no new chapter revision." when nothing changed.
5. Under the chapter, in "Change in this revision:", press **Major** or **Minor**. Before the save the control says "Save the chapter to classify the change."
6. In the **Review** tab, press **Summary of Changes (missing)**. Write the summary and press **Save summary**. Without a summary the CMM cannot close Compliance Review.
7. For the structure, open the chapter's menu in the list: **Add chapter after**, **Add subchapter**, **Move up**, **Move down**, **Indent (make subchapter)**, **Outdent**, **Move to number…**, **Numbering and page start…**, **Remove…**.
8. To see the printed pages, choose **Canvas + pages** in the status bar.

**Visible result**

- In the chapter list, the classification shows as **MAJ** or **min**.
- The title line shows "x/y changes classified".
- Other authors see the saved text. While you type, anyone who opens the same chapter sees: "{name} is editing this chapter (lock until HH:MM). It is read-only for you until they save, leave it, or stop for 15 minutes."

**If the text cannot be edited**

- The revision is not in **Draft**. In **Compliance Review** only the CMM writes, after **Edit chapter**.
- The person is neither the Owner nor an SME. TP1 calls this intended: "Account B (CMM) can't edit a Draft".
- A colleague holds the lock on the chapter. The lock expires after 15 minutes without activity.
- **Show changes (read only)** is on in the **View** tab.
- You are looking at an earlier stage from the process line. The banner says "Read-only view of the … stage". Press **Back to current stage**.
- The **Home** and **Insert** tabs appear only when the chapter is editable.

**Unsaved text:** if the session expires, DocGen asks you to sign in again and keeps the unsaved text in the browser tab. On return it says "Your unsaved changes in N chapter(s) were kept while you were signed in again — review and save them."

**Verification.** behavior in source code, existing documentation.

### 3.4 How do I insert tables, pictures, diagrams, variables and references?

**Feature:** the editor's Insert tab and the "/" quick menu.

**Short answer for Wilco:** "The Insert tab has tables, pictures, diagrams, links, footnotes and the values from the company registries. You can also type a slash in the text to open the insert menu."

**Context**

- Role: whoever may edit the chapter: Owner or SME in **Draft**, the CMM in **Compliance Review** after **Edit chapter**.
- Start screen: editor, **Insert** tab.
- Prerequisites: editable chapter. Variables, abbreviations, definitions and cross-references need access to the registries (Owner, SME, CMM, NGFT staff).

**Steps**

1. Put the cursor at the right place in the text.
2. Open the **Insert** tab and choose the group:
   - **Table**: pick the size, or **More** for the **Insert table** dialog with columns, rows, a repeated header row and a caption.
   - **Picture**: upload a PNG or JPEG image. **Options** changes the selected picture's options.
   - **Diagram**: opens a drawing board. Enter **Diagram title**, **Alternative text**, caption and width, then **Save diagram**.
   - **Link** (Ctrl or ⌘ + K) and **Footnote**.
   - **Variable**, **Abbrev.**, **Definition**, **Cross-ref.**: values from the company registries and references to other chapters or documents.
   - **Rule**, **Special**, **Break**, **Landscape** (for a table or a picture).
3. Or type "/" in the text and choose from the menu: Table, Picture, Diagram, Link, Footnote, Special character, Horizontal rule, Checklist, Page break, Variable, Abbreviation, Definition, Cross-reference.
4. With the cursor in a table, the **Table** tab appears with **Row above**, **Row below**, **Column left**, **Column right**, **Merge cells**, **Split cell**, **Header row**, **Cell colour** and other commands.
5. Save the chapter with **Save chapter**.

**Visible result:** the element appears in the text and, after a few seconds, in the page view. A variable appears as ordinary text, with a hidden link to the registry.

**If something is missing**

- The registry buttons are missing when the person may not read the registries, for example an AM who is not also an Owner or SME.
- "This variable has no value yet. Ask the CMM to enter one under Settings, Registries." means the variable is empty.
- **Diagram** is disabled with the text "Insert diagram (open a chapter you may edit)" when the chapter is not editable.
- The error "Someone saved this diagram while you were drawing" means a colleague saved first. Close the diagram and open it again.
- An unresolved reference shows in the status bar as "N unresolved reference(s)". A click opens **Resolve reference**.

**Verification.** behavior in source code, existing documentation.

### 3.5 How do I comment on a passage, and how do I resolve the comment?

**Feature:** chapter comments with a quote of the text.

**Short answer for Wilco:** "Select the words in the chapter and choose Comment on selection, or press Control Alt M. Type and press Comment. Colleagues answer with Reply; whoever has the right closes the thread with Resolve."

**Context**

- Role and state:
  - **Draft** and **Compliance Review**: Owner, SME, CMM.
  - **In Review**: the Inspector comments, the CMM may only reply.
  - **With the AM**: AM and CMM.
  - From **Approved** on, comments are closed.
- Start screen: editor, chapter open.

**Steps**

1. Select a few words in the text.
2. Choose the command:
   - if the text is not editable, the **Comment on selection** bubble appears;
   - if the text is editable, use **Comment** in the mini toolbar on the selection;
   - or **Review** tab → **Comment on the selection** (Ctrl+Alt+M, on a Mac ⌘+Alt+M).
3. Type in the **New comment** field and press **Comment**.
4. To see all comments, choose **Canvas + comments** in the status bar, or press **Comments (n)** in the title line.
5. To answer, press **Reply**. To close, press **Resolve**.
6. To see closed threads again, switch on **Show resolved**.
7. **Show in text** finds the quoted passage, even after later edits.

**Visible result**

- The comment appears in the panel with the quoted words.
- The chapter list shows the number of open comments.
- The status bar shows "N open comment(s)".

**If the comment field is missing**

- The revision's state does not allow comments for the person's role (see Context).
- You are looking at an earlier stage, read only.
- "The quoted text is no longer in this chapter." means the quoted passage was changed.
- The Inspector sees only comments written in **In Review**.

**Verification.** behavior in source code, existing documentation.

### 3.6 How do I accept or reject another author's changes?

**Feature:** tracked changes (Tracked changes, DR-146).

**Short answer for Wilco:** "The Owner opens the Review tab and chooses Tracked changes. For each colleague's change they press Accept change or Reject change, or Accept all or Reject all. While a change is undecided, the revision cannot be handed over to the CMM."

**Context**

- Role: the document's Owner or the NGFT Admin. The CMM and SMEs see the list but not the buttons.
- Start screen: editor in **Draft**, **Review** tab.
- Prerequisites: an SME or another author has added text.

**Steps**

1. In the **Review** tab, open **Tracked changes (n)**.
2. Use **Previous tracked change** and **Next tracked change** to move.
3. Press **Accept change** to keep the words as ordinary text, or **Reject change** to remove them.
4. To decide everything at once, use **Accept all** or **Reject all**.
5. The mini toolbar on a selection also offers Accept and Reject on a colleague's text.

**Visible result:** every decision creates a new version of the chapter and is recorded in **File → History**.

**If it does not work**

- The person is not the Owner. Only the Owner and the NGFT Admin decide.
- Only additions are tracked changes. Deletions are not tracked.
- At hand-over, the message "Hand-over is not possible yet: N chapter(s) have changes by other authors that you still have to accept or reject" lists the chapters to decide.

**Verification.** behavior in source code, existing documentation.

### 3.7 How do I hand the revision over to Compliance Review?

**Feature:** Hand over to Compliance Review.

**Short answer for Wilco:** "When the Draft is ready, the Owner presses Hand over to Compliance Review. They can propose whether the authority's approval and the Accountable Manager's signature are needed. From then on only the CMM writes."

**Context**

- Role: the document's Owner (or the NGFT Admin).
- Start screen: editor, revision in **Draft**. The button is in the title line.
- Prerequisites:
  - every chapter saved;
  - no other author's change still to decide;
  - the document has an Owner. A document created from a template or by import has no Owner until the CMM sets one in **Document parameters** (open check).

**Steps**

1. Press **Hand over to Compliance Review**.
2. Read the dialog: "The N chapter(s) changed in this revision go to the CMM for review."
3. If it shows "N chapter(s) have unsaved changes — save them first, or they stay behind.", close it, save and try again.
4. Under "Routing proposal (the CMM decides, P3)" you can tick:
   - **Prior approval by the authority required** (not offered for Internal documents);
   - **Signature of the Accountable Manager required**.
5. Press **Hand over**.

**Visible result and handover**

- Message "Handed over: N changed chapter(s) are now with the CMM."
- The state becomes **Compliance Review**.
- The Owner and SMEs can no longer edit.
- The CMM sees **Close Compliance Review** and **Return to Draft** in the title line. The changed chapters show as **With the CMM**.
- The revision appears on the **Sign-off** page, with "Waiting for" = "Compliance Monitoring Manager".

**If the button is missing**

- The person is not the document's Owner. Check the **Owner** field in **Document parameters**.
- The revision is not in **Draft**.
- You are looking at an earlier stage, read only.

**Verification.** behavior in source code, existing documentation.

### 3.8 How does the CMM review the chapters in Compliance Review?

**Feature:** CMM review: checks, a decision per chapter, return to Draft.

**Short answer for Wilco:** "The CMM opens the revision, looks at the Checks tab and decides each changed chapter with Approve or Reject. A rejection asks for a reason, which the authors read. If corrections are needed, Return to Draft sends the revision back to the authors."

**Context**

- Role: CMM (or NGFT Admin).
- Start screen: menu **Sign-off** → **Open revision**, or **Documents** → the manual's row.
- Prerequisites: revision in **Compliance Review**.

**Steps**

1. Open the revision. The right panel opens on the **Checks** tab with six checks: **Law tags linked**, **Law up to date**, **Significance confirmed**, **References resolved**, **Open comments**, **Summary of Changes written**.
2. Above the chapter list, the strip shows "a of N approved" and the filters **Awaiting my decision**, **Law issues**, **Unresolved references**, **Open comments**.
3. Open a changed chapter.
4. Confirm the classification with **Confirm major** or **Confirm minor**.
5. Under "Compliance review of this chapter:", press **Approve**. Or press **Reject…**, write the reason in "Why is it rejected? The authors read this." and press **Reject**.
6. To correct the text yourself, press **Edit chapter**. To finish, press **Stop editing**: it saves before leaving.
7. To mark that a chapter needs the authority's prior approval, tick **Needs the authority's prior approval (CMM)**.
8. If the authors must make corrections, press **Return to Draft** and confirm.

**Visible result and handover**

- The chapter shows "Approved by {name}" and turns green in the list, or "Rejected by {name}: {reason}" and turns red.
- With **Return to Draft**: message "The revision is back in Draft; the authors see your rejection comments." The Owner and SMEs write again. Approved chapters keep their approval.
- The next step is closing the review.

**If a button is missing**

- **Approve** and **Reject…** are missing on a chapter not changed in this revision.
- The CMM cannot approve a chapter they wrote (separation of duties).
- On a supervised document, the Owner cannot also act as CMM.
- The text stays read only until the CMM presses **Edit chapter**. The note "Read only — in this state only the Owner and the SMEs edit (P5)." also shows in Compliance Review: the frontend wording is imprecise there.
- For an initial issue, **File → Approve all chapters (n)** approves every chapter in one step, except those the CMM wrote.

**Verification.** behavior in source code, existing documentation.

### 3.9 How does the CMM close Compliance Review and choose the approval route?

**Feature:** Close Compliance Review and the route proposal (DR-61).

**Short answer for Wilco:** "When every chapter is decided, the CMM presses Close Compliance Review. DocGen proposes the route: to the authority for prior approval, or approval without the authority. The CMM can add the Accountable Manager's signature and confirms with Close review."

**Context**

- Role: CMM (or NGFT Admin).
- Start screen: editor, revision in **Compliance Review**, **Close Compliance Review** button in the title line.
- Prerequisites:
  - every changed chapter approved, none rejected;
  - every change classified and confirmed, **Summary of Changes** written (not required for an initial issue);
  - to send to the authority: every changed chapter has a law tag or a written legal basis.

**Steps**

1. Press **Close Compliance Review**.
2. If chapters are undecided, the dialog lists them: "N changed chapter(s) are not decided yet (P7)". Cancel and decide them.
3. Read the proposal:
   - "Pre-filled: prior approval." with the reasons, when a changed chapter has an article that asks for prior approval;
   - or "Pre-filled: no changed chapter asks for prior approval. The authority is informed of the revision; it does not decide."
4. Choose:
   - **Send to the authority for prior approval (In Review)**, or
   - **Approve without prior approval**.
   If you change the proposal, your choice is recorded.
5. If the AM must sign, tick **The Accountable Manager approves next (With the AM)** or **The Accountable Manager approves after the authority**.
6. Press **Close review**.

**Visible result and handover**

| Choice | New state | Message | Who acts next |
|---|---|---|---|
| Authority | **In Review** | "Sent to the authority for prior approval." | The Inspector |
| No authority, with AM | **With the AM** | "Sent to the Accountable Manager for approval." | The AM |
| No authority, no AM | **Approved** | "Approved internally." | Owner, CMM or AM put it in force |

- An **Internal** document never goes to the authority: closing the review approves it.
- For supervised documents, DocGen keeps a copy of the revision for the authority's package.

**If closing is refused**

- "N chapter(s) of this revision are not yet approved or rejected (P7)": decide the chapters.
- "N rejected chapter(s) — push the revision back to Draft (P7)": use **Return to Draft**.
- "N changed chapter(s) have no legal basis for the Authority — add a law tag or write the legal basis": add a law tag or write the legal basis in the **Law** panel.
- "Internal documents never go to the authority (P2)": for an Internal document choose approval without the authority.
- The authority option is disabled when the route to the authority is not open.

**Configuration condition:** if the AM's signature is chosen and the Workflows flag is on, the AM's decision moves to Workflows. In the demo the flag is on (`docgen2-backend/config/develop.yaml`); in production it is off (`docgen2-backend/config/prod.yaml`).

**Verification.** behavior in source code, existing documentation.

### 3.10 How does the authority inspector decide an In Review revision?

**Feature:** authority decision (In Review).

**Short answer for Wilco:** "The authority inspector decides each changed chapter with Approve or Reject. When every chapter is approved, they press Approve the revision. If something must change, they press Not yet approved, write what to change, and the revision goes back to the CMM."

**Context**

- Role: the authority's Inspector, with the post "Inspector (Authority)" in the operator's company.
- Start screen: menu **Sign-off** (**In Review** rows) → **Open revision**.
- Prerequisites: **Authority supervised** document, revision in **In Review**.
- What the Inspector sees: only supervised documents, only from In Review on, without people's names. In the panel they see only **Comments**. The legal basis of each change is above the text.

**Steps**

1. Open a changed chapter. Under "Your decision on this chapter:" press **Approve**, or **Reject…** and write "Why is it rejected? The operator reads this.".
2. To decide in sequence, open **File → Review chapter by chapter**. The dialog shows "Chapter i of n" with **Previous** and **Next chapter**, then the decision on the revision.
3. When every chapter is approved, press **Approve the revision** and then **Approve**.
4. If a chapter is rejected and none is pending, press **Not yet approved…**, write "What has to change? (required)" and press **Send back**.

**Visible result and handover**

- On approval: "Approved by the authority. The operator's Accountable Manager approves next." (state **With the AM**) or "Approved by the authority." (state **Approved**).
- With **Send back**: the revision returns to **Compliance Review**. The Owner sees the banner "The authority rejected this chapter. Rework it here; the CMM approves it again before the revision goes back to the authority." and can correct that chapter.

**If the buttons are missing**

- **Approve the revision** is disabled while any chapter is pending or rejected.
- Someone who worked on the revision as Owner, SME, CMM or AM and also holds the Inspector post does not decide. They see: "You hold the Inspector's post, but you also worked on this revision as …, so another person decides it for the authority."
- An **Internal** document is not visible to the Inspector.

**Verification.** behavior in source code, existing documentation.

### 3.11 How does the Accountable Manager approve?

**Feature:** the AM step, in DocGen or in Workflows.

**Short answer for Wilco:** "When the revision is With the AM, the Accountable Manager approves it as a whole. If Workflows is on, as in the demo, they decide in Workflows and DocGen shows With the Accountable Manager in Workflows. Otherwise they press Approve as Accountable Manager in DocGen."

**Context**

- Role: AM. Must be a different person from whoever acted as CMM on this revision.
- Start screen: menu **Sign-off** → **Open revision**, or Workflows.
- Prerequisites: revision **With the AM**.
- Condition: flag `workflows.approvalRuns`. On in the demo, off in production. A company not linked to the NGFT platform always stays in DocGen.

**Steps in DocGen (Workflows off)**

1. Open the revision.
2. Press **Approve as Accountable Manager** and then **Approve**. Or press **Reject…**, write "Why do you reject it? (required)" and press **Reject**.

**Steps with Workflows (on)**

1. In DocGen the title line shows "Waiting for Workflows", then "With the Accountable Manager in Workflows (number)". The AM's buttons in DocGen are not shown.
2. The AM decides in Workflows. The changed chapters carry links back to DocGen.
3. Workflows reports the outcome to DocGen.
4. If "Workflows has not confirmed" appears, the Owner or the CMM press **Try again**.

**Visible result and handover**

- Approval: state **Approved**. Message in DocGen: "Approved. The approval is recorded with your name and the date; put the revision in force next." The printed approval table shows the name and date.
- Rejection: the revision goes one step back, to **In Review** if the authority had a step, otherwise to **Compliance Review**. Everyone sees "Not approved by the Accountable Manager ({name}, {date}[, in Workflows]): {reason}".

**If the buttons are missing**

- Workflows holds the AM's step.
- The person does not hold the AM post.
- The same AM acted as CMM: "The Accountable Manager may only sign when a different person acted as CMM for this revision".

**Verification.** behavior in source code, existing documentation.

### 3.12 How do I put an approved revision in force?

**Feature:** Put in force and Introduce as in force.

**Short answer for Wilco:** "On an Approved revision press Put in force and give the effective date. DocGen freezes the controlled PDF and the revision becomes Effective. The one in force before becomes Previous."

**Context**

- Role: Owner, CMM, AM or NGFT Admin.
- Start screen: editor of the **Approved** revision, **Put in force** button in the title line.
- Prerequisites: NGFT Print is reachable, because it makes the PDF.

**Steps**

1. Press **Put in force**.
2. Enter the **Effective date**. The revision's date or today's date is proposed.
3. Press **Put in force** in the dialog.
4. Wait a moment: DocGen makes the PDF.

**Visible result and handover**

- Message "In force from {date}; the controlled PDF has N pages. You can now start the next revision on the document page."
- The state becomes **Effective**. The revision in force before becomes **Previous** and crews no longer see it.
- On the document page, tab **List of Effective Pages**, the pages of the new revision appear.
- The revision can now be published.

**Introducing a manual already approved outside DocGen**

- For a document with no revision in force yet, the CMM, the AM or the NGFT Admin open **File → Introduce as in force**.
- The dialog "Introduce into DocGen as in force" asks for **Effective date** and **Authority approval (reference, optional)**, for example "authority letter of 12.03.2025". Confirm with **Introduce**.
- The difference from **Put in force**: introduction does not go through Compliance Review. It brings into DocGen a version that is already approved.

**If it does not work**

- **Put in force** is missing when the revision is not **Approved**, or the person is not the Owner, the CMM, the AM or the NGFT Admin.
- A job checks every 5 minutes for Approved revisions whose date has come and whose PDF is already frozen. If there is no PDF, the title line says "The effective date has come, but the revision has no frozen PDF yet". In the interface the PDF is frozen only by **Put in force**.

**Verification.** behavior in source code, existing documentation.

### 3.13 How do I publish a revision to crews and see who confirmed reading it?

**Feature:** Publish… and Who confirmed (DR-66), Publishing page.

**Short answer for Wilco:** "On a revision in force open File and choose Publish. Pick the channel, for example NGFT Reader, and the roles. If you tick the reading confirmation, each pilot confirms the changed chapters in the Reader. You see who confirmed in Who confirmed or on the Publishing page."

**Context**

- Role: Owner, CMM, AM or NGFT Admin.
- Start screen: the revision's editor, **File** menu.
- Prerequisites:
  - the revision is **Approved** or **Effective** with a frozen PDF. In the interface the PDF is frozen only by **Put in force**, so in practice you publish after putting the revision in force;
  - the revision is not published yet. A revision is published once and cannot be unpublished.

**Steps**

1. Open **File** and choose **Publish…**.
2. In the **Publish this revision** dialog, under **Channels**, tick **NGFT Reader** (already ticked) and, if needed, **EFB** and **PDF download**.
3. Under **Roles**, choose **Every member of the company** or **Only these roles** and tick the roles.
4. Keep **Crews confirm every changed chapter as read and understood** ticked if you want reading confirmation. It works only with the **NGFT Reader** channel.
5. Press **Publish**.
6. To follow the confirmations, open **File → Who confirmed**, or the **Publishing** menu → **Who confirmed** link.

**Visible result and handover**

- Message "Published.". In the title line: "Published to {channels}" and "x of y confirmed".
- Crews with the chosen roles see the revision in the NGFT Reader app and confirm the changed chapters there.
- The dialog "Who confirmed the changed chapters" shows "n of N chapters" for each person with **Confirmed** or **Open**.
- The **Publishing** page lists each publication with **Channel**, **Audience**, **Published** and **Confirmed**.

**If something is missing**

- An Effective revision that is not published shows "Not published: crews cannot see it in the Reader".
- "The revision has no frozen PDF yet; freeze it before publishing (D32)": put the revision in force first.
- A document's first revision has no changed chapters. The **Confirmed** column says "No changed chapters".
- The AM can publish from the editor, but the **Publishing** page tells them it is not for their role.
- The **EFB** and **PDF download** channels are recorded and can be filtered. These repositories hold no code that delivers to an EFB: delivery is an open check.
- Revisions already in force at the time of the update were published automatically to every member, without reading confirmation.

**Verification.** behavior in source code, existing documentation.

### 3.14 How do I create a new manual from an NGFT template?

**Feature:** New from template (DR-54, DR-159).

**Short answer for Wilco:** "In Documents press New from template, pick the template, for example OM-A, and tick the company's operations. DocGen shows how many chapters it keeps and which it leaves out. With Create document the new manual opens in Draft, with the company's details already filled in."

**Context**

- Role: CMM, AM or NGFT staff. The button is visible to everyone, but for others the dialog shows an error instead of the templates.
- Start screen: **Documents**, tab **Manuals**, button **New from template**. It is not on the **Templates** page.
- Prerequisites: a published template revision (Approved or Effective).

**Steps**

1. Press **New from template**. **New document from a template** opens.
2. Under **Template**, pick the template. Each entry shows title, revision and number of chapters. The company's own templates end in " · your template".
3. Check **Title of the new document**.
4. Under **Operations of the company**, check the ticked operations. The operations from the old DocGen are already ticked. Each operation shows how many chapters it brings.
5. Under **Optional chapters (N)**, tick the optional chapters you want.
6. Read the box "The new document keeps K of N chapters and leaves out M". Open **Chapters left out** to see why each chapter is excluded.
7. If you are the CMM or NGFT staff, you can tick **Confirm the inherited law tags as compliant (NGFT's text as delivered)**.
8. Press **Create document**.

**Visible result and handover**

- The new manual opens in the editor as revision 1 in **Draft**.
- The text holds the values from the company registries, for example the company name, not placeholders such as "[COMPANY_NAME]".
- The manual appears in **Documents**.
- The chapters keep the template's confirmed law tags, marked "Inherited from the template".
- Later template updates do not change the manual by themselves: they arrive as proposals.
- **Company chapters only (N)** in the change bar shows the chapters the company wrote itself, labelled **Company**.

**After creation:** the dialog does not ask for the Owner. Before the hand-over to Compliance Review, the CMM sets the **Owner** in **Document parameters** (open check).

**If it does not work**

- "Only the CMM, the AM or NGFT staff may instantiate templates": the person lacks the role.
- No template in the list: the company has no published template revisions.
- The AM can create the document but does not see the law-tag confirmation box.

**Verification.** behavior in source code, existing documentation.

### 3.15 How do I decide a template update or a company variable change?

**Feature:** Proposals and Take over (DR-53, DR-131).

**Short answer for Wilco:** "Updates of the NGFT templates and changes of company variables arrive in Proposals. For each chapter choose Accept, Adapt or Leave as is. The text changes only when you press Take over in a revision in Draft."

**Context**

- Role:
  - deciding: the document's Owner, the CMM or the NGFT Admin;
  - bringing the text into the revision: whoever may edit in that state (Owner or SME in Draft, CMM in Compliance Review after **Edit chapter**).
- Start screen: menu **Proposals**.
- Where proposals come from:
  - a new approved revision of a template the manual was made from;
  - a company variable changed in **Settings → Registries** (title "Variable KEY changed").

**Steps to decide**

1. Open **Proposals**. Each card is a proposal for one document, with "X of Y decided".
2. Click the chapter. The dialog shows "What NGFT changed" (template) or "What changed" (variable). If the company had its own wording, it also shows "Your own wording" with a warning.
3. Choose:
   - **Accept**: takes the new text. No reason needed.
   - **Adapt…**: keep your wording and work the change into it. Write "How will you adapt it? (required)".
   - **Leave as is…**: the chapter stays as it is. Write "Why does the chapter stay as it is? (required)".
4. To also see decided proposals, switch on **Show decided (N)**.

**Steps to bring the text into the manual**

1. Start or open the revision in **Draft**.
2. In the **Review** tab, press **Take over all updates (n)**. In the dialog "Take over proposals into this revision" press **Take over (n)**.
3. Alternatively, above the affected chapter, use **Take over**, **Adapt…** or **Leave as is…**: they decide and apply in one click.

**Visible result and handover**

- In **Documents**, the **Changes available** column moves from "N to decide" to "N to take over".
- In the editor, chapters with an undecided update carry the **Updates Required** mark. The **Template updates (n)** filter in the change bar lists them.
- Message "N proposal(s) taken over into this revision". The changes enter the revision and follow the normal Compliance Review.

**If something is missing**

- The decision buttons are visible to everyone, but the backend refuses anyone who is not the Owner, the CMM or the NGFT Admin: "Only the document's Owner or the CMM decides a proposal (D51)".
- In Draft an SME sees **Take over** on an open proposal, but the decision is refused for them. The Owner decides first.
- The CMM can decide on the Proposals page, but cannot bring the text into the revision while it is in Draft.
- A template's first publication creates no proposals.
- The top menu shows no count next to **Proposals**.

**Verification.** behavior in source code, existing documentation.

### 3.16 How do I link a chapter to an article of law and see its compliance state?

**Feature:** the editor's Law panel, "No regulation applies", the Compliance page.

**Short answer for Wilco:** "In the editor's Law panel you link the chapter to a RegVault article. The Compliance page shows, for each chapter of the manuals in force, whether it is compliant, needs updating, is not assessed or has no law tag. The filters take you straight to the chapters to look at."

**Context**

- Role:
  - linking articles: CMM, Owner or NGFT staff, only in **Draft** and **Compliance Review**;
  - confirming inherited law tags and marking "No regulation applies": CMM or NGFT staff;
  - **Compliance** page: the CMM and the NGFT Admin see everything, the Owner sees their own documents. The AM and the Inspector do not get the page.
- Start screen: editor, right panel, **Law** tab; or menu **Compliance**.

**Steps in the editor**

1. Open a chapter and the **Law** tab. The heading is "Law for {chapter}", with the state of each law tag: **Up to date**, **Updates required**, **Not compliant**, **Not applicable**, **Not yet assessed**, **Cannot be assessed**, **No regulation applies**.
2. To link an article, type in **Link an article** and press **Add**.
3. On each row you can use **Confirm** (on a suggestion), **Move** (to another chapter) and **Unlink**.
4. For manuals made from a template, **Confirm inherited law tags (n)** confirms the inherited links in one go.
5. For a chapter with no law tag that no regulation covers, choose **No regulation applies…** in the chapter's menu and write an optional reason.

**Steps on the Compliance page**

1. Open **Compliance**.
2. Pick a document under **Document**, or keep **All documents**.
3. Press a state button to filter: **Compliant**, **Updates Required**, **Not Compliant**, **Not Applicable**, **Cannot assess**, **Not assessed**, **Not regulated**, **No law tag**.
4. Click **Open chapter** to open the chapter in the editor.

**Visible result**

- Each chapter has the worst state among its law tags.
- A chapter marked "No regulation applies" shows as **Not regulated**, no longer as **No law tag**.
- A chapter changed since the copy from the template shows "Changed since the template".
- The Dashboard's **Compliance** tile counts chapters with issues: Updates Required, Not Compliant, Cannot assess and Not assessed.
- RegVault states refresh every night.

**If something is missing**

- The page is empty: "No document has a revision in force yet, so there is no compliance to show." The page looks only at revisions in force.
- The AM, the Inspector and members see "This page is for the CMM, the Owner of a document and NGFT staff".
- **No regulation applies** is disabled when the chapter already has a law tag ("No regulation applies (unavailable: law tag linked)").
- The NGFT templates' law tags are edited in DocGen only after the hand-over from RegVault, planned for 30 November 2026 (flag `REGVAULT_TEMPLATE_EDITING`). Until then RegVault maintains them.
- The Compliance page has no CSV export.

**Verification.** behavior in source code, existing documentation.

### 3.17 How do I see what is waiting for a signature?

**Feature:** Sign-off page (DR-125).

**Short answer for Wilco:** "Open Sign-off. Each row is a revision waiting, with its stage, who must decide it and for how many days. Open revision opens the revision where the decision is made."

**Context**

- Role: CMM, AM, Owner (own documents only), Inspector (only In Review rows of supervised documents, without names), NGFT Admin.
- Start screen: menu **Sign-off**.

**Steps**

1. Open **Sign-off**.
2. Filter by **Document** or by stage: **Compliance Review**, **In Review**, **With the AM**.
3. Read the columns **Document**, **Revision**, **Stage**, **Waiting for**, **Waiting**, **Workflows run** and **Owner**.
4. Click **Open revision** to decide.

**Visible result:** the revisions waiting, with the longest wait at the top. For With the AM rows, the **Workflows run** column says "Waiting for Workflows", "With the AM in Workflows", "Not confirmed by Workflows" or "The AM decides in DocGen".

**If the page is empty or refused**

- "Nothing is waiting for sign-off. A revision appears here when the Owner hands it over to Compliance Review."
- A member without a role sees "This page is for the CMM, the AM, the Owner of a document, the Authority Inspector and NGFT staff".
- The page is read only. Decisions are made in the editor.

**Verification.** behavior in source code, existing documentation.

### 3.18 How do I see what changed between two revisions?

**Feature:** Difference document (DR-55) and chapter history.

**Short answer for Wilco:** "In the editor open File and choose Difference document. You see the summary of changes and the removed and added text for each chapter. You can choose the edition for crews, compliance or the authority, and download the PDF."

**Context**

- Role: internal roles (Owner, SME, CMM, AM, NGFT Admin) and the Inspector.
- Start screen: a revision's editor, **File** menu.

**Steps**

1. Open **File → Difference document**. "Difference document — revision X → revision Y" opens.
2. Read the first part: revision numbers, Summary of Changes, one line per changed chapter with the kind of change and Major or Minor.
3. Choose the edition: **Crew**, **Compliance** or **Authority**. The **Crew** edition leaves out chapters changed only in formatting. No edition shows people's names.
4. Under **Compared with**, choose an older revision if needed.
5. Press **Download PDF**.
6. For a single chapter, open **File → History** (for the Inspector it is called **What changed**).

**Visible result:** removed text is struck through and added text is highlighted, also inside table cells. The PDF has the manual's layout.

**If it does not work**

- "NGFT Print could not render the PDF.": NGFT Print did not answer. Try again later.
- **History** is disabled when no chapter is open.

**Verification.** behavior in source code, existing documentation.

### 3.19 How do I prepare the authority's package and the regulator export?

**Feature:** Submission package (DR-63, DR-115) and Regulator export (DR-65, DR-116).

**Short answer for Wilco:** "For supervised documents, File, Submission package prepares the ZIP for the authority with the PDF, the summary and the changed pages. After approval, File, Regulator export downloads the ZIP with the PDF, its fingerprint, the changes and every sign-off."

**Context**

- **Submission package**: **Authority supervised** document, revision from **In Review** on, role Owner, CMM or NGFT Admin.
- **Regulator export**: revision **Approved**, **Effective** or **Previous**, role Owner, CMM, AM or NGFT Admin. For supervised documents also the Inspector.
- Start screen: editor, **File** menu.

**Steps**

1. Open **File → Submission package**.
2. Pick the submission under **Submission**. Press **Build package** if the package does not exist yet, then **Download package**.
3. For the export, open **File → Regulator export**. While it is prepared the item says "Preparing…". The downloaded file is named `regulator-export_{id}.zip`.

**Visible result**

- The package holds "PDF as submitted", "Summary of Changes" and "Changed pages (PDF)". The type is "Approval submission" for prior approval, otherwise "Information submission".
- The export holds `manual.pdf` with its `.sha256` file, `changeset.json`, `sign-off.json` and `manifest.json`. The changeset does not hold the authors' identity.
- DocGen builds the package from the copy saved when the revision entered In Review. After a rejection, the next submission gets the next number.

**If it does not work**

- The **Submission package** item is missing for **Internal** documents.
- If building the package fails, the revision still moves on. The Owner, the CMM or NGFT staff press **Build again**.
- The Workflows audit extract is not yet in the export. The manifest says so.
- The editor has no button to download only the frozen PDF. The PDF is inside these two ZIP files.

**Verification.** behavior in source code, existing documentation.

### 3.20 How do I import an existing PDF or Word manual?

**Feature:** Import a manual (DR-105…108).

**Short answer for Wilco:** "The CMM uploads the PDF or Word file in Import a manual. DocGen reads the chapter tree; you correct it and split the manual. PDF chapters are converted, then Create the manual creates a Draft with a Fidelity report that says what to check."

**Context**

- Role: the company's CMM, AM or NGFT staff.
- Start screen: **Documents** → **Import a manual**, or the **Import a manual** tile on the Dashboard.
- Prerequisites:
  - the company is linked to the NGFT platform;
  - the NGFT AI backend (ai2) is reachable. The import screens call ai2 directly from the browser;
  - a Word file must use heading styles (Heading 1, Heading 2 and so on).
- **Costs:** every conversion of a PDF chapter is billed by the conversion service. Word files are not converted.

**Steps**

1. Open **Import a manual** and press **Upload a manual**.
2. Drag the file onto the area "Drag and drop a PDF or Word file here, or click to select" and press **Upload and read chapters**. You see "Uploading the manual..." and then "Reading the manual...".
3. Read the points under **Worth checking** and press **Check the chapter tree**.
4. Check the columns **Number**, **Title**, **Level**, **Start**, **End**, **Check**. The red chip "N to fix before the split" blocks the split. The yellow chip "N level jumps" is only a warning.
5. Correct with **Divide**, **Merge into above**, **Delete**, **Undo**, **Redo**. **Reset to proposal** returns to the initial proposal.
6. Press **Split PDF along this tree** (PDF) or **Split along this tree** (Word), then **Open the chapters**.
7. PDF only: pick **Conversion mode** (**Fast**, **Balanced**, **Accurate**) and press **Convert** on a chapter, or **Convert all missing (n)**.
8. Press **View** to see a converted chapter next to the source page.
9. When every chapter is converted, press **Create the manual**. Fill in **Title**, **Document type**, **Language**, **Class**, **Short code**, **Numbering** and **Style sheet**. Press **Create the Draft**.
10. In the dialog "The manual is a Draft" press **Open the Draft**.

**Visible result and handover**

- The Draft appears in **Documents** as revision 1, with the chapters and numbers of the source manual.
- The **Fidelity report** lists raw HTML blocks, unresolved references, dropped formatting, images stored and not stored, and chapters to look at. It reopens with **Fidelity report**.
- The cover, table of contents and lists of pages are not imported: DocGen builds them from the style sheet.
- With "From this manual (new draft)" DocGen also creates a draft style sheet in **Settings → Style sheets**.
- The Draft has no Owner: the CMM sets one in **Document parameters**.

**If something is missing or does not work**

- "A manual is imported by the CMM, the AM or NGFT staff of the company.": the person lacks the role.
- "This company is not linked to the NGFT platform, which the import needs. Ask NGFT support to link it."
- "Unable to load the imported manuals: You don't have the required roles to access this resource": wrong company. Check the company name at the top left.
- "Please select a PDF or Word (.docx) file": unsupported format. XML is not supported.
- **Create the Draft** is grey: **Title** or **Document type** is missing, or some chapters are not converted.
- A chapter shows **Failed**: read the reason and press **Retry** later. A frequent reason is the conversion service's rate limit (429).
- The lists refresh every 5 seconds only while the browser tab is in front.
- **Warning:** the app cannot delete a Draft created by the import. The trash icon in **Import a manual** deletes the imported manual for the whole company.

**Verification.** behavior in source code, existing documentation.

### 3.21 How do I manage a controlled PDF that we don't write in DocGen?

**Feature:** Uploaded documents (DR-75).

**Short answer for Wilco:** "In Documents, tab Uploaded documents, the Owner uploads the PDF with a title, a type and an effective date. The Accountable Manager approves it, never the person who uploaded it. Then it is released to the Reader for the chosen roles."

**Context**

- Role:
  - uploading: an Owner of any company document, the CMM or the NGFT Admin;
  - approving: the AM or the NGFT Admin, never the person who uploaded the file;
  - releasing to the Reader: this document's Owner, the CMM, the AM or the NGFT Admin.
- Start screen: **Documents**, tab **Uploaded documents**.
- Typical uses: forms, charts, supplier documents.

**Steps**

1. Press **Upload a document**.
2. Choose the **PDF file** (up to 25 MB). Fill in **Title**, **Document type** (for example FORM, CHART, SUPPLIER), **Class**, **Owner post**, **Effective date** and, if you like, **Note**. Press **Upload**.
3. Click the row to open the document's history.
4. The AM presses **Approve** on the Draft revision and confirms.
5. Press **Release to the Reader**. Choose **Every member of the company** or **Roles** and press **Release**.
6. For a new version, press **Upload a new revision** and write the **Reason for the new revision**.

**Visible result**

- The states are **Draft**, **Approved, not yet in force**, **Effective**, **Previous**, **Withdrawn**. Effective and Previous follow from the effective date.
- Every earlier file stays downloadable with **Download**.
- Crews see in the Reader only the revision in force that was released to their role.

**If something is missing**

- "You uploaded this revision; another person approves it (separation of duties)".
- "Revision N is not released to the Reader. From its effective date the Reader shows nothing for this document until it is released."
- "The file is identical to revision N; upload the changed file".
- A member without a role sees an empty list.
- The virus check is not active yet: it is a placeholder that scans nothing (`docgen2-backend/src/modules/uploaded-document/services/virus-scanner.ts`).

**Verification.** behavior in source code, existing documentation.

### 3.22 How do I change a company variable, for example the company's address?

**Feature:** Settings → Registries (DR-120, DR-131, DR-163).

**Short answer for Wilco:** "The CMM opens Settings, Registries, tab Variables, and changes the value. The manuals do not change by themselves: every chapter that uses the variable gets a proposal in Proposals."

**Context**

- Role: the CMM or NGFT staff edit. The Owner and SMEs may only look. The AM and the Inspector have no access, unless the AM is also an Owner or SME.
- Start screen: **Settings** → **Registries**.

**Steps**

1. Open the **Variables** tab. There are also **Abbreviations** and **Definitions**.
2. Find the variable, for example by the key `COMPANY_CITY`.
3. Press the edit icon. In the **Change variable** dialog change the **Value** and press **Save**.
4. Read the message "KEY saved. N chapters in M documents can take the new value; nothing in the manuals changed yet." and press **Open Proposals**.
5. Decide the proposals and bring them into the next revision.

**Visible result:** one proposal "Variable KEY changed" for each document that uses the variable. Published revisions do not change.

**Company Admin suggestions (NGFT staff only):** when the company's details in Company Admin differ from the variables, the **Variables** tab shows "N values differ from Company Admin" with **Accept** and **Dismiss**. Accept works like a manual save. It needs the Kafka consumer on: in production it is off.

**If something is missing**

- "You can look and search. Changes are made by the Compliance Monitoring Manager and NGFT administrators.": the person may only read.
- "Owned by NGFT" in place of the buttons: the variable belongs to NGFT and only NGFT staff change it.
- A variable still used in a text cannot be deleted: the dialog lists where it is used.
- The first value of an empty variable creates no proposals. Clearing a variable withdraws the open proposals.
- The registries have no export.

**Verification.** behavior in source code, existing documentation.

### 3.23 How do I change the printed look of the manuals?

**Feature:** Settings → Style sheets.

**Short answer for Wilco:** "In Settings, Style sheets, you change typefaces, margins, headings, tables and the cover, with a preview of the pages beside it. Save the draft and press Publish. Manuals take the new version when their next revision starts."

**Context**

- Role: Company Administrator, CMM, AM, Safety Manager or NGFT staff. Other members may only look.
- Start screen: **Settings** → **Style sheets**.

**Steps**

1. The list shows **Name**, **Status**, **Used by** and **Default**. One carries **Company default**.
2. To create one, press **New style sheet**, give it a name, choose **Start from** and press **Create**.
3. Open a group, for example **Typography**, and change a value. On the right, the **Live** tab shows the pages of a company manual chosen under **Pages from**.
4. Under **Front matter**, choose which opening pages to print and in which order.
5. Press **Save draft**.
6. For a real proof, open **Proof (NGFT Print)** and press **Render proof**.
7. Press **Publish**.

**Visible result:** "Version N published. Documents take it when their next revision starts." The status becomes **Published vN**.

**If something is missing**

- "Style sheets are managed by a Company Administrator, the CMM, the AM, the SM or NGFT staff.": the person may only look.
- **Publish** is refused when a value blocks publishing, for example text below 8 points. The message says which.
- "No document to show yet.": the company has no manual for the preview yet.
- There is not yet a way to choose a style sheet for a single manual: the company default applies.

**Verification.** behavior in source code, existing documentation.

### 3.24 How do I switch company or language, and how do I go back to the Cockpit?

**Feature:** account menu and the Company & Members page.

**Short answer for Wilco:** "Click the avatar at the top right. There you choose the company, the language, your profile, Back to Cockpit and Logout."

**Context**

- Role: everyone.
- Start screen: any page, avatar at the top right.

**Steps**

1. Click the avatar.
2. To switch company, use the company selector. DocGen starts over on the Dashboard. The **Organization** field on the Dashboard also switches company.
3. For the language, choose **English**, **Deutsch** or **العربية**. Only the menu and a few labels are translated.
4. **My profile** and **Back to Cockpit** open in a new tab.
5. **Logout** ends the session.
6. To see the members and their roles, open the **Company & Members** tile on the Dashboard.

**Visible result:** the selected company's name, or its logo, appears at the top left.

**If something is missing**

- With only one company, DocGen selects it by itself.
- "No Active Companies": the person has no active companies. Contact the administrator.
- If an NGFT administrator signed in as the user, a frame and the **Impersonated** badge say so. "Log out to end the impersonation."
- Error "Your account is not set up in DocGen" (code `unknown_user`): the person signed in, but DocGen has no user for them. Signing in again does not help: contact NGFT support.
- TP1 calls the menu item "Change Company". In the code the labels are "Current company" and "Select company" (open check).

**Verification.** behavior in source code, existing documentation.

### 3.25 How does NGFT name the people who write and review the NGFT templates?

**Feature:** Settings → NGFT team (D51).

**Short answer for Wilco:** "This is an internal NGFT feature. An NGFT Admin names the NGFT Writers, who write the templates, and the NGFT Reviewers, who review and publish them. A Reviewer never approves a chapter they wrote."

**Context**

- Role: NGFT Admin. Other members of the NGFT company see the page read only. Customer companies have no access.
- Start screen: **Settings** → **NGFT team**.

**Steps**

1. Open **NGFT team**.
2. For each member of the NGFT company, switch **NGFT Writer** and **NGFT Reviewer** on or off.

**Visible result:** the role applies at once, and only on NGFT templates. NGFT Admins carry the **NGFT Admin** label.

**If something is missing:** without NGFT Admin rights the switches are grey and the page says "Only an NGFT Admin changes these roles."

**Verification.** behavior in source code, existing documentation.

### 3.26 Is there an AI assistant in the editor?

**Feature:** AI window (DR-123), **preview feature**.

**Short answer for Wilco:** "The editor has an AI window in preview. Today it gives only demo answers and reads no sources. It is not active for customers."

**Context and conditions**

- The **AI** tab requires the preview feature to be enabled.
- The client is a demo (`DemoAiClient`). Every answer starts with "Demo answer: nothing was researched and no source was read".
- The RegVault, Audit and Web sources are off with "Not connected yet".
- **Warning:** **Accept** writes the demo text into a real chapter.
- When active: Owner, SME, CMM and NGFT Admin, only in Draft and Compliance Review. Never the Inspector or the AM.

**Verification.** behavior in source code, existing documentation.

### 5.1 Demo: from the author to the CMM to the revision in force

**Visitor's prompt:** "How do we get a manual change approved without emails and paper signatures?"

**Accounts or roles needed:** an Owner account for the demo manual (author) and a CMM account, two different people.

**Example record:** demo manual `DEMO-ER` with a revision in Draft and one chapter already changed and saved. Prepare it with **Start next revision** before the demo.

**Actions to show**

1. As the Owner, change a sentence, press **Save chapter** and choose **Major**.
2. Press **Hand over to Compliance Review** and then **Hand over**.
3. As the CMM, open the **Checks** tab, then **Approve** on the chapter.
4. Press **Close Compliance Review**, choose **Approve without prior approval** and press **Close review**.

**End result:** the revision is **Approved** and shows its correct state in **Documents**. Optional: **Put in force**, with the PDF frozen and the earlier revision in **Previous**.

**Format:** guided demo of 60–90 seconds. Not suitable for a silent clip: it needs two roles and the steps need explaining.

**Data changes and reset**

- The demo changes data and cannot be undone.
- Reset: after **Put in force**, **Start next revision** creates a new Draft and the demo can start again. The loop is verified in the source code. The demo manual's revision count grows with every run.
- Without **Put in force**, the revision stays Approved and blocks a new revision.
- Do not tick the AM's signature: in the demo the AM step moves to Workflows.
- **Put in force** calls NGFT Print, which renders one PDF at a time. It can take from a few seconds to a few minutes.

**Verification.** Demonstration scenario based on the documented features.

### 5.2 Demo: regulatory compliance chapter by chapter

**Visitor's prompt:** "How do we know which chapters of the manual are no longer in line with the regulations?"

**Account or role needed:** CMM of the test company.

**Example record:** demo manual `DEMO-ER` in force, with law tags inherited from the NGFT template and at least one chapter without a law tag.

**Actions to show**

1. Open **Compliance** and show the state buttons with their counts.
2. Filter by **No law tag** or **Updates Required**.
3. Press **Open chapter** on a row.
4. Show the **Law** tab with the law tag states, and the **Compare** tab against the NGFT template.

**End result:** the visitor sees where to act, chapter by chapter, with the link to the RegVault articles.

**Format:** both. Silent clip of 20–30 seconds (actions 1–3) and guided demo of 60–90 seconds (actions 1–4).

**Data changes:** none, the demo is read only. Do not use **No regulation applies** during the demo: it changes the chapter and can be removed only with a revision in work.

**Verification.** Demonstration scenario based on the documented features.

### 5.3 Demo: telling crews what changed

**Visitor's prompt:** "How do we know the pilots have read the changes to the manual?"

**Account or role needed:** Owner or CMM. The AM does not get the Publishing page.

**Example record:** demo manual `DEMO-ER` with revision 2 or later in force, published to **NGFT Reader** with reading confirmation on, and some confirmations already given by demo accounts in the Reader.

**Actions to show**

1. Open **Publishing** and show the **Confirmed** column ("x of y").
2. Press **Who confirmed** and show who confirmed and who did not.
3. In the editor, open **File → Difference document** and choose the **Crew** edition.
4. Press **Download PDF**.

**End result:** the visitor sees what changed for crews and who confirmed reading it.

**Format:** both. Silent clip of 20–30 seconds (actions 1–3) and guided demo of 60–90 seconds.

**Data changes:** none. Publish before the show, because a revision is published only once. Confirmations are given in the NGFT Reader app, outside DocGen.

**Verification.** Demonstration scenario based on the documented features.
