# NGFT OPS · WILCO_PRODUCT_GUIDE.md

### 1.1 What is NGFT OPS

**Short answer:** NGFT OPS is the web application with which a helicopter operator handles the work from the customer to the flight. It covers the offer, the job, planning on helicopters and crew, the end-of-flight report and the invoice.

- Product name: **NGFT OPS**. In the catalog of Wilco the card is called «OPS Dispatch».
- Who it is for: helicopter operators, especially for aerial work, sling load, passenger transport, training flights and special flights.
- Work it supports:
    1. prepare offers and register customer requests (Offers, Jobs, Flights);
    2. plan flights on helicopters, pilots, TSOP and vehicles (Calendar, Weekly Planner, Roster, Capacity);
    3. confirm with the customer, alert the crew and print the plan of the day;
    4. check end-of-flight reports, flight and duty hours and FTL limits;
    5. invoice and follow the company's performance (Invoices, Management Cockpit).

**Verification.** screens observed on staging, behavior in the source code.

### 1.4 Roles: who does what

**Short answer:** everyone sees the same menu, but the data open only with the right role. Roles are assigned in Company Admin, not in OPS. Without a role the page opens empty and an error message appears.

| Role (name in Company Admin)                                                                                                                                                   | What the role does in OPS                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Flight Dispatcher                                                                                                                                                               | Typical role of planning: Calendar, Weekly Planner, Capacity, Flight Reports, Jobs, Flights, Customers, Vehicles, Materials |
| Accountable Manager, Nominated Person Flight Operation, Crew Training or Ground Operations, Head of Training, Chief Flight Instructor and deputy, Flight Instructor, Flight Examiner | Like the dispatcher. In the code this group is called «main operational roles»                                               |
| Base Manager                                                                                                                                                                    | Like the dispatcher. In Management Cockpit and in the FTL view only sees its base                                                |
| Project Manager                                                                                                                                                                 | Creates and edits Jobs and Flights and receives offer reminders. Does not use Calendar, Weekly Planner and Capacity               |
| Accountable Manager, Company Account Owner, Chief Financial Officer, Nominated Person Flight Operation, Base Manager                                                            | They open the **Management Cockpit**                                                                                                  |
| Pilot, Task Specialist Operator (TSOP)                                                                                                                                          | Work from the mobile app: assigned flights and flight report                                                                          |
| Any company role                                                                                                                                                       | Offers, My reservations, their own FTL limits                                                                                      |
| NGFT Administrator (NGFT staff)                                                                                                                                                 | Sees **OPS Agent** and Management Cockpit. On its own it does not open Calendar, Jobs, Flights and Offers: a company role is also needed     |

Useful rules:

- The menu does not hide items by role, except «Management Cockpit» and the «OPS Agent» button.
- Without permission a red notice appears, for example «Failed to load jobs». The server responds «You are not allowed to perform this action».
- Account deactivated in the company: «Your account is disabled, contact your administrator».
- Account without companies: page «No company access» with the «Logout» button.

**Verification.** behaviour in the source code.

### 1.5 Company and language

**Short answer:** company and language change from the user menu, top right with the initials.

1. Click on the initials at the top right.
2. «CURRENT COMPANY»: choose the company. The page remains on the same section for the new company.
3. «LANGUAGE»: English, Deutsch, Italiano, Français. The choice remains in the browser, not in the profile.

Special cases:

- A link from another company opens the «Switch company?» dialogue with «Cancel» and «Switch».
- If you are not part of that company, «No access» appears.
- With open conflicts in the Calendar the change is blocked by «Resolve all vehicle conflicts before leaving the Calendar».

**Verification.** screens observed on staging, behavior in the source code.

### T1 How do I record a customer request with one or more flights?

**Short answer:** open Jobs and press New Job. In two steps enter customer, order data and flights. For a single flight there is New Flight. The flights are created as drafts and wait to be planned in the Calendar.

- **Role:** Flight Dispatcher, Project Manager or other operational role.
- **Device:** computer.
- **Starting screen:** «Jobs» (page «Job List») or «Flights».
- **Prerequisites:** customer and contact in «Clients And Contacts»; products in «Products».

Steps with «New Job» (job with multiple flights):

1. «Jobs», «New Job» button. It opens «Create Detailed Job» with the steps «Job Description» and «Flights».
2. In «Client & Contacts» choose «Office Contact» (mandatory). Optional: «Offers Contact» and «Invoice Contact».
3. In «Job Information» fill in «Job Name», «Base», «Job date» and the time («Job start time», «Flexible time»).
4. In «Crew & Timings» enter «Min. Pilots» and «Min. TSOPs». Add tasks with product, pickup and drop-off.
5. Press «Create Job and Proceed». Message: «Job created successfully»
6. In the «Flights» step fill in for each flight «Flight date *», «Job start time *» and «Operation group».
7. Press «Save». Message: «Flights created successfully»

Steps with «New Flight» (single flight):

