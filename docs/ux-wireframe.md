# Weeklet UX Wireframe

## Popup Layout (350px width)
```
┌─────────────────────────────────────┐
│              HEADER                 │
│          Weeklet                    │
│    Week of Sep 23-29, 2024         │
├─────────────────────────────────────┤
│           WEEK NAVIGATION           │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ │
│ │Mon│ │Tue│ │Wed│ │Thu│ │Fri│ │Sat│ │
│ │23 │ │24*│ │25 │ │26 │ │27 │ │28 │ │
│ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ │
│ ┌───┐                               │
│ │Sun│    *Today highlighted         │
│ │29 │                               │
│ └───┘                               │
├─────────────────────────────────────┤
│            ADD TASK                 │
│ ┌─────────────────────────────┐ ┌─┐ │
│ │ Add a task...               │ │+│ │
│ └─────────────────────────────┘ └─┘ │
│ Adding to: Today                    │
├─────────────────────────────────────┤
│            TASK LIST                │
│ ☐ Review project proposal      [×] │
│ ☑ Team standup meeting         [×] │
│ ☐ Update documentation        [×] │
│                                     │
│     No tasks for this day.          │
│      Add one above!                 │
└─────────────────────────────────────┘
```

## Component Specs
- **Header**: 60px height, centered title and week info
- **Week Nav**: 80px height, 7 clickable day chips
- **Add Task**: 60px height, input + button + context
- **Task List**: Variable height, max 300px, scrollable
