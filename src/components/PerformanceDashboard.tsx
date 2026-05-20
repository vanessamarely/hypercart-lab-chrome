import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChartLine, 
  Clock, 
  Eye, 
  Gauge, 
  Layout, 
  Cursor, 
  ArrowsClockwise,
  X,
  TrendUp,
  Warning,
  CheckCircle,
  Download,
  Copy
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useWebVitals, useCustomMetrics, usePerformanceExport } from '@/hooks/use-web-vitals';
import { toast } from 'sonner';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  entries?: PerformanceEntry[];
}

interface PerformanceMetrics {
  lcp?: WebVitalMetric;
  fid?: WebVitalMetric;
  cls?: WebVitalMetric;
  inp?: WebVitalMetric;
  fcp?: WebVitalMetric;
  ttfb?: WebVitalMetric;
}

interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
}

const THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  inp: { good: 200, poor: 500 },
  fcp: { good: 1800, poor: 3000 },
  ttfb: { good: 800, poor: 1800 },
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function formatValue(name: string, value: number): string {
  if (name === 'cls') {
    return value.toFixed(3);
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}s`;
  }
  return `${Math.round(value)}ms`;
}

function getRatingColor(rating: 'good' | 'needs-improvement' | 'poor'): string {
  switch (rating) {
    case 'good':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'needs-improvement':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'poor':
      return 'text-red-600 bg-red-50 border-red-200';
  }
}

function getRatingIcon(rating: 'good' | 'needs-improvement' | 'poor') {
  switch (rating) {
    case 'good':
      return <CheckCircle weight="fill" className="text-green-600" />;
    case 'needs-improvement':
      return <Warning weight="fill" className="text-orange-600" />;
    case 'poor':
      return <Warning weight="fill" className="text-red-600" />;
  }
}

export function PerformanceDashboard({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const vitals = useWebVitals({
    enabled: visible,
    reportToConsole: true,
  });
  const { customMetrics } = useCustomMetrics();
  const { exportData, copyToClipboard } = usePerformanceExport();
  const [resources, setResources] = useState<ResourceTiming[]>([]);
  const [longTasks, setLongTasks] = useState<PerformanceEntry[]>([]);
  const [navigationTiming, setNavigationTiming] = useState<PerformanceNavigationTiming | null>(null);

  useEffect(() => {
    if (!visible) return;

    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      const navTiming = navEntries[0] as PerformanceNavigationTiming;
      setNavigationTiming(navTiming);
    }

    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const resourceTimings: ResourceTiming[] = resourceEntries.map(entry => ({
      name: entry.name.split('/').pop() || entry.name,
      duration: entry.duration,
      size: entry.transferSize || 0,
      type: entry.initiatorType,
    })).sort((a, b) => b.duration - a.duration).slice(0, 20);
    
    setResources(resourceTimings);

    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        setLongTasks(prev => [...prev, ...list.getEntries()]);
      });
      longTaskObserver.observe({ type: 'longtask', buffered: true });
      
      return () => longTaskObserver.disconnect();
    } catch (e) {
      console.warn('Long task observation not supported');
    }
  }, [visible]);

  const handleExport = () => {
    exportData();
    toast.success('Performance metrics exported');
  };

  const handleCopy = async () => {
    const success = await copyToClipboard();
    if (success) {
      toast.success('Metrics copied to clipboard');
    } else {
      toast.error('Failed to copy metrics');
    }
  };

  if (!visible) return null;

  const coreMetrics = [
    { 
      key: 'lcp', 
      label: 'Largest Contentful Paint', 
      description: 'Loading performance',
      icon: <Eye size={20} />,
    },
    { 
      key: 'fid', 
      label: 'First Input Delay', 
      description: 'Interactivity',
      icon: <Cursor size={20} />,
    },
    { 
      key: 'cls', 
      label: 'Cumulative Layout Shift', 
      description: 'Visual stability',
      icon: <Layout size={20} />,
    },
    { 
      key: 'inp', 
      label: 'Interaction to Next Paint', 
      description: 'Responsiveness',
      icon: <Cursor size={20} />,
    },
  ];

  const otherMetrics = [
    { 
      key: 'fcp', 
      label: 'First Contentful Paint',
      icon: <Clock size={16} />,
    },
    { 
      key: 'ttfb', 
      label: 'Time to First Byte',
      icon: <Gauge size={16} />,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto performance-dashboard-overlay">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto animate-in fade-in-0 zoom-in-95 duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <TrendUp size={24} className="text-primary" />
                Core Web Vitals Dashboard
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy size={16} className="mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download size={16} className="mr-2" />
                  Export
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X size={20} />
                </Button>
              </div>
            </div>
            <CardDescription>Real-time performance metrics with detailed attribution</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vitals" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="vitals">Core Vitals</TabsTrigger>
              <TabsTrigger value="custom">Custom Metrics</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="timing">Navigation</TabsTrigger>
              <TabsTrigger value="tasks">Long Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="vitals" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coreMetrics.map(({ key, label, description, icon }) => {
                  const metric = vitals[key as keyof typeof vitals];
                  
                  return (
                    <Card key={key} className={cn(
                      'transition-all hover:shadow-md',
                      metric && getRatingColor(metric.rating)
                    )}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {icon}
                            <div>
                              <CardTitle className="text-base">{label}</CardTitle>
                              <CardDescription className="text-xs">{description}</CardDescription>
                            </div>
                          </div>
                          {metric && getRatingIcon(metric.rating)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {metric ? (
                          <div className="space-y-2">
                            <div className="text-3xl font-bold">
                              {formatValue(key, metric.value)}
                            </div>
                            <Badge variant={metric.rating === 'good' ? 'default' : 'secondary'}>
                              {metric.rating.replace('-', ' ').toUpperCase()}
                            </Badge>
                            {metric.attribution && (
                              <details className="text-xs text-muted-foreground mt-2 cursor-pointer">
                                <summary className="font-medium">Attribution Data</summary>
                                <div className="mt-2 space-y-1 pl-4">
                                  {Object.entries(metric.attribution).map(([attrKey, attrValue]) => (
                                    <div key={attrKey} className="flex justify-between">
                                      <span className="text-muted-foreground">{attrKey}:</span>
                                      <span className="font-mono text-xs">
                                        {typeof attrValue === 'number' ? attrValue.toFixed(2) : String(attrValue)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Waiting for data...
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {otherMetrics.map(({ key, label, icon }) => {
                      const metric = vitals[key as keyof typeof vitals];
                      
                      return (
                        <div key={key} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {icon}
                            <div>
                              <div className="text-sm font-medium">{label}</div>
                              {metric && (
                                <Badge 
                                  variant="outline" 
                                  className={cn('mt-1', getRatingColor(metric.rating))}
                                >
                                  {metric.rating.replace('-', ' ')}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {metric ? (
                            <div className="text-xl font-bold">
                              {formatValue(key, metric.value)}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">—</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="custom" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartLine size={20} />
                    Custom Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Application-specific performance measurements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {customMetrics.length > 0 ? (
                    <div className="space-y-2">
                      {customMetrics.map((metric, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-md"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium">{metric.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Started at {metric.startTime.toFixed(2)}ms
                            </div>
                            {metric.metadata && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {Object.entries(metric.metadata).map(([key, value]) => (
                                  <span key={key} className="mr-2">
                                    {key}: {String(value)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-lg font-mono font-bold">
                            {metric.duration.toFixed(2)}ms
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-8">
                      <div className="mb-2">No custom metrics recorded yet</div>
                      <div className="text-xs">
                        Use <code className="bg-muted px-1 rounded">startMeasure()</code> and{' '}
                        <code className="bg-muted px-1 rounded">endMeasure()</code> in your code
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Timing</CardTitle>
                  <CardDescription>Top 20 slowest resources by load time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {resources.length > 0 ? (
                      resources.map((resource, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{resource.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {resource.type} • {(resource.size / 1024).toFixed(2)} KB
                            </div>
                          </div>
                          <div className="text-sm font-mono font-bold ml-4">
                            {resource.duration.toFixed(2)}ms
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        No resource data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timing" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Navigation Timing</CardTitle>
                  <CardDescription>Detailed breakdown of page load phases</CardDescription>
                </CardHeader>
                <CardContent>
                  {navigationTiming ? (
                    <div className="space-y-3">
                      {[
                        { label: 'DNS Lookup', value: navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart },
                        { label: 'TCP Connection', value: navigationTiming.connectEnd - navigationTiming.connectStart },
                        { label: 'Request Time', value: navigationTiming.responseStart - navigationTiming.requestStart },
                        { label: 'Response Time', value: navigationTiming.responseEnd - navigationTiming.responseStart },
                        { label: 'DOM Processing', value: navigationTiming.domContentLoadedEventEnd - navigationTiming.responseEnd },
                        { label: 'Load Complete', value: navigationTiming.loadEventEnd - navigationTiming.loadEventStart },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                          <div className="text-sm font-medium">{label}</div>
                          <div className="text-sm font-mono font-bold">
                            {value > 0 ? `${value.toFixed(2)}ms` : 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-8">
                      No navigation timing data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowsClockwise size={20} />
                    Long Tasks
                  </CardTitle>
                  <CardDescription>
                    Tasks that blocked the main thread for more than 50ms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {longTasks.length > 0 ? (
                    <div className="space-y-2">
                      {longTasks.map((task, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-md"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium">Long Task #{index + 1}</div>
                            <div className="text-xs text-muted-foreground">
                              Started at {task.startTime.toFixed(2)}ms
                            </div>
                          </div>
                          <Badge variant={task.duration > 100 ? 'destructive' : 'secondary'}>
                            {task.duration.toFixed(2)}ms
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-8">
                      No long tasks detected
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export function PerformanceDashboardButton() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button
        className="fixed bottom-24 right-6 z-50 rounded-full w-14 h-14 shadow-lg"
        onClick={() => setVisible(!visible)}
        title="Performance Dashboard"
        data-cy="performance-dashboard-toggle"
      >
        <TrendUp size={20} />
      </Button>

      <PerformanceDashboard visible={visible} onClose={() => setVisible(false)} />
    </>
  );
}