1. «Jobs» or «Flights», «New Flight» button.
2. In «Client Information» choose customer and contact. In «Related Job:», choose an existing order or «Auto create job».
3. In «Flight Information» fill in «Flight Date», «Start Time», «Pilots» and, if needed, «Fuel Delivery». Then the task sequence: «Product Type», «Product», «Pickup Site», «Dropoff Site», «Estimated Rotations».
4. Press «Save». Message: «Flight created successfully»

**What you see:**

- The order appears in «Jobs» with draft status or Active.
- Flights appear in «Flights» with «Draft» status.
- In «Calendar» flights are in the «UNASSIGNED JOBS» band.

**Handoff:** the dispatcher finds flights to plan in the Calendar and Weekly Planner («Jobs» panel).

**If a button or result is missing:**

- Empty list with «Failed to load jobs»: the role does not include Jobs (see 1.4).
- The «Aircraft» form field does not put the flight on the calendar: it indicates only the planned helicopter. Planning is dragging the flight into the Calendar (T2).
- «Saved without an operation group: the flight won't count in a group in capacity planning»: the flight is saved, but does not count in the Capacity of the group.
- Dialogue «Weekly total of hours breached»: the week is already full (see T7).
- Form errors, for example «Client is required», «At least one task is required», «Pickup site is required».

**Verification.** screens observed on staging, behavior in the source code.

### T2 How do I schedule a new mission in the calendar?

**Short answer:** Open Calendar for the planned day. Find the flight under Unassigned Jobs and drag it onto the helicopter’s row at the intended time. OPS saves the change, assigns an available pilot and sets the flight to Scheduled. OPS shows planning warnings for the dispatcher to review.

- **Role:** Flight Dispatcher or other operational role.
- **Device:** computer with mouse.
- **Starting screen:** «Calendar».
- **Prerequisites:**
    - a flight in draft;
    - the helicopter operating that day in the Roster;
    - pilots and TSOP available in the Roster.

Steps:

1. «Calendar» menu. Choose the day with arrows or by clicking the date, or «Today». With «Base:» you can filter by base.
2. At the top, in the vertical band «UNASSIGNED JOBS», find the flight. The rows are «Start time available», «Start time flexible», «No time & date» and «Planning».
3. To check the flight:
    - mouse over the card to see route and resources;
    - with a double click open the flight in a side panel.
4. Drag the card onto the helicopter's row in the «FLIGHT CALENDAR» section, at the desired time.
5. OPS saves by itself after half a second («Saved successfully»). If autosave is suspended, press «Save». «Cancel» cancels unsaved changes.
6. If a check dialog appears:
    - «Weekly total of hours breached»: see T7;
    - «Overbook maintenance limit?»: see T8.

**What you see:**

- The card is on the helicopter's row.
- The flight is «Scheduled» and an available pilot occupies the open crew seats.
- The flight also appears in the Weekly Planner, in the list «Flights» and in the «Daily plan PDF» of the day.

**Handoff:** the crew is not yet notified. The notification is sent with «Engage jobs of aircraft» (T4).

**If a button or result is missing:**

- Empty calendar with an error: the role is not operational (1.4). Project Manager and NGFT Administrator without other roles do not use the Calendar.
- «Save» grey: there are no changes, or there is a conflict of crew or vehicles (T3).
- The flight is not in the «UNASSIGNED JOBS» band: it already has a helicopter, or has another date. The band shows the chosen day and flights without date.
- A flight started, completed or with reports sent no longer moves.

**Verification.** recording of a demo on staging, screens observed on staging, behavior in the source code.

### T3 How do I assign a pilot, TSOP and vehicles to a flight?

**Short answer:** In the Calendar, drag the person from the crew section onto the flight or onto the helicopter's free seat. Alternatively, use Manage Crew from the flight menu. Vehicles are dragged from the Vehicles row. If a person or vehicle is on two flights at the same time, OPS flags it and blocks saving.

- **Role:** operational role.
- **Device:** computer.
- **Starting screen:** «Calendar».
- **Prerequisites:** flight already on a helicopter (T2); people with Pilot or TSOP role available in the Roster (T9).

Steps:

1. In the Calendar open the crew rows of the helicopter with «Show crew rows». Free seats are called «Add Pilot» or «Add TSOP».
2. Drag a person from the crew section, at the bottom, onto the free seat or onto the flight card.
3. Alternatively: right-click on the card, «Manage Crew». Tick the people, then «Select Crew Leader» and «Apply Changes».
4. For vehicles: drag from «Vehicles» onto «Missing Vehicle» or «Add Vehicle».
5. Automatic saving or «Save».

**What you see:** people appear under the helicopter and on the card. The helicopter indicator no longer reports missing seats.

**Handoff:** if the flight is already Engaged, the crew receives a change notification in the app and in the bell.

**If a button or result is missing:**

- «Crew member must have the Pilot role»: the person does not have the right role.
- Person missing from the list: in the Roster they are not in a working status that day, or they do not have the Pilot or TSOP role.
- «Manage Crew» grey with «Crew can't be changed once the flight is In Progress»: the flight is already in progress.
- Double booking: «Crew member is assigned to overlapping jobs» or «Vehicle is double-booked in multiple jobs» appear.
    - «Save» remains grey.
    - Exit from the Calendar gives «Resolve all vehicle conflicts before leaving the Calendar», even when the conflict affects a person.
    - Move or remove the double assignment.
