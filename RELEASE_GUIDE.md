# Release Guide

## Overview
This application uses GitHub Releases for automatic updates. When you publish a new release on GitHub, users will be notified and can update automatically.

## Release Steps

### 1. Update Version
Update the version in `package.json`:
```json
{
  "version": "1.0.1"
}
```

### 2. Build the Application
```bash
npm run release
```

This will:
- Build the application in production mode
- Create NSIS installer in `release/` directory
- Generate `latest.yml` file for auto-update

### 3. Create GitHub Release
1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Create a new tag (e.g., `v1.0.1`)
4. Set release title (e.g., `Version 1.0.1`)
5. Add release notes
6. Upload the following files from `release/` directory:
   - `PasswordManager Setup 1.0.1.exe` (NSIS installer)
   - `latest.yml` (auto-update metadata)
7. Click "Publish release"

### 4. Auto-Update Process
Once published:
- Users will be notified on app startup (after 3 seconds)
- They can choose to download the update immediately or later
- After download, they can restart to install
- The update is also installed automatically on app quit

## Important Notes

- **Development mode**: Auto-update is disabled when running via `npm run dev`
- **GitHub token**: For publishing from CLI, set `GH_TOKEN` environment variable
- **Version format**: Use semantic versioning (e.g., 1.0.0, 1.0.1, 1.1.0)
- **Testing**: Test the installer on a clean Windows machine before release

## Troubleshooting

### Update not detected
- Verify `latest.yml` is uploaded to the release
- Check that the version in `latest.yml` matches the release tag
- Ensure the release is published (not draft)

### Download fails
- Check GitHub release assets are publicly accessible
- Verify the installer file name matches the pattern in `latest.yml`
