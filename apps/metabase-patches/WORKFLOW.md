# Metabase Fork Management Workflow

This document describes how to work with a modified version of Metabase without checking the entire codebase into the repository.

## Overview

We use a patch-based workflow where:

- The Metabase repository is cloned locally but excluded from version control
- The modifications are stored as patch files that are version controlled
- Scripts automate the process of applying and creating patches

## Initial Setup

1. Clone and set up Metabase with existing patches:

   ```bash
   cd apps/metabase-patches/scripts
   ./setup.sh
   ```

   This will:

   - Clone the Metabase repository to `apps/metabase/`
   - Apply any existing patches from `apps/metabase-patches/patches/`

## Making Changes

1. Navigate to the Metabase directory:

   ```bash
   cd apps/metabase
   ```

2. Make your modifications to the Metabase codebase

3. Create a patch for your changes:

   ```bash
   cd ../../metabase-patches/scripts
   ./create-patch.sh my-feature-name
   ```

   This creates a patch file at `apps/metabase-patches/patches/my-feature-name.patch`

4. Commit the patch file to your repository:

   ```bash
   git add apps/metabase-patches/patches/my-feature-name.patch
   git commit -m "Add Metabase patch for my feature"
   ```

## Updating Metabase

To update Metabase to a newer version while preserving your patches:

```bash
cd apps/metabase-patches/scripts
./update-metabase.sh
```

This will:

- Pull the latest Metabase changes
- Attempt to reapply all patches
- Report any patches that fail to apply (which you'll need to update)

## Best Practices

1. **Keep patches small and focused** - One feature/fix per patch
2. **Name patches descriptively** - Use names like `enable-action-visibility.patch`
3. **Document patches** - Add comments in the patch or a separate docs file
4. **Test patches regularly** - Run update script periodically to ensure compatibility
5. **Order matters** - If patches depend on each other, prefix with numbers (e.g., `001-base-changes.patch`, `002-feature.patch`)

## Troubleshooting

### Patch fails to apply

- The Metabase code may have changed. You'll need to:
  1. Apply the patch manually or update it
  2. Create a new patch with the updated changes
  3. Remove the old patch file

### Merge conflicts

- Resolve conflicts in the Metabase directory
- Create a new patch with the resolved changes

### Clean slate

To start fresh:

```bash
rm -rf apps/metabase
cd apps/metabase-patches/scripts
./setup.sh
```
