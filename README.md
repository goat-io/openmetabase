# Backoffice Metabase POC

A proof-of-concept for using Metabase as a backoffice solution with enhanced action capabilities in embedded dashboards.

## AGPL License Compliance Notice

**This project maintains a patched version of Metabase in full compliance with the GNU Affero General Public License v3.0 (AGPL-3.0).** We are committed to:

- **Full Transparency**: All modifications to Metabase source code are documented and available as git patches in `apps/metabase-patches/patches/`
- **Open Source**: This entire repository, including all patches and modifications, is publicly available
- **Attribution**: We maintain the "Powered by Metabase" logo in all embedded dashboards to properly attribute the original software
- **User Rights**: Anyone receiving our modified version has full access to the complete source code, as required by AGPL

For detailed information about our modifications, see [MODIFICATIONS.md](apps/metabase-patches/MODIFICATIONS.md) and [NOTICE.md](NOTICE.md).

## Metabase Credentials

For the local development environment credentials are

```txt
username: admin@mycompany.com
password: testadmin123
```

## Overview

This project demonstrates how to use a modified version of Metabase to create interactive backoffice applications. Since the open-source version of Metabase has limitations on embedded dashboard actions, we maintain a patched version that enables these features while respecting all license requirements.

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

## Security Architecture

### Embedding Authentication Flow

1. **Backend Authorization**: All embedding requests go through our backend (`metabase-emb`) which:
   - Validates user permissions and access rights
   - Generates JWT tokens with encoded dashboard access
   - Provides API keys only to authorized users for action execution

2. **Secure Token Exchange**: The frontend and embedded Metabase communicate via postMessage to:
   - Share API keys for action execution
   - Exchange session tokens as needed
   - Maintain security boundaries between iframe and parent

3. **JWT-Based Access Control**: Each embedding URL contains a JWT token that:
   - Encodes the specific dashboard ID and parameters
   - Ensures access was authorized by our backend
   - Prevents unauthorized dashboard access

## Metabase Patches

We maintain the following patches to enable actions in embedded dashboards:

1. **`always-enable-actions.patch`**: Forces actions to be enabled regardless of database settings
2. **`make-action-cards-visible.patch`**: Makes action cards visible in embedded views
3. **`add-click-event-support.patch`**: Adds postMessage support for parent-iframe communication
4. **`request-auth-tokens-from-parent.patch`**: Enables secure authentication token exchange between parent and embedded Metabase
5. **`parse-jwt-for-embedded-actions.patch`**: Adds JWT parsing for proper action execution in embedded dashboards

### Managing Patches

```bash
# Apply patches to a fresh Metabase clone
npm run metabase:setup

# Reset Metabase to clean state (removes all patches)
npm run metabase:reset-patches

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

### Our Commitment to License Compliance

- **All modifications are licensed under AGPL-3.0**, the same as the original Metabase
- **Complete source code** for all modifications is available in this repository as patches in `apps/metabase-patches/patches/`
- **We preserve all copyright notices** and the "Powered by Metabase" branding in our deployment
- **Users have full rights** to access, modify, and distribute this modified version under AGPL terms
- **We document all changes** transparently in [MODIFICATIONS.md](apps/metabase-patches/MODIFICATIONS.md)

We respect Metabase's work and aim to contribute back to the community while enabling specific use cases for embedded dashboards.

## Contributing

When contributing, ensure that:

1. All Metabase modifications are captured as patches
2. License compliance is maintained
3. Documentation is updated accordingly
