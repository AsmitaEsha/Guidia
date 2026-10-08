# Guidia UI design system — "Quiet confidence"

The interface should say: *technology can be understood; I can take one step at a time; I know what is happening; I am in control; I can ask for help.*

Warm paper surfaces, deep Guidia teal, warm coral, a touch of gold and dark ink. The brand mark is the blue → teal "G" with a graduation cap (`src/assets/guidia-mark.webp`, rendered by `GuidiaMark`; pass `tile` on dark or coloured backgrounds). Soft arcs in heroes, empty states and dividers are decoration only — keep them away from text and use them sparingly.

## Where things live

| File | Contents |
|---|---|
| `src/styles/index.css` | The **only** style entry point (imported by `src/main.jsx`). It defines the import order. |
| `tokens.css` | Palette, semantic roles, type, space, radii, elevation, motion, cognitive-mode tokens, plus the dark, high-contrast and reduced-motion overrides. |
| `base.css` | Reset, document type, the single focus style, layout primitives (`.stack`, `.row`, `.grid`, `.page`). |
| `motion.css` | Keyframes, `.rise`, `.fade`, `.pop`, `.step-in`, `.route-enter`. All of them collapse under reduced motion. |
| `components.css` | Buttons, cards, forms, chips, choice cards, badges, alerts, progress, stepper, timeline, states, dialog, sheet, toast. |
| `shell.css` | Sidebar, topbar, voice control, offline banner, bottom navigation, More sheet. |
| `app.css` + `pages/*.css` | One file per signed-in page. |
| `landing.css`, `auth.css`, `showcase.css`, `admin.css`, `demo.css` | The public site, sign-in, presentation mode, admin and the interactive demos. |
| `simulators.css` | Practice-simulator styles. It also maps their old variable names onto the tokens. |
| `accessibility.css` | High-contrast reinforcement, forced colours, coarse-pointer targets, print. Loaded last. |

React primitives live in `src/components/ui/index.jsx`. Pages compose them and never hand-roll the same markup.

## Tokens

**Palette.** Each colour has a semantic role. Components use roles, never hex values.

| Role | Light | Use |
|---|---|---|
| `--primary` | `#0D625D` teal | Primary actions, active navigation, links |
| `--brand-900` | `#063F3C` deep teal | Statement bands, brand panels |
| `--brand-600` | `#157770` | Gradients, secondary emphasis |
| `--primary-soft` / `-soft-2` | `#EEF7F4` / `#DCEFEA` | Selected and tonal surfaces |
| `--coral-500` / `-600` / `-700` | `#F2795C` / `#D96A52` / `#B5513B` | Warmth, human support. Text on light backgrounds uses `-700`. |
| `--gold-500` / `--gold-100` | `#D99A43` / `#FBF0D8` | Stars, milestones, review |
| `--fg`, `--fg-muted`, `--fg-subtle` | `#18252C`, `#4A5961`, `#5F6D74` | Text, in decreasing emphasis (all AA or better) |
| `--bg`, `--card`, `--card-2` | `#FBF8F3`, `#FFF`, `#F4EFE7` | Paper, surfaces, soft surfaces |
| `--border`, `--border-strong` | `#DFD8CC`, `#C9C0B1` | Hairlines, form outlines |
| Status | `--ok-*`, `--info-*`, `--warn-*`, `--risk-*`, `--danger-*`, `--unknown-*` | Always shown with an icon **and** words, never colour alone |

Dark (`[data-gx-theme='dark']` on `<html>`) and high contrast (`[data-contrast='high']`) redefine the same names. The landing, auth and showcase pages pin `data-gx-theme="light"`.

**Type.** The UI uses Noto Sans (with Bengali and Devanagari). Editorial headings use Noto Serif; Bengali and Hindi fall back to sans, because serif conjuncts read poorly at display sizes. The wordmark uses Outfit. Inside the signed-in app the root font size equals the user's chosen size (18–28px, `data-scale="user"`), so every `rem` (headings, controls, cards) scales together. Smallest text is `--fs-sm` (0.875rem). Body text is 1rem, which equals the user's size.

**Space.** 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96 (`--s-1` … `--s-10`), with aliases `--space-xs` … `--space-2xl`.

**Shape.** Radii are 10 / 12 / 14 / 16 / 20 / 24 / 32. The pill radius is only for status, filters, segmented controls and labels.

**Elevation.** `--shadow-1` resting, `--shadow-2` raised, `--shadow-3` floating, `--shadow-4` modal. Shadows are warm-tinted and subtle.

