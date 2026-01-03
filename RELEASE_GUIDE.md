# Release Guide

## Overview
This application uses GitHub Releases for automatic updates. The build and upload process is automated via GitHub Actions.

## Automated Release Process

### 1. Create a Release on GitHub

**Via Browser:**
1. Go to repository **Releases** → **Draft a new release**
2. **Choose a tag** → Enter new tag (e.g., `v1.0.2` or `1.0.2`)
3. Enter **Release title** (e.g., `Version 1.0.2`)
4. Write **Description** with release notes
5. Click **Publish release**

**Via GitHub CLI:**
```bash
gh release create v1.0.2 --title "Version 1.0.2" --notes "Bug fixes and improvements"
```

### 2. Automatic Build

When you publish a release:
1. GitHub Actions automatically runs the "Release Build" workflow
2. Extracts version from the tag
3. Updates `package.json` version
4. Runs tests
5. Builds the application
6. Uploads artifacts to the release:
   - `PasswordManager Setup X.X.X.exe` (NSIS installer)
   - `latest.yml` (auto-update metadata)
   - `*.blockmap` (differential update files)

### 3. User Distribution

- Existing users receive update notifications on next app startup
- New users download the `.exe` from the Release page

## Manual Build (if needed)

If you need to build manually without automation:

```bash
# 1. Update version
npm version 1.0.2 --no-git-tag-version

# 2. Build
npm run release

# 3. Create release and upload files
gh release create v1.0.2 \
  --title "Version 1.0.2" \
  --notes "Release notes" \
  release/*.exe \
  release/*.yml \
  release/*.blockmap
```

## Important Notes

- **Tag format**: Both `v1.0.2` and `1.0.2` work (the workflow removes `v` prefix automatically)
- **Draft releases**: Automation only runs when you **publish** (not for drafts)
- **Pre-releases**: Build runs but won't trigger auto-updates for users
- **Version**: No need to manually update `package.json` - the workflow handles it

## Troubleshooting

### Build fails
- Check Actions tab for error logs
- Verify tests pass locally: `npm run test:ci`
- Check dependency issues

### Artifacts not uploaded
- Verify workflow completed successfully
- Check `GITHUB_TOKEN` permissions
- Verify file paths in workflow

### Update existing release
```bash
gh release upload v1.0.2 release/*.exe release/*.yml
```
