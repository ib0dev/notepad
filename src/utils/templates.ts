export const TEMPLATES = [
  {
    id: 'meeting',
    title: 'Meeting Notes',
    content: `# Meeting Notes

## Date: {{date}}
## Participants: {{participants}}

### Agenda:
1. 
2. 
3.

### Notes:
- 

### Action Items:
| Task | Owner | Due Date |
|------|-------|----------|
|      |       |          |
`
  },
  {
    id: 'todo',
    title: 'Todo List',
    content: `# Todo List

## Priority Tasks
- [ ] 

## Upcoming Tasks
- [ ] 

## Completed Tasks
- [x] 
`
  },
  {
    id: 'project',
    title: 'Project Plan',
    content: `# Project Plan

## Overview
- 

## Goals
1. 
2. 
3.

## Timeline
| Phase | Start Date | End Date | Status |
|-------|------------|----------|--------|
| Initiation |            |          |        |
`
  }
];