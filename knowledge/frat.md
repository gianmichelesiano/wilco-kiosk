# NGFT FRAT · WILCO_PRODUCT_GUIDE.md

### 1.1 What NGFT FRAT does

**Short answer for Wilco.** "NGFT FRAT is a flight risk assessment app for pilots. Before a flight, the pilot answers the company's risk questions on a phone or tablet. The app adds up the score, shows the risk level in colour and offers the next step: fly, mitigate, ask the manager for permission, or cancel. The decision is saved with the flight, and managers can grant or deny requests from their own device."

What happens in the app, in order:

1. The pilot signs in with an NGFT account and chooses a crew (the company or base they fly for).
2. The pilot creates a flight: purpose, date, registration, departure, destination, alternate, off-block time, enroute time, people on board and pilot in command.
3. The pilot runs a FRAT for that flight. A FRAT is the company's questionnaire, with scores, risk levels and possible mitigations. The company publishes it; the pilot only fills it in.
4. The app shows the result: score, risk level and colour. The pilot signs the entries with a checkbox.
5. Depending on the risk level, the pilot chooses **FLY**, **FLY ANYWAY**, **ASK FOR PERMISSION**, **MITIGATE** or **CANCEL FLIGHT**.
6. If the pilot asks for permission, a FRAT Admin of the same crew grants or denies it in the **Decisions** tab.
7. After mitigation the pilot can open a **MITIGATION PDF** report.

**Verification.** Source code and documentation. Not verified on a device.

### 1.3 Roles

| Role | What the role can do in the app |
|---|---|
| **FRAT User** | Sign in, choose a crew, create and archive flights, run FRATs, sign results, add notes, choose a decision, ask for permission, mitigate, open the mitigation PDF. Sees the crew's requests in **Decisions**, read-only. |
| **FRAT Admin** | Everything a FRAT User can do, plus the **Granted** and **Denied** buttons on pending requests in **Decisions**. |
| **NPFO** (Nominated Person Flight Operations) | Not an app role. The app names the NPFO as the person who publishes FRATs for the company. |

A user who has neither role in any crew sees "No crews found" after sign-in and cannot continue.

**Verification.** Source code.

### 1.4 Key terms and status values

- **Flight**: a planned flight entered by the pilot.
- **FRAT**: the company's questionnaire. Only FRATs with status `live` and type `flight`, published for the selected crew, appear in the app. The list shows them as "Status: live".
- **Assessment**: one completed FRAT, with its score, signature, notes, mitigations and decision.
- **Risk level**: a band defined in the FRAT, with a title, a colour and an upper threshold.
- **Mitigation**: a measure defined in the FRAT for a question. Each selected mitigation subtracts points from the score.

Decision values. The left column is what **Flight Details** shows next to "Decision:".

| Shown on Flight Details | Stored value | Set by | Decisions tab |
|---|---|---|---|
| No decision | (empty) | — | — |
| Fly | `fly` | **FLY** | not listed |
| Cancel | `cancel` | **CANCEL FLIGHT** | not listed |
| Fly anyway | `fly_anyway` | **FLY ANYWAY** | not listed |
| Ask permission | `ask_permission` | **ASK FOR PERMISSION** | **Pending** |
| Permit | `permit` | **Granted** (FRAT Admin) | **Granted** |
| Deny | `deny` | **Denied** (FRAT Admin) | **Denied** |

**Verification.** Source code.

### 3.1 How do I sign in and choose my crew?

**Short answer for Wilco.** "Open the NGFT FRAT app and sign in with your NGFT email address and password. If you fly for more than one crew, pick one on the Select Crew screen. The app then opens Home with your next flight and your last FRAT."

**Context.**
- Role: FRAT User or FRAT Admin in at least one crew.
- Device: phone or tablet with network.
- Starting screen: sign-in screen "Welcome to NGFT".
- Prerequisite: an NGFT account. The company's administrator assigns the FRAT role.