- «Vehicle must be of category …»: the flight requires another type of vehicle.

**Verification.** screens observed on staging, behavior in the source code.

### T4 How do I confirm a flight with the customer and notify the crew?

**Short answer:** there are two steps.

- On the flight choose Confirm with client: the flight becomes Client Confirmed.
- Then, from the helicopter menu, choose Engage jobs of aircraft: the confirmed flights of that day become Engaged and the crew receives notification.

**Role, device and prerequisites:**

- Operational role, computer.
- Starting screen: «Calendar», on the day of the flight.
- The flight must be «Scheduled».

Steps:

1. Right-click the card, then «Confirm with client». Alternatively: a click on the card and the switch «Client confirmed».
2. If the order is still a draft, «Order not yet confirmed» appears. You can choose «Confirm anyway».
3. Message: «Flight confirmed with client».
4. On the helicopter's row, press the three dots next to the registration and choose «Engage jobs of aircraft».
5. The window asks «Are all customers informed? Are you sure you want to submit?». Press «Engage».
6. Message: «Engage jobs successfully».

**What you see:**

- The confirmed flights of the helicopter, only for the day shown, pass to «Engaged».
- In the Roster, the crew is on the helicopter.
- At the time of departure the flight passes by itself to «In Progress». In advance you can use «Start flight».

**Handoff:**

- Each member of the crew receives the notification «You have been assigned to the job "…"» in the mobile app and in the bell.
- Later changes to an Engaged flight send an update notification.

**If a button or result is missing:**

- «Confirm with client» is not there: the flight is not «Scheduled». It is a draft or is already confirmed.
- A flight does not become Engaged:
    - it was not «Client Confirmed»; the window says how many flights are not;
    - or it is on another day.
- Moving a confirmed or Engaged flight brings it back to «Scheduled». «Important: Flight Status Downgraded» appears, with «I Understand»: the flight must be reconfirmed with the customer and the Engage must be done again.
- «Start flight» appears only on Engaged flights.

**Verification.** screens observed on staging, behavior in the source code.

### T5 The plan has changed: how do I move a flight or change the helicopter?

**Short answer:** in the Calendar, drag the flight to another time or another helicopter. If the flight was already confirmed or Engaged, it returns to Scheduled: it must be reconfirmed and the crew receives a notification. To replace the helicopter for the whole day there is Replace aircraft.

- **Role:** operational role.
- **Device:** computer.
- **Starting screen:** «Calendar» or «Weekly Planner».

Steps:

1. Drag the card to the new time or row of another helicopter.
2. If the flight was confirmed or Engaged, «Important: Flight Status Downgraded» appears. Press «I Understand».
3. With Engaged flights the autosave is suspended: press «Save».
4. To replace a helicopter: three dots on the row, «Replace aircraft», then choose the new helicopter.
5. To put a flight back among those to be planned: drag it into its row of «UNASSIGNED JOBS» or into «Planning».
6. To cancel a flight: right click, «Cancel flight». Enter a reason in «Reason (optional)» and confirm.

**What you see:** the flight is on the new helicopter or time. If it was confirmed, it is now «Scheduled». A cancelled flight leaves the calendar and moves to «Cancelled» in «Flights».

**Handoff:** if the flight was Engaged, the crew receives the notice that it is no longer engaged. The Engage (T4) must be done again.

**If a button or result is missing:**

- The flight does not move: it has started, is completed or cancelled, or has a sent report.
- «Cancel flight» is not there: completed flight, already canceled or with reports sent.
- «No available aircrafts» in «Replace aircraft»: no other helicopter available that day (Roster, «Aircraft» tab).

**Verification.** screens observed on staging, behavior in the source code.

### T6 How do I share the day’s flight plan?

**Short answer:** In Calendar, select the date and base, then choose Daily plan PDF. OPS downloads a plan grouped by helicopter. Share the PDF with the team outside OPS.

- **Role:** operational role.
- **Device:** computer.
- **Starting screen:** «Calendar».
- **Prerequisites:** flights saved on a helicopter on that day.

Steps:

1. «Calendar», choose the day and, if needed, «Base:».
2. Save or cancel the pending changes.
3. Press «Daily plan PDF». During preparation the button shows «Preparing…».
4. The `daily-plan-YYYY-MM-DD.pdf` file is downloaded.

**What you see:**

- A4 landscape PDF with title «Daily plan», date, base and company.
- For each helicopter there is a table with columns «TIME», «FLIGHT», «CLIENT», «LOC/AREA», «CREW», «FUEL», «AMOUNT (L)», «NOTE».

**Handoff:** the PDF is sent to the team outside of OPS. OPS doesn't send it by itself.

**If a button or result is missing:**

- «The daily plan shows the saved calendar; save or cancel your changes first»: There are unsaved changes.
- A flight is missing in the PDF: it is not saved on a helicopter on that day, or the base filter excludes it.
- Blank columns: the flight lacks customer, «Loc/Area Name» or fuel.
- «No flights planned on this day.»: no scheduled flight.

