# Weeklet MVP Overview

## Vision
**Weeklet = Weekly Task Management in 320–360px Chrome popup**
- **Core Value**: Quick weekly task visibility and management without context switching
- **Target User**: Busy professionals who need lightweight task tracking alongside browsing
- **Key Constraint**: Minimal UI real estate, maximum utility

## User Stories

### Primary Stories
- **As a user**, I want to see this week's tasks at a glance so I can quickly assess my workload
- **As a user**, I want to add tasks to any day this week so I can capture todos while browsing
- **As a user**, I want to check off completed tasks so I can track progress and feel accomplished
- **As a user**, I want my tasks to sync across devices so I can access them anywhere
- **As a user**, I want the extension to work offline so network issues don't block productivity

### Secondary Stories
- **As a user**, I want to delete mistaken or obsolete tasks so I can keep my list clean
- **As a user**, I want to see today highlighted so I can focus on current priorities
- **As a user**, I want to switch between days quickly so I can plan ahead or review past work
- **As a user**, I want tasks to persist between browser sessions so I don't lose work

## User Flows

### Core Flow: Add Task
1. **Trigger**: Click Weeklet toolbar icon
2. **Action**: Popup opens showing current week with today selected
3. **Input**: Type task in input field
4. **Submit**: Press Enter or click Add button
5. **Result**: Task appears in today's list, input clears
6. **Storage**: Auto-saves to chrome.storage.sync

### Core Flow: Complete Task
1. **Context**: Popup open, viewing day with tasks
2. **Action**: Click checkbox next to task
3. **Result**: Task visually marked complete (strikethrough, dimmed)
4. **Storage**: Updated task.done = true, auto-saves

### Core Flow: View Different Day
1. **Context**: Popup open
2. **Action**: Click weekday chip (Mon, Tue, etc.)
3. **Result**: View switches to selected day, chip highlighted
4. **Display**: Shows tasks for that date, updates "Adding to: [Day]" text

## Edge Cases

### Date & Time
- **Daylight Saving Time**: Use local date strings (YYYY-MM-DD) to avoid UTC confusion
- **Week Boundaries**: Monday week start (configurable to Sunday later)
- **Midnight Crossing**: Tasks added late stay on intended date, not shifted by timezone
- **Date Rollover**: Handle task creation at 11:59 PM correctly

### Storage & Sync
- **Storage Quotas**: Chrome.storage.sync has 100KB limit total, ~8KB per item
- **Sync Conflicts**: Multiple windows/devices editing simultaneously
- **Network Offline**: Must work without internet connection

## Key Decisions

### Technical Architecture
- **✅ Manifest V3**: Future-proof Chrome extension standard
- **✅ ES6 Modules**: Clean imports, better code organization
- **✅ No Framework**: Vanilla JS for minimal bundle size and performance
- **✅ Chrome Storage Sync**: Built-in cross-device sync, no auth required

### UX Constraints
- **✅ 320-360px Width**: Matches common mobile viewport, fits in browser sidebar
- **✅ Vertical Layout**: Stack components for narrow width optimization
- **✅ Single Week View**: Reduces cognitive load, maintains focus
- **✅ Today Default**: Most common use case gets fastest access
