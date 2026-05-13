# AI Delegation & Orchestration Engine — Prompt Chain

This file contains prompts to be given to Claude Code in order.
Never start the next prompt before the current one is fully completed and tested.
After each prompt, test it yourself, confirm it works, then move to the next.

---

## PHASE 0 — Manual Setup (No Claude Code needed)

Complete all of these before running any prompts:

1. **Create Supabase project**
   - Go to supabase.com → New Project
   - Project name: `ai-delegation-engine`
   - Go to Settings → API → Copy the URL and anon key

2. **Create Telegram Bot**
   - Open Telegram → search @BotFather
   - Send `/newbot`, follow the steps, copy the token
   - Each team member must send `/start` to the bot once
   - Get each member's chat_id: `https://api.telegram.org/bot{TOKEN}/getUpdates`

3. **Get Gemini API key**
   - Go to aistudio.google.com → Get API Key
   - Copy the key

4. **Set up company Gmail**
   - Go to Google Cloud Console → Create new project
   - Enable Gmail API
   - Create OAuth 2.0 credentials
   - Connect to Make.com via the Gmail module

5. **Set up Google Calendar**
   - Enable Calendar API in the same Google Cloud project
   - Each team member will connect their own calendar to Make.com

6. **Log in to Make.com**
   - Confirm Pro membership is active
   - Create a new folder: `AI Delegation Engine`

---

## PHASE 1 — Supabase Schema



```
Read the CLAUDE.md file, then create project_specs.md.

Set up the Supabase schema by following these steps exactly:

1. Go to Supabase dashboard → SQL Editor
2. Run the schema.sql from CLAUDE.md (all CREATE TABLE and RLS policies)
3. Verify all tables exist in the Table Editor
4. Run seed.sql to insert the following demo data:

Departments:
- Software Development (slug: software)
- Customer Support (slug: customer-support)
- Finance (slug: finance)

Team members (2 per department, different skills):
- Software: Ali Yilmaz (skills: ['Python', 'FastAPI', 'backend']), Ayse Kaya (skills: ['React', 'TypeScript', 'frontend'])
- Customer Support: Mehmet Demir (skills: ['communication', 'complaint management']), Zeynep Celik (skills: ['technical support', 'onboarding'])
- Finance: Can Ozturk (skills: ['invoicing', 'accounting']), Selin Arslan (skills: ['contracts', 'legal'])

Fill in each member's telegram_chat_id with the real chat_ids from Phase 0.
Set workload_score to 2 for everyone initially.

After running, verify each table has the correct data.
Show me the SQL output for each step.
Do not mark this as done until you have confirmed all tables exist and contain the correct seed data.
```

---

## PHASE 2 — Make.com Flow 1: Mail Analysis & Assignment



```
Read the CLAUDE.md file.

Create a new scenario in Make.com called "mail-analizi-flow".
Implement Flow 1 from the architecture defined in CLAUDE.md, step by step.

Key requirements:
- Gmail module: connect the company mail account, watch inbox only
- Claude prompt must return ONLY the following JSON, with no extra text, no markdown, no explanation:
{
  "is_task": true,
  "urgency": "high",
  "department": "software",
  "required_skill": "backend development",
  "deadline": "2026-05-15T17:00:00Z",
  "summary": "Server is returning 500 errors, urgent investigation needed."
}

- If is_task is false, stop the flow immediately. Do not process further.
- Use Supabase HTTP module to query team_members filtered by department slug, ordered by workload_score ASC
- Make a second Claude call to select the best match and write the assignment_reason
- Write the new task to the tasks table with status: 'pending'

After building the flow, test it by sending a test email to the company inbox:
Subject: "Server Error" — Body: "Our API is returning 500 errors, needs urgent attention."

The flow must run successfully and a new row must appear in the Supabase tasks table.
Show me a screenshot of the flow execution log and the new Supabase record.
Do not mark this as done until both are confirmed.
```

---

## PHASE 3 — Make.com Flow 2: Calendar & Telegram Notification

**Owner:** Backend
**Time:** ~1 hour