The PDF is downloaded in the OPS browser. The built-in demo in Wilco cannot download files.

**Verification.** screens observed on staging, behavior in the source code, documentation.

### T7 How do I plan the week and check the available hours?

**Short answer:** in Weekly Planner you see a column for helicopters and, on the left, the flights to be assigned. Drag the flights onto the days. In Capacity you set how many hours can be planned each week. If a week is full, OPS asks whether to move the flight to the first free week or to confirm the overbooking.

- **Role:** operational role.
- **Device:** computer.
- **Starting screen:** «Weekly Planner» or «Capacity».
- **Prerequisites:** operation groups in «Ops Config › Operation Groups»; capacity of the week saved in «Capacity».

Steps in Capacity:

1. «Capacity» menu. Choose the year with arrows.
2. On the row of the week (for example «CW 49») press the three vertical dots.
3. Fill out the fields:
    - «No. of flight hours (Total capacity) (in hours)»;
    - «Reserved for maintenance (in hours)»;
    - hours per operation group and, if any, per project manager.
4. «HL» (hard limit) or «Res» (reserved hours) where needed.
5. Press «Save». Message: «Capacity week saved»

Steps in Weekly Planner:

1. «Weekly Planner» menu. Choose the week with «This week» or with the selector, for example «CW 48 Nov 23 - Nov 29, 2026».
2. On the left, in the «Jobs» panel, there are flights to be assigned.
3. Drag a flight onto a helicopter's day, or use the flight menu, «Assign to <registration>».
4. Automatic saving, or «Save». «Cancel» cancels.

If the week exceeds the capacity «Weekly total of hours breached» appears, with three choices:

- «Cancel»: does not save;
- «Move to next free week (CW nn)»: moves the flight to the first week with free hours;
- «Confirm overbooking»: the flight becomes «Overbooked» and remains among those to be assigned, with a red border.

**What you see:**

- The «Max. plannable hours» bar shows «TH» (total hours), «BH» (booked hours) and «RH» (remaining hours).
- The flights assigned count in the week.

**Handoff:**

- Crew, vehicles and Engage are completed in the Calendar (T3, T4).
- The Weekly Planner does not have the Engage or PDF.

**If a button or result is missing:**

- No notice of capacity: the week has no capacity saved.
- The save is refused with a «hard limit» message: a group or project manager with «HL» is full.
- Hours in the gray segment «No group»: the flight has no operation group.
- The project manager section is missing: no user has the role Project Manager.

**Verification.** screens observed on staging, behavior in the source code.

### T8 What happens when a flight exceeds a maintenance limit?

**Short answer:** OPS reads maintenance limits from TechLog, or limits entered by hand. If a flight takes the helicopter over a limit, Overbook maintenance limit? appears. The dispatcher cancels or confirms the overbooking, and OPS records who confirmed it.

- **Role:** operational role. For manual limits also: Maintenance Manager, NPMO Part 145 and CMM CAMO.
- **Device:** computer.
- **Starting screen:** «Calendar» or «Weekly Planner».
- **Prerequisites:** TechLog connected to the installation, or limits entered in OPS.

Steps:

1. Plan or move a flight (T2, T7).
2. If the flight takes a limit below 0 hours or past its due date, «Overbook maintenance limit?» appears. The text is: «Planning this flight takes a maintenance limit of the helicopter below 0 h or past its due date.»
3. Choose one of the two options:
    - «Cancel»: the flight goes back to where it was;
    - «Overbook and plan»: OPS saves and records the confirmation.
4. To see or enter the limits: in the Weekly Planner, under the helicopter, «Next 100 h» and «Limits…». The dialogue is «Maintenance limits · <registration>», with «Add limit» and «Save limit».

**What you see:** on the limit, «Overbooking confirmed by … on … for …» appears.

**Handoff:** maintenance sees the data in TechLog. OPS does not write on TechLog.

**If a button or result is missing:**

- «TechLog is not connected for this OPS installation.»: TechLog is not connected. You can enter the limits by hand.
- «No data — enter manually»: TechLog has no data for that helicopter.

**Verification.** behaviour in the source code, documentation.

### T9 How do I manage the availability of crew, helicopters and vehicles?

**Short answer:** in the Roster there is a grid by person, helicopter or vehicle and by day. Click a day and choose the status: for example Assigned to a helicopter, Standby or Vacation. The Calendar uses the Roster to know who is available. With Replicate week you repeat a week over a period.

- **Role:** dispatcher or crew manager.
- **Device:** computer.
- **Starting screen:** «Roster».

Steps:

1. «Roster» menu. The tabs are «Crew», «Aircraft» and «Vehicle». The views are «Week» and «Month».
2. Click on the day of a person, or drag across several days of the same row.
3. Choose the status:
    - «Assigned», with the helicopter;
    - «Base»;
    - «Unassigned»;
    - or a type like «Standby», «Vacation», «Day off», «Sick day».
