# PulseForge — Update Implementation Notes

Date: 2026-10-05

Everything below was implemented against the requests in the original brief. This file records what changed, where it lives, how it was verified, and what still needs your attention before launch.

---

## 1. Public site

### Home page counters animate from zero

Stats previously rendered at their final value the instant the page loaded. They now count up once, when they scroll into view.

- File: `frontend/src/pages/public/Home.jsx`
- An `IntersectionObserver` watches the stats band. On first intersection it runs a short eased animation from `0` to the final number and then stops, so re-scrolling does not replay it.
- Formatting is preserved per stat: `24/7` stays literal, `12,000+` and `180+` keep their suffix, `0` renders as a plain zero.
- Respects `prefers-reduced-motion`: users who ask for reduced motion get the final numbers immediately.
- Thousands values are abbreviated (`12K+`), so the counters stay the same width as the rest of the band and do not reflow the layout mid-animation.

### Pages always open at the top

Route changes kept the previous scroll position, so opening a page from the middle of another left you halfway down it.

- New file: `frontend/src/components/ScrollToTop.jsx`
- Mounted in `frontend/src/components/PublicLayout.jsx`, so it applies to every public route.
- Uses `behavior: 'instant'` rather than smooth, because a smooth scroll on page entry looks like a lag rather than a feature.

### Mobile navigation

Bottom tab dock with the hamburger menu removed as specified.

- File: `frontend/src/components/SiteNav.jsx`
- Primary actions sit in a fixed bottom dock on small screens, within thumb reach.
- The top hamburger and its slide-in drawer were removed. Navigation is direct rather than hidden behind a second tap.
- The drawer CSS was left in place but is unreferenced, ready to be deleted if you prefer a clean stylesheet.

### Join page

Copy was shortened and the top padding reduced so the form sits above the fold on a phone.

- File: `frontend/src/pages/public/Join.jsx`
- Styles: `frontend/src/styles/site.css`
- Shorter intro paragraph, tighter section padding, plan and goal side by side instead of stacked.
- The form now posts to the real public endpoint (`POST /api/join-requests`) rather than the members endpoint, which previously would have created a member directly with no staff review.

### App icon

Home-screen icons were regenerated so the mark is legible at small sizes.

- Files: `frontend/public/pwa-192.png`, `frontend/public/pwa-512.png`
- Previously the icon was the full wordmark scaled down, which turned to mush at 192px. It is now a bold PF monogram on the ember background.
- Masks and `any` purposes are both declared in `frontend/vite.config.js`.

---

## 2. AI concierge

A floating assistant answers from live club data instead of returning canned text.

- New file: `backend/src/modules/personalization/concierge.service.ts`
- Endpoint: `POST /api/ai/concierge` (public, no auth required)
- Endpoint: `POST /api/ai/concierge/member` (authenticated, tenant-scoped)
- UI: `frontend/src/components/Chatbot.jsx`, styles in `frontend/src/styles/site.css`

### What it answers from real data

| Ask | Source |
| --- | --- |
| Coaches and who has time | `User` where role is TRAINER/STAFF/MANAGER and active, joined to their next scheduled `Session` |
| Class times and spots left | `Session` joined to `ClassType`, with live `currentBookings` vs `maxCapacity` |
| Plans and pricing | `MembershipPlan`, active only, including parsed feature list |
| Opening hours and addresses | `Location`, active only |
| Booking a coach | Coach-name match plus day/time parsing, then their next real open slot |

It also handles greeting, recovery, nutrition, and beginner questions in a coaching voice, and returns clickable follow-up actions so common paths are one tap.

### Booking behaviour

Booking currently **prepares** the request rather than writing a confirmed appointment. It parses the coach name and time, reports that coach's real next open slot, and points the visitor at the join form so staff confirm the slot.

That is deliberate. A public, unauthenticated endpoint should not be able to write bookings straight into the schedule — anyone could hold arbitrary slots with no commitment behind them, and the front desk loses control of its calendar. Once the visitor is a known member, `concierge/member` is the place to extend this into a real write.

One bug was found and fixed during verification: the public endpoint originally hardcoded the tenant to the literal string `"public"`, so every live-data query returned empty. It now resolves the real tenant via the same logic the join endpoint uses.

---

## 3. Join requests and staff inbox

### Backend

- New entity: `JoinRequest` in `backend/src/entities/leads.entities.ts`, exported from `entities/index.ts` and `seed-export.ts`
- New module: `backend/src/modules/leads/` (`module.ts`, `controller.ts`, `service.ts`, `messaging.service.ts`)
- Registered in `backend/src/app.module.ts`

| Endpoint | Access | Purpose |
| --- | --- | --- |
| `POST /api/join-requests` | Public | Submit from the website |
| `GET /api/join-requests` | Staff | Paginated, searchable, filterable list |
| `GET /api/join-requests/counts` | Staff | Badge counts by status |
| `GET /api/join-requests/:id` | Staff | Single request |
| `PUT /api/join-requests/:id/review` | Owner / Manager | Approve or reject |

Status flow is `NEW` → `APPROVED` → `CONVERTED`, or `NEW` → `REJECTED`. `CONVERTED` means a member record was created during approval.

Approving with `createAccount: true` provisions a `User` (role MEMBER, inactive password) and a linked `Member` record, then flips the request to `CONVERTED`. Approving without it leaves the request as `APPROVED` and creates nothing.

