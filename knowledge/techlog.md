# e-TechLog · WILCO_PRODUCT_GUIDE.md

### 1.3 Roles and what they can do

Permissions arise from the user's NGFT roles in the company. The table shows the initial matrix uploaded to the API. The active matrix in production can be different. In the mobile app each user sees their own in «My Profile», by tapping the company: «Permissions for <crew>».

| NGFT role (code) | Typical surface | Main permissions (initial matrix) |
|---|---|---|
| Pilot (`pic`) | App | Create, edit and send missions; check-in of the aircraft; sign inspections; report defects; fluid uplifts; powercheck |
| Copilot (`copilot`) | App | Change the missions in which he is in crew; fluid uplifts. He does not send the mission and does not check in |
| HEMS TCM, HHO TCM, TSOP (`other_crewmember`) | App | Change the missions in which he is on crew |
| Mechanical Engineer (`technician`), Limited Certifying Staff | App | Daily inspection; create and modify maintenance actions; fluid uplifts. In the initial matrix there are no defects |
| CAMO Staff (`camo_staff`) | Techlog Admin | HIL items (create, modify, close); aircraft data; attachments; consult the event log |
| NPCA (`npca`) | Techlog Admin | Like CAMO Staff. In addition, only the NPCA corrects a mission already sent (preview) |

### 3.1 Flight missions: how do I record and submit a mission from the tablet?

**Short answer.** «In the e-TechLog app, open My Missions and tap Add New Mission. Choose the helicopter, check in and add a sector for each leg, with times, fuel and signatures. Finally, on the After Mission tab, tap Sign and submit mission and confirm with the PIN. The mission receives a log number and the totals of the aircraft are updated.»

**Context.**

- Role: Pilot. They need `mission_create` to create and `mission_submit` to send.
- Device: tablet or smartphone. Creating and sending a mission requires connection.
- Initial screen: tab «My Missions» (for those who are not crew it is called «Missions»).
- Prerequisites: aircraft ready in Techlog Admin; PIN set.

**Steps.**

1. In «My Missions» tap «Add New Mission». The app creates the mission and opens the detail with four tabs: «Aircraft», «Before Mission», «Sectors», «After Mission».
2. On the «Aircraft» tab tap «Choose Aircraft» and choose the aircraft.
3. Tap «Check-in Aircraft» and enter the PIN.
   - If another pilot already has the check-in, the «<registration> check-in» dialog appears, which asks you to contact them. Tap «Check-in» to continue.
4. On the «Before Mission» tab:
   - write the name in the «Mission Name» card;
   - in «Crew list» tap «Add» to add crew members;
   - if the layout includes it, sign «Before First Flight Inspection».
5. On the «Sectors» tab, tap «Add New Sector». In the sector fill in:
   - «Fill Before Flight»: departure, «Add Fuel Uplift», fuel on board, signature «Preflight Inspection»;
   - «Airports and Times»: airports and startup times, take-off, landing and shutdown;
   - «Crew»: «PIC», «Copilot», «Other Crew»;
   - cycles and engines, signature «Postflight Inspection», «Remarks».

   Every change is saved by itself.
6. Repeat step 5 for each leg.
7. On the «After Mission» tab:
   - check «Overview»;
   - if «Check overview for Errors» appears, complete the fields indicated;
   - if present, sign «After Last Flight Inspection».
8. Tap «Sign and submit mission» and enter the PIN.

**What you see.**

- The mission passes into «Submitted Missions» with «#<log number>» and becomes read-only.
- The check-in of the pilot who signs closes by itself.
- Totals of aircraft and engines include mission sectors.

**Handoff.** In Techlog Admin the mission appears immediately in «Missions», tab «Submitted». Its sectors appear in «Sectors».

**If a button or result is missing.**

- «Add New Mission»: the user does not have `mission_create`. In the initial matrix only the Pilot has it.
- The aircraft is not in the list: the preparation is not complete. The app doesn't show unprepared aircraft.
- Sectors are not visible: check-in is required. Without the permission, «<registration> needs to be checked-in but you don't have permissions.» appears.
- «Sign and submit mission» is disabled: the user is not in the crew, does not have `mission_modify`, or the mission is already sent. The Copilot does not have `mission_submit`.
- «At least one sector is required.» appears: the mission has no sectors.
- «Check overview for Errors» warns but does not block sending.
- Sending is final. Only the NPCA can correct it afterwards.

**Verification.** Sources and documentation. The «Submitted» list in Techlog Admin is verified in the app.

### 3.2 Signing inspections: how do I sign the pre-flight and post-flight inspections?

**Short answer.** «In the sector you will find the Preflight Inspection and Postflight Inspection panels. Tap Sign and enter your PIN. The box then shows the date, the time and who signed.»