4. Message: «Crew schedule updated successfully».
5. To repeat a week: «Replicate week». Choose «Start Date» and «End Date», then «Replicate Week». Message: «Week schedule replicated successfully»
6. In the «Aircraft» tab the states are «Working», «Standby», «Repositioning», «Maintenance», «Out of service», «Grounded», «TBD».

**What you see:**

- Working people are available in the Calendar.
- Whoever is «Assigned» to a helicopter has priority when OPS fills the crew seats.
- A helicopter in «Maintenance», «Out of service» or «Grounded» is not assignable.

**Handoff:**

- After the Engage the Roster shows the crew on the helicopter.
- The pilot sees his roster in the mobile app.

**If a button or result is missing:**

- Person missing: they do not have the Pilot or TSOP role, are disabled, or are excluded by the base filter.
- «Replicate week» is missing: the «Month» view is active.
- «Full day» and «AM/PM» are missing: half days are off in «Preferences & Defaults › Roster».
- «Vehicle» tab empty with an error: the role does not manage vehicles. It requires Accountable Manager, NPFO, NPGO, Base Manager, Project Manager or Flight Dispatcher.
- A person's permanent base is changed in Company Admin.

**Verification.** screens observed on staging, behavior in the source code.

### T10 How do I make an offer for a customer?

**Short answer:** in Offers press New Offer: OPS immediately creates a draft with a number. Choose customer and contact; currency, VAT and conditions fill in by themselves. Then add flights with date, helicopter type and products. Many fields save by themselves; flights and lines are saved with Save. The offer stays in draft until you send it.

- **Role:** sales or project manager; in general any company role.
- **Device:** computer.
- **Starting screen:** «Offers». Alternatively, from the order: section «Offers», «+ Create Offer».
- **Prerequisites:** valid customer in «Clients And Contacts»; products with price in «Products».

Steps:

1. «Offers», «New Offer» button. It opens «Edit Offer» with the number «O-YYYY-NNNN».
2. Give a title to the offer (field «Untitled Offer»).
3. In «Client & Contact» look for the customer, then choose address and contact. Language, «Currency», «VAT Scheme», «Payment Tr.» and «Discount» come from the customer.
4. Fill «Loc/Area Name:» and «Project Name:».
5. In «Flights & Flight Sequences» press «Create new flight». Set date and «ACFT Type».
6. In the flight's «Flight sequence» fill in «Type», «Product» (the price comes from the catalog), «Pickup.», «Drop-off.», «No.» and «Est. Rot.».
7. Press «Save». Message: «Offer saved»

**What you see:** the offer is on the list «Offers» with «Draft» status. «Valid until» is already calculated from the preferences (default: 30 days).

**Handoff:** sending and acceptance are described in T11.

**If a button or result is missing:**

- Closing the form does not delete the draft. To delete it: row menu in «Offers», «Delete».
- Customer not found:
    - the customer has expired («Valid until» of the customer is in the past);
    - or the role does not read customers (see Open checks).
- «Please fix validation errors before saving»: mandatory fields are missing on the flights.
- Other row entries in «Offers»: «Edit», «Print», «Duplicate», «Delete». «Duplicate» creates a draft copy with «(Copy)» in the title.

**Verification.** screens observed on staging, behavior in the source code, documentation.

### T11 How do I send the offer and what happens when the customer accepts?

**Short answer:**

- With Print you prepare the PDF in NGFT Print.
- With the envelope icon, send it by email. When the delivery is confirmed the offer passes to Sent.
- When the customer answers, set Accepted or Rejected.
- With Accepted, OPS creates the job by itself and one flight for each group of flights in the offer, ready to plan.

**Role, device and prerequisites:**

- Sales or project manager, on a computer.
- Starting screen: the offer open in «Draft» status.
- Prerequisites:
    - an offer template published in NGFT Print;
    - a company email in Company Admin;
    - popups allowed in the browser.

Steps:

1. In the draft offer press «Print». OPS saves the form and opens NGFT Print in a new tab. If there are several templates, «Select Template» appears.
2. In NGFT Print save the document. In OPS «Printed document saved to offer» appears.
3. In «Client Information» press the envelope icon («Send via email»).
4. In «Send Offer via Email» check «To», «CC», «Subject», «Message» and «Attachment». Press «Send».
5. Message: «Email sent successfully» or «Email queued; delivery confirmation is still pending». On confirmation the offer passes by itself to «SENT».
6. When the customer answers, open the status selector next to the title and choose «ACCEPTED» or «REJECTED».
7. If the flights exceed the week's capacity, «Weekly total of hours breached» appears (T7).

**What you see:**

- With «ACCEPTED» a job is created in «Jobs», and one flight for each group, called «<title> - FL1», «- FL2» and so on.
- Flights are to be planned in the Calendar.
- The notes of the customer relationship pass to the job.
- «Create Advance Invoice» allows a deposit invoice (T13).

**Handoff:**

- The dispatcher finds new flights in «Flights» and in «UNASSIGNED JOBS».
- The project manager receives the reminder «Check offer … with …», every day at 07:00, when an offer remains «Sent» beyond the set days (default: 14).
- Sent offers with «Valid until» past become «Expired» at midnight.

