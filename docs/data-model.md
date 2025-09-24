# Weeklet Data Model

## Core Types

### Task Type
```typescript
type Task = {
  id: string;               // crypto.randomUUID() - unique identifier
  title: string;            // short text, primary task description
  notes?: string;           // optional detailed description/context
  date: string;             // YYYY-MM-DD format (local date, no timezone)
  done: boolean;            // completion status
  priority?: 0 | 1 | 2;     // 0 = none, 1 = medium, 2 = high
  tags?: string[];          // optional categorization labels
  dueTime?: string;         // "HH:MM" format in 24hr local time
  createdAt: number;        // epoch milliseconds (Date.now())
  updatedAt: number;        // epoch milliseconds (Date.now())
  rollover?: boolean;       // allow task to carry forward to next day if incomplete
  recurrence?: {            // optional recurring task rules
    rule: "daily" | "weekly" | "weekdays";
  } | null;
};
```

### Settings Type
```typescript
type Settings = {
  startOfWeek: "Mon" | "Sun";    // week start preference
  rolloverDefault: boolean;      // default rollover setting for new tasks
  compactMode: boolean;          // condensed UI layout option
};
```

## Storage Layout

### Primary Storage Strategy
```typescript
// Chrome storage.sync keys:
{
  "settings": Settings,
  "version": "1.0.0",
  "lastSync": 1234567890,
  
  // Tasks partitioned by date to avoid 8KB item limit
  "tasks_2024-09-23": Task[],
  "tasks_2024-09-24": Task[],
  "tasks_2024-09-25": Task[],
  // ... one entry per date with tasks
}
```

### Storage Constraints & Decisions

#### Chrome Storage Limits
- **Total Quota**: 100KB for chrome.storage.sync
- **Item Size**: 8KB max per storage item
- **Write Rate**: Limited to prevent abuse
- **Strategy**: Partition tasks by date, keep settings separate

#### Data Partitioning Logic
```typescript
// Storage key generation
const getTaskStorageKey = (date: string): string => `tasks_${date}`;

// Example: tasks for Sept 24, 2024 stored as:
// "tasks_2024-09-24": [Task, Task, Task]
```