Submitted requests are attributed to a tenant via `PUBLIC_TENANT_ID` in the environment. If that is blank, the oldest active tenant is used, which is correct for a single-club deployment and wrong for multi-club. **Set `PUBLIC_TENANT_ID` explicitly before going live.**

A second bug was caught and fixed here: the review endpoint treated any unrecognised `decision` value as `REJECTED`. A typo in the payload would have silently rejected a real applicant. It now rejects invalid input with a 400.

### Frontend

- New page: `frontend/src/pages/Members/JoinRequests.jsx`
- Registered in `frontend/src/App.jsx`
- Linked from the sidebar and the module permission map in `frontend/src/components/Layout.jsx`

Status tabs with live counts, search, and a review modal that previews the exact email the applicant will receive. Staff add an internal note that is never shown to the applicant. The account-creation checkbox is on by default and only appears on approval.

---

## 4. Email

Real SMTP delivery, not just in-app rows.

- New file: `backend/src/common/mail.service.ts`, provided and exported from `common/common.module.ts`
- `nodemailer` and `@types/nodemailer` added to `backend/package.json`
- Notification engine extended in `backend/src/modules/notifications/service.ts` with `sendWithEmail`, `broadcastToStaff`, and `notifyStaffRole`

Emails sent:

| Trigger | Recipient |
| --- | --- |
| Request submitted | All OWNER / MANAGER / STAFF, plus the applicant as confirmation |
| Request approved | The applicant |
| Request rejected | The applicant |

In-app notifications behave exactly as before. Email is layered on top, so nothing regresses if SMTP is unavailable.

### Configuration required

`SMTP_*` in `backend/.env` are currently placeholders. Until real credentials are filled in, `MailService` detects the absence of `SMTP_HOST` and logs messages instead of sending them. Every code path is exercised and no errors are thrown, but **no mail will actually leave the machine until you supply credentials.**

Environment variables used:

```
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM=PulseForge <no-reply@yourdomain.com>
PUBLIC_TENANT_ID=
```

---

## 5. Admin visual pass

The staff app was purple and is now ember, matching the public site.

- File: `frontend/src/index.css` — full token set retinted
- Chart and accent colours updated in `Dashboard.jsx`, `Reports.jsx`, `Billing.jsx`, `Checkins.jsx`, `Challenges.jsx`, `Login.jsx`

Changes: neutral true-black and near-black surfaces replacing the blue-tinted greys, ember `--accent` with a matching hover, new semantic status colours, and sharper radii. Primary buttons now use dark text on ember, which is the correct contrast pairing; they were white-on-purple before and would have failed a contrast check. Display headings moved to the condensed Oswald face already used on the public site.

Sidebar, topbar, cards, tables, badges, forms, and the login screen all inherit the new tokens, so this is one coherent change rather than per-page patches.

---

## 6. Bug found along the way

A fourth cleanup: `App.jsx` had a leftover unused `Chatbot` import after the component was moved to being mounted inside `PublicLayout`. Removed so the import list reflects what actually renders.

Every admin list page was rendering empty, and the cause was worth recording.

The API returns paginated lists as `{ items, total, page, limit }`. Roughly 18 pages read `response.data.data`, which is always `undefined`, so the table headers rendered with no rows and no error.

Fixed centrally in `frontend/src/api/client.js` with an axios response interceptor that exposes `items` as `data`, rather than editing 18 files or changing a response shape that other consumers depend on. Any page that expects `data` now works.

`Notifications.jsx` also read `n.title`, but the entity field is `subject`. Fixed to match.

---

## Verification

Backend

```
npx tsc --noEmit      clean
npx nest build        clean
```

Frontend

```
npx vite build        built in 9.17s, 2543 modules
```

Live endpoint tests against a running server

| Test | Result |
| --- | --- |
| Public submit with valid payload | 201, `status: NEW`, 4 staff notified |
| Missing required field | 400 with a specific message |
| Duplicate submission | Returns the existing request, flagged `duplicate: true` |
| Staff list with no token | 401, correctly rejected |
| Owner list with token | 2 items, counts correct |
| Review with invalid decision | 400, no longer silently rejects |
| Approve with `createAccount` | `CONVERTED`, member record linked |
| Re-approve a decided request | 400, locked |
| Concierge: coaches | 6 real coaches with slot status |
| Concierge: classes | Real schedule with live spots remaining |
| Concierge: plans | 6 real plans with prices |
| Concierge: hours | 2 real locations with hours |
| Concierge: booking | Coach and time parsed, real next slot reported |

Static asset checks: built CSS contains the ember token, built JS contains the concierge call, preview server returns 200 for document, CSS, and JS.

---

## Before you launch

1. **Fill in `SMTP_*`** in `backend/.env`, or the email feature silently does nothing.
2. **Set `PUBLIC_TENANT_ID`** so join requests cannot land in the wrong club.
3. **Review the booking design.** The assistant prepares bookings and routes them to staff. If you want it writing confirmed appointments directly, that needs an authenticated path and probably a payment or deposit step.
4. **Delete the unused `.drawer` CSS** in `site.css` if you want it gone entirely.
5. **Confirm the icon on a real device.** Generated PNGs are correct, but Android and iOS apply their own masking, so check the installed icon rather than trusting the manifest.