# QuizMania: Migrating from cuid to Slug for Quiz URLs

## 1. Background
QuizMania originally used cuid-based IDs for all quiz URLs and lookups. This document explains the current flow, the new slug-based flow, and provides a migration checklist for a robust transition.

---

## 2. Current Flow (cuid)
- **Quiz Creation:**
  - Backend generates a cuid (e.g., `clx123abc0001`) as the quiz ID.
  - All URLs, API calls, and lookups use this cuid.
- **Quiz Access:**
  - URLs: `/quiz/clx123abc0001/take`, `/quiz/clx123abc0001/edit`
  - Backend looks up quizzes by cuid only.
- **Sharing:**
  - Users share links with cuid in the URL.

---

## 3. Target Flow (slug)
- **Quiz Creation:**
  - Backend generates a unique, URL-safe slug from the quiz title (e.g., `sample-quiz-100`).
  - Both cuid and slug are stored in the DB.
- **Quiz Access:**
  - URLs: `/quiz/sample-quiz-100/take`, `/quiz/sample-quiz-100/edit`
  - Backend resolves slug to cuid for all DB operations.
- **Sharing:**
  - Users share friendly, readable links with the slug.
- **Legacy Support:**
  - Backend can redirect `/quiz/clx123abc0001/take` to `/quiz/sample-quiz-100/take`.

---

## 4. Data Flow Diagram
```mermaid
flowchart TD
    A[User fills quiz form] --> B[POST /api/quiz/create]
    B --> C[Backend: create cuid + slug]
    C --> D[Return {id, slug}]
    D --> E[Frontend: redirect to /quiz/slug/edit]
    E --> F[User edits quiz, takes quiz, shares link]
    F --> G[All API calls use slug]
    G --> H[Backend: resolve slug to cuid]
    H --> I[DB operations by cuid]
```

---

## 5. Migration Checklist
- [ ] Add `slug` (unique) to Quiz model in Prisma schema
- [ ] Update quiz creation API to generate/store slug
- [ ] Create a resolver utility to accept cuid or slug and return the quiz
- [ ] Update all backend lookups to use the resolver
- [ ] Update frontend to use slug in all URLs, links, and API calls
- [ ] Update sharing logic to use slug-based links
- [ ] (Optional) Add redirect for legacy cuid links
- [ ] Test all flows: creation, edit, take, share, session, validation

---

## 6. Example Resolver Utility (Pseudocode)
```ts
async function getQuizByIdOrSlug(input: string) {
  if (isCuid(input)) {
    return prisma.quiz.findUnique({ where: { id: input } });
  } else {
    return prisma.quiz.findUnique({ where: { slug: input } });
  }
}
```

---

## 7. Notes
- Slugs should be unique, URL-safe, and ideally immutable (or support redirect/history if changed).
- All session, validation, and submission logic should use cuid internally after resolving the quiz. 

---

## 5a. Detailed Migration Checklist

### Backend
- [ ] **Prisma Schema:**
  - [ ] Add `slug` field to `Quiz` model (type: String, unique, indexed).
  - [ ] Run `prisma migrate` to update the database.
- [ ] **Quiz Creation:**
  - [ ] Generate a unique, URL-safe slug from the quiz title on creation.
  - [ ] Ensure slug uniqueness (append number or random string if needed).
  - [ ] Store both cuid and slug in the DB.
- [ ] **Quiz Update:**
  - [ ] Optionally allow slug to update if title changes (with redirect/history support).
- [ ] **Resolver Utility:**
  - [ ] Implement a function to resolve cuid or slug to the quiz object.
  - [ ] Use this resolver in all quiz-related API endpoints and services.
- [ ] **API Endpoints:**
  - [ ] Update all endpoints to accept slug or cuid as identifier.
  - [ ] Update validation, error handling, and logging to support slugs.
- [ ] **Legacy Support:**
  - [ ] Add redirect logic for old cuid-based URLs to the new slug-based URLs.
  - [ ] (Optional) Maintain a slug history table for redirects if slugs can change.

### Frontend
- [ ] **URL Structure:**
  - [ ] Update all quiz-related routes to use slugs (e.g., `/quiz/[slug]/take`).
  - [ ] Update Next.js dynamic routes and link generation.
- [ ] **API Calls:**
  - [ ] Update all API calls to use slug instead of cuid.
  - [ ] Ensure all quiz fetches, submissions, and mutations use the slug.
- [ ] **Quiz Creation Flow:**
  - [ ] After creation, redirect to slug-based URL.
  - [ ] Update modals, notifications, and share links to use slug.
- [ ] **Quiz Listing:**
  - [ ] Update dashboard, home, and admin panels to display and link quizzes by slug.
- [ ] **Error Handling:**
  - [ ] Show user-friendly errors if slug not found or invalid.

### Database
- [ ] **Migration:**
  - [ ] Backfill slugs for all existing quizzes (generate from title, ensure uniqueness).
  - [ ] Test migration on staging/dev before production.

### QA & Testing
- [ ] **Unit Tests:**
  - [ ] Add tests for slug generation, uniqueness, and resolver utility.
- [ ] **Integration Tests:**
  - [ ] Test all quiz flows (create, edit, take, share, session, validation) with slugs.
- [ ] **Manual QA:**
  - [ ] Verify all old cuid links redirect to new slug URLs.
  - [ ] Check for broken links, missing quizzes, or duplicate slugs.
- [ ] **Analytics:**
  - [ ] Update analytics/tracking to use slugs in URLs and events.

### Documentation
- [ ] **Update Docs:**
  - [ ] Update all internal and public documentation to reference slug-based URLs.
  - [ ] Communicate migration to team and users if needed.

--- 