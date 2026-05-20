# HyperCart Lab - Performance Debugging Demo

A production-ready React + TypeScript demo application designed for Chrome DevTools performance debugging conference talks. Features toggleable performance issues for live demonstrations of Core Web Vitals optimization techniques.

> **⚠️ Important**: If you encounter a Vite module error during startup, run `./fix-deps.sh` to reinstall dependencies. See [Quick Start](#quick-start) section below.

## Quick Start

```bash
# Install dependencies
npm install

# If you encounter Vite module errors, run the fix script:
chmod +x fix-deps.sh
./fix-deps.sh

# Start development server
npm run dev

# Open app with debug panel
http://localhost:5173/?debug=1

# Build for production
npm run build

# Serve production build
npm run preview
```

## ⚠️ Troubleshooting Installation

If you see an error like `Cannot find module '.../vite/dist/node/chunks/dist.js'`:

**Quick Fix:**
```bash
# Run the automated fix script
chmod +x fix-deps.sh
./fix-deps.sh
```

**Manual Fix:**
```bash
# Remove corrupted dependencies
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall
npm install
```

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more details.

## Configuration

### Unsplash API Setup

The app uses Unsplash for product images. For best image quality and reliability:

1. Visit [unsplash.com/developers](https://unsplash.com/developers)
2. Create an application to get your Access Key
3. Add your key to `.env` file:

```bash
VITE_UNSPLASH_ACCESS_KEY=your_actual_access_key_here
```

**Without API key**: Falls back to free Unsplash Source API (may have rate limits)
**With API key**: Uses official Unsplash API (higher quality, more reliable)

## Debug Panel Access

- **Development**: Debug panel automatically visible
- **Production**: Add `?debug=1` to URL to show debug panel
- **Toggle Count**: Badge shows number of active performance flags

## Web MCP Integration

The app includes **Web MCP (Model Context Protocol)** integration for AI-powered performance debugging assistance.

### Accessing Web MCP

Add `?debug=1` to the URL to enable both the debug panel and Web MCP features. A "Web MCP" button appears on the bottom left.

### Features

**🛠️ Tools Tab**: Browse available MCP tools for performance analysis
- `analyze_performance` - Get optimization suggestions for current page
- `get_web_vitals` - Retrieve Core Web Vitals measurements
- `simulate_user_flow` - Test user interaction scenarios
- `capture_trace` - Capture performance traces for specific actions
- `compare_metrics` - Compare before/after optimization results

**📦 Resources Tab**: Access app performance data via MCP resource URIs
- `perf://current-vitals` - Real-time Core Web Vitals data
- `perf://trace-data` - Latest captured performance trace
- `perf://network-waterfall` - Network request timeline
- `perf://long-tasks` - Detected long tasks blocking main thread
- `app://debug-flags` - Current debug configuration state

**💬 Prompt Tab**: Ask AI for performance guidance
- Use example prompts or write custom questions
- Get contextual advice based on current app state
- Receive actionable optimization suggestions
- Copy responses for documentation

### Example Use Cases

**During a Talk**:
1. Enable a performance issue (e.g., `simulateLongTask`)
2. Ask MCP: "What's causing INP issues on this page?"
3. Show AI's analysis to audience
4. Apply suggested fix and re-measure

**For Learning**:
- "Explain the difference between LCP and FCP"
- "What are the top 3 performance bottlenecks?"
- "How do I optimize this checkout flow?"

**For Development**:
- Query resources to get structured performance data
- Use tools to automate common debugging tasks
- Generate test scenarios programmatically

## Routes & Performance Labs

### 🏠 Home Page (`/`) - LCP/CLS Lab
**Focus**: Largest Contentful Paint & Cumulative Layout Shift optimization

**Available Toggles**:
- `heroPreload`: Preload hero image for faster LCP
- `heroFetchPriorityHigh`: Use `fetchpriority="high"` attribute
- `fontPreconnect`: Preconnect to Google Fonts
- `reserveHeroSpace`: Reserve space to prevent CLS
- `lateBanner`: Insert banner after 2s (causes CLS when space not reserved)

### 🛍️ Products Grid (`/products`) - Coverage/Network Lab
**Focus**: Network optimization and code coverage analysis

**Available Toggles**:
- `injectThirdParty`: Load heavy blocking third-party script
- `loadExtraCSS`: Load CSS file with unused rules (4KB+ unused styles)
- `lazyOff`: Disable image lazy loading (eager load all 30 images)

### 📱 Product Detail (`/product/:id`) - INP/Long Tasks Lab
**Focus**: Interaction to Next Paint and main thread optimization

**Available Toggles**:
- `listenersPassive`: Use passive event listeners for touch/wheel
- `simulateLongTask`: Block main thread for 120ms on interactions
- `useWorker`: Move heavy formatting to Web Worker

### 🔍 Search Page (`/search`) - INP/Input Lab
**Focus**: Input responsiveness and search optimization

**Available Toggles**:
- `debounce`: Debounce search input (300ms delay)
- `microYield`: Chunk work with micro-yields between processing
- `useWorker`: Perform search in Web Worker (fallback to main thread)

### 🛒 Checkout (`/checkout`) - CLS/UX Lab
**Focus**: Layout stability and user experience

**Available Toggles**:
- `missingSizes`: Remove image dimensions (causes CLS)
- `intrinsicPlaceholders`: Use `content-visibility: auto` for placeholders

## Live Demo Scripts (Conference Runbook)

### 🎯 Demo 1: LCP Optimization (5 minutes)

**Setup**:
1. Open `/?debug=1` in Chrome
2. Open DevTools → Performance panel
3. Turn OFF all LCP flags: `heroPreload`, `heroFetchPriorityHigh`, `fontPreconnect`, `reserveHeroSpace`

**Recording "Before"**:
1. Start Performance recording
2. Refresh page (Cmd/Ctrl+R)
3. Wait for page load to complete
4. Stop recording

**Analysis**:
- Find LCP marker in timeline (usually the hero image)
- Note LCP timing (likely 2-3 seconds)
- Examine network waterfall for hero image loading
- Show resource loading chain: HTML → CSS → JavaScript → Image

**Optimization**:
1. Turn ON `heroPreload` flag
2. Turn ON `heroFetchPriorityHigh` flag  
3. Turn ON `fontPreconnect` flag

**Recording "After"**:
1. Clear cache (DevTools → Network → Disable cache)
2. Start new Performance recording
3. Refresh page
4. Stop recording

**Results to Highlight**:
- LCP improved by 40-60% (typically 1.2-1.8s)
- Hero image loads earlier in waterfall
- Preconnect reduces font loading time
- AI assistance: "Explain this LCP marker and suggest optimizations"

---

### 🎯 Demo 2: INP & Long Tasks (4 minutes)

**Setup**:
1. Navigate to any product detail page
2. Turn ON `simulateLongTask` and `listenersPassive=OFF`
3. Open DevTools → Performance panel

**Recording "Before"**:
1. Start Performance recording with "Web Vitals" checkbox enabled
2. Click "Add to Cart" button multiple times
3. Try scrolling/touching while clicking
4. Stop recording after 10-15 seconds

**Analysis**:
- Identify Long Tasks (red blocks >50ms)
- Find INP markers and measurements
- Show main thread blocking during interactions
- Demonstrate how non-passive listeners cause warnings

**Optimization**:
1. Turn ON `useWorker` flag
2. Turn ON `listenersPassive` flag
3. Turn OFF `simulateLongTask` flag

**Recording "After"**:
1. Start new recording
2. Repeat same interactions
3. Stop recording

**Results to Highlight**:
- Long Tasks eliminated or reduced
- INP scores improved (sub-200ms)
- Smooth scrolling during interactions
- AI assistance: "Analyze these interaction delays and propose fixes"

---

### 🎯 Demo 3: Third-Party Impact & Coverage (3 minutes)

**Setup**:
1. Navigate to Products page
2. Turn ON `injectThirdParty` and `loadExtraCSS`
3. Open DevTools → Coverage panel (Cmd/Ctrl+Shift+P → "Coverage")

**Recording Network Impact**:
1. Open DevTools → Network panel
2. Turn ON `injectThirdParty` flag
3. Refresh page
4. Observe network timing and blocking

**Analysis**:
- Show blocking third-party script impact
- Demonstrate parse/execution time in Network panel
- Point out render-blocking behavior

**Coverage Analysis**:
1. Click Coverage "Record" button
2. Navigate around the site (Products → Search → Home)
3. Stop coverage recording
4. Examine `/extra.css` in results

**Results to Highlight**:
- 90%+ unused CSS in extra.css file (4KB+ unused)
- Third-party script blocks parsing for 200ms+
- Network waterfall shows blocking behavior
- Coverage panel highlights optimization opportunities

**Cleanup Demo**:
1. Turn OFF both flags
2. Show improved loading performance
3. Coverage shows only necessary code loaded

---

## Performance Monitoring Hooks

The app includes comprehensive performance marking for detailed analysis:

```javascript
// Automatic marks created:
'app-start'              // App initialization
'home-page-start/end'    // Home page load
'hero-image-loaded'      // Hero image LCP candidate
'products-page-start/end' // Products page load  
'render-products-start/end' // Product grid rendering
'search-start/end'       // Search operations
'add-to-cart-start/end'  // Cart interactions
'checkout-submit-start/end' // Form submissions
```

## DevTools Analysis Guide

### 🔍 Performance Panel Features
- **Web Vitals**: Enable to see LCP, INP, CLS markers
- **AI Assistance**: Right-click call tree → "Explain with AI"
- **Screenshots**: Enable to see visual progression
- **Memory**: Show memory usage patterns

### 📊 Key Metrics to Monitor
- **LCP (Largest Contentful Paint)**: Target <2.5s
- **INP (Interaction to Next Paint)**: Target <200ms  
- **CLS (Cumulative Layout Shift)**: Target <0.1
- **Long Tasks**: Identify >50ms blocking tasks

### 🛠️ Network Optimization
- **Resource Priority**: Check fetch priority hints
- **Preloading**: Verify preload links in Network
- **Third-Party**: Identify blocking external scripts
- **Coverage**: Find unused CSS/JS for optimization

## Technical Implementation

### Performance Utilities
```typescript
// Block main thread (for demo purposes)
block(120) // Blocks for 120ms

// Performance marking
addPerformanceMark('operation-start')
measurePerformance('operation', 'start', 'end')

// Worker management
const worker = new WorkerManager()
await worker.execute('heavy-task', data)
```

### Flag Management
```typescript
// Get current flags
const flags = getFlags()

// Toggle specific optimization
setFlag('heroPreload', true)

// Check active optimizations
const activeCount = getActiveFlagCount()
```

## Troubleshooting

### Common Issues

**Vite module resolution error** (`Cannot find module 'dist.js'`):
```bash
# Clean install to fix corrupted node_modules
rm -rf node_modules package-lock.json
npm install
```

**Debug panel not showing**:
- Ensure URL contains `?debug=1`
- Check browser console for errors

**Performance measurements not visible**:
- Clear Performance timeline and re-record
- Enable "Web Vitals" checkbox in Performance panel
- Refresh page while recording

**Worker not available**:
- Check `/public/worker.js` exists
- Verify HTTPS or localhost (workers require secure context)
- Falls back to main thread automatically

**Third-party script not loading**:
- Check `/public/thirdparty.js` exists
- Verify network panel shows script request
- Banner should appear at top when loaded

**Images not loading**:
- Check Unsplash API key is correctly set in `.env`
- Verify network requests aren't being blocked
- Check console for CORS or API errors

### Browser Compatibility

- **Chrome 88+**: Full feature support including INP
- **Chrome DevTools**: Required for performance analysis
- **Local Development**: All features work on localhost
- **HTTPS**: Required for Web Workers in production

## File Structure

```
src/
├── components/
│   ├── pages/           # Route components
│   ├── DebugPanel.tsx   # Performance toggle UI
│   ├── Navigation.tsx   # App navigation
│   └── StatusBar.tsx    # Dev status display
├── lib/
│   ├── performance-flags.ts    # Flag management
│   ├── performance-utils.ts    # Perf utilities
│   └── types.ts               # TypeScript types
└── assets/images/       # Demo images
public/
├── thirdparty.js       # Heavy blocking script
├── extra.css          # Unused CSS for Coverage
└── worker.js          # Web Worker for offloading
```

## Conference Tips

### Speaker Preparation
1. **Pre-load tabs**: Have multiple browser tabs ready with different flag combinations
2. **Clear DevTools**: Start each demo with cleared Performance timeline
3. **Network throttling**: Consider simulating slow 3G for more dramatic results
4. **Backup plan**: Screenshots of expected results in case of technical issues

### Audience Engagement
- **Live coding**: Toggle flags in real-time during presentation
- **Before/after comparisons**: Show clear metric improvements
- **AI integration**: Demonstrate DevTools AI features for analysis
- **Q&A scenarios**: Use different flag combinations for audience questions

### Demo Environment
- **Stable connection**: Ensure reliable internet for consistent results
- **Chrome Canary**: Latest DevTools features and AI assistance
- **Screen resolution**: Optimize for projector/screen sharing
- **Audio backup**: Prepare to describe visuals if screen sharing fails

---

**Built for Chrome DevTools performance debugging conferences by the HyperCart Lab team** 🚀