# Vite Module Resolution Error Fix

## Error Description
```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js' 
imported from /workspaces/spark-template/node_modules/vite/dist/node/chunks/config.js
```

## Root Cause
This error typically occurs due to:
1. Corrupted node_modules installation
2. Incomplete Vite package installation
3. Cache conflicts in npm or Vite

## Solution Steps

### Option 1: Clean and Reinstall (Recommended)
```bash
# Remove node_modules and lock file
rm -rf node_modules
rm -rf package-lock.json

# Clear npm cache
npm cache clean --force

# Clear Vite cache
rm -rf node_modules/.vite
rm -rf node_modules/.cache

# Reinstall dependencies
npm install

# Try to start dev server
npm run dev
```

### Option 2: Vite Cache Only
If you don't want to reinstall everything:
```bash
# Clear Vite cache
npm run clean

# Or manually:
rm -rf node_modules/.vite
rm -rf node_modules/.cache

# Restart dev server
npm run dev
```

### Option 3: Optimize Dependencies
```bash
# Run Vite optimizer
npm run optimize

# Then start dev server
npm run dev
```

### Option 4: Check for Port Conflicts
```bash
# Kill any process using port 5173
npm run kill

# Start dev server
npm run dev
```

## Prevention
To prevent this error in the future:
1. Always shut down the dev server properly (Ctrl+C)
2. Don't manually edit files in node_modules
3. Keep npm and Node.js updated
4. Periodically clear caches with `npm run clean`

## Verification
After applying the fix, verify everything works:
```bash
# Check if Vite is properly installed
npm list vite

# Should show: vite@6.4.1

# Start dev server
npm run dev
```

## Still Having Issues?
If the error persists:
1. Check Node.js version: `node --version` (should be 18+)
2. Check npm version: `npm --version` (should be 9+)
3. Try running with verbose logging: `npm run dev --verbose`
4. Check for file system permissions issues