**If a button or result is missing:**

- «ACCEPTED» is not in the selector: the offer is still «Draft». It can be accepted only from «Sent».
- «Cannot accept offer: …»: no contact, flight, task, product, rotation, pickup or drop-off.
- Grey envelope: the offer is not in draft, or the PDF is missing or has been invalidated by a change. Press «Print» again.
- «No published offer template found»: no template published in NGFT Print.
- «Preview could not open — popup blocked. Allow popups for this site.»: allow popups.
- Offer «Sent» or «Accepted» not editable: it must be brought back to «DRAFT». Only Company Administrator or Company Account Owner can do so from «Accepted».
- When you open a «Sent» or «Accepted» offer, red alerts «Changes not saved - Offer cannot be edited in status '…'» appear. They are a known effect: the data does not change.
- The «Status» filter of the list «Offers» currently returns «Failed to load offers». To find the offers in a given status, sort by the «STATUS» column or use the search.

**Verification.** screens observed on staging, behavior in the source code, documentation.

### T12 How do I check and confirm the end-of-flight report?

**Short answer:** the pilot sends the report from the mobile app. The dispatcher finds it in Flight Reports, Active tab, and opens it with View Report. If needed, they correct it, then press Confirm report. The flight becomes Completed and can be invoiced.

- **Role:** the pilot or the TSOP sends; an operational role confirms.
- **Device:** mobile app for sending; computer for confirmation.
- **Starting screen:** «Flight Reports».
- **Prerequisites:** flight «Engaged» or «In Progress»; report sent by the crew.

Steps:

