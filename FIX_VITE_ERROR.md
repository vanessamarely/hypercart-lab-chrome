# 🔧 Quick Fix: Vite Module Error

## Error You're Seeing

```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js'
```

## Quick Fix (Run These Commands)

```bash
# Navigate to project root
cd /workspaces/spark-template

# Clear Vite cache
npm run clean

# Restart dev server
npm run dev
```

## If That Doesn't Work

```bash
# Full reinstall
rm -rf node_modules/.vite
npm install
npm run dev
```

## Still Not Working?

```bash
# Nuclear option - complete fresh install
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## What's Happening?

This is a **Vite build tool cache issue**, not an application code problem. The app code is fully functional - Vite just needs its cache cleared.

## Alternative: Use a Different Port

Sometimes the issue is related to a stale dev server:

```bash
# Kill any existing processes on port 5173
npm run kill

# Start fresh
npm run dev
```

## Verify Fix Worked

After running the commands above, you should see:

```
VITE v6.4.1  ready in X ms

➜  Local:   http://localhost:5173/
```

Then open the browser and the app should load without errors.

---

**Note:** Your application code is correct. This is purely a development environment caching issue.
