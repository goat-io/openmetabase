# Metabase Modifications Documentation

This document describes all modifications made to the Metabase source code in compliance with the AGPL-3.0 license requirements.

## Overview

We maintain a fork of Metabase with custom patches to enable action functionality in embedded dashboards. These modifications are necessary for our backoffice use case where we need to trigger actions from embedded Metabase dashboards.

## Detailed Modifications

### 1. Always Enable Actions (`always-enable-actions.patch`)

**File Modified**: `frontend/src/metabase/actions/components/ActionViz/Action.tsx`

**Change**: 
- Line 161: Changed `const hasActionsEnabled = getActionIsEnabledInDatabase(dashcard);` to `const hasActionsEnabled = true;`

**Purpose**: This modification bypasses the database-level action enablement check, ensuring actions are always available in embedded dashboards regardless of database settings.

**Impact**: Actions will be functional in all embedded dashboards where they are configured.

### 2. Make Action Cards Visible (`make-action-cards-visible.patch`)

**File Modified**: `frontend/src/metabase/public/containers/PublicOrEmbeddedDashboard/PublicOrEmbeddedDashboardPage/PublicOrEmbeddedDashboardPage.tsx`

**Change**:
- Line 71: Changed `isDashcardVisible={(dashcard) => !isActionDashCard(dashcard)}` to `isDashcardVisible={(dashcard) => true}`

**Purpose**: This modification ensures that action dashboard cards are visible in public and embedded dashboard views, where they are normally hidden.

**Impact**: Users can see and interact with action cards in embedded dashboards.

### 3. Add Click Event Support (`add-click-event-support.patch`)

**File Modified**: `frontend/src/metabase/visualizations/lib/action.js`

**Changes**:
- Lines 35-43: Added a new condition to intercept URLs starting with '<<event>>'
- When such URLs are detected, the code parses the event data and posts a message to the parent window
- This allows communication between the embedded Metabase iframe and the parent application

**Purpose**: Enables custom event handling for actions, allowing the embedded dashboard to communicate with the parent application through postMessage API.

**Impact**: Actions can trigger events in the parent application instead of just navigating to URLs.

### 4. Request Auth Tokens from Parent (`request-auth-tokens-from-parent.patch`)

**File Modified**: `frontend/src/metabase/lib/api.js`

**Changes**:
- Lines 8-40: Added mechanism to request and receive authentication tokens from parent window
- Implements secure postMessage communication for sessionToken and apiKey exchange
- Only initializes when running within an iframe context
- Exports getter functions `getSessionToken()` and `getApiKey()`
- Lines 94-106: Modified `getClientHeaders()` to use the received tokens

**Purpose**: Enables secure authentication token exchange between parent application and embedded Metabase, allowing the embedded dashboard to make authenticated API requests.

**Impact**: Embedded dashboards can receive and use authentication tokens from the parent application for secure API communication.

### 5. Parse JWT for Embedded Actions (`parse-jwt-for-embedded-actions.patch`)

**File Modified**: `frontend/src/metabase/dashboard/actions/actions.ts`

**Changes**:
- Lines 41-60: Added `parseJwt` function to decode JWT tokens without external dependencies
- Lines 63-70: Added `EmbedDashboardToken` type definition for JWT payload structure
- Lines 85-94: Modified `executeRowAction` to extract dashboard ID from JWT token for embedded dashboards

**Purpose**: Enables embedded dashboards to properly execute actions by parsing the JWT token to extract the actual dashboard ID, which is encoded within the token for security.

**Impact**: Actions in embedded dashboards can correctly identify and execute against the proper dashboard resource.

## Building the Modified Version

To build Metabase with these modifications:

```bash
# Clone and apply patches
npm run metabase:setup

# Build Docker image
npm run metabase:build-image
```

## Patch Management

- Patches are stored in `apps/metabase-patches/patches/`
- Use `npm run metabase:create-patch <name>` to create new patches
- Use `npm run metabase:reset-patches` to reset Metabase to a clean state for patch development
- Use `npm run metabase:update` to update Metabase while preserving patches

## License Compliance

These modifications are made under the terms of the AGPL-3.0 license. Users who receive this modified version have the right to receive the complete corresponding source code, including these patches.