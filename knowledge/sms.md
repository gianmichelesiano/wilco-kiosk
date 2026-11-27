# NGFT Safety · WILCO_PRODUCT_GUIDE.md

### 1.3 Roles and what they see on the home page

The home is called «My Modules». Each module is a card with the «Open» button. There's no side menu. The cards depend on user roles in the selected company.

| Profile | Roles (examples) | Pages in the home |
|---|---|---|
| Safety managers | Safety Manager (SM), Accountable Manager (AM), Company Account Owner | Reporting, Report List, External Accident DB, Management of Change, Risk Register, Mitigation Strategies / Best Practice, Configuration, Safety Assurance, Safety Promotion, Emergency Response Plan, Hazard Analysis. Above the cards: the «Safety Cockpit» band (only SM, Company Account Owner, Company Administrator) |
| Other managers | NPFO, NPCT, NPGO, NPCA, Head of Training, CMM, Base Manager, AI Manager, Company Administrator | Reporting, Report List, External Accident DB, Management of Change |
| Operational staff | Pilot, Copilot, HEMS TCM, Ground Personnel, Mechanical Engineer, CAMO Staff | Reporting, Report List, External Accident DB, Management of Change |
| NGFT staff | NGFT Administrator, NGFT Support | Report List, External Accident DB, Risk Register, Mitigation Strategies / Best Practice, Configuration |

Additional rules:

- **Bow-Tie Analysis** is added to SM, CMM (also CAMO and Maintenance), AM, NPFO, NPCT, NPGO, NPCA, NPMO Part 145, Head of Training and NGFT Administrator.
- Managers also see the section «Coming Soon»: Authority Reporting, Safety Audits, Data Exchange. They are not yet available.
- Anyone without an SMS role in the company sees «Access Denied».
- The Safety Manager has a **deputy**. Today the deputy is a user indicated in the triage settings. A role «Deputy Safety Manager» is in development (NS-1326) and is not yet in the sources read.

**Verification.** screens observed in the app (profile manager and Safety Manager profile) and sources.

### 3.1 New report: How do I submit a safety report?

**Short answer.** Open Reporting on the home page. Enter the date, time, location and type, then describe what happened. You can mark the report confidential or submit it anonymously and attach photos or files. Select Submit. The Safety Manager receives an email and the report enters triage.

**Context.**

- Role: anyone who has a SMS role in the company (pilot, technician, manager). NGFT staff do not have the Reporting card.
- Device: browser.
- Initial screen: home «My Modules» › «Reporting» › «Open». It opens «New report» (`/reporting`).
- Prerequisites: active company and with subscription; active user.

**Steps.**

1. Check «Date» and «Time»: they are already set to now.
    - The «I became aware of it at that time» box is checked. If you noticed it later, untick it and fill in «Date you became aware of it» and «Time you became aware of it».