**Steps.**
1. Open **NGFT FRAT**.
2. In **Username**, enter your email address. In **Password**, enter your password.
3. Optional: tick **Remember me**. Next time the app fills in your username.
4. Tap **LOGIN**. The app shows "Signed in successfully".
5. On **Select Crew** ("Hi, <your name>", "Select a crew to continue"), tap your crew. If you have only one crew, the app skips this screen.
6. The app opens **Home**: "Welcome Back", your name, and the cards "Next Scheduled Flight", "Last Frat" and "Last Flight" when data exists. The bottom bar has **Home**, **FRAT**, **Decisions** and **Profile**.

**Visible result and handoff.** You are in the selected crew. Flights, FRATs and requests on every tab belong to that crew. Change the crew later in **Profile**. If you are still signed in from a previous session, the app goes straight to **Select Crew**.

**Troubleshooting.**
- "Enter a valid email address": the **Username** field accepts only an email address.
- "No network connection": sign-in needs network.
- "No crews found" and "You are not authorized. Please check your role in the system with your manager.": your account has no FRAT role in any crew. Ask your company's NGFT administrator. Tap **Log out** to leave.
- "Looks like something went wrong. Please try again later." with **Retry**: the user information could not be loaded. Tap **Retry**.
- Home says "You have no flights!": no flights exist yet for this crew. Create one.

**Verification.** Source code.

### 3.2 How do I create a flight?

**Short answer for Wilco.** "Go to the FRAT tab and tap NEW FLIGHT. The app asks one thing per screen: purpose, date, registration, departure, destination, alternate, off-block time, enroute time, people on board and pilot in command. Your name is already filled in as pilot in command. Tap the tick on the last step and the flight is saved."

**Context.**
- Role: FRAT User.
- Device: phone or tablet, **online**.
- Starting screen: **FRAT** tab › **FLIGHTS** sub-tab.
- Prerequisite: a crew is selected.

**Steps.**
1. Tap **FRAT** in the bottom bar. Stay on the **FLIGHTS** sub-tab.
2. Tap **NEW FLIGHT**. The form shows "STEP 1 OF 10". Use the down arrow for the next step and the up arrow to go back.
3. Fill in each step. Text is converted to capitals.

   | Step | Question on screen | Field | Required |
   |---|---|---|---|
   | 1 | "Describe the purpose of your flight" | Description | yes |
   | 2 | "Select the date of your flight" | Date of flight | yes |
   | 3 | "Set the aircraft registration" | Tail number | yes |
   | 4 | "Set the departure airport" | Departure airport (pick from the suggestions) | yes |
   | 5 | "Set the destination airport" | Destination airport | yes |
   | 6 | "Set the alternate airport / landing site" | Alternate airport | no |
   | 7 | "Set the estimated off-block time" | Off-block time | yes |
   | 8 | "Set the estimated enroute time" | Enroute time | yes |
   | 9 | "Set the number of people on board" | People on board | yes |
   | 10 | "Set the Pilot in command" | Pilot in command (pre-filled with your name) | yes |

4. On step 10, tap the tick icon.

Example with fictional data: "DEMO TRAINING CIRCUIT", tail number "DEMO-01", 2 people on board.

**Visible result and handoff.** The app shows "Flight created successfully" and opens **Flight Details**: Date, Registration, Departure, Destination, Alternate, EOBT, EET, POB, PIC and "Decision: No decision". The **NEW ASSESSMENT** button starts the risk assessment. The flight appears at the top of **FLIGHTS**.

**Troubleshooting.**
- **NEW FLIGHT** is missing: it shows only on the **FLIGHTS** sub-tab, not on **FRATs** or **ARCHIVE**.
- "No network connection": creating a flight needs network.
- The down arrow does not move: a required field is empty. The field shows the reason in red.
- Leaving the form with the back arrow shows "Confirmation Alert", "If you exit now then the data that was entered will be lost". **Exit** discards the entries; **Cancel** stays.
- "Something went wrong. Please try again later or contact support.": the server did not save the flight. Try again.

**Verification.** Source code.

### 3.3 How do I run a risk assessment for a flight?

