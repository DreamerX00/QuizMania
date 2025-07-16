# 🧠 Neuron Arena Implementation Steps

This document tracks all phases and steps for the Neuron Arena quiz upgrade. Update this file as you progress through each phase.

---

## Phase 0: Slug Migration (Pre-requisite)

### Backend
- [ ] Add `slug` (unique) to Quiz model in Prisma schema
- [ ] Update quiz creation API to generate/store slug
- [ ] Create a resolver utility to accept cuid or slug and return the quiz
- [ ] Update all backend lookups to use the resolver
- [ ] (Optional) Add redirect for legacy cuid links

### Frontend
- [ ] Update all quiz URLs, links, and API calls to use slug
- [ ] Update sharing logic to use slug-based links
- [ ] Test all flows: creation, edit, take, share, session, validation

> See `cuidIdToSlug.md` for a full migration plan and code examples.

---

## Phase 1: Quiz Initialization & Security Modal (Target: Day 1–2)

### Frontend
- [x] Modal/Dialog blocks all quiz UI until acknowledged
- [x] Tabs/buttons: “Read Rules”, “Read Guide”, “Creator’s Message”, “Generate Unique Link”
- [x] After link generation: show “Copy Link” and “Open in Incognito” buttons
- [x] Display creator’s name, profile image, and `creator_message` (from DB)
- [x] Integrate @fingerprintjs/fingerprintjs for device fingerprinting
- [x] Collect userAgent, devicePixelRatio, screen size, and generate salted HMAC device ID
- [x] Call backend to generate unique, session-tied quiz link
- [x] Prevent quiz content rendering until modal is accepted
- [ ] Validate session and device on quiz access before showing questions (in progress)
- [ ] Invalidate/expire sessions after use or timeout (in progress)

### Backend
- [x] API endpoint to generate/store unique quiz link per user/session
- [x] Store: userId, quizId, IP, device hash, timestamp
- [x] On quiz start, validate device/IP/fingerprint; deny access if mismatch

---

## Phase 2: Timer, Auto-Submit, and Violation Flags (Target: Day 3–4)

### Frontend
- [ ] Timer: source duration from quiz JSON or default (30 min)
- [ ] Animate warning at 10s left
- [ ] Auto-submit on timeout (trigger store + backend)
- [ ] Blur/tab switch: show toast, log violation
- [ ] DevTools open: auto-submit, show red alert toast
- [ ] Window resize to abnormal height: treat as devtools
- [ ] Use sonner or @radix-ui/react-toast for toasts
- [ ] Pass all violations to backend in submission payload

### Backend
- [ ] Store all violations in quiz_violation table
- [ ] Add is_flagged boolean to quiz_attempt for critical/repeat violations
- [ ] Accept and store violation info with each attempt

---

## Phase 3: File Upload, Essay, and Poll Enhancements (Target: Day 5–6)

### Frontend
- [ ] Audio/Video Input: file upload with preview, show file metadata, validate size/duration, show progress/errors
- [ ] Essay/Paragraph: markdown preview toggle, word count, enforce min/max, show errors, support links (open in _blank), no images
- [ ] Poll: store vote on backend, show poll result chart after submission

### Backend
- [ ] Use S3/Supabase Storage (pre-signed URLs), store fileUrl, size, duration in response metadata
- [ ] Store poll votes, return results for chart

---

## Phase 4: Accessibility, Toasts, and Feedback (Target: Day 7–8)

### Frontend
- [ ] ARIA labels for all controls
- [ ] Keyboard navigation, focus rings, skip links
- [ ] Global toasts for save, error, timeout, violation
- [ ] Announce timer warnings and auto-submit

---

## Phase 5: Backend & API Hardening (Target: Day 9)

### Backend
- [ ] Validate all frontend checks server-side (IP/device/session/violations)
- [ ] Harden endpoints against replay/double-submit/tampering
- [ ] Handle new fields (violations, file metadata, poll votes) in QuizAttemptService
- [ ] Add tests for all new logic
- [ ] Log quiz start, attempt duration, violation breakdown, IP, device hash, manual question counts
- [ ] (Optional) Integrate with PostHog/Plausible

---

## Phase 6: Final Polish, QA, and Admin Panel (Target: Day 10)

### Frontend
- [ ] Review breakpoints, dark mode, mobile sticky elements
- [ ] Add micro-animations (framer-motion)
- [ ] Custom icons and theme consistency
- [ ] Manual QA for all flows
- [ ] Automated tests for critical flows (if infra exists)
- [ ] Update README and in-app guides

### Admin Panel
- [ ] List attempts with violations
- [ ] Show: Attempt ID, violation type/count, manual review questions
- [ ] Option to override score/block user

---

## General/Optional
- [ ] For premium/long quizzes: auto-save draft every 30s (localStorage + backend), resume modal on return 