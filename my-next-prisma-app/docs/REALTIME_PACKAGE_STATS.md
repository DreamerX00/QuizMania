# Real-Time Package Stats Implementation

## Overview

This implementation provides real-time statistics for quiz packages, including likes, attempts, earnings, average rating, and average score. The stats are stored directly on the `QuizPackage` model and are automatically updated whenever quiz interactions occur.

## Database Schema Changes

### QuizPackage Model
Added the following real-time stats fields to the `QuizPackage` model:

```prisma
model QuizPackage {
  // ... existing fields ...
  
  // Real-time stats fields
  totalAttempts   Int      @default(0)
  totalLikes      Int      @default(0)
  earnings        Int      @default(0)
  averageRating   Float    @default(0)
  averageScore    Float    @default(0)
}
```

## Implementation Components

### 1. Stats Update Service (`src/services/updatePackageStats.ts`)

**Functions:**
- `updatePackageStatsForQuiz(quizId: string)`: Updates stats for all packages containing a specific quiz
- `updatePackageStats(packageId: string)`: Updates stats for a specific package
- `updateAllPackageStats()`: Updates stats for all packages (bulk operation)

**How it works:**
- Aggregates stats from all quizzes in a package
- Calculates totals and averages
- Updates the package's real-time stats fields
- Handles edge cases (empty packages, missing data)

### 2. Updated API Endpoints

#### Package API (`src/app/api/packages/route.ts`)
- **POST**: Creates package and updates stats
- **PUT**: Updates package and recalculates stats
- **DELETE**: Removes package (no stats update needed)

#### Package Stats API (`src/app/api/packages/stats/route.ts`)
- **GET**: Returns real-time stats directly from package fields (no calculation needed)

### 3. Quiz Interaction APIs

#### Quiz Like API (`src/app/api/quizzes/[quizId]/like/route.ts`)
- **POST**: Creates like and updates package stats
- **DELETE**: Removes like and updates package stats

#### Quiz Rating API (`src/app/api/quizzes/[quizId]/rate/route.ts`)
- **POST**: Creates/updates rating and updates package stats

#### Quiz Attempt API (`src/app/api/quizzes/[quizId]/attempt/route.ts`)
- **POST**: Records attempt and updates package stats

## How Real-Time Updates Work

1. **Quiz Interaction Occurs**: User likes, rates, or attempts a quiz
2. **Quiz Stats Updated**: The quiz's individual stats are updated
3. **Package Stats Triggered**: `updatePackageStatsForQuiz()` is called
4. **Package Discovery**: All packages containing the quiz are found
5. **Stats Aggregation**: Stats from all quizzes in each package are aggregated
6. **Package Update**: Package's real-time stats fields are updated
7. **UI Refresh**: Frontend displays updated stats immediately

## Benefits

### Performance
- **Fast API Responses**: Package stats are pre-calculated and stored
- **Reduced Database Queries**: No need to aggregate on every request
- **Scalable**: Works efficiently with large numbers of packages and quizzes

### Accuracy
- **Real-Time**: Stats are always up-to-date with the latest interactions
- **Consistent**: All packages are updated when any quiz interaction occurs
- **Reliable**: Handles edge cases and error scenarios gracefully

### User Experience
- **Instant Updates**: Users see stats change immediately after interactions
- **Comprehensive Data**: Shows all relevant metrics in one place
- **Visual Feedback**: Clear indication of package performance

## Usage Examples

### Creating a Package
```typescript
// Package is created with initial stats (all zeros)
const package = await prisma.quizPackage.create({
  data: {
    title: "My Package",
    quizIds: ["quiz1", "quiz2"],
    price: 500, // ₹5.00
    // ... other fields
  }
});

// Stats are automatically calculated and updated
await updatePackageStats(package.id);
```

### Quiz Interaction
```typescript
// User likes a quiz
await prisma.quizLike.create({
  data: { quizId: "quiz1", userId: "user1" }
});

// Quiz like count is updated
await prisma.quiz.update({
  where: { id: "quiz1" },
  data: { likeCount: { increment: 1 } }
});

// All packages containing this quiz are updated
await updatePackageStatsForQuiz("quiz1");
```

### Fetching Package Stats
```typescript
// Fast response - no calculation needed
const stats = await prisma.quizPackage.findUnique({
  where: { id: packageId },
  select: {
    totalAttempts: true,
    totalLikes: true,
    earnings: true,
    averageRating: true,
    averageScore: true
  }
});
```

## Migration and Setup

### 1. Database Migration
```bash
npx prisma migrate dev --name add-realtime-stats-to-packages
```

### 2. Update Existing Packages
```bash
npx tsx src/scripts/updateAllPackageStats.ts
```

### 3. Integration
- Update quiz interaction APIs to call `updatePackageStatsForQuiz()`
- Update package creation/update APIs to call `updatePackageStats()`
- Update frontend to display real-time stats

## Monitoring and Maintenance

### Logging
- All stats updates are logged with package ID and calculated values
- Errors are logged with context for debugging

### Performance Monitoring
- Monitor API response times for package stats
- Track database query performance
- Monitor memory usage during bulk updates

### Data Integrity
- Regular validation of package stats against quiz data
- Automated reconciliation scripts if needed
- Backup and recovery procedures

## Future Enhancements

### Caching
- Redis cache for frequently accessed package stats
- Cache invalidation on stats updates

### Analytics
- Historical stats tracking
- Trend analysis and reporting
- Performance metrics dashboard

### Optimization
- Batch updates for multiple quiz interactions
- Background job processing for large updates
- Incremental updates for better performance 