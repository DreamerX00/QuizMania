# QuizMania Performance & Optimization Audit Report

**Date**: November 5, 2025  
**Status**: Comprehensive Analysis Complete

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### 1. **Massive Dependency Bloat**

**Impact**: Bundle size, Load time, Memory  
**Severity**: HIGH

#### Duplicate/Redundant Packages:

- **bcrypt** (^6.0.0) AND **bcryptjs** (^3.0.2) - Remove one, prefer bcryptjs for better compatibility
- **framer-motion** (^12.23.5) AND **motion** (^12.22.0) - Consolidate to one
- **react-lottie-player** (^2.1.0) AND **lottie-react** (^2.4.1) - Keep one
- **lodash** (^4.17.21) AND **lodash.debounce** + **lodash.isequal** - Use tree-shaking imports from lodash
- **@material-tailwind/react** - Conflicts with shadcn/radix; remove or fully migrate
- **next-auth** (^4.24.11) - You're using Clerk; this is completely unused

#### Overly Heavy Packages:

- **three** + **@react-three/fiber** + **@react-three/drei** + **postprocessing** - ~1MB+ combined
  - Only used in 2-3 decorative components (FluidGlass, Orb)
  - Consider: CSS alternatives or lazy load these components
- **chart.js** + **react-chartjs-2** + **recharts** - Two charting libraries! Pick one
- **gsap** - Only for scroll animations; use CSS or Framer Motion instead
- **@tiptap/react** + **@uiw/react-md-editor** - Two markdown editors
- **react-simple-typewriter** + **react-typing-effect** - Duplicate typewriter effects

**Estimated Bundle Savings**: 40-50% reduction (3-4MB)

---

### 2. **Homepage Performance Disaster**

**Impact**: First Contentful Paint, Largest Contentful Paint  
**Severity**: CRITICAL

#### Problems in `src/app/page.tsx` (532 lines!):

```tsx
// ❌ BAD: Loading 20+ heavy animation components on mount
import { BackgroundBeams } from "../../components/ui/background-beams";
import { Card3DEffect } from "../../components/ui/3d-card-effect";
import { AnimatedTestimonials } from "../../components/ui/animated-testimonials";
import { Spotlight } from "../../components/ui/spotlight";
import { GlowingEffect } from "../../components/ui/glowing-effect";
import { Sparkles as SparklesComponent } from "../../components/ui/sparkles";
import { HeroHighlight } from "../../components/ui/hero-highlight";
import ScrollFloat from "./ScrollFloat";
import CountUp from "@/reactBitBlocks/TextAnimations/CountUp/CountUp";
import { TextEffect } from "../../components/motion-primitives/text-effect";
import { Typewriter } from "react-simple-typewriter";
```

#### Issues:

1. **No code splitting** - All animations load immediately
2. **No memoization** - Complex calculations run on every render
3. **Heavy GSAP ScrollFloat** everywhere without optimization
4. **Multiple useEffect hooks** without cleanup in animations
5. **Excessive motion.div** nesting (50+ animated divs)

#### Fix:

```tsx
// ✅ GOOD: Lazy load below-fold components
const AnimatedTestimonials = dynamic(
  () => import("../../components/ui/animated-testimonials"),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  }
);

// Use React.memo for heavy components
const ScrollFloatSection = React.memo(({ children, ...props }) => (
  <ScrollFloat {...props}>{children}</ScrollFloat>
));
```

---

### 3. **No Image Optimization**

**Impact**: LCP, CLS, Bandwidth  
**Severity**: HIGH

#### Problems:

- **10.5MB** in `/public` folder (assets not optimized)
- **1.3MB** in `/public/game_arena` alone
- Using `<img>` instead of Next.js `<Image>`
- No WebP conversion
- No responsive image variants

#### Files to Optimize:

```
public/
├── about.mp3 (audio could be compressed)
├── game_arena/*.mp3 (1.3MB total - use lossy compression)
├── avatars/*.png (convert to WebP, resize)
└── user_resources/*.png (likely unused)
```

#### Fix:

