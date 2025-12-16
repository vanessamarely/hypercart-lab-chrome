# Troubleshooting Guide

## ⚠️ CRITICAL: Vite Module Resolution Error

### Error: Cannot find module 'vite/dist/node/chunks/dist.js'

**Error Message:**
```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js' 
imported from /workspaces/spark-template/node_modules/vite/dist/node/chunks/config.js
```

**Status:** 🟡 **TRANSIENT BUILD ERROR - Usually self-resolving**

**Cause:**
This is a Vite internal module resolution error caused by:
- Corrupted Vite cache in `node_modules/.vite`
- Incomplete or interrupted npm installation
- File system sync issues in cloud/container environments
- Stale build artifacts

**Solution 1: Clear Vite Cache (Fastest)**

```bash
# Use the built-in clean command
npm run clean

# Then restart dev server
npm run dev
```

**Solution 2: Reinstall Vite Package**

```bash
# Remove and reinstall Vite specifically
npm uninstall vite
npm install vite@6.4.1

# Restart dev server
npm run dev
```

**Solution 3: Full Node Modules Reinstall**

```bash
# Complete clean reinstall (most thorough)
rm -rf node_modules package-lock.json node_modules/.vite
npm cache clean --force
npm install
npm run dev
```

**Solution 4: Restart Development Environment**

If you're using a cloud IDE or container:
1. Stop the development server completely
2. Close all terminal sessions
3. Restart the workspace/container
4. Run `npm install` then `npm run dev`

**Important Note:**
✅ The application code is **fully functional** - this is only a Vite build tool issue
✅ All imports and dependencies are correctly configured
✅ Once the cache is cleared, the app runs without issues

## Other Known Issues

### Runtime Errors When Adding Products to Cart

**Symptoms:**
- App crashes when clicking "Add to Cart"
- React error #185 displayed
- Infinite loop in product detail page

**Causes Fixed:**
1. ✅ Cart state management using `useKV` hook
2. ✅ Proper functional updates to avoid stale closures
3. ✅ Safe cart operations with null checks
4. ✅ Toast notifications configured correctly

**If issues persist:**
1. Clear browser localStorage: `localStorage.clear()`
2. Hard refresh the page: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Check browser console for specific error messages

### Hero Video Not Displaying

**Status:** ✅ FIXED

The hero video asset is correctly located at:
- `/src/assets/video/hero-background.mp4`
- Imported and used in `HomePage.tsx`

If video still doesn't display:
1. Check browser console for 404 errors
2. Verify the video file exists in the assets folder
3. Try hard refresh to clear Vite's cache

### Product Images from Unsplash

**Configuration:**
Environment variables are read from browser localStorage (not .env file in this Spark environment).

**To configure Unsplash API:**
1. Open browser console
2. Run: `localStorage.setItem('UNSPLASH_ACCESS_KEY', 'your-key-here')`
3. Refresh the page

**Current Unsplash Configuration:**
- Access Key is stored in component state as fallback
- Images are fetched dynamically from Unsplash API
- Fallback to local assets if API fails

## Performance Debugging Features

### Debug Panel
- Access with `?debug=1` query parameter
- Toggle performance flags on/off
- See active optimizations

### Performance Dashboard
- Click the floating button (bottom right)
- View real-time Core Web Vitals
- Monitor LCP, INP, CLS metrics

### Status Bar
- Fixed at bottom of screen (dev mode only)
- Shows active performance flags
- Helps during live demos

## Common Development Tasks

### Starting Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Previewing Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## Browser Support

This application requires a modern browser with support for:
- ES2020 features
- Web Performance APIs
- Web Workers
- CSS Grid and Flexbox

**Recommended Browsers:**
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 15+

## Getting Help

If you encounter issues not covered here:

1. Check the browser console for error messages
2. Review the `PRD.md` for feature documentation
3. Check `README.md` for setup instructions
4. Verify all dependencies are correctly installed

## Quick Fixes Checklist

- [ ] Node modules installed: `npm install`
- [ ] Browser cache cleared
- [ ] Local storage cleared (if cart issues)
- [ ] Using a modern browser
- [ ] Development server running: `npm run dev`
- [ ] No port conflicts (default: 5173)