1. «Flight Reports» menu. The tabs are «Active» (sent and confirmed) and «Drafts» (the pilot's drafts). The default period is «Last 90 days».
2. On the flight's row, Action menu, «View Report». The report also opens from the Calendar (right-click, «View report») and the «Flights» list.
3. Check the «Tasks» panel, times, «Materials», fuel, crew notes and the «Client representative sign-off» signature.
4. If you fix anything press «Save corrections». Message: «Report corrections saved»
5. Press «Confirm report». Message: «Report confirmed»

**What you see:** the flight is «Completed» («Completed» tab of «Flights»; purple, locked card in the Calendar). The report becomes read-only.

**Handoff:**

- The invoice is created from the report line with «Create Invoice» (T13).
- The receipt signed by the customer is downloaded with «Download customer receipt».

**If a button or result is missing:**

- Report absent in «Active»: the pilot has not yet sent it (look in «Drafts»), or it is outside the chosen period.
- «Confirm report» disabled: the customer typed in by hand by the pilot must first be linked to a real customer with «Resolve client».
- «Create Invoice» grey: unconfirmed report, or already invoiced flight («Already on …»).

**Verification.** screens observed on staging, behavior in the source code.

### T13 How do I invoice flights?

**Short answer:** the invoice is not created from the Invoices list but from the work done. There are three ways:

- from the job with «+ Create Invoice»;
- from the confirmed report with «Create Invoice»;
- from the accepted offer with «Create Advance Invoice», for an advance.

Then check rows and conditions, print and send it by email. A flight can be on only one active invoice.

- **Role:** administration, project manager or dispatcher (see Open checks for the exact permissions).
- **Device:** computer.
- **Starting screen:** «Jobs» or «Flight Reports».
- **Prerequisites:**
    - customer linked to the job;
    - for flights, confirmed reports (T12);
    - invoice template published in NGFT Print.

Steps:

1. Choose where to start from:
    - **The whole job:** «Jobs», open the job, section «Invoices», «+ Create Invoice».
    - **A flight:** in «Flight Reports», row menu, «Create Invoice». Or in the job's flight table, flight menu, «Create Invoice».
    - **Advance:** in the accepted offer, «Create Advance Invoice». Choose «Percentage» or «Fixed amount», then «Create».
2. The invoice opens as a draft («Edit Invoice»). Check the rows in «Flights & Flight Sequences»: the amount is «Inv unit» × price.
3. You can add rows with «+ Add free-text line» or «+ Add calculated line».
4. In «Conditions» check «Currency», «VAT Scheme», «Payment Tr.» and, for Switzerland, «Swiss QR-bill on PDF».
5. Press «Save». Message: «Invoice saved»
6. Press «Print», save in NGFT Print, then envelope icon and «Send». When the delivery is confirmed, the invoice passes to «ISSUED».
7. The later statuses are set by hand with the selector: «PENDING», «PAID», «OVERDUE», «ARCHIVED», «CANCELLED».

**What you see:**

- The invoice is on the «Invoices» list.
- In the invoiced flights an orange label appears with the invoice number, in the lists «Flights», «Flight Reports» and in the order.

**Handoff:**

- The invoice is linked to the job.
- Management Cockpit counts turnover and receivables.

**If a button or result is missing:**

- In «Invoices» there is no «New Invoice»: this is intended; you start from the job, the report or the offer.
- «Already on invoice … — open it or cancel that invoice first»: the flight is already on an invoice. To redo an invoice:
    - set the old one to «CANCELLED», or delete it if it is still a draft;
    - then create a new one.
- «Assign the client before creating an invoice.»: there is a temporary customer that must first be linked («Resolve client»).
- Invoice total 0: the flights do not yet have units from the report. The warning icon next to the number appears on every non-draft invoice with a total of 0.
- «Issue without advance deductions?»: there are non-deducted deposits. Choose «Issue anyway» or «Go to deductions».
- The «Status» filter of the list does not have «Issued». To find them, sort by the «STATUS» column or use the search.
- When you open an «ISSUED» invoice, red alerts «Changes not saved - Invoice is not editable in its current status» appear. They are a known effect: the invoice does not change.
- QR-bill: You need an IBAN CH or LI in Company Admin and an invoice in CHF or EUR.

**Verification.** screens observed on staging, behavior in the source code.

### T14 How do I check the crew's flight hours, duty hours and FTL limits?

**Short answer:** open Flight & Duty Times. In Working times you see the time recorded by the crew. In FTL compliance you see, for each pilot, the status of the flight and duty limits: OK, Warning or Failed. The calculation is updated once a day, or immediately with Recalculate.

- **Role:** management, dispatcher, Base Manager (own base only). Every member sees their own limits.
- **Device:** computer. The crew records the time in the mobile app.
- **Starting screen:** «Flight & Duty Times».

Steps:

1. «Flight & Duty Times» menu. In the «View» filter, choose «Working times» or «FTL compliance».
2. In «Working times» filter by «Staff Type» and «Period». Open a person with «View Details».
3. In «FTL compliance» you can filter by:
    - «Regulation» («Swiss», «Austrian», «German»);
    - «Status» («Failed», «Warning», «OK», «Undetermined»);
    - «Base», «Role» and «Show inactive».
4. Open a person to see «All limits, most stringent first». With «Recalculate» you update the calculation immediately.

**What you see:** FTL status per person, with the items «Duty today», «Block today», «Rest», «Block year».

**Handoff:**

- The same calculation appears in the FTL sheet of the mobile app.
- OPS Agent reports who is at risk among those who fly today or tomorrow.

**If a button or result is missing:**

- Empty FTL view or with error: the role does not include FTL overview.
- A TSOP does not appear: the FTL limits apply to Pilot, Copilot and HEMS TCM.
- «Undetermined»: the regulation has not been determined. Choose a «Regulation» at the top.
- The time of the daily calculation is set in «Preferences & Defaults › Flight time limits».

**Verification.** screens observed on staging, behavior in the source code.

### T15 Can OPS Agent prepare the day’s plan?

**Short answer:** OPS Agent can propose an aircraft, time and crew using the schedule, roster and flight-time limitations. Review the proposal before confirming. Access requires the NGFT Administrator role and the relevant operational permissions.

- **Role:** NGFT Administrator in at least one of the user's companies, plus an operational role to see the data. The agent uses the user's permissions.
- **Device:** computer.
- **Starting screen:** any page; the «OPS Agent» button is at the bottom right.
- **Prerequisites:** agent active in the installation.

Steps:

1. Press «OPS Agent». The panel opens with «Needs Attention (n)». For each notice there are «Open», «Ask The Agent» and «Hide For Today».
2. Use a prompt question («What Am I Looking At?», «Who Is Flying Tomorrow?», «What I Can Do»), or write in «Message to the agent».
3. Example: «Prepare tomorrow's plan». The agent proposes a card with helicopter, time, crew and warnings to be checked.
4. Check the proposal and confirm it. In the clip the button is «Confirm and save».
5. The Calendar shows the flight on the proposed helicopter, «Scheduled», with the proposed crew.

**What you see:** the confirmed changes are in the Calendar. The panel rechecks the alerts.

**Handoff:** the crew's Engage and flight start remain separate steps of the dispatcher (T4).

**What the agent doesn't do:**

- Engage the crew or start a flight.
- Overbooking confirmation.
- Send or issue offers and invoices.
- Cancellations without a confirmed proposal.

**If a button or result is missing:**

- «OPS Agent» button absent: the user is not NGFT Administrator, or the agent is switched off in that installation.
- Empty Answers or «no access»: The user does not have an operational role for those data.
- Other limits:
    - up to 60 messages per hour per person;
    - responds in the language you write;
    - for future days it uses today's FTL status.

**Verification.** recording of a demo on staging, screens observed on staging, behavior in the source code, documentation.

### T16 How do I see what needs attention in the company? (Management Cockpit)

**Short answer:** the Management Cockpit collects in one page:

- turnover and receivables;
- hours flown;
- status of fleet and crew;
- a list of points that require attention, for example completed but not invoiced flights or overdue invoices.

It is reserved for management.

- **Role:** Accountable Manager, Company Account Owner, Chief Financial Officer, Nominated Person Flight Operation, Base Manager (only your base), NGFT Administrator or Support.
- **Device:** computer.
- **Starting screen:** «Management Cockpit» or «Open cockpit →» on the Dashboard.

Steps:

1. «Management Cockpit» menu. Choose the period («This month», «Last 30 days», «This quarter», «Year to date», «Last 12 months») and the base and group filters.
2. On the «Overview» tab, read the alerts. Examples: «Overdue receivables», «Flown, no day report», «Completed, not invoiced», «Expired offers without decision».
3. Click a pane, for example «Receivables», for detail and formula.
4. The other tabs are «Commercial», «Operations», «Crew & Compliance» and «Fleet».
5. «Configure» sets which tiles you see. Targets and thresholds apply to the whole company, and only roles not limited to a base can change them.

**What you see:** company picture with clickable alerts.

**Handoff:** from the alerts you go to the lists to settle: invoices, reports, offers.

**If a button or result is missing:**

- Item missing from the menu: the role is not among those of the cockpit.
- From direct links without role: «The Management Cockpit is not available for your role.»
- Base Manager without assigned base: the cockpit does not open.
- The «Safety» tab is a preview: SMS, Audit and FRAT will arrive at a later stage.

**Verification.** screens observed on staging, behavior in the source code.

### T17 How do I use the map and operation sites?

**Short answer:** in Map you see the day's flights by helicopter, with Swiss and Austrian maps, the ICAO chart, airspaces and obstacles. You can draw areas, measure distances and import or export KML. In Operation Sites you save landing sites, pickups and drop-offs, to be used in flights and offers.

- **Role:** dispatcher and operational roles. The project manager sees the flights; the pilots read the sites.
- **Device:** computer.
- **Starting screen:** «Map» or «Operation Sites».

Steps in Map:

1. Choose the day with the arrows on the top right.
2. In the «JOBS» panel, click a flight to highlight it. The «Time of day» widget shows where each helicopter will be according to the plan.
3. In the «LAYERS» panel, choose the base map («Swiss Topo», «Austrian Map», «ICAO Chart», «Satellite», «OpenStreetMap») and the layers «Airspace», «Air Navigation Obstacles» and «Mountain Landing Sites».
4. To draw: «Company data», «New layer». Then use the tools below («Draw polygon», «Draw circle», «Drop point», «Draw line») and save with «Save».
5. «Measure distance and altitude (not saved)» measures without saving. From the layer menu: «Import KML / KMZ» and «Export as KML».

Steps in Operation Sites:

1. «Operation Sites», «Add Site» button.
2. Choose «Category» (for example «Heliport», «Mountain Landing Site», «Hospital») and type «Shared» or «Private». Enter coordinates and data such as «T-Value (kg)» and «D-Value (m)».
3. Save. The site can then be chosen as a pickup or drop-off.

**What you see:** sites and drawings on the map. From the Calendar, right-click a flight, «View flight layer», to see the flight path.

**If a button or result is missing:**

- «No jobs on the selected date.»: no flight that day.
- The «Weather» layer and some layers are disabled («Coming soon»).
- On Map there is no real-time GPS tracking: the locations are the planned ones.
- The choice between coordinates «WGS84» and «LV95» is changed at the top. The default format is set in «Preferences & Defaults».

**Verification.** screens observed on staging, behavior in the source code.

### T18 Can I export data in Excel?

**Short answer:** Yes. Lists have the Export button, which downloads a CSV file that opens in Excel. With Columns, choose the columns. The day plan comes out in PDF, offers and invoices via NGFT Print, and map drawings in KML.

- **Role:** whoever can open the list.
- **Device:** computer.
- **Screens:** «Jobs», «Flights», «Offers», «Invoices», «Flight Reports», «Flight & Duty Times», «Operation Sites», «Clients And Contacts», «Products».

Steps:

1. Open the list and apply search and filters.
2. If needed, with «Columns (n)» choose the columns.
3. Press «Export». The file is downloaded, for example `flights-export.csv`.

Other formats:

- «Daily plan PDF» in Calendar (T6);
- «Print» in offers and invoices (T11, T13);
- «Export as KML» in Map (T17).

**If a button or result is missing:**

- Roster and Weekly Planner don't have an export.
- The lists with the broken «Status» filter do not export filtered by status.

**Verification.** screens observed on staging, behavior in the source code.

### 5.1 Demo Dispatcher · Fit in a new mission

Show Calendar in read-only mode with a Flight Dispatcher account. Open an unassigned demo mission in Unassigned Jobs. Show the assignment from the mission clip, if approved and available on the kiosk. In the clip the flight ends on the helicopter's row in Scheduled status, with a pilot assigned. A live drag saves data.

### 5.2 Commercial Demo · From Offer to Invoice

With an operational role or Project Manager, show a demo job that already has an accepted offer and a related invoice. From the job open Offers, Flights and Invoices. Point out the status of each step and show where to export. The demo can be done in read-only mode.

### 5.3 Demo Management · What needs attention

With an enabled role, from Dashboard open Management Cockpit. Choose This month, show Completed, not invoiced and Overdue receivables, then open the Fleet or Operations tab. Use demo data. Any demonstration of OPS Agent is only for authorised roles such as NGFT Administrator.