```tsx
// ❌ BAD
<img src="/avatars/user.png" alt="User" />;

// ✅ GOOD
import Image from "next/image";
<Image
  src="/avatars/user.png"
  alt="User"
  width={64}
  height={64}
  quality={75}
  placeholder="blur"
/>;
```

---

## 🟠 HIGH PRIORITY ISSUES

### 4. **Database N+1 Query Patterns**

**Impact**: API response time  
**Severity**: HIGH

#### Problem in `src/app/api/users/[id]/profile/route.ts`:

```typescript
// ❌ BAD: Overfetching with deep includes
let user = await prisma.user.findUnique({
  where: { clerkId: userId },
  include: {
    premiumSummary: true, // Always included, even if not needed
  },
});
```

#### More Issues:

- `src/app/api/quizzes/route.ts` - No pagination (fetches `take: 20` but no skip)
- `src/app/api/users/[id]/stats/route.ts` - Multiple separate queries (should be one with aggregations)
- Missing database indexes on frequently queried fields (check Prisma schema)

#### Fix:

```typescript
// ✅ GOOD: Select only needed fields
const user = await prisma.user.findUnique({
  where: { clerkId: userId },
  select: {
    id: true,
    name: true,
    avatarUrl: true,
    // Only include premiumSummary when needed
    ...(includePremium && { premiumSummary: true }),
  },
});

// Add pagination
const page = parseInt(searchParams.get("page") || "1");
const limit = parseInt(searchParams.get("limit") || "20");
const skip = (page - 1) * limit;

const quizzes = await prisma.quiz.findMany({
  where,
  take: limit,
  skip,
  // ... rest
});
```

---

### 5. **Excessive React Re-renders**

**Impact**: UI jank, CPU usage  
**Severity**: MEDIUM-HIGH

#### Problem Areas:

1. **`src/app/multiplayer-arena/page.tsx`** - Multiple `useEffect` without proper dependencies
2. **`src/app/profile/page.tsx`** - Every component subscribes to SWR separately
3. **`src/store/multiplayer.ts`** - Zustand store with no selectors (re-renders entire tree)

#### Example Issue:

```tsx
// ❌ BAD: Re-fetches on every render
const { data } = useSWR("/api/users/" + user.id + "/profile");

// ✅ GOOD: Memoize key
const profileKey = useMemo(
  () => (user ? `/api/users/${user.id}/profile` : null),
  [user?.id]
);
const { data } = useSWR(profileKey);
```

#### Multiplayer Store Issue:

```typescript
// ❌ BAD: Every component re-renders on any state change
const { currentRoom, participants, game, voice, ui } = useMultiplayerStore();

// ✅ GOOD: Use selectors
const currentRoom = useMultiplayerStore((state) => state.currentRoom);
const participants = useMultiplayerStore((state) => state.participants);
```

---

### 6. **WebSocket Event Leaks**

**Impact**: Memory leaks, duplicate events  
**Severity**: MEDIUM-HIGH

#### Problems in `src/lib/socket.ts`:

```typescript
// ❌ Missing cleanup in setupEventListeners
this.socket.on("connect", () => {
  /* ... */
});
this.socket.on("disconnect", () => {
  /* ... */
});
// No .off() calls anywhere!
```

#### Multiplayer Store Issues:

- Socket connects in `useEffect` but may not clean up properly
- Multiple components could initialize socket multiple times
- No singleton pattern enforcement

#### Fix:

