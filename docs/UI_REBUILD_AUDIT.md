# UI rebuild audit

This records what the frontend contained before the "Quiet confidence" rebuild, what each route does now, and how it was verified.

## Before the rebuild (findings that drove the work)

- **Two competing style systems.** A 1,333-line legacy `src/index.css` (dark navy and indigo tokens, `.lp-*` landing classes, `.t-*` type helpers, utility classes, `!important` font overrides keyed on inline `style*=` selectors) sat beside the V2 `src/styles/*`. The two defined `.btn`, `.card` and `.badge` in conflicting ways.
- **Inconsistent pages.** The landing and auth pages used the legacy purple and indigo gradient; the app used V2 teal. Admin used inline styles and two stub components (`GuidiaLoadingState`, `GuidiaErrorState`).
- **Text-size gaps.** Headings were fixed `rem` sizes against a 16px root, so the user's text-size setting only scaled body text.
- **Overlay accessibility.** `window.confirm()` was used for destructive actions. The dialog didn't trap focus or lock scroll, and the "More" sheet had no focus trap.
- **Ask.** No conversation history in the UI, and conversations had no titles.
- **App logos.** Loaded from third-party sites (including 3000px PNGs): slow, offline-broken and layout-shifting.
- **Missing pieces.** No route-level error boundary, no 404 page (unknown URLs redirected silently), no offline indicator, and no route transitions or page-shaped skeletons.
- **Button guides.** Two overlapping components (`ButtonGuideViewer`, `UIExplainer`) built on legacy styles.
- **Hero image.** A 2.1 MB PNG.

## Route inventory (after)

| Route | Purpose | Primary action | Data / API | States designed |
|---|---|---|---|---|
| `/landing` | Public story and interactive demos | Get started | None (guided demos use local fixtures) | Interactive demo states; reduced motion |
| `/showcase` | Investor and hackathon presentation | Start demo / Next | None (guided demos) | 9 steps, timer, keyboard |
| `/login` | Sign in | Sign in | `POST /auth/login` | Validation, loading, success, error |
| `/register` | Create account | Create account | `POST /auth/register` | Strength meter, match, loading, success |
| `/forgot-password` | Request reset | Send reset link | `POST /auth/forgot-password` | Confirmation, resend |
| `/reset-password` | New password | Update password | `POST /auth/reset-password` | Missing token, success screen |
| `/onboarding` | Language, guidance, reading and voice, age | Continue / Start using Guidia | `PUT /users/me/preferences`, `PATCH /users/me` | Step transitions, completion |
| `/app/home` | "What would you like to do today?" | Four action tiles | `/tasks/active`, `/memory`, `/progress/me`, `/learning/lessons` | Skeletons, empty continue card, pause/resume |
| `/app/ask` | Conversation studio | Send / speak | `/assistant/message`, `/assistant/conversations[/:id]`, `DELETE …/:id` | Thinking, voice transcript review, AI resting, delete confirm |
| `/app/screen` | Upload a screenshot | Explain my screen | `POST /vision/analyze` | Drag/drop, camera, scanning phases, vision unavailable |
| `/app/screen/:id` | Explanation workspace | Ask about this screen | `/vision/:id`, `/vision/:id/image`, `/vision/:id/ask`, `DELETE /vision/:id` | Zoom, marker ↔ list sync, countdown, deleted image, delete confirm |
| `/app/learn` | Course hub | Open a lesson | `/learning/lessons`, `/memory` | Featured app lessons, continue, topic filter, button guides |
| `/app/learn/:slug` | One lesson | Next step / I did it | `/learning/lessons/:slug`, `POST …/complete` | Stepper, safety tips, reflection, completion |
| `/app/practice` | Practice app library | Practise | `/learning/applications`, `/tasks/active` | Resume card, empty, error |
| `/app/practice/:slug` | Simulator plus guided task | I've done this / Hint | `/learning/scenarios`, `/tasks`, `/tasks/:id/actions|hint|complete` | Device frame, recovery, hints, completion (independent vs assisted) |
| `/app/safety` | Safety Center | Check it | `POST /safety/analyze`, `POST /safety/feedback`, `/learning/lessons?domain=DIGITAL_SAFETY` | Check → Understand → Respond stages, scam gym with clue chips |
| `/app/memory` | Memory Book | Listen again | `/memory`, `PATCH …/star`, `DELETE /memory/:id` | Search states, no results, starred, remove confirm |
| `/app/progress` | Learning journey | Practise now | `/progress/me` | Competence vs confidence, review, mastery path |
| `/app/people` | Trusted Circle | Add a trusted person | `/guardian`, `/guardian/invite`, `…/permissions`, `…/revoke`, approvals, `/emergency/incoming` | Invite dialog with success, permission editor, revoke confirm, guardian view |
| `/app/help` | "You are not alone" | Ask my trusted people for help | `/emergency`, `POST /emergency`, `…/cancel`, `/guardian` | No trusted person, live status timeline (polling), cancel confirm |
| `/app/notifications` | Notifications | Open / Mark read | NotificationContext (`/notifications`, read, read-all) | Category filter, Today/Yesterday/Earlier, urgent |
| `/app/settings` | Preferences | Instant toggles / Save | `PUT /users/me/preferences`, `PATCH /users/me`, `/auth/sessions`, `/extension/pairing`, `/users/me/export`, `DELETE /users/me` | Section nav, saved pill, pairing countdown, delete dialog |
| `/admin` | Admin console | Refresh | `/admin/users`, `/admin/analytics`, `/admin/audit`, `/admin/switches` | Tabs, sortable and paginated users, severity distribution |
| `*`, `/app/*` | Not found | Go home / Go back | None | Inside or outside the shell |
| Legacy: `/screenshot-explain/:id`, `/app/assistant`, `/app/guardian`, `/app/emergency` | Redirects | None | None | Kept |