**Short answer for Wilco.** "Open the flight and tap NEW ASSESSMENT. Choose your company's FRAT. The app shows one question per screen: tap your answers or move the slider, then go to the next step. On the last question, tap the tick and the app calculates the risk straight away."

**Context.**
- Role: FRAT User.
- Device: phone or tablet. Online is recommended (offline works only for a FRAT opened online before on this device).
- Starting screen: **Flight Details** of a flight with "Decision: No decision".
- Prerequisite: the crew has at least one published FRAT.

**Steps.**
1. In **FRAT** › **FLIGHTS**, tap the flight. **Flight Details** opens.
2. Tap **NEW ASSESSMENT**.
3. Tap the FRAT you want to use. Each FRAT shows "Status: live".
4. The FRAT opens with its title at the top. Each step shows one question as "<Section>: <Question>" and "STEP X OF Y".
   - Choice questions: tap one answer, or several if the question allows it.
   - Slider questions: move the slider. The value shows as "Value: N".
5. Tap the down arrow for the next question. The arrow stays inactive until you answer a required question.
6. On the last question, tap the tick icon.

**Visible result and handoff.** The app opens **Frat Results**. The assessment is saved with the flight on the server. The flight stays in **FLIGHTS**.

**Troubleshooting.**
- **NEW ASSESSMENT** is missing: the flight already has a decision. One flight has one decision. Create a new flight for a new assessment.
- "Your company has not published any FRATs yet. Ask your NPFO.": no live FRAT exists for the selected crew. Check the crew in **Profile**, then ask the NPFO.
- "User id is null, please sign out and then sign in again.": log out and sign in again.
- "No question available": the FRAT has no questions. Contact the NPFO.
- Leaving mid-way shows "Confirmation Alert". **Exit** discards your answers.

**How the score works.** Each answer has points. Sliders give points by range. Some answer combinations add extra points (the FRAT calls them modifiers). The total decides the risk level.

**Verification.** Source code and documentation.

### 3.4 How do I read the FRAT result and sign it?

**Short answer for Wilco.** "The result screen shows your total score, the risk level and its colour. A plane icon means low risk, a triangle means caution and a stop sign means the risk is too high. Before you choose what to do, tick the box to confirm your entries are accurate. That is your signature."

**Context.**
- Role: FRAT User.
- Device: phone or tablet, online for the signature.
- Starting screen: **Frat Results**, right after the last question.