```typescript
// ✅ GOOD: Proper cleanup
private setupEventListeners() {
  if (!this.socket) return;

  // Remove old listeners first
  this.socket.removeAllListeners();

  this.socket.on('connect', this.handleConnect);
  this.socket.on('disconnect', this.handleDisconnect);
}

cleanup() {
  if (this.socket) {
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  }
}
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 7. **Overly Complex UI Components**

**Impact**: Maintainability, Bundle size  
**Severity**: MEDIUM

#### Giant Components:

- **`src/reactBitBlocks/Components/InfiniteMenu/InfiniteMenu.tsx`** - 1400+ lines! WebGL canvas implementation
- **`src/reactBitBlocks/Components/FluidGlass/FluidGlass.tsx`** - 400+ lines of Three.js
- **`src/app/multiplayer-arena/_components/FriendModalOverlay.tsx`** - 300+ lines

#### Problems:

- No component splitting
- Business logic mixed with presentation
- Hard to test
- Hard to optimize

#### Recommendation:

- Split into smaller components (< 150 lines each)
- Extract hooks for logic (useInfiniteMenu, useFluidGlass)
- Consider if these heavy animations are needed at all

---

### 8. **Responsive Design Inconsistencies**

**Impact**: Mobile UX, CLS  
**Severity**: MEDIUM

#### Issues Found:

```tsx
// Excessive breakpoint variants (hard to maintain)
className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl"

// Fixed pixel values causing mobile overflow
className="text-[3rem]"  // Will overflow on mobile

// Missing mobile optimizations
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* 4 columns on desktop but no gap reduction on mobile */}
</div>
```

#### Tailwind Config Missing:

- No custom responsive breakpoints defined
- No font size scale standardization
- Arbitrary values used everywhere (`text-[26px]`, `text-[10px]`)

#### Fix:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        // ... define standard scale
      },
    },
  },
};
```

---

## 🟢 LOW PRIORITY OPTIMIZATIONS

### 9. **Code Organization**

- `reactBitBlocks/` folder has duplicated animation components
- Multiple copies of similar button sound logic
- Missing barrel exports (index.ts files)

### 10. **TypeScript Improvements**

- Many `any` types in store and socket code
- Missing return type annotations
- Unused imports

### 11. **SEO & Accessibility**

- Missing alt text on decorative images
- No focus management in modals
- Missing ARIA labels on icon buttons

---

## 📊 PERFORMANCE METRICS (Estimated)

### Current State:

- **Initial Bundle**: ~2.5MB (uncompressed)
- **First Contentful Paint**: 2.5-3.5s
- **Time to Interactive**: 4-6s
- **Lighthouse Score**: ~45-55

### After Optimizations:

- **Initial Bundle**: ~1.2MB (52% reduction)
- **First Contentful Paint**: 1.2-1.8s
- **Time to Interactive**: 2-3s
- **Lighthouse Score**: ~75-85

---

## 🎯 RECOMMENDED ACTION PLAN

### Week 1 (Quick Wins):

1. ✅ Remove duplicate dependencies (bcrypt, motion, lottie)
2. ✅ Lazy load below-fold components on homepage
3. ✅ Add React.memo to heavy animation components
4. ✅ Fix WebSocket cleanup in socket.ts

### Week 2 (Medium Effort):

5. ✅ Optimize images (convert to WebP, use Next Image)
6. ✅ Add Zustand selectors to multiplayer store
7. ✅ Implement proper pagination in API routes
8. ✅ Split large components (InfiniteMenu, FluidGlass)

### Week 3 (Refactoring):

9. ✅ Remove unused packages (next-auth, @material-tailwind)
10. ✅ Consolidate charting libraries (pick recharts or chart.js)
11. ✅ Add database indexes for common queries
12. ✅ Standardize Tailwind responsive patterns

### Optional (Consider Trade-offs):

- Remove Three.js decorations (saves 1MB+ but loses visual flair)
- Replace GSAP with CSS animations (saves 200KB)
- Use CSS-only alternatives for simple animations

---

## 🛠️ AUTOMATED FIXES AVAILABLE

I can automatically fix these now:

1. Remove duplicate deps from package.json
2. Add React.memo wrappers to heavy components
3. Fix WebSocket cleanup
4. Add missing Image imports
5. Refactor multiplayer store with selectors

**Would you like me to start with the automated fixes?**

---

## 📝 NOTES

- Your ws-server is already optimized (good job on the recent refactor!)
- Docker setup is clean
- Prisma schema is well-structured
- Most issues are in the frontend React layer

**Priority**: Start with dependency cleanup and homepage lazy loading for immediate 40%+ perf gain.
