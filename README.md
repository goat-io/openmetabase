# Backoffice Metabase POC

A proof-of-concept for using Metabase as a backoffice solution with enhanced action capabilities in embedded dashboards.

## Metabase Credentials

For the local development environment credentials are

```txt
username: admin@mycompany.com
password: testadmin123
```

## Overview

This project demonstrates how to use a modified version of Metabase to create interactive backoffice applications. Since the open-source version of Metabase has limitations on embedded dashboard actions, we maintain a patched version that enables these features.

## Architecture

The solution consists of three main components:

- **Frontend (`apps/backoffice`)**: React application that embeds Metabase dashboards
- **Backend (`apps/metabase-emb`)**: Node.js service that generates JWT tokens for secure embedding
- **Infrastructure (`infra`)**: Pulumi-managed Docker containers and services

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- npm
- Pulumi
  - Install with `brew install pulumi/tap/pulumi` and login with `pulumi whoami` for the first time

### 0. Install packages in all repos (no monorepo setup yet)

```bash
cd apps/metabase-emb
npm install

cd apps/backoffice
npm install

cd infra
npm install

```

### 1. Build Custom Metabase Image

If you want to build and use the patched Metabase version:

```bash
# Clone Metabase and apply patches
npm run metabase:build-image
```

### 1. Setup Infrastructure

```bash
# Start local infrastructure (PostgreSQL, Metabase)
npm run serve:infra
```

### 3. Run the Applications

```bash
# Start the JWT backend service
cd apps/metabase-emb
npm install
npm run serve

# In another terminal, start the React frontend
cd apps/backoffice
npm install
npm run serve
```

The frontend will be available at <http://localhost:3001>

## Project Structure

```txt
├── apps/
│   ├── backoffice/          # React frontend application
│   ├── metabase-emb/        # JWT generation backend
│   └── metabase-patches/    # Metabase modifications
│       ├── patches/         # Git patches for Metabase
│       └── scripts/         # Patch management scripts
├── infra/                   # Infrastructure as Code (Pulumi)
└── package.json            # Root package with convenience scripts
```

## Metabase Patches

We maintain the following patches to enable actions in embedded dashboards:

1. **`always-enable-actions.patch`**: Forces actions to be enabled regardless of database settings
2. **`make-action-cards-visible.patch`**: Makes action cards visible in embedded views
3. **`add-click-event-support.patch`**: Adds postMessage support for parent-iframe communication

### Managing Patches

```bash
# Apply patches to a fresh Metabase clone
npm run metabase:setup

# Create a new patch from your changes
npm run metabase:create-patch my-feature

# Update Metabase while preserving patches
npm run metabase:update
```

## Development

### Environment Variables

Create `.env` files in each app directory based on the provided examples:

- `apps/metabase-emb/.env` - Configure Metabase URL and JWT secret
- `apps/backoffice/.env` - Configure API endpoints

### Available Scripts

```bash
# Root level commands
npm run serve              # Start local infrastructure
npm run metabase:setup     # Clone and patch Metabase
npm run metabase:update    # Update Metabase with patches
npm run metabase:build-image # Build Docker image

# Format code
npm run format             # Format all projects
```

## License

This project contains a modified version of Metabase, which is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See [NOTICE.md](NOTICE.md) for details about modifications and [LICENSE-AGPL](LICENSE-AGPL) for the full license text.

Our modifications are also licensed under AGPL-3.0. Source code for all modifications is available in this repository as patches in `apps/metabase-patches/patches/`.

## Contributing

When contributing, ensure that:

1. All Metabase modifications are captured as patches
2. License compliance is maintained
3. Documentation is updated accordingly