**Motion.** `--t-fast` 140ms, `--t-base` 220ms, `--t-slow` 320ms, `--t-page` 240ms, with ease-out curves. The user's "Reduce movement" setting or the system preference sets every duration to 0. State still changes, just instantly.

**Cognitive mode.** `data-mode` on `<html>` (calm / unsure / scared) changes `--step-gap`, `--choice-gap`, `--instruction-size`, `--content-width`, motion speed and `--reassurance-display`. "Very gentle" gives bigger instructions, more space, fewer simultaneous choices (for example, Home tiles go to two columns) and slower movement.

**No `backdrop-filter`.** Blur cost about 10 s per frame in software rendering (low-end phones, headless capture). Sticky bars use near-opaque backgrounds instead.

## Primitives (`components/ui`)

| Component | Notes |
|---|---|
| `Button` | Variants: `primary`, `secondary`, `tonal`, `quiet`, `ghost`, `link`, `help` (human support, coral), `danger`, `danger-quiet`, `on-dark`, `outline-on-dark`. Sizes: `sm` (46px), default (52px), `lg` (60px). `state`: idle / loading / success / error shows "Saving…" then "Saved" and announces success. Accepts `to` (router link) or `href`. `arrow` nudges on hover. |
| `IconButton` | Its `label` is required and becomes both `aria-label` and the tooltip. Minimum 48px. |
| `Card`, `IconChip`, `PageHeader`, `SectionHeader` | Page structure. |
| `Field` | Visible label, optional hint, error and success, wired with `aria-describedby` and `aria-invalid` through a render prop. |
| `Switch`, `Checkbox`, `Segmented`, `Tabs`, `ChoiceCard` | `Tabs` supports arrow-key navigation. `ChoiceCard` is a radio-style large option. |
| `ProgressBar`, `ProgressRing`, `Stepper`, `StepDots`, `Timeline` | Progress and handoff. |
| `Alert`, `Badge`, `RiskBadge` / `riskMeta`, `ModeLabel` | Status and labelling ("Practice mode", "Guided demo"). |
| `LoadingState`, `EmptyState`, `ErrorState`, `SuccessState`, `Skeleton` | Every async view uses these. |
| `Dialog`, `ConfirmDialog`, `Sheet` | Portal, focus trap (topmost overlay only), Escape, focus restore, scroll lock. On phones a dialog becomes a bottom sheet. |
| `KeyValue`, `Avatar`, `Meta`, `Waveform` | Review rows (What / Who / Amount / Consequence), people, metadata, the voice activity indicator. |

Hooks: `useResource` (server data), `useAsyncAction` (idle → loading → success → error), `useFocusTrap` and `useScrollLock`, `useOnline` and `useScrolled`. `utils/announce.js` provides one polite live region for screen-reader messages ("Saved", "Guidia answered", "Step 2 of 5").

## Patterns

- **Every network action:** button state plus inline error, and the rest of the page keeps working (`ErrorState` has a retry).
- **Consequential actions:** review, then `ConfirmDialog` listing exactly what happens, then a result toast. This covers removing access, deleting conversations, screenshots, memories and the account, and cancelling a help request.
- **Instant preferences** (Settings): apply immediately, show a quiet "Saved" pill and announcement, and roll back with an explanation if the server refuses.
- **AI honesty:** answers show their grounding: "From a Guidia lesson", "General guidance — screens can differ", or "Guidia isn't sure yet" with "Ask another way" and "Ask someone I trust".
- **Demo, practice and live are always distinguishable:** gold "Guided demo" labels on the landing and showcase, green "Practice mode" on simulators.
- **Language:** every string goes through `t(en, bn, hi, vi)`. Shared vocabulary (skills, mastery, domains, categories, tips) lives in `src/data/catalog.js`.

## Responsive

| Width | Layout |
|---|---|
| ≥ 1024px | Sidebar (272px), topbar (72px), content up to 1200px. |
| < 1024px | Compact header, bottom navigation (Home, Learn, Ask, Safety, More), More sheet. |
| ≤ 640px | Single column, full-width cards, safe-area padding, dialogs as bottom sheets. |

Long Bengali, Hindi and Vietnamese labels wrap; buttons grow vertically and never clip. `e2e/smoke.spec.js` asserts there is no page-level horizontal scroll at 375px and on desktop.

## Accessibility

- One 3px focus outline with offset, everywhere.
- Skip link, landmarks, labelled groups, live regions.
- 52px targets (48px minimum on coarse pointers).
- High contrast and forced-colours support, reduced motion, and the user text size scales the whole app.
- axe (WCAG 2.1 AA, serious and critical) runs on the landing, auth, showcase and all twelve app pages in CI-style smoke tests.
