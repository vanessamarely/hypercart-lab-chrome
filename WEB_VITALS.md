# Advanced Web Vitals Tracking

This project includes a comprehensive Web Vitals tracking system with custom measurements and detailed attribution data.

## Features

### Core Web Vitals Tracking
- **LCP (Largest Contentful Paint)**: Tracks loading performance with element details and timing breakdown
- **FID (First Input Delay)**: Measures initial interactivity with event type and target information
- **CLS (Cumulative Layout Shift)**: Monitors visual stability with shift sources and timing
- **INP (Interaction to Next Paint)**: Tracks responsiveness with input/processing/presentation delays
- **FCP (First Contentful Paint)**: Measures when first content appears
- **TTFB (Time to First Byte)**: Tracks server response time with DNS, TCP, and TLS breakdown

### Attribution Data
Each Web Vital includes detailed attribution information showing:
- **LCP**: Element tag, URL, TTFB, resource load delay/time, element render delay
- **FID**: Event type, time, target element, load state
- **CLS**: Largest shift value/time/source
- **INP**: Event type, input delay, processing time, presentation delay
- **FCP**: TTFB, first byte to FCP timing
- **TTFB**: Waiting time, DNS time, connection time, TLS time

### Custom Metrics
Track application-specific performance measurements:
```typescript
import { startMeasure, endMeasure } from '@/lib/web-vitals';

// Simple measurement
startMeasure('data-fetch');
const data = await fetchData();
const metric = endMeasure('data-fetch');

// With metadata
startMeasure('render-list');
renderList(items);
endMeasure('render-list', { itemCount: items.length });
```

### React Hooks

#### useWebVitals
```typescript
import { useWebVitals } from '@/hooks/use-web-vitals';

function MyComponent() {
  const vitals = useWebVitals({
    enabled: true,
    reportToConsole: true,
    onMetric: (metric) => {
      console.log(metric.name, metric.value, metric.rating);
    }
  });

  return (
    <div>
      {vitals.lcp && (
        <div>
          LCP: {vitals.lcp.value}ms - {vitals.lcp.rating}
        </div>
      )}
    </div>
  );
}
```

#### useCustomMetrics
```typescript
import { useCustomMetrics } from '@/hooks/use-web-vitals';

function MyComponent() {
  const { customMetrics, startMetric, stopMetric } = useCustomMetrics();

  const handleAction = () => {
    startMetric('user-action');
    doSomething();
    stopMetric('user-action', { userId: 123 });
  };

  return (
    <div>
      {customMetrics.map(m => (
        <div key={m.name}>{m.name}: {m.duration}ms</div>
      ))}
    </div>
  );
}
```

#### usePerformanceExport
```typescript
import { usePerformanceExport } from '@/hooks/use-web-vitals';

function MyComponent() {
  const { exportData, copyToClipboard } = usePerformanceExport();

  return (
    <div>
      <button onClick={exportData}>Export Metrics (JSON)</button>
      <button onClick={copyToClipboard}>Copy to Clipboard</button>
    </div>
  );
}
```

## Core API

### Web Vitals Observers
```typescript
import { onLCP, onFID, onCLS, onINP, onFCP, onTTFB } from '@/lib/web-vitals';

onLCP((metric) => {
  console.log('LCP:', metric.value, metric.attribution);
});

onINP((metric) => {
  console.log('INP:', metric.value);
  console.log('Input delay:', metric.attribution.inputDelay);
  console.log('Processing time:', metric.attribution.processingTime);
});
```

### Custom Measurements
```typescript
import { measureFunction, measureAsyncFunction } from '@/lib/web-vitals';

// Synchronous function
const { result, metric } = measureFunction('calculate', () => {
  return expensiveCalculation();
}, { operation: 'fibonacci' });

// Asynchronous function
const { result, metric } = await measureAsyncFunction('api-call', async () => {
  return await fetch('/api/data');
}, { endpoint: '/api/data' });
```

### Resource Metrics
```typescript
import { getResourceMetrics } from '@/lib/web-vitals';

const metrics = getResourceMetrics();
console.log('Total resources:', metrics.totalCount);
console.log('Total size:', metrics.totalSize);
console.log('By type:', metrics.byType);
```

### Export All Metrics
```typescript
import { exportMetrics } from '@/lib/web-vitals';

const allMetrics = exportMetrics();
// Returns: { webVitals, customMetrics, resources, navigation, longTasks }
```

## Performance Dashboard

The dashboard displays all metrics in an organized interface with:
- **Core Vitals Tab**: LCP, FID, CLS, INP with detailed attribution
- **Custom Metrics Tab**: Application-specific measurements
- **Resources Tab**: Top 20 slowest resources
- **Navigation Tab**: Detailed page load timing breakdown
- **Long Tasks Tab**: Tasks blocking the main thread >50ms

Access the dashboard by clicking the chart icon button in the bottom-right corner.

## Best Practices

1. **Use the hooks in React components** for automatic cleanup and state management
2. **Leverage attribution data** to identify specific performance bottlenecks
3. **Track custom metrics** for business-critical operations
4. **Export metrics** for offline analysis and reporting
5. **Monitor INP closely** as it's the new Core Web Vital replacing FID

## Browser Support

- **LCP, FID, CLS, FCP, TTFB**: All modern browsers
- **INP**: Chrome 96+, Edge 96+
- **Long Tasks**: Chrome 58+, Edge 79+

The library gracefully handles unsupported features and provides console warnings.

## Performance Impact

The tracking library is designed for minimal performance overhead:
- Uses PerformanceObserver API (passive observation)
- No polling or timers
- Lazy initialization
- Efficient memory usage

## Examples

### Track Page Load Performance
```typescript
import { onLCP, onFCP, onTTFB } from '@/lib/web-vitals';

onTTFB((metric) => {
  if (metric.rating === 'poor') {
    console.warn('Slow server response:', metric.attribution);
  }
});

onFCP((metric) => {
  console.log('First content painted at:', metric.value, 'ms');
});

onLCP((metric) => {
  console.log('LCP element:', metric.attribution.element);
  console.log('LCP timing breakdown:', {
    ttfb: metric.attribution.timeToFirstByte,
    resourceLoadDelay: metric.attribution.resourceLoadDelay,
    resourceLoadTime: metric.attribution.resourceLoadTime,
    renderDelay: metric.attribution.elementRenderDelay,
  });
});
```

### Track User Interactions
```typescript
import { onFID, onINP } from '@/lib/web-vitals';

onFID((metric) => {
  console.log('First interaction:', {
    type: metric.attribution.eventType,
    delay: metric.value,
    target: metric.attribution.eventTarget,
  });
});

onINP((metric) => {
  if (metric.rating === 'poor') {
    console.warn('Slow interaction:', {
      inputDelay: metric.attribution.inputDelay,
      processingTime: metric.attribution.processingTime,
      presentationDelay: metric.attribution.presentationDelay,
    });
  }
});
```

### Monitor Layout Stability
```typescript
import { onCLS } from '@/lib/web-vitals';

onCLS((metric) => {
  if (metric.value > 0.1) {
    console.warn('Layout shift detected:', {
      totalShift: metric.value,
      latestShift: metric.attribution.largestShiftValue,
      time: metric.attribution.largestShiftTime,
      source: metric.attribution.largestShiftSource,
    });
  }
});
```

## License

This tracking system is part of the HyperCart Lab project for performance demonstration purposes.
