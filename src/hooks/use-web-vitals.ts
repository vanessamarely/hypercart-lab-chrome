import { useEffect, useState, useCallback } from 'react';
import {
  WebVitalsMetric,
  CustomMetric,
  onCLS,
  onLCP,
  onFID,
  onINP,
  onFCP,
  onTTFB,
  measureCustomMetric,
  startMeasure,
  endMeasure,
  getResourceMetrics,
  exportMetrics,
} from '@/lib/web-vitals';

interface WebVitalsData {
  lcp: WebVitalsMetric | null;
  fid: WebVitalsMetric | null;
  cls: WebVitalsMetric | null;
  inp: WebVitalsMetric | null;
  fcp: WebVitalsMetric | null;
  ttfb: WebVitalsMetric | null;
}

interface UseWebVitalsOptions {
  enabled?: boolean;
  onMetric?: (metric: WebVitalsMetric) => void;
  reportToConsole?: boolean;
  reportToAnalytics?: boolean;
}

export function useWebVitals(options: UseWebVitalsOptions = {}) {
  const {
    enabled = true,
    onMetric,
    reportToConsole = false,
    reportToAnalytics = false,
  } = options;

  const [vitals, setVitals] = useState<WebVitalsData>({
    lcp: null,
    fid: null,
    cls: null,
    inp: null,
    fcp: null,
    ttfb: null,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  const handleMetric = useCallback(
    (metric: WebVitalsMetric) => {
      setVitals((prev) => ({
        ...prev,
        [metric.name.toLowerCase()]: metric,
      }));

      if (reportToConsole) {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
          attribution: metric.attribution,
        });
      }

      if (reportToAnalytics && typeof window !== 'undefined') {
        const event = {
          event: 'web_vitals',
          metric_name: metric.name,
          metric_value: metric.value,
          metric_rating: metric.rating,
          metric_id: metric.id,
        };

        if ((window as any).dataLayer) {
          (window as any).dataLayer.push(event);
        }
      }

      if (onMetric) {
        onMetric(metric);
      }
    },
    [onMetric, reportToConsole, reportToAnalytics]
  );

  useEffect(() => {
    if (!enabled || isInitialized) return;

    onLCP(handleMetric);
    onFID(handleMetric);
    onCLS(handleMetric);
    onINP(handleMetric);
    onFCP(handleMetric);
    onTTFB(handleMetric);

    setIsInitialized(true);
  }, [enabled, isInitialized, handleMetric]);

  return vitals;
}

export function useCustomMetrics() {
  const [customMetrics, setCustomMetrics] = useState<CustomMetric[]>([]);

  const startMetric = useCallback((name: string) => {
    startMeasure(name);
  }, []);

  const stopMetric = useCallback((name: string, metadata?: Record<string, any>) => {
    const metric = endMeasure(name, metadata);
    if (metric) {
      setCustomMetrics((prev) => [...prev, metric]);
    }
    return metric;
  }, []);

  const clearMetrics = useCallback(() => {
    setCustomMetrics([]);
  }, []);

  return {
    customMetrics,
    startMetric,
    stopMetric,
    clearMetrics,
  };
}

export function useResourceMetrics() {
  const [resourceMetrics, setResourceMetrics] = useState<ReturnType<typeof getResourceMetrics> | null>(null);

  useEffect(() => {
    const updateMetrics = () => {
      setResourceMetrics(getResourceMetrics());
    };

    updateMetrics();
    
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  return resourceMetrics;
}

export function usePerformanceExport() {
  const exportData = useCallback(() => {
    const data = exportMetrics();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-metrics-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const copyToClipboard = useCallback(async () => {
    const data = exportMetrics();
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }, []);

  return { exportData, copyToClipboard };
}
