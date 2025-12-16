# Vite Module Resolution Error Fix

## Error
```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js' 
imported from /workspaces/spark-template/node_modules/vite/dist/node/chunks/config.js
```

## Root Cause
This error indicates a corrupted `node_modules` directory, specifically with the Vite package installation.

## Solution

### Option 1: Use the repair script (Recommended)
```bash
npm run repair
```

This will:
1. Remove cached Vite files
2. Reinstall dependencies
3. Force Vite to optimize dependencies

### Option 2: Manual cleanup
```bash
# Clean caches
rm -rf node_modules/.vite
rm -rf node_modules/.cache

# Reinstall node_modules
rm -rf node_modules
npm install

# Optimize Vite dependencies
npm run optimize
```

### Option 3: Clean and rebuild
```bash
# Full clean
npm run clean

# Reinstall
npm install

# Start dev server
npm run dev
```

## Prevention

This issue can occur when:
- Package installations are interrupted
- Node modules are corrupted during updates
- Multiple npm operations run simultaneously

To prevent:
1. Always complete package installations
2. Don't interrupt npm install
3. Use the repair script when errors occur

## Verification

After applying the fix, verify with:
```bash
npm run dev
```

The development server should start without errors.

## Configuration Updates

The `vite.config.ts` has been updated with:
- `optimizeDeps.force: true` - Forces dependency pre-bundling
- `server.fs.strict: false` - More lenient file system access
- `clearScreen: false` - Better error visibility

These changes make the build more resilient to module resolution issues.