**Context.**

- Role: Pilot (`otherinspection_submit`).
- Device: app. It also works offline.
- Initial screen: sector detail; for the other signatures, the «Before Mission» and «After Mission» tabs.
- Prerequisite: the signature field is active in the Techlog Layout of the aircraft (sections «Signatures» and «Signature of PIC»).

**Steps.**

1. Open the sector and find the «Sign <inspection name>» pane.
2. Tap «Sign». The «Sign» window opens with the text «Enter your PIN or use biometric verification».
3. Enter the 4-digit PIN. «PIN verified» appears, then «Signed successfully».
4. The same steps apply to «Before First Flight Inspection» («Before Mission» tab) and «After Last Flight Inspection» («After Mission» tab).

**What you see.**

- The box shows «Signed on YYYY-MM-DD at HH:MM by <person>».
- In Techlog Admin the mission detail shows «Signed» in the signature table.

**If a button or result is missing.**

- The box is not there: the inspection is not active in the aircraft layout.
- «Sign»: the user does not have `otherinspection_submit`.
- «*Wrong PIN» appears: the PIN is wrong. «Forgot PIN?» starts recovery.
- «Signature could not be saved. Check the connection and sign again.» appears: the signature has not been saved and must be repeated.
- Biometrics is mentioned in the text, but the button is hidden: you sign only with the PIN.
- Offline the PIN is checked on a saved copy in the device and the signature synchronizes later.

**Verification.** Sources. The «Signed» view in Techlog Admin is verified in the app.

### 3.3 Defects: How do I report an aircraft defect from a tablet?

**Short answer.** Open the aircraft or flight sector and tap Add New Defect. Set the aircraft status, describe the defect and add photos if needed. Tap Sign And Submit and enter your PIN. If you select Unserviceable, the updated aircraft status also appears in Techlog Admin.

**Context.**