**Steps.**
1. Read the top of **Frat Results**:
   - the icon in the risk-level colour,
   - "Threshold: N" (the upper limit of your risk level, not your score),
   - "Risk Level: <title>" (the title comes from your company's FRAT),
   - "Assessment Total Score: N".
2. Tick "Tick the box to confirm the accuracy of your entries". A short spinner shows while the app saves the signature.
3. Choose an action. The buttons depend on the score:

   | Your score | Icon | Buttons |
   |---|---|---|
   | At or below the lowest threshold | Plane | **FLY**, **CANCEL FLIGHT** |
   | Above the lowest, up to the second-highest threshold | Triangle | **FLY ANYWAY**, **CANCEL FLIGHT** |
   | Above the second-highest, up to the highest threshold | Triangle | **ASK FOR PERMISSION**, **CANCEL FLIGHT** |
   | Above the highest threshold | Stop sign | **MITIGATE**, **CANCEL FLIGHT** |

   **MITIGATE** also appears in the first three rows when your answers have mitigations in the FRAT.
4. Optional: tap **ADD RISK NOTE**.

Fictional example: a FRAT with "Low" up to 10, "Medium" up to 20 and "High" up to 30 points. A score of 8 gives a plane and **FLY**. A score of 15 gives **FLY ANYWAY**. A score of 25 gives **ASK FOR PERMISSION**. A score of 34 gives a stop sign and only **MITIGATE** or **CANCEL FLIGHT**.

**Visible result and handoff.** The signature is saved on the assessment. The next step is a decision, a permission request or mitigation.

**Troubleshooting.**
- "Please sign by checking the box before proceeding": every button on this screen, including **ADD RISK NOTE** and **MITIGATE**, needs the box ticked first.
- The box does not tick: it needs network.
- "Risk Level: Not defined" or "Threshold: N/A": the FRAT has no risk levels. Contact the NPFO.

**Verification.** Source code.

### 3.5 How do I record my go/no-go decision?

**Short answer for Wilco.** "On the result screen, tick the signature box and tap FLY or CANCEL FLIGHT. In the caution band you can choose FLY ANYWAY and write a reason. The decision is saved on the flight, and the app goes back to Home."

**Context.**
- Role: FRAT User.
- Device: phone or tablet.
- Starting screen: **Frat Results** with the signature box ticked.

**Steps.**
- **Fly (low risk):** tap **FLY**. The app shows "Flight confirmed".
- **Cancel (any level):** tap **CANCEL FLIGHT**. The app shows "Your flight has canceled" or "Flight canceled".
- **Fly anyway (caution band):**
  1. Tap **FLY ANYWAY**. The screen "Ask for permission to fly" opens.
  2. In **Reason**, type why you are going (for example "Demo: ceiling improving, alternate planned").
  3. Tap **SUBMIT**. The app shows "You chose to fly anyway".

**Visible result and handoff.** The app returns to **Home**. **Flight Details** now shows "Decision: Fly", "Decision: Cancel" or "Decision: Fly anyway", and **NEW ASSESSMENT** is gone. **FLY ANYWAY** does not appear in the **Decisions** tab, so a FRAT Admin does not see it in the app.

**Troubleshooting.**
- "Error: You must be online to submit your decision to "Fly anyway".": **FLY ANYWAY** needs network.
- **FLY** is missing: your score is above the lowest threshold. Higher bands offer **FLY ANYWAY**, **ASK FOR PERMISSION** or **MITIGATE** instead.
- The **Reason** field is not mandatory, but it is the only explanation saved with "Fly anyway".

**Verification.** Source code.

### 3.6 How do I ask my manager for permission to fly?

**Short answer for Wilco.** "If your score is in the high band, tap ASK FOR PERMISSION, write the reason and tap SUBMIT. The request goes to the Decisions tab of your crew, where a FRAT Admin can grant or deny it. Your flight shows Ask permission until they answer."

**Context.**
- Role: FRAT User.
- Device: phone or tablet.
- Starting screen: **Frat Results** with the signature box ticked, score in the **ASK FOR PERMISSION** band, or after mitigation when the score is still above the lowest threshold.

**Steps.**
1. Tap **ASK FOR PERMISSION**. The screen "Ask for permission to fly" opens.
2. In **Reason**, describe the situation and your plan.
3. Tap **SUBMIT**.

**Visible result and handoff.** The app shows "Permission status pending." and returns to **Home**. **Flight Details** shows "Decision: Ask permission". The request appears in **Decisions** › **Pending** for everyone in the crew. A FRAT Admin answers it there. The app does not send a push notification; tell your manager directly if it is urgent.

**Troubleshooting.**
- **ASK FOR PERMISSION** is missing: your score is in another band. In the stop band, mitigate first.
- No network: the request is stored on the device and sent when the connection returns.
- After a **Deny**, the flight cannot be assessed again. Create a new flight if the plan changes.

**Verification.** Source code.

### 3.7 How does a FRAT Admin grant or deny a request?

**Short answer for Wilco.** "The manager opens the Decisions tab. Pending shows each request with the pilot's name, date, route, reason and score after mitigation. Tap Granted or Denied. The request moves to the matching tab, and the pilot sees Permit or Deny on the flight."

**Context.**
- Role: **FRAT Admin**.
- Device: phone or tablet, **online**.
- Starting screen: **Decisions** tab, same crew as the pilot.

**Steps.**
1. Tap **Decisions** in the bottom bar. The tabs are **Pending**, **Granted** and **Denied**.
2. On **Pending**, read the request card: pilot name, flight date, "<departure> ➜ <destination>", the pilot's reason, "Score" and "After Mitigation".
3. Tap **Granted** or **Denied**.

**Visible result and handoff.** The app shows "Granted Permission" or "Denied Permission". The card moves to **Granted** or **Denied**. On the pilot's device, **Flight Details** shows "Decision: Permit" or "Decision: Deny", and the request appears in the matching tab. The app does not notify the pilot; the pilot sees the answer the next time they open the flight or **Decisions**.

**Troubleshooting.**
- **Granted** and **Denied** are missing: you do not have the FRAT Admin role. FRAT Users see the list read-only.
- "No open request": no pending requests for the selected crew. Check the crew in **Profile**. A request made offline arrives only when the pilot's device is back online.
- A new request does not appear: the list loads when you open the tab. Switch to **Home** and back to **Decisions**.
- "Score" shows "N/A": the API does not send the score before mitigation in this list. Use "After Mitigation".
- "No network connection": answering needs network.
- There is no undo in the app. Answered requests have no buttons.
- A request from a FRAT run without a flight shows "N/A ➜ N/A" as the route.

**Verification.** Source code.

### 3.8 How do I mitigate risks and lower the score?

**Short answer for Wilco.** "On the result screen, tick the signature box and tap MITIGATE. For each risky answer the app lists the mitigations your company accepts, like adding a second pilot or delaying departure. Tick the ones you will apply. The app subtracts their points and shows the new score and the next steps."

**Context.**
- Role: FRAT User.
- Device: phone or tablet, online recommended.
- Starting screen: **Frat Results** with the signature box ticked and **MITIGATE** visible.

**Steps.**
1. Tap **MITIGATE**. The screen "Mitigation Selection" opens.
2. Each step shows one question you answered, with its mitigations as checkboxes. Tick the mitigations you will apply.
3. Use the down arrow to move through the steps. On the last step, tap the tick icon.
4. The app shows "Mitigation Created" and opens **Frat Results** again, now with "FRAT Total Score After Mitigation: N", the new threshold and risk level.
5. Choose the next step:
   - If the new score is at or below the lowest threshold: **FLY**, **MITIGATION PDF** or **CANCEL FLIGHT**.
   - Otherwise: **MITIGATION PDF**, **ASK FOR PERMISSION** or **CANCEL FLIGHT**. After mitigation, **FLY ANYWAY** is not offered.
6. Optional: **ADD MITIGATION NOTE**.

**Visible result and handoff.** The mitigated score is saved on the assessment. FRAT Admins see it as "After Mitigation" in **Decisions**. **MITIGATION PDF** opens the mitigation report.

**Troubleshooting.**
- **MITIGATE** is missing: your answers have no mitigations in this FRAT, or the assessment was done offline. In the stop band, **MITIGATE** always shows.
- **CANCEL FLIGHT** on the after-mitigation screen, low band: the code opens the "Ask for permission to fly" form, and **SUBMIT** saves nothing. To cancel, go back to the first **Frat Results** screen and use **CANCEL FLIGHT** there.
- If the score does not change, the selected mitigations have zero points in the FRAT.

**Verification.** Source code and documentation.

### 3.9 How do I export the mitigation report as PDF?

**Short answer for Wilco.** "After you mitigate, tap MITIGATION PDF. The app creates a Mitigation Report with your name, the assessment and the mitigations you selected, grouped by section, and opens it on your device. From there you can share or save it."

**Context.**
- Role: FRAT User.
- Device: phone or tablet with a PDF viewer.
- Starting screen: **Frat Results** after mitigation.

**Steps.**
1. Tap **MITIGATION PDF**. A spinner shows.
2. The PDF opens in the device's viewer.
3. Use the viewer's share or save function to keep it.

**Visible result and handoff.** The PDF is titled "MITIGATION REPORT". It shows User, Assessment ID and FRAT ID, then "Selected Mitigations" grouped by section, and "Generated on <date and time>" in the footer. It does not contain scores, risk level, notes or the decision. The file is `Mitigation_results.pdf` in the app's storage and is replaced each time.

**Troubleshooting.**
- "Error generating PDF. Please try again.": tap again. If it persists, check that a PDF viewer is installed.
- The button is missing: the PDF is only offered after mitigation.
- This is the only export in the app. No CSV or Excel export was found.

**Verification.** Source code. The PDF is built on the device; whether it opens offline is not verified.

### 3.10 How do I add a risk note or a mitigation note?

**Short answer for Wilco.** "On the result screen, tick the box and tap ADD RISK NOTE to describe a risk the questions did not cover. After mitigation, ADD MITIGATION NOTE lets you explain what you will do. Both notes are saved with the assessment."

**Context.**
- Role: FRAT User.
- Device: phone or tablet, **online** recommended.
- Starting screen: **Frat Results** (risk note) or after-mitigation **Frat Results** (mitigation note).

**Steps.**
- **Risk note:**
  1. Tick the signature box, then tap **ADD RISK NOTE**. The screen "Enter risk note" opens.
  2. Type in **Risk note** and tap **SUBMIT**. The app shows "Risk note submitted successfully."
- **Mitigation note:**
  1. Tap **ADD MITIGATION NOTE**. The screen "Enter mitigation note" opens. If you wrote a risk note, it shows as "Custom Risk Note:".
  2. Type in **Mitigation note** and tap **SUBMIT**. The app shows "Mitigation note submitted successfully."

**Visible result and handoff.** The notes are stored on the assessment. They appear on no other screen and not in the PDF.

**Troubleshooting.**
- "Please enter a risk note." / "Please enter a mitigation note.": the field is empty.
- Add notes while online. The offline path for notes in the code looks incomplete.

**Verification.** Source code.

### 3.11 How do I run a FRAT without creating a flight?

**Short answer for Wilco.** "Open the FRAT tab and switch to FRATs. Tap a FRAT and answer the questions as usual. The result works the same way, but it is not linked to a flight. For a real flight, start from the flight, so the decision is stored with it."

**Context.**
- Role: FRAT User.
- Device: phone or tablet.
- Starting screen: **FRAT** › **FRATs** sub-tab, or the "Last Frat" card on **Home**.

**Steps.**
1. Tap **FRAT**, then the **FRATs** sub-tab.
2. Tap a FRAT ("Status: live").
3. Answer the questions and tap the tick on the last step.
4. Continue on **Frat Results**.

**Visible result and handoff.** The assessment and any decision are saved without a flight. A permission request from this assessment appears in **Decisions** with the route "N/A ➜ N/A". The "Last Frat" card on **Home** starts a new assessment of that FRAT; it does not reopen the previous one.

**Troubleshooting.**
- "Your company has not published any FRATs yet. Ask your NPFO.": no live FRAT for the selected crew.
- Swiping a FRAT shows "Frat items cannot be archived.": FRATs cannot be archived.

**Verification.** Source code.

### 3.12 How do I archive or restore a flight?

**Short answer for Wilco.** "In the flight list, swipe a flight from right to left to archive it. It moves to the ARCHIVE tab. To bring it back, swipe it again in ARCHIVE."

**Context.**
- Role: FRAT User.
- Device: phone or tablet, **online**.
- Starting screen: **FRAT** › **FLIGHTS** or **ARCHIVE**.

**Steps.**
1. In **FLIGHTS**, swipe the flight from right to left. The app shows "<DESCRIPTION> is archived!".
2. To restore, open **ARCHIVE** and swipe the flight from right to left. The app shows "<DESCRIPTION> is unarchived!".

**Visible result and handoff.** Archived flights are hidden from **FLIGHTS**. Their **Flight Details** shows "This flight is archived.". Archiving does not change the decision or the assessments. There is no delete function.

**Troubleshooting.**
- "No network connection": archiving needs network.
- "An error occurred.": the server did not save the change. Pull down to refresh the list and try again.
- "No Archived Flights Found": nothing is archived for this crew.

**Verification.** Source code.

### 3.13 What works offline?

**Short answer for Wilco.** "FRAT keeps your flights, FRAT list and questionnaires on the device once you have opened them online. Without signal you can still answer a FRAT and see the result. Anything saved offline is sent automatically when the connection comes back. Creating flights, archiving, flying anyway and approving requests need network."

**Context.**
- Role: FRAT User.
- Device: phone or tablet that was online at least once with the same crew.
- Starting screen: any.

**What the code does offline.**

| Action | Offline |
|---|---|
| See flights and FRAT lists | Yes, the last list loaded online for this crew |
| Open flight details | Yes, if opened online before on this device |
| Open a FRAT and answer it | Yes, if that FRAT was opened online before on this device |
| See **Frat Results** | Yes, calculated on the device |
| Tick the signature box | **No** — the box does not react offline |
| **FLY**, **CANCEL FLIGHT**, **ASK FOR PERMISSION** | Stored and sent later — but they also need the signature box (see above) |
| **MITIGATE** | Only in the stop band; stored and sent later |
| **NEW FLIGHT**, archiving, **FLY ANYWAY**, **Granted** / **Denied** | No |
| Sign in | No |

**Steps.**
1. Before a remote flight, open the app online, select the crew and open the FRATs you may need.
2. Offline, the app shows "Network disconnected". Work as usual.
3. When the connection returns, the app shows "Network connected" and sends stored answers, mitigations and decisions after about two seconds.

**Visible result and handoff.** After the sync, the server and the FRAT Admins see the data.

**Troubleshooting.**
- "No network found, Please try again later.": nothing has been stored on this device for that screen yet.
- **Do not tap LOGOUT with unsent offline work.** Logout deletes the data stored on the device, including what is not yet sent.

**Verification.** Source code and documentation. Offline behaviour is not verified on a device: confirm with the NGFT team before relying on it.

### 3.14 How do I switch crew or log out?

**Short answer for Wilco.** "Open Profile. Under Your Crews, tap the crew you want; a green tick shows the active one. To leave, tap LOGOUT and confirm."

**Context.**
- Role: any.
- Device: phone or tablet.
- Starting screen: **Profile** tab.

**Steps.**
1. Tap **Profile**. You see your picture, name, email and "Your Crews".
2. To switch, tap another crew. The app shows "Switched to <crew name>" and moves the green tick.
3. To log out, tap **LOGOUT**. Confirm "Are you sure you want to log out?" with **LOGOUT**.

**Visible result and handoff.** After a switch, **Home**, **FRAT** and **Decisions** show the new crew's data. After logout, the app returns to the sign-in screen, deletes the data stored on the device and forgets **Remember me**.

**Troubleshooting.**
- A crew is missing: you have no FRAT role in it. Ask your NGFT administrator.
- Logout deletes the data stored on the device, including offline work not yet sent.

**Verification.** Source code.

### 3.15 Is there a web version of FRAT?

**Short answer for Wilco.** "There is an older browser version of FRAT. Without signing in it runs in Free Mode with sample FRATs; signed in, you can create flights. For daily work and decisions, NGFT recommends the NGFT FRAT app on phone or tablet."

**Limitation.** The browser version is older and limited. Ask the NGFT team whether it is available for your company.

**Context.**
- Role: none for Free Mode; NGFT account for flights.
- Device: desktop or tablet browser.
- Starting screen: flight list with tabs **Flights**, **FRATs**, **Archive**.

**Steps (from source).**
1. Without login, the page shows "Free Mode" and the **FRATs** tab. **Login** and "No Login yet? Get your own account here." are offered.
2. Signed in, choose the organisation at the top and tap **New flight**. Fill in the steps from "Type a description of the flight" to "Set the pilot in command".
3. Open the flight, tap **New assessment**, choose the FRAT ("Choose FRAT"), answer and tap **Complete**.
4. The result shows the score as a percentage and the risk level. If mitigations exist, **Mitigate** lists them; "Own mitigation" lets you add your own text and score; **Finish Mitigation** returns to the result with "Before Mitigation" and "Your new Risk Score".

**Visible result and handoff.** Assessment and mitigations are stored on the NGFT platform, not in the FRAT API. The action buttons show only for flights in the future, and they save no decision.

**Verification.** Source code only.

### 5.1 Demo A: go/no-go before take-off

- **Visitor's question:** "How fast can a pilot do a risk assessment on the phone before a flight?"
- **Demo role:** FRAT User, demo crew. Phone or iPad.
- **Starting record:** fictional flight "DEMO TRAINING CIRCUIT", tail number "DEMO-01", "Decision: No decision". A short live FRAT on the demo crew.
- **Actions:**
  1. **FRAT** › **FLIGHTS** › "DEMO TRAINING CIRCUIT" › **NEW ASSESSMENT** › choose the FRAT.
  2. Answer with low-risk options; tap the tick on the last step.
  3. **Frat Results**: plane icon and risk level. Tick the signature box.
  4. **FLY** → "Flight confirmed". Open the flight: "Decision: Fly".
- **Result on screen:** score, low risk level in colour, then the decision stored on the flight.
- **Format:** both. As a silent 20–30 second clip if the FRAT has about six questions or fewer; otherwise as a guided 60–90 second demo.
- **Data changes:** creates an assessment and sets the flight's decision. **NEW ASSESSMENT** disappears, so the flight cannot be reused. Reset: archive the flight; use a new one next time.

**Verification.** Demonstration scenario based on the source code.

### 5.2 Demo B: high risk, mitigation and PDF

- **Visitor's question:** "What happens when the risk is too high? Does the app just say no?"
- **Demo role:** FRAT User, demo crew. iPad recommended for readability.
- **Starting record:** fictional flight "DEMO MOUNTAIN TRANSFER", "Decision: No decision". A demo FRAT with mitigations on the high-risk answers.
- **Actions:**
  1. **NEW ASSESSMENT**, answer with high-risk options. **Frat Results** shows a triangle or stop sign.
  2. Tick the signature box, tap **MITIGATE**, tick two or three mitigations, tap the tick.
  3. "FRAT Total Score After Mitigation" shows the lower score and new risk level.
  4. Tap **MITIGATION PDF**: the "MITIGATION REPORT" opens.
- **Result on screen:** score before and after mitigation, the new colour, and the PDF report.
- **Format:** guided 60–90 seconds. Steps 2 to 4 also work as a silent 20–30 second clip.
- **Data changes:** creates an assessment with mitigations and a signature. If you stop before any decision button, the flight keeps "No decision" and **NEW ASSESSMENT** stays visible, so the flight can be reused (source code only). Each run adds an assessment record. The PDF on the device is overwritten.

**Verification.** Demonstration scenario based on the source code.

### 5.3 Demo C: manager approval on a second device

- **Visitor's question:** "Can my operations manager approve a high-risk flight remotely?"
- **Demo roles:** pilot with FRAT User on a phone; manager with FRAT Admin on an iPad; same demo crew.
- **Starting record:** fictional flight "DEMO HOSPITAL TRANSFER", "Decision: No decision". Known answers that land in the **ASK FOR PERMISSION** band.
- **Actions:**
  1. Pilot: assessment → **Frat Results** → tick the box → **ASK FOR PERMISSION** → **Reason** "Demo: marginal weather at destination, alternate planned" → **SUBMIT** → "Permission status pending."
  2. Manager: **Decisions** › **Pending** (switch to **Home** and back if the card is not there yet). Show name, route, reason and "After Mitigation".
  3. Manager: **Granted** → "Granted Permission". The card moves to **Granted**.
  4. Pilot: open the flight: "Decision: Permit".
- **Result on screen:** the request travels from the pilot's phone to the manager's iPad and back, with the reason and score visible.
- **Format:** guided 60–90 seconds only. It needs two devices and there is no push notification.
- **Data changes:** permanent decision on the flight; no undo in the app. Reset: archive the flight and prepare a new one per run. Expect "Score: N/A" on the manager's card.

**Verification.** Demonstration scenario based on the source code.