2. In «Location», search for the place with «Search Location», use «My location» or «Add Location» on the map.
3. In «Type:» choose a type. The default types are: Accident, Incident, Event, Observation, Ground Damage, Fuel/Chemical Spill, Information Security, Non-Compliance, Safety Improvement, Customer Complaint, Fatigue & Wellbeing. «What the types mean» explains all the types.
4. Describe the event in the text field: who was involved, what you saw, what you did.
5. If the type is Fatigue & Wellbeing, fill out «How were you feeling?»: sleep hours in the last 24 and 48 hours, hours awake, duty start, scale «Fatigue (Samn-Perelli)» from 1 to 7 and «Sleepiness (Karolinska, KSS)» from 1 to 9.
6. Choose the options, if needed:
    - «Confidential»: only the Safety Manager and the deputy see the report and who sent it. For Fatigue & Wellbeing it is always active and locked.
    - «Report anonymously»: Your name is not saved. The Safety Manager can still write to you in the anonymous chat.
    - «Immediate safety concern»: for a hazard that requires immediate action. Who to call appears (the company's operational contact, otherwise the operations centre) and the Safety Manager receives an immediate notification.
7. In «Attachments» add files with «Photo/Video» or «Attach file». Maximum 10 files, 100 MB each. Formats: PDF, Word, Excel, JPG, PNG, GIF, MP4, AVI, MOV, MPEG, MP3, WAV, AAC, OGG, M4A.
8. Press «Submit». The button becomes «Sending…». Sending can take up to a couple of minutes: leave the page open.

**What you see.**

- «Report saved» appears and then «Checking what else the Safety Manager needs…».
- If no other data is needed: «Report sent» and «Thank you. You'll find the report and every update under Reports.»
- If other data is needed, step 2 opens.

**Handoff.**

- The report has a number (example of the format: `ABC-2026-00041`) and the internal status «awaiting triage». It is not yet an analyzed event.
- The AI classifies the event as accident, serious incident or incident. If it is an accident or serious incident, the urgency becomes «Immediate» and the deadlines for notifying the authority start (72 hours).
- All active Safety Managers receive the email «New report has been submitted in SMS», with a link to Reports and without the reporter's data.
- The Safety Manager sees the report in the «Triage» tab.

**If a button or result is missing.**

- «Submit» is disabled: the types have not been loaded. Use «Try again» below «The report types could not be loaded.»
- Error messages on the form: «Pick a report type.», «Describe what happened.», «You can't have become aware of it before it happened.»
- «Error creating report»: the form stays filled in, you can try again.
- You do not see the Reporting card: you are NGFT staff, or your role does not give access to the SMS.
- A type is missing from the list: the Safety Manager can rename, hide or archive types.

**Verification.** screens observed in the app for the form (fields, types, options; no sending), sources for sending and notifications.

### 3.2 Completing the report: why does the system ask me for more data?

**Short answer.** «For some events the Safety Manager needs more details, for example for notification to the authority. After sending, the SMS shows you the missing questions. The AI pre-fills some by reading your description. You can answer Unknown, or press Finish later and complete it afterwards from Reports.»

**Context.**

- Role: whoever sent the report.
- Device: browser.
- Initial screen: it opens by itself after «Submit». Later: «Reports» › banner «… needs additional information» › «Complete now».
- Prerequisites: none.

**When it appears.**

- Accident and Incident: always the long form.
- Other types of the Occurrences workflow and the Observation type: the long form if the AI classifies the event as an accident or serious incident; otherwise a short list «Additional information».
- Safety Improvement, Customer Complaint and Fatigue & Wellbeing: no step 2.

**Steps.**

1. Read the reason at the top, for example «You reported an accident. The Safety Manager needs these details for the report to the FOCA…».
2. Wait for «Reading your description for answers…». The answers proposed by the AI are marked «Filled for you» and «from your description»: check them.
3. In the long form, browse pages with «Next» and «Back». The pages depend on the event: Flight, What happened, Damage, Injuries, Weather, Dangerous goods, Bird, Traffic, Laser, Obstacle, Aerodrome, Check.
4. Each question accepts «Unknown».
5. At the end, press «Complete report». In the short list press «Send details».
6. To stop, press «Finish later»: «Saved for later» appears.

**What you see.** The details are saved with the report. The Safety Manager no longer sees «Required data missing.» in the detail.

**Handoff.** If the data is missing, the Safety Manager and the deputy receive a notice «Report needs data». The reporter receives reminders according to the company's schedule.

**If a button or result is missing.**

- «Required details are still missing (n). Answer them or tick Unknown.»: answer or tick Unknown.
- Step 2 does not appear: the chosen type does not include it.

**Verification.** sources.

### 3.3 My reports: how do I follow a report I sent?

**Short answer.** «Open Report List. You see only your reports, with the status: New, Viewed, Analysis, Review or Saved. From the row menu open the report and read the Safety Manager's updates. If you reported anonymously, you answer in your private conversation.»

**Context.**

- Role: whoever is not part of management (pilot, technician, ground personnel). Managers see the work tabs.
- Device: browser.
- Initial screen: home › «Report List» › «Open» (`/reports`), title «Reports».
- Prerequisites: at least one report sent.

**Steps.**

1. Search with «Keyword», «Type», «Status» and «Search». «Clear all» resets the filters. Sort with «Most recent» or «Oldest».
2. Read the column «Status»:
    - «New»: no one has yet opened it;
    - «Viewed»: the Safety Manager opened it in the triage;
    - «Analysis» and «Review»: it is being analyzed;
    - «Saved»: the analysis is completed, possibly with corrective actions.
3. From the row menu choose «Open the report». In the «Your report» window, the «Updates for you» part shows the messages.
4. For an anonymous report, choose «Private conversation»; for a confidential one «Private updates».
5. If the «… needs additional information» banner appears, press «Complete now».

**What you see.** Updated status and Safety Manager messages. Without updates you see «No update yet. You get a notification when the Safety Manager writes to you.»

**If a button or result is missing.**

- «View RCA & CAP» appears only if you are also the assignee of the case.
- Reporters never see the internal risk assessment.


**Verification.** sources.

### 3.4 Triage: How does the Safety Manager route a new report?

**Short answer.** From Report List, open Triage. Review the suggested AI classification, the report type, urgency and deadlines. Choose the appropriate workflow and select Send to. The report keeps its original number.

**Context.**

- Role: Safety Manager, deputy indicated in triage settings, NGFT Administrator.
- Device: browser.
- Initial screen: home › «Report List» › tab «Triage».
- Prerequisites: at least one report.

**Steps.**

1. In the «Triage» tab filter with «Type», «Proposed workflow» and «Urgency». The columns are Report, Description, Type, Proposed workflow, Urgency, AI classification, Reported, Reporter.
    - «Immediate» reports not yet acknowledged appear in a red banner with «Acknowledge».
2. Click the row. «Triage <number>» opens.
3. «Original submission»: the original text is never modified.
4. Read the «Classification» of the AI. It is only a suggestion: «a hint only; it doesn't decide reportability». If the AI is wrong, use «Mark as accident or serious incident…»: alerts and deadlines start.
5. In «Times and reporting obligations» check the times of the event; correct them with «Set earlier…» and record the obligations with «Mark done…».
6. In «Workflow» › «Send to» choose: Occurrences, Observations, Improvements or Fatigue & Wellbeing. The proposed workflow comes from the report type. If you change it, a note is mandatory.
7. In «Urgency» choose Routine, Priority or Immediate. Routine and Priority only change the order of lists.
8. In «Confidentiality» you can only raise the confidentiality. It cannot be lowered afterwards.
9. Press «Send to <workflow>», for example «Send to Occurrences».

**What you see.** «<number> is now in <workflow> at <step>, with the same report number.» In the Occurrences workflow the report starts from the «Adding information» step.

**Handoff.** As soon as the Safety Manager opens the triage window, the reporter sees the status «Viewed».

**If a button or result is missing.**

- The «Triage» tab is missing: you are not Safety Manager, Deputy or NGFT Administrator. Other managers see Occurrences, Observations, Improvements tabs.
- The «Fatigue & Wellbeing» tab shows only aggregated counts: details are reserved for the restricted group and the designated person.
- The dotted box «The AI pre-triage proposal (workflow, urgency, duplicates, rationale) appears here once it is live.» indicates a function not yet active.

**Verification.** screens observed in the app with the Safety Manager profile ( Triage tab, open triage window without sending) and with the manager profile (no Triage tab; Fatigue & Wellbeing counts).

### 3.5 Report analysis: how do I analyze an event and link it to the Risk Register?

**Short answer.** «In the report detail, the Safety Manager completes the information and presses Save & Analyze. The AI summarizes the event and identifies the hazards. Then the SMS guides the steps: matching with the ECCAIRS taxonomy, assessment of severity and probability of each hazard in the Risk Register, ARMS ERC classification and final decision.»

**Context.**

- Role: Safety Manager, Accountable Manager or Company Account Owner. Only the Safety Manager saves the ARMS ERC classification.
- Device: browser.
- Initial screen: «Reports» › tab «Occurrences» › row menu › «View» (`/reports/<id>`).
- Prerequisites: report sent to the Occurrences workflow; tolerability matrix configured.

**Steps.** The steps bar shows: Adding information, Analysis, Review results, ECCAIRS matching, Risk Register, ARMS ERC, Summary, RCA & CAP.

1. **Adding information.** Check attachments and type. Add notes with «Add information». For an anonymous report, use «Contact Reporter».
2. Press «Save & Analyze». «Hold on, we are analyzing the report... It may take a few minutes.» appears. The AI reads notes and PDFs; it does not read images, Office files or videos.
3. **Review results.** Read «Analysis Result» and «Identified Hazards». To add a hazard, select the text and use «Mark as a hazard». «Add more information» goes back to step 1.
4. **ECCAIRS matching.** Press «Suggest Entities» and then «Start Matching»: the AI proposes the entries of the ECCAIRS taxonomy.
5. **Risk Register.** For every hazard, press «Analyze Hazard»: the AI proposes severity and probability, evaluated on the company's matrix. You can look for an existing risk with «Search Risk Register». Press «Next» to save the risks.
6. **ARMS ERC.** The Safety Manager saves the classification with «Save ERC».
7. **Summary.** The «What next?» panel offers decisions, for example «Assign RCA & CAP» or «Close with no further action».

**What you see.** The report has hazards, risks in the Risk Register and an ARMS ERC classification. In the Risk Register, new risks have the source «Occurrence».

**Buttons for anyone reading the report.**

- «Download Report Info» and «Download Full Report»: PDF created in the browser.
- «Ngft-print»: disabled if the company is not connected to NGFT.
- «Authority deadline: n h remaining»: It appears when the event is to be notified to the authority.

**If a button or result is missing.**

- You see «View Report» without the steps bar: your role is not SM, AM or Company Account Owner.
- «Tolerability matrix was not configured for this company.»: configure the matrix in «Configuration».
- «Please make sure all hazards are analyzed»: press «Analyze Hazard» on every hazard.
- «Next» locked at the ARMS ERC step: the Safety Manager must save the classification.
- Closed report: all changes are hidden.


**Verification.** sources.

### 3.6 RCA & CAP: How do I assign and approve a root cause analysis and corrective action plan?

**Short answer.** From the report summary, the Safety Manager selects Assign RCA & CAP, chooses a manager and sets two deadlines. The manager performs the root cause analysis, prepares corrective actions and submits them. The Safety Manager approves them or gives a reason for rejecting them.

**Context.**

- Roles:
    - assigns, approves and rejects: only the Safety Manager (plus NGFT Administrator);
    - performs: a user with a management role (e.g. NPFO, Head of Training, Base Manager, CMM).
- Device: browser.
- Initial screen: report detail › step «Summary» › «What next?».
- Prerequisites: ARMS ERC classification saved.

**Steps.**

1. The Safety Manager chooses «Assign RCA & CAP».
2. Fill «Assign to», «RCA Due Date», «CAP Due Date» and press «Assign». To change the assignee use «Update».
3. The assignee receives a notification and an email. In the report detail they use:
    - «Analyze GAP»;
    - «Perform RCA», with one of the methods «Quick AI Classifier», «5 whys», «Fishbone diagram», «Manual Classification», and «Perform analysis»;
    - «Create CAP» and «Generate CAP»: the AI proposes «Immediate Actions», «Short-term Actions», «Long-term Actions».
4. The assignee presses «Submit RCA & CAP». Safety Managers receive a notification.
5. The Safety Manager chooses «Approve RCA & CAP» or «Reject» with a mandatory reason. After a rejection the assignee uses «Resubmit RCA & CAP».
6. After approval, the assignee chooses the outcome:
    - «Create Report»: an implementation report, which the Safety Manager approves or rejects;
    - «Create Project»: a Management of Change project.

**Visible statuses.** RCA & CAP Assigned, In Progress, Submitted, Accepted, Rejected; then Report Submitted, Report Approved, Report Rejected or Project Started, Project Submitted, Project Results Accepted.

**What you see.** Approved root cause analysis and corrective actions linked to the report. The report can be closed.

**If a button or result is missing.**

- The assignee does not appear in the list or the assignment fails: the user does not have a management role.
- The Safety Manager does not see the content: while the state is Assigned or In Progress, the content is visible only to the assignee.
- Only the assignee edits and submits.

**Verification.** sources. In the demo the Safety Manager profile home shows «OVERDUE ACTIONS 1 · 1 RCA».

### 3.7 Closing: How do I close a report?

**Short answer.** «There are two ways. If the event requires nothing else, the Safety Manager chooses Close with no further action in the summary and writes the reason. If there are corrective actions, they close with Close Report after the implementation report or the project has been approved. A closed report can no longer be changed.»

**Context.**

- Role: Safety Manager.
- Device: browser.
- Initial screen: report detail.
- Prerequisites: see the two ways.

**Steps, closing without actions.**

1. Step «Summary», in «What next?», choose «Close with no further action».
2. Write the reason (mandatory, maximum 2000 characters). If the ARMS ERC classification is red or amber, a notice appears.
3. Confirm. In the register «Closed by <name> on <date>: "<reason>"» appears.

**Steps, closing after the actions.**

1. Wait for «Report Approved» or «Project Results Accepted» status.
2. Press «Close Report» and confirm «Are you sure you want to close this report?».

**Other choices in the «What next?» panel.**

- «Start a MoC project»: for managers.
- «Report to the authority»: disabled, «Comes with the Authority Reporting module.».

**What you see.** Status «Closed». The report is locked. The menu item «Report on Safety Promotion» appears on the Occurrences list.

**If a button or result is missing.**

- «Close with no further action» appears only in ARMS ERC, Summary or Saved states, and not after RCA & CAP starts.
- «Close Report» appears only for the Safety Manager and only in the states indicated.

**Verification.** sources.

### 3.8 Risk Register and Matrix: How do I prepare for a safety meeting?

**Short answer.** Open Risk Register and switch to Matrix. Use Initial and Residual to see the counts before and after mitigation. Select an Initial cell to see the matching risks and choose Export to download Excel. For a PDF summary, use the Safety Cockpit export.

**Context.**

- Role: Safety Manager, Accountable Manager, Company Account Owner, NGFT staff.
- Device: browser, wide screen recommended.
- Initial screen: home › «Risk Register» › «Open» (`/risk-register`).
- Prerequisites: tolerability matrix configured, otherwise the colours are missing.

**Steps.**

1. In «Risks», the «List» view shows Number, Risk title, Groups, Initial, Residual, Status, Owner, Review due, Source, Created.
2. Narrow down with «Filters»: Status, Risk Groups, Owner, «Only overdue reviews», Source, Probability, Severity. Sort with «Sort by» (Rating, Number, Review due, Owner, Created).
3. Press «Matrix».
    - Rows: Frequent, Occasional, Remote, Improbable, Extremely improbable (5 to 1).
    - Columns: Catastrophic, Hazardous, Major, Minor, Negligible (A to E).
    - Under the matrix: totals for Intolerable, Tolerable, Acceptable and «Total: n risks».
4. Choose the «Initial» or «Residual» level.
5. Click a cell of the Initial level: you go back to the filtered list, with the label «Cell 3B». The cells of the Residual level are not clickable.
6. Press «Export». `risk-register-YYYY-MM-DD.xlsx` is downloaded, with the filtered list.

**What you see.** Matrix with counts; Excel file with a «Risks» sheet.

**If a button or result is missing.**

- You see «No permission»: the Risk Register is reserved for SM, AM, Company Account Owner and NGFT staff. The Company Administrator cannot open it, even though the API allows them to write.
- Grey cell or «Tolerability unknown»: the tolerability matrix is not configured.
- You want a PDF: the Risk Register only exports Excel. The PDF with the matrix's summary comes from Safety Cockpit.

**Verification.** screens observed in the app with the Safety Manager profile (list, filters, Matrix view with Initial and Residual; unrun download) and with the manager profile (`/risk-register` leads to «No permission»); sources for the `.xlsx` format.

### 3.9 New risk: how do I register a risk by hand?

**Short answer.** «In the Risk Register press Register new risk. Write the hazard name, description and consequences, then Create and Analyze Hazard. The AI proposes severity and probability on your company's matrix. You can correct them and save with Save Risk. The risk receives a number and a review date.»

**Context.**

- Role: Safety Manager, Accountable Manager, Company Account Owner, NGFT staff.
- Device: browser.
- Initial screen: «Risk Register» › «Register new risk» (`/risk-register/create-risk`), title «Create Hazard and Analyze Risk».
- Prerequisites: tolerability matrix; AI service available for the company.

**Steps.**

1. «Hazard Name» (at least 3 characters), «Hazard Description» (at least 10) and «Consequences», separated by commas (at least 5 characters). On the right you can look for similar risks already registered.
2. Press «Create and Analyze Hazard». «Hold on, we are creating and analyzing the hazard...» appears.
3. In «Analysis Results» check the tolerability. With the Severity/Probability switch, correct the proposed values.
4. Press «Save Risk». To cancel, press «Discard» and confirm «Discard changes?».

**What you see.** Risk with number `R-YYYY-NNNN`, status «Assessed», source «Manually created». The first review date is today plus the company's interval (12 months if not configured).

**If a button or result is missing.**

- Unconfigured matrix message: configure the matrix in «Configuration».
- Error in Step 2: AI service refused the request, for example for a role that is not enabled or because the AI budget is exhausted.


**Verification.** sources. In the demo the «Register new risk» button is visible to the Safety Manager profile.

### 3.10 Risk life cycle: how do I review a risk and change its status?

**Short answer.** «Open the risk from the Risk Register. At the top you find Mark as reviewed, Create strategy and Change status. A risk goes from Identified to Assessed with a rating, to Mitigated with at least one linked strategy, then to Monitored. The residual rating is entered after linking a strategy.»

**Context.**

- Role: Safety Manager, Accountable Manager, Company Account Owner, NGFT staff.
- Device: browser.
- Initial screen: «Risk Register» › click the row (`/risk-register/<id>`).
- Prerequisites: a registered risk.

**Steps.**

1. Read the header: number, title, status, Owner, Review due (with «Overdue» if overdue), Initial rating, Residual rating.
2. Use the six tabs: Details, Strategies, Risks, Linked Reports, Bowties, History.
3. To record the review, press «Mark as reviewed». The next review is due one company interval from today.
4. To link a measure, press «Create strategy».
5. For the residual rating, in the Details tab fill in probability and severity and press «Save residual rating». Both values are needed, or neither.
6. To change the status, use «Change status»:
    - Identified → Assessed: a rating is needed;
    - Assessed → Mitigated: at least one linked strategy is needed;
    - Mitigated → Monitored;
    - any open state → Closed: «Reason for closing» is needed;
    - Closed → «Reopen as Monitored».
7. To assign an owner, use «Edit» › «Edit owner, review due and reference».

**Actions on several risks.** In the list select multiple rows. The bar offers Set owner, Set status, Set review due, Add to group, Remove from group, Delete; confirm with «Apply». «Bulk actions» also offers «Create group» and «Create mitigation strategies».

**What you see.** Status and dates updated; the History tab logs changes.

**If a button or result is missing.**

- «Link a mitigation strategy first»: Residual rating requires a linked strategy.
- «Not available: needs at least one linked mitigation strategy.»: applies to the transition to Mitigated.
- «Mark as reviewed» is disabled on a Closed risk.

**Verification.** screens observed in the app with the Safety Manager profile (heading, buttons and six tabs of a risk with an overdue review; no modification), sources for state rules.

### 3.11 Import from Excel: How do I import an existing risk register into SMS?

**Short answer.** «In the Risk Register press Import from Excel and upload the xlsx file. The SMS recognizes the format of the NGFT register, in German or in English; for other sheets you map the columns. You see a preview with warnings and errors, then you import risks, strategies and groups. If something is wrong, Undo this import deletes everything the import created.»

**Context.**

- Role: Safety Manager, Accountable Manager, Company Account Owner, NGFT staff.
- Device: browser.
- Initial screen: «Risk Register» › «Import from Excel» (`/risk-register/import`). Also from the Best Practice Register.
- Prerequisites: file `.xlsx`; full tolerability matrix.

**Steps.** The steps are Upload, Options, Preview, Result.

1. **Upload.** Drag the file or use «click to upload». Limits: «Only .xlsx files are allowed. 10 MB max file size, 20 MB max unzipped.» The SMS shows the sheets, the recognized profile and the number of rows.
2. **Options.**
    - «Sheet» and «Language»: «German (DE)» or «English (EN)».
    - «Action item status»: «Done (measures are in force)» or «Open».
    - «Create risk groups from activity groups».
    - «Duplicates»: «Skip rows already in the Risk Register» or «Import anyway».
    - «Column mapping» for unrecognized sheets.
3. **Preview.** Read To import, Warnings, Skipped, Errors and status of each line. Press «Import n risks».
4. **Result.** «Import complete» with counts. Open «Open Risk Register» or «Open Best Practice Register».

**What you see.** Risks with source «Imported», strategies in the Best Practice Register and risk groups. The «Imports» tab lists the import.

**Undo.** «Undo this import» › «Undo this import?»: deletes all the risks, strategies and groups created. It is also available later on the «Imports» tab.

**If a button or result is missing.**

- «This sheet cannot be imported yet» with the «Set up the tolerability matrix on the dashboard» link: complete the matrix.
- Row errors: format not recognized, missing rating, probability outside 1–5 or severity outside A–E.
- «The file changed since the preview, upload it again»: upload the file again.
- There is no downloadable template in the interface.

**Verification.** sources. In the demo the «Import from Excel» buttons and the «Imports» tab are visible to the Safety Manager profile.

### 3.12 Mitigation Strategies: How do I document measures against a risk?

**Short answer.** «Open Mitigation Strategies, i.e. the Best Practice Register, or press Create strategy from a risk. Write the goal and description, link the risks, add the actions and, if you want, the expected residual risk. The actions have a status: Open, In progress, Done.»

**Context.**

- Role: write access for SM, CMM, AM, NPFO, NPCT, NPGO, NPCA, NPMO, Head of Training, Company Account Owner, Company Administrator, NGFT staff. Other managers (for example CFI, Base Manager, AI Manager) read a strategy only from a direct link.
- Device: browser.
- Initial screen: home › «Mitigation Strategies / Best Practice» (`/best-practice-register`), title «Best Practice Register».
- Prerequisites: none; linking a risk is optional.

**Steps.**

1. Press «Create Mitigatison Strategies» (the label contains a typo). From a risk: «Create strategy»; from a group: «Create strategy for this group».
2. In «Risks» use «Import Risks» to link risks if needed.
3. Open «Add Mitigation Strategy» and fill in:
    - «Strategy Goal» and «Strategy Description» (mandatory);
    - «Select Risks»;
    - «Residual probability» and «Residual severity», both or none;
    - «Action Items»: at least one action per group.
4. Press «Add». The strategy is already saved.
5. Press «Save».

**What you see.** The strategy appears on the Best Practice Register «Active» tab, with Linked Risks and Action Items. The associated risk may pass to «Mitigated».

**Editing.** Open the strategy: «Edit This Strategy», then «Save Changes». The state of the actions changes with «Change status».

**If a button or result is missing.**

- You do not see the card in the home: CMM, NP and Head of Training can write strategies but do not have the card. They open `/best-practice-register` from the link.
- In the list there is no «Delete»: use «Deactivate» and the strategy moves to the «Inactive» tab.
- «Import from Excel» appears only to those who can use the Risk Register.

**Verification.** screens observed in the app with the profile manager (page, button and columns; no creation), source for the form.

### 3.13 Hazard Analysis: How do I find the hazards in a report with AI?

**Short answer.** «Open Hazard Analysis and press Analyze. Upload the report as a PDF or write the text, then Start Analysis. The AI lists the hazards. Select them and press Analyze severity & probability: you get severity, probability and mitigation proposals. Export Hazards as PDF creates the report to share.»

**Context.**

- Role: the card is in the home of SM, AM and Company Account Owner. The AI service includes AI Manager, Safety Manager, Accountable Manager, NPFO, NPCT, NPGO, NPCA, CMM, Head of Training, CFI, CTKI, Base Manager, Auditor and NGFT Administrator.
- Device: browser.
- Initial screen: home › «Hazard Analysis» (`/hazard-analysis`).
- Prerequisites: report in PDF (maximum 10 MB) or text; active subscription and AI budget of the company not exhausted.

**Steps.**

1. Press «Analyze». It opens «Analyze Report».
2. Upload a PDF or write in «Or write your report». Don't use both of them.
3. Press «Start Analysis». «Analyzing is in progress» appears. For the text the SMS converts it first to PDF.
4. At the end «View Report and Hazards» opens with the original file and «Identified hazards».
5. Select the hazards and press «Analyze severity & probability». Then click on a hazard to see the results:
    - Severity: Overall Severity, Confidence, Level of damage, Level of injury, Safety barriers, Operational human factors;
    - Probability: Overall Probability, Qualitative Probability, Qualitative Company, Quantitative;
    - Risk Mitigation: measures with priority and times. If it is missing, press «Generate Mitigation Analysis».
6. Correct severity and probability with «Save» if needed.
7. Press «Export Hazards as PDF».

**What you see.** The report appears in the list with the number of hazards. The PDF «Hazard Analysis Report» is called `<file>_hazard_analysis.pdf`. Classes follow the ICAO schema: severity from Catastrophic (A) to Negligible (E), probability from Frequent (5) to Extremely Improbable (1).

**Handoff.** The hazards do not go to the Risk Register by themselves. You can use them in a Bowtie with «From a hazard analysis».

**If a button or result is missing.**

- Access error from the AI service: your role is not allowed (for example Company Account Owner without other roles, NGFT Support).
- «Company has no active subscriptions» or exhausted AI budget.
- «Export Hazards as PDF» appears only after the analysis of at least one hazard.
- «Please use either file upload or text editor, not both».


**Verification.** screens observed in the app with both profiles (list with analyzed reports, «Analyze» button; no started analysis), source for flow.

### 3.14 Bow-Tie Analysis: How do I build a Bow-Tie model?

**Short answer.** «Open Bow-Tie Analysis and press New bowtie. Start from scratch, from a risk in the register, from an AI hazard analysis, from a root-cause type or from the description of an event. In the diagram add threats, barriers and consequences and evaluate the effectiveness of each barrier. With Validate and Set active the model becomes active. Export creates a PNG or PDF with the barrier register.»

**Context.**

- Role: Safety Manager, CMM (also CAMO and Maintenance), Accountable Manager, NPFO, NPCT, NPGO, NPCA, NPMO Part 145, Head of Training, NGFT Administrator. There is no read-only role: the others receive the PDF.
- Device: browser, large screen.
- Initial screen: home › «Bow-Tie Analysis» (`/bow-tie-analysis`), title «Bowtie Analysis».
- Prerequisites: for the colors of «Scenario ranking», tolerability matrix configured.

**Steps.**

1. Press «New bowtie». Choose the starting point:
    - «Blank»: Title, Hazard, Top event;
    - «From a risk»: from a risk of Risk Register;
    - «From a hazard analysis»: from AI; if mitigation analysis is missing, it can take up to 3 minutes;
    - «From a root-cause type»: from the list of causes;
    - «From an event description»: text from 20 to 4000 characters, then «Identify hazards».
2. Press «Create bowtie». The proposed elements come as candidates: accept them or discard them.
3. In the diagram use the bar: Threat, Barrier, Consequence, Escalation factor, Fit, Undo. Drag the items; click to edit; right click for other actions.
4. For each barrier, set the function (Prevent, Control, Mitigate) and rate adequacy and reliability: the effectiveness becomes Effective, Weak, Gap or Not rated.
5. With «Mitigation action» you create an action in a strategy of the Best Practice Register.
6. Press «Validate», then «Set active».
7. Press «Export» and choose «PNG of the canvas» or «PDF (diagram + barrier register)».

**What you see.** Bowtie in status «Active», with the tabs Diagram, Barriers, Threats & consequences, Scenario ranking, Linked, Actions. In the Risk Register the «Bowties» tab of the linked risk lists it.

**If a button or result is missing.**

- «The bowtie cannot be activated yet — see the highlighted elements.»: the hazard or the top event is missing, there are disconnected elements or no barrier.
- The Company Account Owner and NGFT Support have no access.
- «Your company's AI budget is spent.» or «The hazard analysis is unavailable. Try again later.»: the AI starting point is not available; start from «Blank».
- Deleted items cannot be recovered with Undo.


**Verification.** screens observed in the app with profile manager (list, columns and button «New bowtie»; no creation), source for editor.

### 3.15 Management of Change: How do we evaluate and approve a change?

**Short answer.** «Open Management of Change and press Create Project. Enter the title, the type of change and whom to send it to. The AI pre-fills the analysis sections: impact, risks, options, timeline, budget and indicators. The project owner submits the project, and the recipient approves or rejects it. After approval the tasks are tracked on a board.»

**Context.**

- Roles:
    - create: managers (SM, AM, NP, Head of Training, CMM, Base Manager, Company Account Owner, Company Administrator and others);
    - read and contribute: also AI Manager, crews, ground staff, instructors, CAMO and maintenance;
    - approve: only the recipient of the project.
- Device: browser.
- Initial screen: home › «Management of Change» (`/change-management`).
- Prerequisites: none.

**Steps.**

1. Press «Create Project». In «Project Proposal» fill in «Project title», «Project type» (Operational, Procedural, Emergency & Contingency, Organizational, Technological, Compliance & Regulatory), «Description», «Initiated by», «Submit to», «Mitigation strategies». Press «Create».
2. The project is in «Draft». Open the tabs: Initiation, Impact Analysis, Risk Analysis, Implementation Options, Expected Timeline, Budgeting, Performance Metrics, Recommendation.
    - When you open an empty tab, the AI pre-fills it: «Almost there... Our AI is working to pre-fill your tab…».
    - In Risk Analysis use «Identify and Analyze Hazards» (AI) or «Create and Analyze Hazard».
    - In the editor select a text and use the AI assistant: «Shorter», «More details», «Simplify» or a free request.
3. The project owner presses «Submit» and confirms «Submit Proposal». The recipient receives an email.
4. The recipient presses «Approve» or «Reject» with a «Remark (required)». The project owner receives an email.
5. After approval, go to «Board»: columns Draft, Assignment, In Progress, Evaluation. Create tasks with «Create Task».
6. When all tasks are in Evaluation, press «Close Project».

**Statuses.** Draft, Proposed, Approved, Rejected, Closed. «Full timeline» shows the history. «Re-open» brings a closed project back to Approved, with a mandatory note.

**Exports.** «Download Project» (PDF), «Download Attachments», «Export» in the list (CSV).

**Handoff.** A project can start from a report («Start a MoC project») or from an approved RCA & CAP. The status of the project updates the status of the report; closing the project closes the report. The hazards found here feed the Safety Cockpit and the Risk Register with source «Management of Change».

**If a button or result is missing.**

- «Create Project» is missing: your role is not management.
- «Approve» and «Reject» are missing: only the recipient sees them, only in the Proposed state.
- «Close Project» is disabled: «To close the project all the tasks should be in evaluation.»
- The board gives an error to a crew member: the board is reserved for management, company administrators and AI Manager.

**Verification.** screens observed in the app with profile manager (list, columns, button «Create Project»; no creation), source for flow.

### 3.16 Safety Cockpit: how does the Safety Manager get an overview?

**Short answer.** «On the home page the Safety Manager sees the Safety Cockpit band with new reports, risks, unassessed hazards, overdue actions and overdue reviews. Open cockpit opens the full page: work queues per area, risk matrix, latest reports and bulletins. Export downloads a PDF.»

**Context.**

- Role: Safety Manager, Company Account Owner, Company Administrator, NGFT Administrator.
- Device: browser, large screen.
- Initial screen: home › band «Safety Cockpit» › «Open cockpit →» (`/safety-cockpit`).
- Prerequisites: none.

**Steps.**

1. In the home read the tiles: NEW REPORTS (by type), RISKS (intolerable and tolerable), UNASSESSED HAZARDS (by source), OVERDUE ACTIONS (RCA and CAP), RISKS OVERDUE FOR REVIEW.
2. Press «Open cockpit →».
3. Choose the period: «Last 30 days», «Last 90 days» (default), «Last 12 months».
4. Read the sections:
    - «Reports by area»: TRIAGE, OBSERVATIONS, IMPROVEMENTS, FATIGUE & WELLBEING, with links «Open Triage →» and the like;
    - «Risk Matrix»: a click on a cell opens the Risk Register;
    - «Latest occurrences», «Hazards by source», «Latest safety bulletins».
5. Press «Export» to download the PDF, with the summary of the risk matrix.
6. With «Configure tiles» choose the visible tiles. The choice remains only in that browser.

**What you see.** Overall view for the chosen period; PDF downloaded.

**If a button or result is missing.**

- The band does not appear in the home and the page gives «No permission»: your role is not among those indicated.
- The «Safety Performance Indicators» box shows «Under Development»: Trend charts in the cockpit are not yet available. The indicators are in Safety Assurance.
- The Company Administrator sees the matrix, but a click on a cell leads to «No permission», because they cannot open the Risk Register.

**Verification.** screens observed in the app with the Safety Manager profile (band in the home, page with period, sections and buttons; PDF not downloaded) and with the manager profile (no band, page «No permission»).

### 3.17 Safety Promotion: how do I publish a safety bulletin?

**Short answer.** «Open Safety Promotion and press Create safety bulletin. Write title, introduction and text, with the help of the AI assistant if you want. Choose the publication date, the expiry and the audience by role or by person, then Publish. In the bulletin you see who read it and who didn't.»

**Context.**

- Role: Safety Manager, Accountable Manager, Company Account Owner.
- Device: browser.
- Initial screen: home › «Safety Promotion» (`/safety-promotion`), title «Safety Bulletins».
- Prerequisites: none.

**Steps.**

1. Press «Create safety bulletin».
2. Fill «Title», «Lead-In», «Content» and, if needed, «Attachments» (maximum 2).
3. «Posting date» (today by default), «Expires on» or «Doesn't expire».
4. In «Target Audience» choose «Roles» or «Users» and select the recipients.
5. Press «Publish».

**From a closed report.** In the Occurrences list, the menu of a closed report offers «Report on Safety Promotion»: it opens the bulletin with the PDF of the report already attached.

**What you see.**

- Today's date: the bulletin is in the «Posted» tab.
- Future date: it is in «Scheduled» and is published on that day. At expiry it moves to «Archive».
- In the bulletin, the audience list shows «Read at» or «Not read».

**Handoff.** Staff do not read the bulletins in the SMS web app. The SMS sends an event to other NGFT apps. The bulletins also appear in the Safety Cockpit, in «Latest safety bulletins».

**If a button or result is missing.**

- «No permission»: the module is for SM, AM and Company Account Owner.
- «Delete» exists only for scheduled bulletins. For the others use «Archive».


**Verification.** screens observed in the app with the Safety Manager profile (list with published bulletins, creation button; no creation), sources for creation.

Where the staff reads the bulletin after publication is not verified.

### 3.18 Safety Assurance: how do I measure safety performance?

**Short answer.** «In Safety Assurance set a target and a warning threshold for each indicator. The SMS calculates the monthly values by itself: number of reports, time between report and analysis, duration of change projects. The charts compare the value with target and threshold.»

**Context.**

- Role: Safety Manager, Company Account Owner, Company Administrator.
- Device: browser.
- Initial screen: home › «Safety Assurance» (`/safety-assurance`).
- Prerequisites: at least one target set.

**Steps.**

1. Open the «Perfomance Targets» tab.
2. For an indicator fill in «Target value…», «Warning value…» and «Description».
3. Press «Create Target» or «Update Target».
4. Open «Dashboard» or «Performance Indicators» to see the charts (legend: SPI, Target, Warning).

**Calculated indicators.**

- «Number of reports submitted by users».
- «Time between report submission and analysis».
- «Time to develop and sign off project management changes».
- «Time to implement Management of Change project».

**What you see.** Monthly graphs of the current year.

**If a button or result is missing.**

- «You have not setup any SPTs yet» with «Setup SPT»: set a target.
- Other managers open the page but do not see data: the service accepts only SM, Company Account Owner and Company Administrator.
- The «Updates» block shows «Coming soon»: it is not yet available.

**Verification.** screens observed in the app with both profiles (profile manager: «You have not setup any SPTs yet»; Safety Manager profile: indicator «Number of reports submitted by users» with «See Details»), sources for calculation.

### 3.19 Emergency Response Plan: how do I prepare the emergency plan?

**Short answer.** «In the Emergency Response Plan prepare teams, checklists, external contacts, documents and emergency types. During an emergency the team works from the NGFT mobile app: it receives the notification, joins the video call and uses the checklists. On the web, Emergency Logs shows the history of each emergency.»

**Context.**

- Role: preparation, Safety Manager, Accountable Manager, Company Account Owner. Starting an emergency: a member of the emergency team. Closing: the team leader.
- Device: browser for preparation and logs; mobile app for emergency.
- Initial screen: home › «Emergency Response Plan», title «Emergency Response Plan Dashboard».
- Prerequisites: team users present in the company.

**Steps of preparation.**

1. «Teams»: Create a team with name, description, «Members» and «Team lead».
2. «Checklists»: create a template with «Checklist name», «Emergency Type (optional)», the items and «Add item».
3. «External Contacts» and «Documents»: add contacts and upload documents with «Upload».
4. «Emergency Types»: create a type with «Emergency type name» and «Emergency type icon», then choose the team or «Create a new team».

**During and after an emergency.**

1. A team member starts the emergency from the mobile app. All members receive a notification with the link to the video call.
2. On the web, open «Emergency Logs» and click on the emergency.
3. The timeline shows automatic events (creation, closure, completed checklist items, video call). Add notes with «Add Log».

**What you see.** Ready plan; history of each emergency.

**If a button or result is missing.**

- There is no button on the web to start an emergency.
- «External Contacts» and «Documents» have the description «TBD» in the dashboard.


**Verification.** screens observed in the app with the Safety Manager profile (dashboard with six tabs; no creation), source for mobile startup. Mobile app not verified.

### 3.20 External Accident DB: how do I look for accidents from other operators?

**Short answer.** «Open External Accident DB. It contains public accident reports, imported every night from Aero Inside. Filter by description, location, date, country or airport and export the list. Managers can give an accident their own ARMS ERC classification, which other companies do not see.»

**Context.**

- Role: company managers and NGFT staff.
- Device: browser.
- Initial screen: home › «External Accident DB» (`/external-reports`), title «External Report Database».
- Prerequisites: none.

**Steps.**

1. Filter with columns: Description, Location, Source, Country, Incident date, Status, Airport code, Screened, Investigation.
2. Choose columns with «Columns».
3. Click on a report to read it.
4. From the row menu, «ARMS ERC» assigns your company's classification. The Safety Manager saves it.
5. «Export» downloads the list in CSV.

**What you see.** Filtered list; own ARMS ERC classification.

**If a button or result is missing.**

- The card also appears to pilots and operational staff, but the page is reserved for managers: whoever is not a manager sees «No permission».
- «Upload Report» is only for NGFT staff.


**Verification.** screens observed in the app with profile manager (list, columns, reports; no export), sources for data source.

### 3.21 Configuration: how do I set up the tolerability matrix and the report types?

**Short answer.** «On the home page open Configuration. In the Tolerability Metric tab, choose for each cell of the 5 by 5 matrix whether the risk is intolerable, tolerable or acceptable. The Safety Manager also manages report types, triage rules, the risk review interval and the ARMS ERC settings. Each setting applies only to your company.»

**Context.**

- Role:
    - tolerability matrix: SM, AM, Company Account Owner, Company Administrator, NGFT staff;
    - report types and triage: only the Safety Manager;
    - ARMS ERC: Safety Manager or Company Administrator.
- Device: browser.
- Initial screen: home › «Configuration» › «System Configuration», «Settings for this company only.».
- Prerequisites: none.

**Steps.**

1. «Tolerability Metric» › «Configure Tolerability Metric».
2. Select the cells and press «Mark as intolerable», «Mark as tolerable» or «Mark as acceptable».
3. Save with «Set Configuration» the first time, «Complete Configuration» if cells are missing, «Update Configuration» to change.
4. «Report types»: rename, hide, reorder, add or archive types. Archiving does not delete.
5. «Triage and escalation»: operational contact, reminders and «Risk review interval (months)» (12 by default).
6. «ARMS ERC»: classification settings.

**What you see.** Matrix colors in Risk Register, Safety Cockpit and Bowtie; updated types in the «New report» form.

**If a button or result is missing.**

- «Read-only · only the Safety Manager changes the report types.»: you are not Safety Manager.
- The «Configuration» card appears only for SM, AM, Company Account Owner and NGFT staff.


**Verification.** sources. In the demo the «Configuration» card is visible to the Safety Manager profile.

### 3.22 Access: Why don't I see a module or button?

**Short answer.** «The SMS shows the modules based on your roles in the selected company. If you open a page not intended for your role, you see No permission. If an action is refused because of the role, a message appears: your role does not allow this action, ask your company administrator for access. The roles are assigned in the NGFT administration, not in the SMS.»

**Context.**

- Role: everyone.
- Device: browser.
- Initial screen: any.
- Prerequisites: NGFT account.

**What to check.**

1. **The company.** In the home, in «Organization», check the selected company. If you work for multiple companies, choose the right one from the drop-down menu. The account menu shows «Current Company».
2. **The page «Access Denied».** «You don't have the required roles to access SMS application for the selected company.» Use «Switch Company» or ask for a role.
3. **The page «No permission».** «The page you're trying access has restricted access. Please refer to your system administrator». Use «Go To Home». The module is reserved for other roles.
4. **The missing role notice.** «Your role does not allow this action. Ask your company administrator for access.» It appears when a save is refused because of the role.
5. **The record state.** Many buttons depend on the state: for example a closed report can no longer be changed.
6. **The language.** The language selector offers English, Deutsch, Italiano, Français. Some labels remain in English.

**Other elements.**

- «Back to Cockpit» (top icon) opens the NGFT Cockpit in a new tab.
- «Messaging» and «Start a new chat» below open the chat between users.
- If an NGFT administrator logs in on your behalf, the «Impersonated» indicator appears.


**Verification.** screens observed in the app for «No permission» (profile manager on Risk Register, Safety Promotion, Emergency Response Plan, Safety Cockpit) and home header; sources for other messages.

The notice «Your role does not allow this action» is documented in a branch of development. The availability on the customer's version must be verified.

### 3.23 Authority Reporting, Data Exchange and Safety Audits: What is available today?

**Short answer.** SMS already shows reporting deadlines. Authority Reporting, Data Exchange and Safety Audits are listed as Coming Soon in the documented version. Submitting a report to the authority from this interface is pending.

**Context.**

- Role: manager.
- Initial screen: home › section «Coming Soon» › «Authority Reporting», «Safety Audits», «Data Exchange».

**What the visitor sees.**

- The three pages show «This feature will be available soon.», «This module is currently under development.» and «Go back».
- In the report: the «Authority deadline: n h remaining» indicator and the disabled choice «Report to the authority», «Comes with the Authority Reporting module.».
- The matching with the ECCAIRS taxonomy and the ARMS ERC classification are already available.


**Verification.** screens observed in the app (page «Authority Reporting» and «Coming Soon» cards), source and documentation.

### 5.1 Demo A: Prepare the safety meeting

- **Visitor's phrase:** «What do we discuss at the next safety meeting?»
- **Account or role:** Safety Manager in the NGFT test company.
- **Sample record:** a demo risk with an overdue review and an initial rating.
- **Actions:**
    1. In the home, show the band «Safety Cockpit»: RISKS and RISKS OVERDUE FOR REVIEW.
    2. «Open cockpit →»: «Reports by area» and «Risk Matrix».
    3. Open «Risk Register» › «Matrix», then «Initial» and «Residual».
    4. Click a cell: filtered list; open the overdue risk and show the six tabs.
- **Outcome:** risk list to be discussed; with «Export» an Excel from the Risk Register or a PDF from the Safety Cockpit.
- **Format:** silent clip 20–30 s (steps 1–3) and guided demo 60–90 s (all steps, with export).
- **Data changes:** none, if you do not press «Mark as reviewed». No reset needed.
- **Verification:** observed in the app, read only (steps 1–4). Downloads not tested.

### 5.2 Demo B: from the pilot's report to triage

- **Visitor's phrase:** «A pilot reports an event: what happens next?»
- **Account or role:** a user with a Pilot role for sending and a Safety Manager for triage, in the NGFT test company. With only one Safety Manager account, the demo works, but the view «Reports» shows the management tabs.
- **Sample record:** a new report of type «Observation» or «Incident», with a demo text, for example: «During taxi a cone was found on the taxiway, no damage». No real data.
- **Actions:**
    1. «Reporting»: fill out type, place and description; check «Report anonymously»; «Submit».
    2. Show «Report saved» and, if it appears, step 2 with «Filled for you».
    3. As Safety Manager: «Report List» › «Triage», open the report, read the AI classification.
    4. Choose the workflow and «Send to Occurrences» (or «Send to Observations»).
- **Outcome:** the report is in the chosen workflow, with the same number. The reporter sees «Viewed».
- **Format:** guided demo 60–90 s. Not suitable for a live silent clip, because the AI takes a variable time; record the clip in advance.
- **Data changes:** Yes. Each test creates a report and sends an email to the Safety Manager of the company.
- **Reset:** not verified. After the triage, in the «Occurrences» tab, the Safety Manager has «Delete» in the row menu (sources). For a report not yet triaged, no deletion has been found in the interface.

### 5.3 Demo C: AI finds the hazards in a report

- **Visitor's phrase:** «Can the AI help us analyze an accident report?»
- **Account or role:** Safety Manager or AI Manager in the NGFT test company.
- **Sample record:** a public and anonymous PDF of a helicopter event, or a demonstration text written in «Or write your report».
- **Actions:**
    1. «Hazard Analysis» › «Analyze», upload the PDF, «Start Analysis».
    2. Select two hazards and press «Analyze severity & probability».
    3. Open a hazard: Severity, Probability, Risk Mitigation.
    4. «Export Hazards as PDF». Extension for a safety manager audience: «Bow-Tie Analysis» › «New bowtie» › «From a hazard analysis».
- **Outcome:** hazards with severity and probability on the ICAO scale and a PDF «Hazard Analysis Report».
- **Format:** guided demo 60–90 s with an analysis already prepared; silent clip 20–30 s recorded in advance. Live analysis can last minutes.
- **Data changes:** Yes. Each analysis remains on the list; there is no deletion in the interface. A bowtie can be archived but not deleted.
- **Reset:** not available in the interface. Use the test company and accept test records, or ask the SMS team for a clean-up.