- Role: Pilot (`defect_submit`).
- Device: app. It also works offline.
- Initial screen: detail of the aircraft («My Aircrafts» or «Fleet» tab, or the mission's «Aircraft» tab), or «Sector Defects» in the sector.

**Steps.**

1. Open the aircraft or the sector and tap «Add New Defect».
2. In «Involved Aircraft», under «Remains», choose «Serviceable» or «Unserviceable». The choice is mandatory.
3. Write the description in «Describe the Defect». This is also mandatory.
4. Add photos or files if needed.
5. In «Defect Submission» tap «Sign And Submit» and enter the PIN.

**What you see.**

- «Created defect» appears. The row shows «Reported at …» and the detail shows the status «Active».
- With «Unserviceable» the aircraft becomes «Unserviceable: <reason>»; the reason is the beginning of the description, up to 100 characters.

**Handoff.** In Techlog Admin the defect appears in «Maintenance» › «Defects» with «Unresolved» in the «Resolved at» column and the link to the mission. From there the technical office links it to an HIL item or to a maintenance action.

**If a button or result is missing.**

- «Add New Defect»: the user does not have `defect_submit`. In the initial matrix only the Pilot has it.
- «Required» appears: a mandatory field is empty.
- In the app a defect already sent is read-only. It is resolved only with a completed maintenance action.
- The status does not return to Serviceable by itself. It is changed from the aircraft's pencil icon, under the item «Aircraft status», with the permission `aircraft_modifydata`.

**Verification.** Sources. The defect table in Techlog Admin is verified in the app.

### 3.4 Fluid uplifts: how do I record fuel, oil or hydraulic fluid?

**Short answer.** «On the aircraft detail tap Add Fluid Uplift, choose the fluid, enter the amount and sign with the PIN. In a sector, Add Fuel Uplift records the fuel directly in the sector.»

**Context.**

- Roles: Pilot, Copilot, Mechanical Engineer, Limited Certifying Staff.
- Permissions: with `fluiduplift_submitother` you choose between «Fuel», «Oil» and «Hydraulics»; with only `fluiduplift_submitfuel` you record only fuel.
- Device: app. It also works offline.

**Steps.**

1. In the detail of the aircraft tap «Add Fluid Uplift».
2. In the «Fluid Uplift for <registration>» dialog, choose the type of fluid.
3. Enter the quantity in «Uplifted Amount». It must be greater than zero.
4. Add attachments if needed.
5. Tap «Sign and Submit» and enter the PIN.

**What you see.**

- «Fluid uplift submitted.»
- In Techlog Admin the entry appears in «Maintenance» › «Fluid Uplift History» and in the aircraft's «Fuel Uplift History» tab.
- The unit of measurement is that of the aircraft: Lt, Kg, Lbs, Usg or %.

**If a button or result is missing.**

- «Please enter an uplifted amount greater than 0.» appears: the quantity is zero or empty.
- You can only choose «Fuel»: the user does not have `fluiduplift_submitother`.
- A wrong amount is corrected in Techlog Admin: in «Fluid Uplift History» turn on «Edit Mode» («Edit mode allows you to update amount for fluid uplifts»).


**Verification.** Sources. The Admin page with «Edit Mode» is verified in the app.

### 3.5 Work offline: how do I work without connection?

**Short answer.** «Sectors, inspection signatures, defects and fluid uplifts are also recorded without a network. The app saves them on the device and sends them as soon as the connection returns. Creating, sending or deleting a mission, check-in and maintenance need the connection instead.»

**Context.** Crew, app, any screen.

**What the user sees.**

- Under the top bar the «Offline» banner appears.
- On the top left there is the sync button: tapping it forces the sending. Without a network it answers «Internet connection needed to sync to server».
- When you change a sector offline, «No connection — changes saved locally and will sync automatically.» appears.
- The synchronization starts on its own when the app comes back to the foreground and when the network returns. Then it retries after ten, 20, 40 and 60 seconds.

**Works offline:** creation, modification and deletion of sectors; sector fields; inspection signatures; new defects; fluid uplifts.

**Requires the network:** create, send and delete missions; check-in; maintenance actions; HIL; daily inspection; powercheck; aircraft modifications.

**If something doesn't appear.**

- «Cannot reach server — your offline changes are saved and will sync when connectivity is restored.» appears: the changes are saved and will be sent as soon as the server responds.
- **Warning:** a voluntary «Logout» deletes unsynchronized changes. Before logging out, wait for the synchronization. An expired session keeps them.

**Verification.** Sources and documentation.

### 3.6 Daily inspection: how does the technician sign?

**Short answer.** «The technician opens the aircraft detail and taps Sign Daily Inspection. They confirm the total flight hours, tick the repetitive airworthiness directives if required and sign with the PIN. The daily inspection deadlines close by themselves.»

**Context.**

- Roles: Mechanical Engineer, Limited Certifying Staff (`dailyinspection_submit`; available from version 1.0.5).
- Device: app, with connection.
- Initial screen: detail of the aircraft.

**Steps.**

1. In the detail of the aircraft tap «Sign Daily Inspection».
2. The «Daily Inspection for <registration>» dialog shows «Daily inspection has been completed at Total Flight Time:».
3. If the aircraft has repetitive airworthiness directives, tick «Repetitive Airworthiness Directive».
4. Tap «Sign and submit» and enter the PIN.

**What you see.**

- «Daily inspection submitted.»
- In Techlog Admin the entry appears in «Maintenance» › «Daily Inspections», with columns «Signed at», «Signed by», «Reg code» and «Total flight time».
- Open daily inspection deadlines close. If the warning hours are configured on the aircraft, the system creates the next deadline.

**If a button or result is missing.**

- The button is not there: in the initial matrix the pilots do not have `dailyinspection_submit`.
- «You need to confirm completing Repetitive Airworthiness Directives before submitting the daily inspection.» appears: tick the directives box.

**Verification.** Sources and documentation. The list in Techlog Admin is verified in the app.

### 3.7 Maintenance actions: How do I record an action and close a defect?

**Short answer.** On the tablet, open the defect and tap Create Related Maintenance Action. Enter the work order number, action type and description, then sign using Sign And Submit. When the action is signed and Completed, the linked defect is marked as resolved.

**Context.**

- Roles: Mechanical Engineer, Limited Certifying Staff (`maintaction_create`, `maintaction_modify`).
- Device: app, with connection.
- Initial screen: detail of the defect, or detail of the aircraft.

**Steps.**

1. Open the defect and tap «Create Related Maintenance Action». Alternatively, in the aircraft tap «Add maintenance».
2. In the form «Add New Maintenance Action for <registration>» fill out:
   - «Work Order #»;
   - «Maintenance Action Type»: «Scheduled», «Out of phase», «Defect resolution» or «Other» (mandatory);
   - «Maintenance Action Description» (mandatory);
   - if needed, «Certificate of Release to Service» («Part 145 Certificate of Release to Service»);
   - «Related Defect»: tap «Add Related Defect», then «Select Defect» and «Select». Only unresolved defects are listed.
3. In the «Sign Maintenance Action Submission» box, choose:
   - «Sign And Submit» with PIN: the action becomes «Completed»;
   - or «Close and Sign Later»: the action remains «Not Completed».

**What you see.**

- With «Sign And Submit» the action is «Completed» and the connected defect receives the resolution time.
- In the app the defect passes to «Closed». In Techlog Admin the column «Resolved at» shows date and time.

**Handoff.** The technical office sees the action in «Maintenance» › «Maintenance Actions», with «Completed at», «Completed by» and «CRS».

**If a button or result is missing.**

- The defect remains open: the action has been saved with «Close and Sign Later». It must be reopened and signed.
- The defect to link does not appear: it is already resolved, or it belongs to another aircraft.
- **In Techlog Admin** an action created with «New Maintenance Action» is not completed. So it doesn't close the defect. The page exists (`/maintenance/maintenance-actions/new`), but no button opens it.

**Verification.** Sources. The «Valid maintenance actions» table is verified in the app.

### 3.8 Defect links: How do I link a defect to an HIL item or maintenance action?

**Short answer.** In Techlog Admin, open Maintenance and select Defects. On the defect row, select the icon in the HIL or Maintenance action column. Choose the item and select Assign. Use Remove assignment to clear the link.

**Context.**

- Roles: CAMO Staff or NPCA. Techlog Admin does not check the role.
- Device: desktop browser.
- Initial screen: «Maintenance» › «Defects».
- Prerequisite: an active and free HIL item or maintenance action exists.

**Steps.**

1. In the «Maintenance» menu choose «Defects».
2. In the defect's row, column «HIL», tap the link icon.
3. The «Assign HIL Item» dialog only lists HIL items that are active and not yet linked. Select one and press «Assign».
4. For a maintenance action use the icon in the «Maintenance action» column. The title of the dialog is «Assign Maintenace Action», with the typo present in the product. Select the action and press «Assign».
5. To see or remove a link, tap the eye icon. «View HIL Item» or «View Maintenance Action» opens: press «Remove assignment».

**What you see.**

- «Defect assigned successfully» appears and the list is updated.
- In the app the defect shows the «HIL» label and the panes «HIL» or «Related Maintenance Action».

**Important difference.** Linking an HIL item does not resolve the defect, and closing the HIL item does not resolve it either. The defect is resolved only with a completed maintenance action.

**If a button or result is missing.**

- The HIL dialog is empty: there are no active and free HIL items. Create one with «New HIL Item»; in the form the defect can also be linked directly.
- The list does not show the defect: check the selected company in the user menu at the top right.

**Verification.** The page and columns are verified in the app. Dialogues are verified in the source code: in the app they have not been opened.

### 3.9 HIL: how do I create and close an HIL item (Hold Item List)?

**Short answer.** «In Techlog Admin go to Maintenance, HIL Items and press New HIL Item. Choose the aircraft, describe the problem and limitations, set the deadline and link the defect if there is one. Then press Sign & Submit and confirm with your PIN. To close it, open the row menu, choose close and sign with the PIN.»

**Context.**

- Roles: CAMO Staff, NPCA (`hilitem_*` in the initial matrix).
- Device: Techlog Admin. **In the app the HIL is read-only.**
- Initial screen: «Maintenance» › «HIL Items».

**Steps to create an HIL item.**

1. Press «New HIL Item».
2. In the form «Add HIL Item» fill out:
   - «Aircraft» (mandatory);
   - «Deadline»;
   - «Description» (mandatory);
   - «Limitation»;
   - if needed, «Assign Defect»: choose the defect in the dialog and press «Assign».
3. Press «Sign & Submit» and enter the PIN in the «Enter PIN» dialog.

**Steps to close an HIL item.**

1. On the «Valid HIL items» tab, open the row menu (three dots) and choose «close».
2. «Close HIL item» warns: «After your signing this HIL item will be closed and moved to the 'Closed' tab.»
3. Press «Close» and enter the PIN.

To delete an item choose «delete»: the item moves to the «Deleted HIL items» tab and is restored with «Undelete».

**What you see.**

- «HIL Item created successfully» appears.
- In the app the aircraft shows the «HIL» pane with «Limitations: …». The detail shows «HIL Item Active» or «HIL Item Closed».

**If a button or result is missing.**

- In the app there is no button to create an HIL item: this is intended.
- The closure is final: a closed HIL item cannot be reopened.

**Verification.** Page, tabs and «New HIL Item» are verified in the app. Form and closure are verified in the source code.

### 3.10 Due limits: how do I set and check a maintenance deadline?

**Short answer.** «In Maintenance, Due Limits, press Add due limit. Choose Parameter due limit for a deadline in hours or cycles, or Calendar due limit for a date. Enter aircraft or engine, description, warning threshold, limit and maximum limit, then sign with Sign & Submit and the PIN. The list shows how much is left before the deadline.»

**Context.**

- Roles: CAMO Staff, NPCA.
- Device: Techlog Admin.
- Initial screen: «Maintenance» › «Due Limits». The same list is in the aircraft's «Due Limits» tab.

**Steps.**

1. Press «Add due limit» and choose «Parameter due limit» or «Calendar due limit».
2. In the form «Add Parameter Due Limit» fill out:
   - type of resource: «Aircraft» or «Engine»;
   - «Resource», «Description», «Kind»;
   - «Parameter», for example Flight Time;
   - the three values «Warning», «Limit» and «Latest».
3. Press «Sign & Submit» and enter the PIN.

**What you see.**

- «Due limit added successfully» appears.
- The «Open due limits» tab shows the columns «Due in», «Resource», «Description», «Parameter», «Due Warning», «Due Limit», «Due Latest», «Kind», «Attachments» and «Action». Example of «Due in»: «In 98:46:00 Flight Time (About 98.77 flight hours)».
- In the app the aircraft shows «Approaching Limit» or «Limit Overdue». The «Due limits» pane shows «No overdue or near-limit items.» when nothing is due.

**Closure.** From the row menu choose «Close» or «Close and reuse» and enter the PIN. The due limit moves to «Closed due limits», from where it can be reopened.

**If a button or result is missing.**

- «Warning value must be smaller than limit value» appears: the values must be in order, warning ≤ limit ≤ maximum.
- The parameter is not in the list: it must be a summable value (number, decimal or duration) and active in the layout. Otherwise the server responds «Property is not defined in the layout».

**Verification.** List, tabs and «Add due limit» are verified in the app. The form is verified in the sources.

### 3.11 Mission review: how do I review a submitted mission in the office?

**Short answer.** «In Techlog Admin open Missions. In the Submitted tab there are the signed missions. Opening one, you see the crew, a tab for each sector and the After Mission tab with the totals before and after the mission, defects and attachments.»

**Context.**

- Roles: CAMO Staff, NPCA, operations office.
- Device: Techlog Admin.
- Initial screen: «Missions».

**Steps.**

1. Open «Missions». The «Submitted» tab has filters «Mission Name», «Date & Time», «Aircraft Reg» and «Crew».
2. Press the name of the mission.
3. See the tabs:
   - «Before Mission»: crew, initial fuel, signature «Before first flight inspection»;
   - a tab for each sector, with the name «<departure> - <destination>»;
   - «After Mission»: in «Totals» the columns «Parameter», «Totals», «Mission Totals» and «New Totals» for the aircraft and for each «Engine #n»; the signature «After last flight inspection»; defects and attachments.
4. With «Edit mode», the mission name and attachments are changed («Attach files», «Attach URL»).

**What you see.** The data sent by the pilot, without copying them.

**Delete and restore.**

- On the list, «Delete» asks for the PIN and moves the mission to the «Deleted» tab.
- «Restore» brings it back among the valid ones.
- A deleted mission doesn't count in the totals.

**Preview.**

- The tabs are «Submitted», «Open» and «Deleted». «Open» contains missions not yet sent.
- At the top there is the «New flight» button.
- In the detail there are «Add Sector» and, for each sector, «Cancel Sector».
- «Plausibility warnings» alert: «Please check. A warning does not prevent saving.»

**If a button or result is missing.**

- A mission is not in «Submitted»: it has not yet been sent. In the preview you find it in «Open».
- «Failed to load totals» appears: the initial totals of the aircraft are missing.

**Verification.** App and sources. In the app the version is more recent than sources.

### 3.12 Sectors and Export: How do I export flights to Excel?

**Short answer.** «Open Sectors in Techlog Admin, choose year and month, filter if needed and press Export to XLSX. With the arrow next to it you can choose CSV. The file contains all filtered rows, not only those visible on screen.»

**Context.**

- Roles: CAMO, NPCA, operations office.
- Device: Techlog Admin.
- Initial screen: «Sectors».

**Steps.**

1. Choose «Year» and «Month», or «All» for the whole year.
2. Filter from the row under the headings. Active filters appear as labels; «✕ Clear all» removes them all.
3. With «Columns (n)» choose the columns to show.
4. Press «Export to XLSX». For the CSV open the arrow «Choose export format» and choose «Export to CSV».

**What you see.** The download is `sectors.xlsx` or `sectors.csv`, with all filtered rows and total rows.

**Preview.**

- «With warnings» shows only sectors with plausibility warnings, for example a landing before take-off. Warnings don't block saving.
- «Show cancelled» shows the cancelled sectors. It only works for the NPCA.
- The columns «Total flight time», «Total landings» and «Total rotations» show the running totals of the aircraft after each sector.

**If a button or result is missing.**

- A flight does not appear: the list shows only the sectors of missions sent and not deleted.
- Available formats: only XLSX and CSV from the Sectors page. The product does not have a PDF export and the API does not have export endpoints.

**Verification.** Page, filters and buttons are verified in the app; the file has not been downloaded. The content of the file is verified in the sources.

### 3.13 Preparation of the aircraft: how do I prepare a new helicopter for e-TechLog?

**Short answer.** «In Techlog Admin open Assets, Fleet and the aircraft. A warning at the top indicates the first missing step: mandatory data, engines, engine parameters, techlog layout, initial totals and at least one flight type. When all the steps are completed, the aircraft appears in the pilots' app.»

**Context.**

- Roles: company administrator, CAMO.
- Device: Techlog Admin.
- Initial screen: «Dashboard» (showing Fleet), or «Assets» › «Fleet».
- Prerequisite: the aircraft already exists in NGFT. Techlog Admin doesn't create it.

**Steps, in the order of the checks.**

1. Open the aircraft from Fleet. The warning with the first missing step appears at the top.
2. Fill in the mandatory data: «Manufacturer Serial Number (MSN) *», «Fuel Measurement Unit *», «Hydraulics Measurement Unit *», «Oil Measurement Unit *» and «Pilot Operation *». Press «Save Changes» and enter the PIN.
3. Assign engines in «Engine 1 *» (and «Engine 2 *» for twin-engine aircraft). A new engine is created in «Assets» › «Engines» › «Add Engine».
4. Set the parameters of each engine on the engine page.
5. Set up the layout in «Techlog Layout».
6. Set the initial totals in «Maintenance» › «Totals».
7. Assign at least one flight type in «Flight Types».

**What you see.**

- The warning disappears.
- In the Fleet the column «Techlog Layout» shows «View Layout» instead of «Setup Layout».
- The aircraft appears in the app. If the customer uses NGFT OPS, the system communicates to OPS that the aircraft is ready.

**Warning messages** (one at a time, in this order):

- «<registration> needs to have all mandatory fields filled.»
- «<registration> needs to have all engines assigned.»
- «Assigned engine needs to be setup.»
- «<registration> needs to have techlog layout set up.»
- «<registration> needs to have totals set up.»
- «<registration> needs to have at least one flight type assigned.»

**If a button or result is missing.**

- The aircraft is not in the Fleet: check the «Inactive» tab and the selected company.
- The aircraft does not appear in the app: one of the steps is missing. The app hides unprepared aircraft.

**Verification.** Fleet, detail and fields are verified in the app. Sources and documentation.

### 3.14 Techlog Layout: how do I choose the fields that the pilot fills in?

**Short answer.** «The layout decides which fields the pilots see in each sector. In Techlog Admin open Techlog Layout and choose the aircraft. Turn parameters on or off, or load them from a template with Load from templates. Then press Save to aircraft and confirm with your PIN.»

**Context.**

- Roles: administrator, CAMO.
- Device: Techlog Admin.
- Initial screen: «Techlog Layout», or «Setup Layout» or «View Layout» in the Fleet.

**Steps.**

1. In «Select an aircraft to setup» choose the aircraft.
2. The sections are «Signatures», «Flights», «Airports and Times», «Approach», «Crew», «Fuel», «Signature of PIC», «Passengers», «APU», «Aircraft Cycles» and «Training». Each section has columns «Show», «Label», «Kind» and «Note».
3. Activate or disable fields with «Show». A new field is added with «Create new parameter»; types include «Time», «Duration», «Small number», «Decimal number», «Short text» and «Option».
4. To start from a template, press «Load from templates».
5. Press «Save to aircraft» and enter the PIN. With «Save as template» the same layout becomes a company template (without PIN). «Discard changes» cancels the changes.

**What you see.**

- «Layout saved successfully» appears.
- New missions use this layout. A mission already created keeps the layout it had when it was created.

**Templates.** The «Templates» page lists the «Techlog» and «Engine» templates and lets you create them with «Create template».

**If a button or result is missing.**

- «This aircraft has no layout, please setup one» appears: the default layout is proposed, to be saved.
- A field does not appear in the app: «Show» is disabled for that field.

**Verification.** Page, selector and Templates are verified in the app. Sources.

### 3.15 Totals: how do I set the initial totals of aircraft and engines?

**Short answer.** «In Maintenance, Totals choose Aircraft or Engine and the aircraft. Activate Edit Mode, enter the starting values and press Save Changes with the PIN. From that moment on, e-TechLog adds up only the flights sent.»

**Context.**

- Roles: CAMO, NPCA.
- Device: Techlog Admin.
- Initial screen: «Maintenance» › «Totals».

**Steps.**

1. Choose the «Aircraft» or «Engine» tab and then the aircraft or engine.
2. Turn on «Edit Mode» («Edit mode allows you to setup which parameters have their totals calculated.»).
3. Enter the initial values, for example Flight Time and Engine Cycles.
4. Press «Save Changes» and enter the PIN.

**What you see.**

- «Aircraft totals baseline updated successfully» appears.
- The totals are: initial values + active sectors of missions sent and not deleted. They are recalculated at every opening.

**If a button or result is missing.**

- A total does not appear: the parameter does not have an initial value.
- A flight is not counted: the mission is not sent, or the sector is canceled.

**Verification.** App and sources.

### 3.16 Flight types: how do I create a flight type and assign it to aircraft?

**Short answer.** «Open Flight Types and press Add Flight Type. Enter the abbreviation and description, choose the aircraft and press Create. Afterwards the name can no longer be changed.»

**Context.**

- Role: Administrator.
- Device: Techlog Admin.
- Initial screen: «Flight Types».

**Steps.**

1. Press «Add Flight Type».
2. In the «Create Flight Type» panel enter the name. The notice says: «Please choose or type the name for the flight type carefully. Because you won't be able to modify it.»
3. Fill out «Description» and choose the aircraft.
4. Press «Create».

**What you see.**

- The type appears in the «Active» tab, with aircraft in the «Show for aircraft» column.
- Pilots choose it in the sector with «Select Flight Type».

**Changes.**

- To remove an aircraft, tap its label. No PIN is needed.
- To delete the flight type you need a confirmation and the PIN. The type moves to the «Deleted» tab.

**Verification.** App and sources.

### 3.17 Integration with NGFT OPS: how do I use flights recorded in OPS in the techlog?

**Short answer.** «If the operator also uses NGFT OPS, the OPS flight creates an e-TechLog mission with the registration and date. When the flight day is closed in OPS, the data arrives in the techlog. The pilot creates the sectors from the OPS reports and checks any warnings. Nothing needs to be copied.»

**Context.**

- Condition: the company uses NGFT OPS and integration is active.
- Roles: Pilot and operations office.

**How it works.**

1. From OPS an e-TechLog mission called «<registration> dd-MM-yy» is created. The next missions of the same day receive « (2)», « (3)» and so on. The crew comes from OPS.
2. When the flight day is closed in OPS, e-TechLog receives times, fuel, engine runs and readings.
3. In the app, the «Create Sectors from OPS Reports» dialog offers a sector for every engine run; the pilot confirms with «Create Sectors». The crew leader becomes PIC, the others «Other».
4. The sectors with doubt show a warning, for example:
   - «Flight time split across engine runs — check the ratio»
   - «Engine run with no reported job»
   - «Job outside every engine run»

   The pilot corrects the data or confirms with «Flight time is correct».
5. The pilot sends the mission as usual, with «Sign and submit mission» and the PIN. e-TechLog communicates to OPS imported data and modified readings.

**If a button or result is missing.**

- In the app no label indicates that the mission comes from OPS: it is recognized by the name.
- «No new sectors from OPS to create.» appears: OPS reports have not yet arrived, or sectors already exist.
- A mission already sent does not accept sectors from OPS.


**Verification.** Sources and documentation.

The availability of the «Create Sectors from OPS Reports» command in the normal flow of the pilot must still be confirmed in the app.

### 3.18 NPCA corrections (preview): how do I record a backdated flight or correct a submitted mission?

**Short answer.** «This function is reserved for the NPCA and is currently a preview. In Techlog Admin, Missions, the New flight button records a flight entered afterwards. On missions already sent, the NPCA can add or cancel a sector by giving a reason, which stays in the event log.»

**Context.**

- Condition: preview, not yet released. The screens are not in the local sources of Techlog Admin; the rules are in the API («Unreleased», TLDEV-1674 and 1675).
- Role: only NPCA. The others receive «Only the NPCA of the company may perform this action».
- Device: Techlog Admin.

**Steps** (from the preview screen and API rules; not executed):

1. In «Missions» press «New flight». The flight is created as a mission not yet sent, with the NPCA in the crew.
2. Set the crew and sectors, then send with normal signature. The mission receives the next log number.
3. On a mission sent, «Add Sector» adds a sector and «Cancel Sector» cancels a sector. A reason is required, otherwise «A reason is required for this change» appears.

**What you see.**

- A cancelled sector stays in the data but is removed from totals and deadlines. In «Sectors» you see it with «Show cancelled».
- The reason, the previous values, the author and the time go into the event log. NPCA and CAMO Staff can consult it.

**Verification.** Only the presence of buttons is verified in the app. The rules are verified in the sources of the API.

### 3.19 Access and PIN: How do I sign in and reset a forgotten PIN?

**Short answer.** «Log in with the NGFT account. At the first access e-TechLog asks you to create a 4-digit PIN, which is needed to sign. The PIN is the same in the app and on the web. If you forget it, tap Forgot PIN: you are logged out and at the next access you set a new one.»

**In the app.**

1. «Sign in to your account»: «Username or email», «Password», «Remember me», «Sign in».
2. If the user has more than one company, choose it in «Select your crew».
3. At the first access «Setup PIN» appears: «Insert New PIN», then «Confirm Using New PIN».
4. With «Remember me», «Quick login» appears: «Tap to login with PIN».
5. Forgot PIN: In the signing window tap «Forgot PIN?», then «Proceed». The user is logged out and sets a new PIN at the next access.

**In Techlog Admin.**

1. The first access opens the page «Setup PIN»: «Insert New PIN», then «Confirm using new PIN».
2. Protected actions open «Enter PIN». On the fourth digit the PIN is sent by itself.
3. In «Enter PIN», «Forgot PIN?» logs the user out; a new PIN is set at the next access.
4. In «My Profile» (user menu at the top right) there are «Change PIN» and «Logout».

**If a button or result is missing.**

- «Incorrect PIN. Please try again.» appears: the PIN is wrong.
- «does not have any e-TechLog role assigned» appears: the user lacks an e-TechLog role in the company.
- «Forgot Password?» in the app does not send anything yet. For the password, the NGFT login recovery applies (to be confirmed).
- In the app there is no item to change the PIN: use «Change PIN» in Techlog Admin, or «Forgot PIN?».

**Verification.** «My Profile» with «Change PIN» and «Logout» is verified in the app. Sources.

### 5.1 Demo A: from the flight to the signed techlog, on a tablet

- **Visitor's phrase:** «At the end of the day we still do the techlog by hand. Can I do it from the tablet?»
- **Account:** test user with role Pilot in the NGFT test company, PIN already set, the demo e-TechLog app.
- **Sample record:** the test aircraft that in Fleet shows «View Layout» and has its totals set. Do not use customer aircraft.
- **Actions to show:**
  1. «My Missions» → «Add New Mission» → «Choose Aircraft» → «Check-in Aircraft».
  2. «Sectors» → «Add New Sector»: times, fuel, signature «Preflight Inspection».
  3. «After Mission» → «Overview» → «Sign and submit mission» with PIN.
  4. On a second screen, Techlog Admin › «Missions» › «Submitted»: the mission is already in the office, with new totals.
- **Outcome:** mission with log number, visible in the office, totals updated.
- **Format:** 60–90 seconds guided demo. A 20–30 seconds silent clip is only possible if recorded beforehand, because the mission remains in the data.
- **Data changes:** Yes. Reset, verified only in the source code: in Techlog Admin, «Missions» › «Delete» with the PIN moves the mission to «Deleted», and the totals exclude it. However, the log number stays used: the next mission receives the following number. The check-in closes by itself on sending.

### 5.2 Demo B: fleet status and due limits for CAMO

- **Visitor's phrase:** «How do I see at a glance what is due and which defects are open on our helicopters?»
- **Account:** CAMO Staff or NPCA test user on the demo Techlog Admin.
- **Sample record:** the test aircraft with an open hours-based due limit and an unresolved defect (in the demo both exist).
- **Actions to show:**
  1. «Dashboard» (Fleet): status «Serviceable» and «Checked out».
  2. Details of the aircraft → tab «Due Limits»: row «Due in» with residual hours.
  3. «Maintenance» › «Defects»: defect «Unresolved» with connection to mission.
  4. Icon in the «HIL» column: dialog «Assign HIL Item». Stop before «Assign».
- **Outcome:** in three screens the visitor sees status, deadlines and fleet defects.
- **Format:** fits both, 20–30 seconds silent clip and 60–90 seconds demo.
- **Data changes:** none, if you stop before «Assign». If you do link an HIL item, undo it with «Remove assignment» (verified in the source code).

### 5.3 Demo C: from OPS flights to sector export

- **Visitor's phrase:** «We already use NGFT OPS and the office wants the flights in Excel. Do we have to retype them?»
- **Account:** on the demo Techlog Admin, an office user (CAMO). For the OPS part, a pilot with an OPS flight closed.
- **Sample record:** a mission created from OPS («<registration> dd-MM-yy») in «Open» or «Submitted»; the page «Sectors» with «All».
- **Actions to show:**
  1. «Missions»: the mission with the name created by OPS.
  2. «Sectors» → «All» → «With warnings»: the sectors to be checked.
  3. Running-total columns («Total flight time»).
  4. «Export to XLSX».
- **Outcome:** Excel file with all filtered flights and totals, without copying anything.
- **Format:** 60–90 seconds guided demo. The Sectors and Export part is also good as a 20–30 seconds silent clip.
- **Data changes:** none. Export doesn't change anything.
- **Conditions:** «With warnings» and the running totals are a preview, not yet released. The OPS part requires active integration and is not verified in the demo.
