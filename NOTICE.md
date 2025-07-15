# Notice of Modifications to Metabase

This project contains a modified version of Metabase (<https://github.com/metabase/metabase>).

## Original Software

- **Name**: Metabase
- **Copyright**: Copyright © 2024 Metabase, Inc.
- **License**: GNU Affero General Public License v3.0 (AGPL-3.0)
- **Source**: <https://github.com/metabase/metabase>

## Modifications

This distribution includes the following modifications to the original Metabase source code:

1. **Always Enable Actions** (`always-enable-actions.patch`): Forces actions to be enabled in embedded dashboards
2. **Make Action Cards Visible** (`make-action-cards-visible.patch`): Ensures action cards are visible in public/embedded dashboard views
3. **Add Click Event Support** (`add-click-event-support.patch`): Adds support for click events to communicate from iframe to parent window
4. **Request Auth Tokens from Parent** (`request-auth-tokens-from-parent.patch`): Enables secure authentication token exchange for embedded dashboards
5. **Parse JWT for Embedded Actions** (`parse-jwt-for-embedded-actions.patch`): Handles JWT token parsing for action execution in embedded contexts

All modifications are applied as patches located in `apps/metabase-patches/patches/`.

## Source Code Availability

In compliance with the AGPL-3.0 license:

- The complete source code for this modified version is available at: [ADD OUR PUBLIC REPO HERE]
- The patches applied to create this modified version are included in this repository
- To build this modified version from source:
  1. Clone this repository
  2. Run `npm run metabase:setup` to clone Metabase and apply patches
  3. Run `npm run metabase:build-image` to build the Docker image

## License

This modified version is distributed under the same AGPL-3.0 license as the original Metabase software. See the LICENSE file for the full license text.

## How to Obtain the Source Code

Users of this modified Metabase instance can obtain the complete corresponding source code by:

1. Downloading this repository which contains all patches
2. Following the build instructions above
3. Or by contacting [your contact information]

## No Warranty

This software is provided "as is" without warranty of any kind, either expressed or implied.