## Debt removed

- `src/index.css` (legacy), `src/styles/pages.css`, five `Guidia*` stub components, the old landing components and `data/landingContent.js`, `useScrollReveal`, `ButtonGuideViewer`, `UIExplainer`, unused template assets (`hero.png`, `vite.svg`, `react.svg`, `public/icons.svg`).
- Simulator CSS was extracted to `styles/simulators.css`, with an alias layer for the old variable names.
- All `window.confirm` calls were replaced by `ConfirmDialog`.
- `backdrop-filter` was removed (it made rendering about 8× slower).
- Third-party logo requests were replaced by inline marks.

## Kept intentionally

- `context/AppStateContext.jsx` (`useApp`) and `components/GuidiaSafetyPanel.jsx`: the twelve simulators use them. They're themed through `simulators.css`.
- The simulators' internal visuals stay app-like (bKash pink, MoMo magenta), contained inside the device frame.

## Verification

| Check | Result |
|---|---|
| `npm run lint` | 0 problems |
| `npm run build` | OK |
| Backend unit tests | 40 / 40 |
| Backend integration tests | 19 / 19, including new tests for conversation titles and the Facebook/Nagad/Gmail/imo lessons in four languages |
| `npm run test:e2e` | 7 / 7: landing walkthrough, auth pages, showcase keyboard, 404, register → onboarding → all 12 app pages, a full new lesson → Memory Book, mobile bottom navigation and More sheet. axe (WCAG 2.1 AA serious/critical) passes on every page, and there's no horizontal scroll. |
| `npm run test:visual` | 39 baselines: landing, home, learn, safety and settings at 390, 768 and 1440 widths in light, dark and high contrast; stable across runs |

Issues found and fixed by these checks:

- Escape didn't close a dialog after its focused button was removed.
- Low-contrast coral step numbers.
- An interactive element nested in an `img` role.
- Unlabelled file inputs.
- Phone overflow from the home artwork and the Ask suggestions.
- A collapsed last stepper item.
- `fetchpriority` prop casing.

## Known limitations

- The visual baselines are Windows/Edge-specific (`*-win32.png`). Regenerate them on other platforms with `npm run test:visual -- --update-snapshots`.
- Voice quality depends on the device's installed voices for বাংলা, हिन्दी and Tiếng Việt. Guidia says so honestly and falls back to text.
- The new imo lessons have no simulator yet; imo is registered with `hasSimulation: false`.