```
Read the CLAUDE.md file.

Create a new scenario in Make.com called "flow-notify".
Implement Flow 2 from CLAUDE.md.

Key requirements:
- Trigger: Supabase Watch Rows — tasks table, filter status = 'pending'
- Google Calendar event description must include:
  "Sender: {mail_sender}\nWhy you: {assignment_reason}\nWhat to do: {summary}"
- Telegram message must follow the exact format from CLAUDE.md
- Final step: update task status to 'assigned' and save calendar_event_id in Supabase

Test using the pending task left from Phase 2.
The flow must catch it, create a Google Calendar event, and send a Telegram message.

Verify:
- Telegram message was received on the assigned member's phone
- Google Calendar event exists with the correct description
- Supabase task record shows status = 'assigned' and a valid calendar_event_id

Show me evidence of all three. Do not mark this as done until all three are confirmed.
```

---

## PHASE 4 — Make.com Flow 3: Deadline Reminder

**Owner:** Backend
**Time:** ~30 minutes

```
Read the CLAUDE.md file.

Create a new scenario in Make.com called "flow-reminder".
Implement Flow 3 from CLAUDE.md.

Scheduler should run daily at 09:00 local time (UTC 06:00 for UTC+3).

To test without waiting until tomorrow:
1. Insert a test task in Supabase with a deadline within the next 24 hours and status = 'assigned'
2. Trigger the scheduler manually in Make.com
3. Confirm a Telegram reminder message was received
4. Confirm the reminded_at field was updated in Supabase

Do not mark this as done until both the Telegram message and the Supabase update are confirmed.
```

---

## PHASE 5 — Next.js Project Setup

**Owner:** Frontend
**Time:** ~45 minutes

```
Read the CLAUDE.md file, then create project_specs.md.

Bootstrap the Next.js 14 project:
npx create-next-app@latest ai-delegation-dashboard --typescript --tailwind --app --src-dir=false

Then install the following:
- shadcn/ui: npx shadcn@latest init (select dark theme, slate base color)
- @supabase/supabase-js @supabase/ssr
- lucide-react
- recharts

Create the .env.local file with all variables from CLAUDE.md.
Create lib/supabase/client.ts and lib/supabase/server.ts.
Add middleware.ts to protect all routes (redirect to /login if not authenticated).

After setup, run npm run build — it must pass with zero errors.
Then run npm run dev and confirm localhost:3000 redirects to /login.
Fix any errors before marking this as done.
```

---

## PHASE 6 — Auth & Login Page

**Owner:** Frontend
**Time:** ~30 minutes

```
Read the CLAUDE.md file.

Build the /login page:
- shadcn/ui Card with email + password form
- Sign in using Supabase Auth
- On success, redirect to /dashboard
- Show a clear error message on failure (wrong password, user not found, etc.)
- Design: dark background, minimal, premium feel — no emojis, no gradients

After building, create a test user in Supabase:
- Go to Authentication → Users → Invite User
- Create test@company.com
- In the team_members table, link this user to Ali Yilmaz by setting auth_user_id

Test the full login flow:
- Open localhost:3000 — confirm redirect to /login
- Enter wrong password — confirm error message appears
- Enter correct credentials — confirm redirect to /dashboard

Fix any issues before marking this as done.
```

---

## PHASE 7 — Employee Dashboard

**Owner:** Frontend
**Time:** ~1.5 hours

```
Read the CLAUDE.md file.

Build the /dashboard page using the component structure from CLAUDE.md:
TaskCard, TaskList, TaskStatusButton.

TaskCard must display:
- Task summary as the card title
- Urgency badge (low = yellow, medium = orange, high = red)
- Department name
- Deadline formatted as human-readable date (e.g. "May 14, 2026")
- Assignment reason in small italic text
- Status button: "Mark In Progress" / "Mark Complete"
- Completed tasks: green checkmark, reduced opacity, moved to the bottom of the list

Add Supabase Realtime so the list updates without page refresh.

RLS must ensure each employee only sees their own tasks. Verify this is working.

After building, run npm run build — must pass with zero errors.

Then test manually:
- Tasks load from real Supabase data
- Clicking status button updates the record in Supabase
- Open two browser tabs logged in as the same user — update status in one, confirm it updates instantly in the other without refresh
- Log in as a different user — confirm they cannot see the first user's tasks

Fix all issues before marking this as done.
```

