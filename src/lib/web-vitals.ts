export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
  attribution?: Record<string, any>;
}

export interface CustomMetric {
  name: string;
  value: number;
  startTime: number;
  duration: number;
  metadata?: Record<string, any>;
}

type MetricCallback = (metric: WebVitalsMetric) => void;
type CustomMetricCallback = (metric: CustomMetric) => void;

const thresholds = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  INP: { good: 200, needsImprovement: 500 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
};

function getRating(
  name: keyof typeof thresholds,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = thresholds[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

function generateUniqueID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getNavigationType(): string {
  if ('navigation' in performance && typeof performance.navigation === 'object') {
    const navType = (performance as any).navigation.type;
    const typeNames = ['navigate', 'reload', 'back_forward', 'prerender'];
    return typeNames[navType] || 'navigate';
  }
  
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  return navEntry?.type || 'navigate';
}

let clsValue = 0;
let clsEntries: LayoutShift[] = [];

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  sources?: Array<{
    node?: Node;
    previousRect: DOMRectReadOnly;
    currentRect: DOMRectReadOnly;
  }>;
}

export function onCLS(callback: MetricCallback): void {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as LayoutShift[]) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        clsEntries.push(entry);
        
        const attribution: Record<string, any> = {
          largestShiftValue: entry.value,
          largestShiftTime: entry.startTime,
          largestShiftEntry: entry,
        };

        if (entry.sources && entry.sources.length > 0) {
          attribution.largestShiftSource = entry.sources[0];
        }

        callback({
          id: generateUniqueID(),
          name: 'CLS',
          value: clsValue,
          rating: getRating('CLS', clsValue),
          delta: entry.value,
          navigationType: getNavigationType(),
          attribution,
        });
      }
    }
  });

  observer.observe({ type: 'layout-shift', buffered: true });
}

export function onLCP(callback: MetricCallback): void {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
      element?: Element;
      url?: string;
      renderTime?: number;
      loadTime?: number;
    };

    const value = lastEntry.startTime;
    
    const attribution: Record<string, any> = {
      element: lastEntry.element?.tagName || 'unknown',
      url: lastEntry.url || '',
      timeToFirstByte: 0,
      resourceLoadDelay: 0,
      resourceLoadTime: 0,
      elementRenderDelay: 0,
    };

    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      attribution.timeToFirstByte = navEntry.responseStart;
      
      if (lastEntry.url) {
        const resourceEntry = performance.getEntriesByType('resource')
          .find((e) => e.name === lastEntry.url) as PerformanceResourceTiming;
        
        if (resourceEntry) {
          attribution.resourceLoadDelay = resourceEntry.startTime - navEntry.responseStart;
          attribution.resourceLoadTime = resourceEntry.responseEnd - resourceEntry.startTime;
          attribution.elementRenderDelay = lastEntry.startTime - resourceEntry.responseEnd;
        }
      }
    }

    callback({
      id: generateUniqueID(),
      name: 'LCP',
      value,
      rating: getRating('LCP', value),
      delta: value,
      navigationType: getNavigationType(),
      attribution,
    });
  });

  observer.observe({ type: 'largest-contentful-paint', buffered: true });
}

export function onFID(callback: MetricCallback): void {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries() as PerformanceEventTiming[];
    const firstInput = entries[0];
    
    if (firstInput) {
      const value = firstInput.processingStart - firstInput.startTime;
      
      const attribution: Record<string, any> = {
        eventType: firstInput.name,
        eventTime: firstInput.startTime,
        eventTarget: (firstInput.target as Element)?.tagName || 'unknown',
        loadState: document.readyState,
      };

      callback({
        id: generateUniqueID(),
        name: 'FID',
        value,
        rating: getRating('FID', value),
        delta: value,
        navigationType: getNavigationType(),
        attribution,
      });
    }
  });

  observer.observe({ type: 'first-input', buffered: true });
}

export function onINP(callback: MetricCallback): void {
  let maxDuration = 0;
  let maxEntry: PerformanceEventTiming | null = null;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as PerformanceEventTiming[]) {
      if (entry.duration > maxDuration) {
        maxDuration = entry.duration;
        maxEntry = entry;
        
        const attribution: Record<string, any> = {
          eventType: entry.name,
          eventTime: entry.startTime,
          eventTarget: (entry.target as Element)?.tagName || 'unknown',
          inputDelay: entry.processingStart - entry.startTime,
          processingTime: entry.processingEnd - entry.processingStart,
          presentationDelay: entry.startTime + entry.duration - entry.processingEnd,
          loadState: document.readyState,
        };

        callback({
          id: generateUniqueID(),
          name: 'INP',
          value: maxDuration,
          rating: getRating('INP', maxDuration),
          delta: maxDuration,
          navigationType: getNavigationType(),
          attribution,
        });
      }
    }
  });

  try {
    observer.observe({ type: 'event', buffered: true, durationThreshold: 16 } as any);
  } catch (e) {
    observer.observe({ type: 'event', buffered: true });
  }
}

