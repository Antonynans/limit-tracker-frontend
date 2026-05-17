# Limit Tracker

A React application for creating category limits and tracking spending against them with real-time status updates.

## Overview

This application allows users to:
- Create spending categories with monthly limits
- Record spending activities against categories
- View real-time status of each category (On Track / Warning / Exceeded)
- Monitor usage percentage and remaining budget

## Tech Stack

- React
- TypeScript
- CSS

### Setup

In a new terminal:

```bash
# Navigate to frontend directory
cd limit-tracker-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# App will run on http://localhost:5173
```

### Access the Application

- **Frontend**: http://localhost:5173
- Swagger API docs: http://localhost:4000/api/docs

## Usage Example

### 1. Create a Category Limit
```bash
curl -X POST http://localhost:3001/limits \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Groceries",
    "limit": 50000
  }'
```

### 2. Record an Activity
```bash
curl -X POST http://localhost:3001/activities \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "<limit-id>",
    "amount": 12500,
    "description": "Weekly shopping"
  }'
```

### 3. Check Summary
```bash
curl http://localhost:3001/limit-summary
```

Response shows:
```json
{
  "category": "Groceries",
  "limit": 50000,
  "spent": 12500,
  "percentage": 25.0,
  "status": "On Track"
}
```

## Features

### Status Calculation
- **On Track**: Usage < 80%
- **Warning**: 80% ≤ Usage ≤ 100%
- **Exceeded**: Usage > 100%

### Features
- Real-time status indicators (color-coded)
- Progress bars showing usage percentage
- Quick add forms for limits and activities
- Category overview cards
- Responsive grid layout
- Error handling and user feedback


## Assumptions

1. **Data Persistence**: Data is stored in-memory and resets when the server restarts. For production, a persistent database (PostgreSQL, MongoDB) would be required.

2. **Single User**: The system is single-user without authentication. In a real application, authentication and per-user data isolation would be implemented.

3. **Amount Units**: All amounts are stored in kobo (₦100 = 10000 units) to avoid floating-point precision issues common in financial applications.

## Key Decisions

### 1. In-Memory Storage Over Database
**Decision**: Use in-memory Map instead of PostgreSQL/MongoDB.

**Justification**: For a minimal MVP demonstration, in-memory storage eliminates deployment complexity while allowing focus on core feature logic. The architecture remains database-agnostic; swapping to PostgreSQL requires only replacing the service layer.

**Trade-offs**: Data loss on restart (acceptable for demo), no concurrent access safety (acceptable for single user).

### 2. Percentage-Based Status Thresholds
**Decision**: Use fixed thresholds (80%, 100%) rather than configurable per-category.

**Justification**: Fixed thresholds keep the feature simple and make status consistent. Most budgeting apps use standard 80% warning/100% exceeded thresholds, reducing cognitive load.

**Trade-offs**: Less flexibility (users can't set custom thresholds), but covers 90% of use cases for this scope.

## Rejected Alternatives

**Real Database (PostgreSQL)**
- **Why rejected**: - A database-backed API was rejected because persistence is outside the core task and would add setup overhead.

**Redux/Zustand State Management (Frontend)**
- **Why rejected**: React hooks (useState) suffice for single-page data flow. Redux adds boilerplate without solving real complexity here (no deeply nested state, no time-travel debugging needs).

**JWT Authentication**
- **Why rejected**: Out of scope. Single-user system doesn't need per-user data isolation. Adds OAuth setup (Google, GitHub), token management, refresh logic—not required for MVP.

## Failure Scenarios

### Scenario: User Deletes Active Category
**Current Behavior**: Category is deleted; orphaned activities remain in the database.

**Impact**: Activities reference non-existent `categoryId`. GET /activities still returns them, but they don't appear in /limit-summary. 

**Mitigation** (for production):
- Add foreign key constraint: deleting a limit cascades or prevents deletion if activities exist
- Soft deletes: mark limits as deleted instead of removing them
- Data audit: log deletions with timestamp and user

```
