# 13. Reports: Position, Crew and Aircraft Overview

[← Previous: Editing a member](12-member-edit.md) · [Table of Contents](README.md) · [Next: Bundles and active subscriptions →](14-subscriptions.md)

**Who can use it:** managers with the permission *See training data of crew members* (menu **Members Properties**).

By default: Accountable Manager (AM), Base Manager, Chief Flight Instructor (CFI), Chief Theoretical Knowledge Instructor (CTKI), CMM CAMO, CMM Maintenance (Part 145), Company Account Owner, Company Administrator, Compliance Monitoring Manager (CMM), Deputy NPCT, Head of Training (HT), NPCA, NPCT, NPFO, NPGO, NPMO and Safety Manager (SM).

UAS …: the same roles for drone operations.

![Where you are: Members Properties](screenshots/12-00-where.png)

## What it is for

The reports show the training status of your **whole crew at a glance**, for example before an audit or when you plan trainings. Each row is a member, each dot a status. An empty cell means it does not apply.

You can save the status as a **picture** or download the data as an **Excel file**, for example for an audit ([Other buttons](#other-buttons)).

| Report | Columns | Use it to see |
|---|---|---|
| **Aircraft Overview** | Operations per aircraft | May the member fly this aircraft for this operation, and under which conditions? |
| **Position Overview** | Positions and operations | Is each member complete for their position or operation? |
| **Crew Overview** | Single courses and certificates | Which course is missing or expiring? |

| Dot | Meaning |
|---|---|
| ![Green](screenshots/icons/status-valid.svg) | **Valid.** The number (Crew Overview) shows the days remaining |
| ![Orange](screenshots/icons/status-buffer.svg) | **Buffer zone:** expires within 3 months |
| ![Red](screenshots/icons/status-expired.svg) | **Expired** (red **!**, Crew Overview) |
| ![Red](screenshots/icons/status-missing.svg) | **Missing** |

## Step by step

1. Click **Members Properties** in the sidebar (red frame) and choose a report:

   ![Crew Overview](screenshots/12-02-crew-overview.png)

2. Click the refresh arrow (**1**) ![Refresh](screenshots/icons/tool-refresh.svg) to calculate again, for example after an upload or an approval. The blue box says when the data was last calculated.
3. Narrow the table with the filters (**2**) and save them if required ![Save](screenshots/icons/tool-save.svg). Your filters are then your default view.
4. Click ![Clear filters](screenshots/icons/tool-clear-filter.svg) (**3**) to clear all filters.

### Click a dot

- **Aircraft Overview:** see below.
- **Position Overview:** a window with the member's courses for that position or operation, with the same icons as in My Courses ([chapter 4](04-my-courses.md)). You do not have to open the arrow of a course: the **first row** already shows the current status, and you find the icons for the next step right there.
- **Crew Overview:** shows status, expiry and buffer zone. A click keeps the box open and adds the icons upload, cart, play, download and history.

### Aircraft Overview

![Aircraft Overview](screenshots/12-04-aircraft-overview.png)

**A pilot may fly only if all required courses are green:** the operation's own sign-off **and all courses of the pilot's position** (the courses in the Crew Overview). The dot stays red until all of them are valid.

The marks around a dot show the conditions you set in [chapter 12](12-member-edit.md). A click shows the status of the operation and of the aircraft, plus the conditions:

| Dot | Meaning | After a click |
|---|---|---|
| ![Plain dot](screenshots/icons/mark-plain.png) | No special conditions | ![Plain](screenshots/12-06-click-plain.png) |
| ![Blue ring](screenshots/icons/mark-supervision.png) | **Under supervision:** only together with an experienced pilot | ![Under supervision](screenshots/12-05-aircraft-click.png) |
| ![Dark disc](screenshots/icons/mark-limitations.png) | **Limitations**, for example *Visibility > 5km* | ![Limitations](screenshots/12-07-click-limitations.png) |
| ![Blue ring with dark disc](screenshots/icons/mark-both.png) | **Both** | ![Both](screenshots/12-08-click-both.png) |

### Other buttons

![Toolbar](screenshots/12-03-toolbar.png)

| Icon | What it does |
|---|---|
| ![Dollar](screenshots/icons/tool-purchased.svg) | Crew Overview only: shows only courses not purchased yet |
| ![Airplane](screenshots/icons/tool-aircraft-courses.svg) | Crew Overview only: shows the aircraft courses as well. Click it again to hide them |
| ![Full screen](screenshots/icons/tool-fullscreen.svg) | Full-screen view |
| ![Camera](screenshots/icons/tool-camera.svg) | Takes a picture of the table to save or share |
| ![Grid](screenshots/icons/tool-excel.svg) | **Export to Excel.** Downloads the table as an Excel file (all three reports) |

### Excel export

The camera gives you a **picture**, the grid button gives you the **data**, so you can sort it, filter it and keep it.

1. Set the filters you want. The file contains what you see: the same filters and the same columns.
2. Click the grid button ![Grid](screenshots/icons/tool-excel.svg) (*Export to Excel*). The file is saved in your downloads, for example `crew_course_overview_2026-11-13-04-45.xlsx`. The time in the name is when the data was calculated.
3. Open the file. The first row says when the data was calculated and which filters were set. Below it the columns have the same groups as on the screen. Each cell shows **Missing**, **Expired**, the **days remaining**, or **Never Expires**, in the colour of the dot. Members with a red status come first.
