# HyperCart Lab - Performance Debugging Demo

A minimal, production-ready React + TypeScript demo app for Chrome DevTools performance debugging conference talks, featuring toggleable performance issues for live demonstrations.

**Experience Qualities**: 
1. Educational - Clear demonstration of performance concepts with before/after comparisons
2. Interactive - Real-time toggles that immediately impact performance metrics
3. Professional - Production-quality code that speakers can confidently present

**Complexity Level**: Light Application (multiple features with basic state)
Multiple routes with focused performance scenarios, persistent debugging state, and clear educational demonstrations without overwhelming complexity.

## Essential Features

**Performance Dashboard**
- Functionality: Real-time Core Web Vitals monitoring dashboard with interactive metrics display
- Purpose: Live visualization of performance metrics during presentations and development
- Trigger: Click floating chart button on bottom right
- Progression: Click dashboard button → View Core Web Vitals → Switch between tabs (Vitals/Resources/Navigation/Tasks) → Monitor real-time changes
- Success criteria: Accurate real-time reporting of LCP, FID, CLS, INP, FCP, and TTFB with color-coded ratings

**Debug Panel System**
- Functionality: Floating gear button reveals comprehensive toggle panel
- Purpose: Live control of performance issues during presentations
- Trigger: URL parameter `?debug=1` shows panel
- Progression: Click gear → View grouped toggles by performance type → Toggle features → See immediate impact
- Success criteria: Toggles persist in localStorage and affect metrics measurably

**Home Page (LCP/CLS Lab)**
- Functionality: Hero image with Core Web Vitals optimization toggles
- Purpose: Demonstrate Largest Contentful Paint and Cumulative Layout Shift fixes
- Trigger: Navigate to home page
- Progression: Load page → Toggle optimizations → Measure with DevTools → Compare results
- Success criteria: Clear LCP timing differences and CLS prevention when optimized

**Products Grid (Coverage/Network)**
- Functionality: Product catalog with third-party script and CSS loading toggles
- Purpose: Show network optimization and code coverage analysis
- Trigger: Navigate to products page
- Progression: View grid → Enable heavy resources → Check Coverage panel → Optimize and retest
- Success criteria: Unused code highlighted in Coverage, network timing improvements

**Product Detail (INP/Long Tasks)**
- Functionality: Interactive product page with thread-blocking simulation
- Purpose: Demonstrate Interaction to Next Paint optimization techniques
- Trigger: Click any product card
- Progression: Click add to cart → Experience delay → Enable optimizations → Retry with smooth interaction
- Success criteria: Long tasks eliminated, INP scores improved

**Search Autocomplete (INP)**
- Functionality: Real-time search with debouncing and worker thread options
- Purpose: Show input responsiveness optimization patterns
- Trigger: Type in search field
- Progression: Type query → Experience blocking → Enable debounce/worker → Notice smooth typing
- Success criteria: No input lag, suggestions load without blocking

## Edge Case Handling
- **Missing Debug Parameter**: Panel stays hidden, app functions normally for production use
- **Broken Worker**: Graceful fallback to main thread processing
- **Heavy Asset Loading**: Loading states prevent user confusion during slow loads
- **Toggle State Conflicts**: Each toggle operates independently without interference

## Design Direction
The design should feel professional and developer-focused - clean, minimalist interface that doesn't distract from the performance concepts being demonstrated. Minimal visual complexity serves the educational purpose better than rich interfaces.

## Color Selection
Complementary (opposite colors) - Using a blue/orange palette to create clear visual distinction between optimized and unoptimized states, helping speakers quickly identify which toggles are active.

- **Primary Color**: Deep Blue (#1e40af) - Professional, trustworthy for main actions
- **Secondary Colors**: Light Blue (#3b82f6) for secondary actions, Neutral Gray (#6b7280) for backgrounds
- **Accent Color**: Vibrant Orange (#f97316) - High contrast for toggle states and performance warnings
- **Foreground/Background Pairings**: 
  - Background (White #ffffff): Dark Gray text (#1f2937) - Ratio 12.6:1 ✓
  - Primary (Deep Blue #1e40af): White text (#ffffff) - Ratio 8.2:1 ✓
  - Accent (Orange #f97316): White text (#ffffff) - Ratio 4.9:1 ✓

## Font Selection
System fonts to eliminate font loading performance issues that could interfere with demos - using the system font stack ensures consistent, fast text rendering across all platforms.

- **Typographic Hierarchy**: 
  - H1 (Page Titles): System Font Stack/32px/font-weight: 700
  - H2 (Section Headers): System Font Stack/24px/font-weight: 600
  - Body Text: System Font Stack/16px/font-weight: 400
  - Code/Toggles: Monospace/14px/font-weight: 500

## Animations
Minimal, purposeful animations that don't interfere with performance measurements - subtle state transitions for toggles and loading indicators that provide feedback without skewing metrics.

- **Purposeful Meaning**: Toggle state changes use 150ms transitions to provide clear feedback
- **Hierarchy of Movement**: Loading states take priority, UI feedback is secondary

## Component Selection
- **Components**: Card for product grid, Button for actions, Switch for toggles, Badge for active count, Dialog for debug panel
- **Customizations**: Debug panel with grouped sections, performance marks display, status indicators
- **States**: Clear active/inactive states for all toggles with visual feedback
- **Icon Selection**: Gear for settings, Play/Pause for toggles, Warning for performance issues
- **Spacing**: 4px/8px/16px/24px grid for consistent rhythm
- **Mobile**: Responsive grid, collapsible debug panel, touch-friendly toggle controls