# HyperCart Lab - Performance Debugging Demo

A production-ready React + TypeScript demo application designed for Chrome DevTools performance debugging conference talks. Features toggleable performance issues for live demonstrations of Core Web Vitals optimization techniques.

## Quick Start

```bash
# Install dependencies
npm install

# Configure Unsplash API (optional but recommended)
# 1. Copy .env file and add your Unsplash access key
cp .env .env.local
# 2. Edit .env.local and replace 'your_unsplash_access_key_here' with your actual key
# Get your key from: https://unsplash.com/developers

# Start development server
npm run dev

# Open app with debug panel
http://localhost:5173/?debug=1

# Build for production
npm run build

# Serve production build
npm run preview
```

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

## Performance Dashboard

The app includes a **real-time Core Web Vitals Dashboard** accessible via the floating chart button (always visible, positioned below the debug panel gear icon).

**Features**:
- **Core Web Vitals**: Live tracking of LCP, FID, CLS, and INP with color-coded ratings (good/needs-improvement/poor)
- **Additional Metrics**: FCP (First Contentful Paint) and TTFB (Time to First Byte)
- **Resource Timing**: Top 20 slowest resources by load time with size and duration
- **Navigation Timing**: Detailed breakdown of DNS, TCP, request/response phases
- **Long Tasks**: Detection and reporting of tasks blocking main thread >50ms

**Rating Thresholds**:
- **LCP**: Good <2.5s, Poor >4s
- **FID**: Good <100ms, Poor >300ms
- **CLS**: Good <0.1, Poor >0.25
- **INP**: Good <200ms, Poor >500ms
- **FCP**: Good <1.8s, Poor >3s
- **TTFB**: Good <800ms, Poor >1.8s

**Usage During Presentations**:
1. Open Performance Dashboard to show baseline metrics
2. Toggle performance flags in Debug Panel
3. Watch metrics update in real-time
4. Switch between tabs to show detailed resource/timing analysis
5. Use color-coded ratings to quickly communicate performance health

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