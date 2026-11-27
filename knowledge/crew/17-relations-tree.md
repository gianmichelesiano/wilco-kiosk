# 17. Relations tree

[← Previous: Company aircraft and limitations](16-aircraft-and-limitations.md) · [Table of Contents](README.md) · [Next: Approving uploaded certificates →](18-approve-courses.md)

**Who can use it:** managers with the permission *Configure courses* (menu **Relations Tree**).

By default: Accountable Manager (AM), Chief Flight Instructor (CFI), Company Account Owner, Company Administrator, Company LMS Manager, Head of Training (HT), NPCA, NPCT, NPFO, NPGO and NPMO.

The Deputy NPCT does not have it by default.

UAS …: the same roles for drone operations.

![Where you are: Relations Tree](screenshots/16-00-where.png)

## What it is for

The Relations Tree is the **rulebook of NGFT Crew**. It says which courses and certificates are required for whom. According to EASA every role, position and operation needs specific courses. NGFT delivers a standard set, and here you see it and adjust it for your company.

Everything depends on this tree: what a member sees in **My Courses**, the colours in the reports ([chapter 13](13-overviews.md)), and what is required for each person you set up in [chapter 12](12-member-edit.md). If a course is missing or too much for someone, look here first.

### How the tree is built

The tree goes from role to position to operation. Aircraft types can sit below any of them. A course placed on a level applies to everyone below it.

| Icon | Level | Example |
|---|---|---|
| ![Role](screenshots/icons/tree-role.svg) | **Role** | Pilot |
| ![Position](screenshots/icons/tree-position.svg) | **Position** (below a role) | CAT Pilot - Helicopter |
| ![Operation](screenshots/icons/tree-operation.svg) | **Operation** (below a position) | AtoA |
| ![Aircraft](screenshots/icons/tree-aircraft.svg) | **Aircraft** type (below a role, position or operation) | A109 |
| ![Course](screenshots/icons/tree-course.svg) | **Course or certificate** on that level | (280) Aviation Security - Initial |

In front of a course name you see its number: a plain number is an NGFT course, **cc_** a custom certificate of your company ([chapter 15](15-company-courses.md)), **g_** a group: the yearly versions of one course, for example *Accident / Incident Review*. The latest certificate of any course in the group counts for the whole group, and no Initial is needed first.

### The icons behind a course

| Icon | What it does |
|---|---|
| ![Hide](screenshots/icons/tree-hide.svg) | **Hide** an NGFT standard course for this position. You cannot delete standard courses, only hide them. |
| ![Show](screenshots/icons/tree-show.svg) | **Show** a hidden course again |
| ![Bin](screenshots/icons/tree-bin.svg) | **Remove** an entry that you added yourself |

## Step by step

### Read the tree

1. Click **Relations Tree** in the sidebar (red frame above). Open a role (**1**), its positions (**2**) and see the courses (**3**).

   ![The tree](screenshots/16-01-tree.png)

2. Type in **Search** to find a role, position, operation, aircraft or course. The tree shows only the matching path.

   ![Search](screenshots/16-03-tree-search.png)

### Add an existing course

You can only add courses that already exist. You cannot create a new course here. To create your own certificate, see [chapter 15](15-company-courses.md).

1. In the form at the top choose where the course applies (see the numbers):

   ![The form](screenshots/16-02-add-form.png)

   - **Role** (**1**): choose one or several roles. Choose several to add to all of them at once; then you can only add at role level.
   - **Position** (**2**): only when exactly one role is selected.
   - **Operation** (**3**): only after you have chosen a position.
   - **Aircraft** (**4**): the bold entry (ICAO designator) applies to all variants of the aircraft, a single variant only to that one.
   - **Courses / Certificates** (**5**): choose one or more. You find the NGFT courses and your own custom certificates here.

   The less you fill in, the wider the course applies: a role alone applies to all its positions.

2. Click **Add** (**6**). The course appears in the tree and has the bin icon, because you added it. **Clear** empties the form.

> **Tip:** click a role, position, operation or aircraft in the tree. The form is then filled in for that place.

### Add your own certificate

1. First create the certificate: **Company Custom Courses → Add Custom Certificate** ([chapter 15](15-company-courses.md)).
2. Then add it here like any other existing course. Custom certificates are in the list with **cc_** before their number.

### Add your own LMS course

1. First create the course: **Company Custom Courses → Add LMS Company Course** ([chapter 15](15-company-courses.md)).
2. Then add it here like any other existing course. Your LMS courses are in the list with their number only, without **cc_**. Until you do, your members do not see the course.

### Hide or remove a course

- To remove something you added: click the bin ![Bin](screenshots/icons/tree-bin.svg).
- To switch off an NGFT standard course for a position: click ![Hide](screenshots/icons/tree-hide.svg). The course disappears for your company.
- Hidden courses are shown in grey italics when the top icon is the crossed eye (**1**). Click ![Show](screenshots/icons/tree-show.svg) (**2**) to bring a course back.

  ![Hidden course](screenshots/16-04-hidden-course.png)

> **Important:** a change applies to **all** members with that role or position. Check the result in the reports ([chapter 13](13-overviews.md)).