export function onFCP(callback: MetricCallback): void {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        const value = entry.startTime;
        
        const attribution: Record<string, any> = {
          timeToFirstByte: 0,
          firstByteToFCP: 0,
          loadState: document.readyState,
        };

        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navEntry) {
          attribution.timeToFirstByte = navEntry.responseStart;
          attribution.firstByteToFCP = value - navEntry.responseStart;
        }

        callback({
          id: generateUniqueID(),
          name: 'FCP',
          value,
          rating: getRating('FCP', value),
          delta: value,
          navigationType: getNavigationType(),
          attribution,
        });
      }
    }
  });

  observer.observe({ type: 'paint', buffered: true });
}

export function onTTFB(callback: MetricCallback): void {
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (navEntry) {
    const value = navEntry.responseStart;
    
    const attribution: Record<string, any> = {
      waitingTime: navEntry.responseStart - navEntry.requestStart,
      dnsTime: navEntry.domainLookupEnd - navEntry.domainLookupStart,
      connectionTime: navEntry.connectEnd - navEntry.connectStart,
      requestTime: navEntry.responseStart - navEntry.requestStart,
    };

    if (navEntry.secureConnectionStart > 0) {
      attribution.tlsTime = navEntry.connectEnd - navEntry.secureConnectionStart;
    }

    callback({
      id: generateUniqueID(),
      name: 'TTFB',
      value,
      rating: getRating('TTFB', value),
      delta: value,
      navigationType: getNavigationType(),
      attribution,
    });
  }
}

export function measureCustomMetric(
  name: string,
  startMark?: string,
  endMark?: string,
  metadata?: Record<string, any>
): CustomMetric | null {
  try {
    const measureName = `custom-${name}`;
    
    if (!startMark) {
      performance.mark(`${measureName}-start`);
      return null;
    }

    if (!endMark) {
      performance.mark(`${measureName}-end`);
      endMark = `${measureName}-end`;
    }

    const measure = performance.measure(measureName, startMark, endMark);
    
    return {
      name,
      value: measure.duration,
      startTime: measure.startTime,
      duration: measure.duration,
      metadata,
    };
  } catch (error) {
    console.warn(`Failed to measure custom metric: ${name}`, error);
    return null;
  }
}

export function onCustomMetric(name: string, callback: CustomMetricCallback): void {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === `custom-${name}`) {
        callback({
          name,
          value: entry.duration,
          startTime: entry.startTime,
          duration: entry.duration,
        });
      }
    }
  });

  observer.observe({ type: 'measure', buffered: true });
}

export function startMeasure(name: string): void {
  performance.mark(`${name}-start`);
}

export function endMeasure(name: string, metadata?: Record<string, any>): CustomMetric | null {
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;
  
  performance.mark(endMark);
  
  return measureCustomMetric(name, startMark, endMark, metadata);
}

export function measureFunction<T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>
): { result: T; metric: CustomMetric | null } {
  startMeasure(name);
  const result = fn();
  const metric = endMeasure(name, metadata);
  
  return { result, metric };
}

export async function measureAsyncFunction<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<{ result: T; metric: CustomMetric | null }> {
  startMeasure(name);
  const result = await fn();
  const metric = endMeasure(name, metadata);
  
  return { result, metric };
}

export function getLongTasks(): PerformanceEntry[] {
  return performance.getEntriesByType('longtask');
}

export function getResourceMetrics(): {
  totalSize: number;
  totalCount: number;
  byType: Record<string, { count: number; size: number; duration: number }>;
} {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  let totalSize = 0;
  const byType: Record<string, { count: number; size: number; duration: number }> = {};
  
  for (const resource of resources) {
    totalSize += resource.transferSize || 0;
    
    const type = resource.initiatorType || 'other';
    if (!byType[type]) {
      byType[type] = { count: 0, size: 0, duration: 0 };
    }
    
    byType[type].count++;
    byType[type].size += resource.transferSize || 0;
    byType[type].duration += resource.duration;
  }
  
  return {
    totalSize,
    totalCount: resources.length,
    byType,
  };
}

export function exportMetrics(): {
  webVitals: Record<string, any>;
  customMetrics: PerformanceEntry[];
  resources: PerformanceResourceTiming[];
  navigation: PerformanceNavigationTiming | null;
  longTasks: PerformanceEntry[];
} {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const customMetrics = performance.getEntriesByType('measure');
  const longTasks = getLongTasks();
  
  return {
    webVitals: {
      LCP: performance.getEntriesByType('largest-contentful-paint'),
      FCP: performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint'),
      FID: performance.getEntriesByType('first-input'),
      CLS: performance.getEntriesByType('layout-shift'),
    },
    customMetrics,
    resources,
    navigation,
    longTasks,
  };
}