---

## PHASE 8 — Admin Dashboard

**Owner:** Frontend
**Time:** ~1.5 hours

```
Read the CLAUDE.md file.

Build the /admin page with the following sections:

1. Full task list with filters: department, urgency, status
2. Team workload summary: number of open tasks per person (cards or table)
3. Department task distribution chart (Recharts BarChart — department name / task count)
4. Manual reassignment: select a task → select a new assignee → "Reassign" button
   (update Supabase + send Telegram notification to new assignee)

Add a sidebar with two sections:
- Employee: link to /dashboard
- Admin: links to /admin and /admin/team

Admin access control:
- Users with department_id IS NULL in team_members are admins
- Non-admin users attempting to visit /admin must be redirected to /dashboard

After building, run npm run build — must pass with zero errors.

Then test manually:
- Log in as admin — confirm all tasks from all departments are visible
- Apply filters — confirm they work correctly
- Recharts bar chart renders with real data
- Log in as a regular employee — confirm /admin redirects to /dashboard

Fix all issues before marking this as done.
```

---

## PHASE 9 — Claude MCP Integration

**Owner:** Frontend + Backend together
**Time:** ~1 hour

```
Read the CLAUDE.md file.

Set up Claude MCP to manage Make.com flows via natural language.

Make.com configuration:
- Create a webhook in Make.com that receives MCP commands
- Map the following commands to the correct Make.com scenarios or Supabase queries:
  * "List tasks with today's deadline" → Supabase query, return formatted list
  * "Trigger the mail analysis flow" → trigger flow-mail-analysis webhook
  * "Assign task [id] to [name]" → update Supabase + send Telegram to new assignee
  * "Show team workload summary" → Supabase aggregation query, return per-person counts

Frontend — build /admin/assistant page:
- Chat interface: user types a message, AI responds
- Responses rendered as markdown
- Show last 10 messages
- Clean, dark design consistent with the rest of the dashboard

Test all four commands with real data.
Confirm each one returns the correct result or triggers the correct action.
Do not mark this as done until all four commands have been tested successfully.
```

---

## PHASE 10 — Demo Preparation & Deployment

**Owner:** Full team
**Time:** ~1 hour

```
Read the CLAUDE.md file.

Deploy to Vercel:
1. Push everything to GitHub — double check that .env.local and service_role key are NOT committed
2. Import the GitHub repo to Vercel
3. Add all environment variables in Vercel project settings
4. Deploy and get the production URL
5. Test the production URL end-to-end (login, dashboard, admin)

Export Make.com flows:
- Export all three scenarios as JSON from Make.com
- Save them to /make-flows/ directory
- Commit and push to GitHub

Run the full demo scenario and confirm each step works:
1. Send a test email to the company inbox (Subject: "Critical: Payment system is down")
2. Watch the Make.com execution log live
3. Confirm Telegram notification is received
4. Confirm Google Calendar event is created with the correct description
5. Confirm the task appears as "assigned" on the dashboard
6. Open admin panel — confirm the task appears in the list and the chart updates
7. Go to /admin/assistant — type "List tasks with today's deadline" — confirm correct response
8. Mark the task as complete — confirm green checkmark appears

Final checklist — do not submit until ALL of these are confirmed:
- [ ] End-to-end flow works in production
- [ ] Telegram notification is received
- [ ] Google Calendar event is created correctly
- [ ] Dashboard updates in real time
- [ ] Admin panel works with filters and charts
- [ ] Claude MCP responds correctly to all four commands
- [ ] App is live on Vercel
- [ ] GitHub repository is public
- [ ] All Make.com flows are exported and committed
- [ ] 1-minute demo video recorded and uploaded to YouTube
- [ ] Video link and GitHub repo link added to the submission form on Slack
```

---

