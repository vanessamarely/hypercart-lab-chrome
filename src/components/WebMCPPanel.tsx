import React, { useState, useEffect } from 'react';
import { Globe, CaretDown, CaretRight, Copy, CheckCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface MCPTool {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
}

interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export function WebMCPPanel() {
  const [expanded, setExpanded] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [llmResponse, setLlmResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [toolOutput, setToolOutput] = useState<string>('');

  const mockTools: MCPTool[] = [
    {
      name: 'analyze_lcp',
      description: 'Deep analysis of Largest Contentful Paint including element attribution, critical path, and preload opportunities',
      inputSchema: { 
        type: 'object', 
        properties: { 
          includeWaterfall: { type: 'boolean', description: 'Include network waterfall analysis' },
          checkPreload: { type: 'boolean', description: 'Check for preload opportunities' }
        } 
      }
    },
    {
      name: 'analyze_inp',
      description: 'Analyze Interaction to Next Paint with long task detection, event handler optimization, and main thread blocking analysis',
      inputSchema: { 
        type: 'object', 
        properties: { 
          interactionType: { type: 'string', enum: ['click', 'keyboard', 'touch', 'all'] },
          identifyBlockers: { type: 'boolean', description: 'Identify main thread blockers' }
        } 
      }
    },
    {
      name: 'analyze_cls',
      description: 'Investigate Cumulative Layout Shift sources including late-loading content, missing dimensions, and font swaps',
      inputSchema: { 
        type: 'object', 
        properties: { 
          trackShiftSources: { type: 'boolean', description: 'Track individual shift sources' },
          checkFontLoading: { type: 'boolean', description: 'Analyze font loading impact' }
        } 
      }
    },
    {
      name: 'analyze_resource_timing',
      description: 'Detailed resource timing analysis including render-blocking resources, compression opportunities, and cache efficiency',
      inputSchema: { 
        type: 'object', 
        properties: { 
          resourceType: { type: 'string', enum: ['script', 'stylesheet', 'image', 'font', 'all'] },
          threshold: { type: 'number', description: 'Duration threshold in ms' }
        } 
      }
    },
    {
      name: 'detect_long_tasks',
      description: 'Identify and analyze long tasks (>50ms) blocking the main thread with attribution and optimization suggestions',
      inputSchema: { 
        type: 'object', 
        properties: { 
          minDuration: { type: 'number', description: 'Minimum task duration in ms (default: 50)' },
          includeStackTrace: { type: 'boolean' }
        } 
      }
    },
    {
      name: 'analyze_network_waterfall',
      description: 'Generate network waterfall analysis with critical path identification and parallelization opportunities',
      inputSchema: { 
        type: 'object', 
        properties: { 
          showCriticalPath: { type: 'boolean' },
          groupByDomain: { type: 'boolean' }
        } 
      }
    },
    {
      name: 'measure_render_blocking',
      description: 'Identify render-blocking resources and calculate their impact on FCP/LCP',
      inputSchema: { 
        type: 'object', 
        properties: { 
          calculateSavings: { type: 'boolean', description: 'Calculate potential time savings' }
        } 
      }
    },
    {
      name: 'analyze_javascript_execution',
      description: 'Analyze JavaScript execution time, parse/compile costs, and third-party script impact',
      inputSchema: { 
        type: 'object', 
        properties: { 
          includeThirdParty: { type: 'boolean' },
          showBreakdown: { type: 'boolean', description: 'Show parse vs execution breakdown' }
        } 
      }
    },
    {
      name: 'check_image_optimization',
      description: 'Audit image loading including format recommendations, lazy loading opportunities, and size optimization',
      inputSchema: { 
        type: 'object', 
        properties: { 
          checkFormats: { type: 'boolean', description: 'Check for modern format opportunities' },
          checkSizing: { type: 'boolean', description: 'Check for oversized images' }
        } 
      }
    },
    {
      name: 'analyze_cache_efficiency',
      description: 'Evaluate cache hit rates, cache-control headers, and CDN effectiveness',
      inputSchema: { 
        type: 'object', 
        properties: { 
          resourceTypes: { type: 'array', items: { type: 'string' } }
        } 
      }
    },
    {
      name: 'generate_optimization_report',
      description: 'Generate comprehensive performance optimization report with prioritized recommendations',
      inputSchema: { 
        type: 'object', 
        properties: { 
          format: { type: 'string', enum: ['markdown', 'json', 'html'] },
          includePriority: { type: 'boolean' }
        } 
      }
    },
    {
      name: 'compare_before_after',
      description: 'Compare performance metrics before and after optimization changes with delta calculations',
      inputSchema: { 
        type: 'object', 
        properties: { 
          baselineSnapshot: { type: 'string', description: 'Baseline snapshot ID' },
          metrics: { type: 'array', items: { type: 'string' } }
        } 
      }
    },
    {
      name: 'simulate_throttling',
      description: 'Simulate different network/CPU conditions and predict performance impact',
      inputSchema: { 
        type: 'object', 
        properties: { 
          networkProfile: { type: 'string', enum: ['3G', '4G', 'slow-4G', 'offline'] },
          cpuThrottling: { type: 'number', description: 'CPU throttling multiplier' }
        } 
      }
    },
    {
      name: 'trace_critical_path',
      description: 'Trace critical rendering path and identify dependencies causing delays',
      inputSchema: { 
        type: 'object', 
        properties: { 
          targetMetric: { type: 'string', enum: ['LCP', 'FCP', 'FMP'] }
        } 
      }
    },
    {
      name: 'audit_third_party_impact',
      description: 'Measure third-party script impact on main thread time, load time, and memory',
      inputSchema: { 
        type: 'object', 
        properties: { 
          blockingTime: { type: 'boolean' },
          memoryUsage: { type: 'boolean' }
        } 
      }
    }
  ];

  const mockResources: MCPResource[] = [
    {
      uri: 'perf://current-vitals',
      name: 'Current Web Vitals',
      description: 'Real-time Core Web Vitals (LCP, INP, CLS, FCP, TTFB)',
      mimeType: 'application/json'
    },
    {
      uri: 'perf://lcp-attribution',
      name: 'LCP Attribution',
      description: 'Detailed LCP element, timing breakdown, and render path',
      mimeType: 'application/json'
    },
    {
      uri: 'perf://inp-interactions',
      name: 'INP Interactions',
      description: 'All user interactions with processing time and attribution',
      mimeType: 'application/json'
    },
    {
      uri: 'perf://cls-shifts',
      name: 'CLS Shift Sources',
      description: 'Individual layout shifts with element attribution',
      mimeType: 'application/json'
    },
    {
      uri: 'perf://resource-timing',
      name: 'Resource Timing',
      description: 'Detailed timing for all resources (scripts, styles, images, fonts)',
      mimeType: 'application/json'
    },
    {
      uri: 'perf://network-waterfall',
      name: 'Network Waterfall',
      description: 'Network request timeline with dependencies and priorities',
      mimeType: 'application/json'
    },
    {
      uri: 'perf://long-tasks',
      name: 'Long Tasks Report',
      description: 'Tasks >50ms blocking the main thread with stack traces',
      mimeType: 'application/json'
    },
    {
      uri: 'perf://render-blocking',
      name: 'Render-Blocking Resources',
      description: 'Resources blocking FCP/LCP with optimization opportunities',
      mimeType: 'application/json'
    },
    {
      uri: 'perf://javascript-execution',
      name: 'JavaScript Execution',
      description: 'Parse, compile, and execution time for all scripts',
      mimeType: 'application/json'
    },
    {
      uri: 'perf://navigation-timing',
      name: 'Navigation Timing',
      description: 'Complete navigation timing breakdown (DNS, TCP, TLS, etc.)',
      mimeType: 'application/json'
    },
    {
      uri: 'perf://memory-usage',
      name: 'Memory Usage',
      description: 'JavaScript heap size and DOM node count',
      mimeType: 'application/json'
    },
    {
      uri: 'perf://cache-analysis',
      name: 'Cache Analysis',
      description: 'Cache hit/miss rates and header analysis',
      mimeType: 'application/json'
    },
    {
      uri: 'perf://third-party-impact',
      name: 'Third-Party Impact',
      description: 'Third-party script blocking time and resource usage',
      mimeType: 'application/json'
    },
    {
      uri: 'perf://custom-marks',
      name: 'Custom Performance Marks',
      description: 'Application-specific performance measurements',
      mimeType: 'application/json'
    },
    {
      uri: 'app://debug-flags',
      name: 'Active Debug Flags',
      description: 'Current performance debug configuration and toggles',
      mimeType: 'application/json'
    },
    {
      uri: 'app://optimization-history',
      name: 'Optimization History',
      description: 'Timeline of applied optimizations and their impact',
      mimeType: 'application/json'
    }
  ];

  const examplePrompts = [
    "Why is my LCP slow? Analyze the critical rendering path and suggest preload opportunities",
    "Identify all long tasks >50ms and recommend code-splitting strategies",
    "What's causing layout shifts? Check for missing image dimensions and late-loading content",
    "Analyze render-blocking resources and calculate potential FCP improvement",
    "Compare INP before and after using web workers for heavy computations",
    "Which third-party scripts are blocking the main thread the most?",
    "Audit all images for format optimization and lazy loading opportunities",
    "Generate a prioritized optimization report with estimated impact",
    "Trace the critical path for LCP element and identify bottlenecks",
    "What cache optimization opportunities exist for repeat visits?"
  ];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const executeTool = async (toolName: string) => {
    setSelectedTool(toolName);
    setToolOutput('');
    setIsLoading(true);

    try {
      let result = '';

      switch (toolName) {
        case 'analyze_lcp':
          result = await analyzeLCP();
          break;
        case 'analyze_inp':
          result = await analyzeINP();
          break;
        case 'analyze_cls':
          result = await analyzeCLS();
          break;
        case 'analyze_resource_timing':
          result = await analyzeResourceTiming();
          break;
        case 'detect_long_tasks':
          result = await detectLongTasks();
          break;
        case 'measure_render_blocking':
          result = await measureRenderBlocking();
          break;
        case 'check_image_optimization':
          result = await checkImageOptimization();
          break;
        case 'generate_optimization_report':
          result = await generateOptimizationReport();
          break;
        default:
          result = `Tool "${toolName}" execution not yet implemented.\n\nThis tool would analyze: ${mockTools.find(t => t.name === toolName)?.description}`;
      }

      setToolOutput(result);
      toast.success('Tool executed successfully');
    } catch (error) {
      const errorMsg = `Error executing tool: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setToolOutput(errorMsg);
      toast.error('Tool execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeLCP = async (): Promise<string> => {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries.length === 0) return 'No LCP data available yet. Try interacting with the page.';

    const lcp = lcpEntries[lcpEntries.length - 1] as any;
    const lcpValue = lcp.startTime;
    const lcpElement = lcp.element?.tagName || 'Unknown';

    let analysis = `=== LCP ANALYSIS ===\n\n`;
    analysis += `LCP Value: ${(lcpValue / 1000).toFixed(2)}s\n`;
    analysis += `LCP Element: ${lcpElement}\n`;
    analysis += `Rating: ${lcpValue < 2500 ? '✓ GOOD' : lcpValue < 4000 ? '⚠ NEEDS IMPROVEMENT' : '✗ POOR'}\n\n`;

    analysis += `BREAKDOWN:\n`;
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (nav) {
      analysis += `- TTFB: ${(nav.responseStart / 1000).toFixed(2)}s\n`;
      analysis += `- Resource Load Delay: ${((lcpValue - nav.responseStart) / 1000).toFixed(2)}s\n`;
    }

    analysis += `\nRECOMMENDATIONS:\n`;
    if (lcpValue > 2500) {
      analysis += `• Add <link rel="preload"> for LCP ${lcpElement}\n`;
      analysis += `• Use fetchpriority="high" on LCP image\n`;
      analysis += `• Consider using modern image formats (WebP/AVIF)\n`;
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const renderBlocking = resources.filter(r => 
      (r.initiatorType === 'link' || r.initiatorType === 'script') && (r as any).renderBlockingStatus === 'blocking'
    );
    if (renderBlocking.length > 0) {
      analysis += `• Remove ${renderBlocking.length} render-blocking resources\n`;
    }

    return analysis;
  };

  const analyzeINP = async (): Promise<string> => {
    let analysis = `=== INP ANALYSIS ===\n\n`;
    
    const longTasks = performance.getEntriesByType('longtask');
    analysis += `Long Tasks Detected: ${longTasks.length}\n\n`;

    if (longTasks.length > 0) {
      analysis += `TOP LONG TASKS (>50ms):\n`;
      longTasks.slice(0, 5).forEach((task, idx) => {
        analysis += `${idx + 1}. Duration: ${task.duration.toFixed(0)}ms at ${(task.startTime / 1000).toFixed(2)}s\n`;
      });
      analysis += `\n`;
    }

    analysis += `RECOMMENDATIONS:\n`;
    analysis += `• Use code splitting to reduce bundle size\n`;
    analysis += `• Move heavy computations to Web Workers\n`;
    analysis += `• Use { passive: true } for scroll/touch listeners\n`;
    analysis += `• Debounce expensive event handlers\n`;
    
    const allResources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const scripts = allResources.filter(r => r.initiatorType === 'script');
    if (scripts.length > 10) {
      analysis += `• Consider lazy-loading ${scripts.length} scripts\n`;
    }

    return analysis;
  };

  const analyzeCLS = async (): Promise<string> => {
    const layoutShifts = performance.getEntriesByType('layout-shift') as any[];
    const clsScore = layoutShifts.reduce((sum, entry) => {
      if (!entry.hadRecentInput) {
        return sum + entry.value;
      }
      return sum;
    }, 0);

    let analysis = `=== CLS ANALYSIS ===\n\n`;
    analysis += `CLS Score: ${clsScore.toFixed(3)}\n`;
    analysis += `Total Shifts: ${layoutShifts.length}\n`;
    analysis += `Rating: ${clsScore < 0.1 ? '✓ GOOD' : clsScore < 0.25 ? '⚠ NEEDS IMPROVEMENT' : '✗ POOR'}\n\n`;

    if (layoutShifts.length > 0) {
      analysis += `SHIFT SOURCES:\n`;
      const significantShifts = layoutShifts.filter(s => s.value > 0.01 && !s.hadRecentInput);
      significantShifts.slice(0, 5).forEach((shift, idx) => {
        analysis += `${idx + 1}. Score: ${shift.value.toFixed(3)} at ${(shift.startTime / 1000).toFixed(2)}s\n`;
      });
      analysis += `\n`;
    }

    analysis += `RECOMMENDATIONS:\n`;
    const imgResources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const images = imgResources.filter(r => r.initiatorType === 'img');
    if (images.length > 0) {
      analysis += `• Add explicit width/height to ${images.length} images\n`;
    }
    analysis += `• Use CSS aspect-ratio for responsive images\n`;
    analysis += `• Reserve space for dynamic content\n`;
    analysis += `• Use font-display: swap with size-adjust\n`;

    return analysis;
  };

  const analyzeResourceTiming = async (): Promise<string> => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let analysis = `=== RESOURCE TIMING ANALYSIS ===\n\n`;
    analysis += `Total Resources: ${resources.length}\n\n`;

    const byType = resources.reduce((acc, r) => {
      acc[r.initiatorType] = (acc[r.initiatorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    analysis += `BY TYPE:\n`;
    Object.entries(byType).forEach(([type, count]) => {
      analysis += `- ${type}: ${count}\n`;
    });

    const slowResources = resources
      .filter(r => r.duration > 100)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    if (slowResources.length > 0) {
      analysis += `\nSLOWEST RESOURCES (>100ms):\n`;
      slowResources.forEach((r, idx) => {
        const name = r.name.split('/').pop() || r.name;
        analysis += `${idx + 1}. ${name.substring(0, 40)}: ${r.duration.toFixed(0)}ms\n`;
      });
    }

    const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    analysis += `\nTOTAL TRANSFER: ${(totalSize / 1024).toFixed(0)}KB\n`;

    return analysis;
  };

  const detectLongTasks = async (): Promise<string> => {
    const longTasks = performance.getEntriesByType('longtask') as PerformanceEntry[];
    
    let analysis = `=== LONG TASKS REPORT ===\n\n`;
    analysis += `Total Long Tasks: ${longTasks.length}\n`;
    
    if (longTasks.length === 0) {
      return analysis + '\n✓ No long tasks detected! Main thread is responsive.\n';
    }

    const totalBlockingTime = longTasks.reduce((sum, task) => sum + (task.duration - 50), 0);
    analysis += `Total Blocking Time: ${totalBlockingTime.toFixed(0)}ms\n\n`;

    analysis += `TASKS:\n`;
    longTasks.forEach((task, idx) => {
      analysis += `${idx + 1}. ${task.duration.toFixed(0)}ms at ${(task.startTime / 1000).toFixed(2)}s\n`;
    });

    analysis += `\nIMPACT:\n`;
    analysis += `• Delays user interactions by ${totalBlockingTime.toFixed(0)}ms\n`;
    analysis += `• Affects INP metric\n`;
    analysis += `• Causes janky scrolling/animations\n`;

    return analysis;
  };

  const measureRenderBlocking = async (): Promise<string> => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const renderBlocking = resources.filter(r => 
      (r.initiatorType === 'link' || r.initiatorType === 'script') && 
      (r as any).renderBlockingStatus === 'blocking'
    );

    let analysis = `=== RENDER-BLOCKING RESOURCES ===\n\n`;
    analysis += `Blocking Resources: ${renderBlocking.length}\n\n`;

    if (renderBlocking.length > 0) {
      analysis += `RESOURCES:\n`;
      renderBlocking.forEach((r, idx) => {
        const name = r.name.split('/').pop() || r.name;
        analysis += `${idx + 1}. ${name}: ${r.duration.toFixed(0)}ms\n`;
      });
      
      const totalDelay = renderBlocking.reduce((sum, r) => sum + r.duration, 0);
      analysis += `\nTotal Blocking Time: ${totalDelay.toFixed(0)}ms\n`;
      analysis += `\nPOTENTIAL SAVINGS:\n`;
      analysis += `• FCP improvement: ~${(totalDelay * 0.7).toFixed(0)}ms\n`;
      analysis += `• LCP improvement: ~${(totalDelay * 0.5).toFixed(0)}ms\n`;
    } else {
      analysis += `✓ No render-blocking resources detected!\n`;
    }

    return analysis;
  };

  const checkImageOptimization = async (): Promise<string> => {
    const allResources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const images = allResources.filter(r => r.initiatorType === 'img');
    
    let analysis = `=== IMAGE OPTIMIZATION AUDIT ===\n\n`;
    analysis += `Total Images: ${images.length}\n\n`;

    const largeImages = images.filter(img => (img.transferSize || 0) > 100000);
    if (largeImages.length > 0) {
      analysis += `LARGE IMAGES (>100KB):\n`;
      largeImages.forEach((img, idx) => {
        const name = img.name.split('/').pop() || img.name;
        analysis += `${idx + 1}. ${name}: ${((img.transferSize || 0) / 1024).toFixed(0)}KB\n`;
      });
      analysis += `\n`;
    }

    analysis += `RECOMMENDATIONS:\n`;
    analysis += `• Use WebP/AVIF formats for better compression\n`;
    analysis += `• Implement responsive images with srcset\n`;
    analysis += `• Add loading="lazy" for below-fold images\n`;
    if (largeImages.length > 0) {
      analysis += `• Compress ${largeImages.length} large images\n`;
    }

    return analysis;
  };

  const generateOptimizationReport = async (): Promise<string> => {
    let report = `=== PERFORMANCE OPTIMIZATION REPORT ===\n\n`;
    
    const lcp = performance.getEntriesByType('largest-contentful-paint').slice(-1)[0] as any;
    const lcpValue = lcp?.startTime || 0;
    const layoutShifts = performance.getEntriesByType('layout-shift') as any[];
    const clsScore = layoutShifts.reduce((sum, entry) => !entry.hadRecentInput ? sum + entry.value : sum, 0);
    const longTasks = performance.getEntriesByType('longtask');

    report += `CURRENT METRICS:\n`;
    report += `• LCP: ${(lcpValue / 1000).toFixed(2)}s ${lcpValue < 2500 ? '✓' : '✗'}\n`;
    report += `• CLS: ${clsScore.toFixed(3)} ${clsScore < 0.1 ? '✓' : '✗'}\n`;
    report += `• Long Tasks: ${longTasks.length}\n\n`;

    report += `PRIORITY RECOMMENDATIONS:\n\n`;
    report += `HIGH PRIORITY:\n`;
    if (lcpValue > 2500) {
      report += `1. Optimize LCP (current: ${(lcpValue / 1000).toFixed(2)}s)\n`;
      report += `   - Add preload for LCP resource\n`;
      report += `   - Use fetchpriority="high"\n\n`;
    }
    if (clsScore > 0.1) {
      report += `2. Fix Layout Shifts (current: ${clsScore.toFixed(3)})\n`;
      report += `   - Add image dimensions\n`;
      report += `   - Reserve space for dynamic content\n\n`;
    }

    report += `MEDIUM PRIORITY:\n`;
    if (longTasks.length > 0) {
      report += `3. Reduce Long Tasks (${longTasks.length} detected)\n`;
      report += `   - Use code splitting\n`;
      report += `   - Move work to Web Workers\n\n`;
    }

    const allResources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    report += `4. Optimize Resources (${allResources.length} total)\n`;
    report += `   - Enable compression\n`;
    report += `   - Implement caching\n`;

    return report;
  };

  const handlePromptSubmit = async () => {
    if (!customPrompt.trim()) return;
    
    setIsLoading(true);
    setLlmResponse('');
    
    try {
      const currentVitals = await getCurrentWebVitals();
      const resourceMetrics = getResourceTimingData();
      const debugFlags = getActiveDebugFlags();
      
      const promptText = `You are a Chrome DevTools Performance expert analyzing the HyperCart Lab demo app.

CONTEXT:
- App: E-commerce performance debugging demo with toggleable optimizations
- Purpose: Teaching performance debugging using the DevTools Performance Loop
- Current Page: ${window.location.pathname}

CURRENT METRICS:
${currentVitals}

RESOURCE OVERVIEW:
${resourceMetrics}

ACTIVE DEBUG FLAGS:
${debugFlags}

USER QUESTION:
${customPrompt}

INSTRUCTIONS:
Provide specific, actionable advice for this demo app. Reference:
1. Specific metric values and their thresholds (LCP <2.5s, INP <200ms, CLS <0.1)
2. Chrome DevTools features to use (Performance panel, Network panel, Coverage)
3. Concrete code changes or configuration tweaks
4. Expected impact on metrics
5. How to verify improvements using the Performance Loop

Focus on techniques that work well in a live demo presentation.`;

      const response = await window.spark.llm(promptText, 'gpt-4o-mini');
      setLlmResponse(response);
    } catch (error) {
      toast.error('Failed to get LLM response');
      setLlmResponse('Error: Could not generate response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentWebVitals = async (): Promise<string> => {
    try {
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      const clsEntries = performance.getEntriesByType('layout-shift');
      const navigationEntries = performance.getEntriesByType('navigation');
      
      let vitalsText = 'Web Vitals:\n';
      
      if (lcpEntries.length > 0) {
        const lcp = lcpEntries[lcpEntries.length - 1] as PerformancePaintTiming;
        vitalsText += `- LCP: ${(lcp.startTime / 1000).toFixed(2)}s\n`;
      }
      
      if (clsEntries.length > 0) {
        const clsScore = (clsEntries as any[]).reduce((sum, entry) => {
          if (!(entry as any).hadRecentInput) {
            return sum + (entry as any).value;
          }
          return sum;
        }, 0);
        vitalsText += `- CLS: ${clsScore.toFixed(3)}\n`;
      }
      
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0] as PerformanceNavigationTiming;
        const fcp = performance.getEntriesByName('first-contentful-paint')[0];
        if (fcp) {
          vitalsText += `- FCP: ${(fcp.startTime / 1000).toFixed(2)}s\n`;
        }
        vitalsText += `- TTFB: ${(nav.responseStart / 1000).toFixed(2)}s\n`;
      }
      
      return vitalsText || 'No vitals data available yet';
    } catch (error) {
      return 'Unable to collect vitals data';
    }
  };

  const getResourceTimingData = (): string => {
    try {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const scripts = resources.filter(r => r.initiatorType === 'script');
      const styles = resources.filter(r => r.initiatorType === 'link' || r.initiatorType === 'css');
      const images = resources.filter(r => r.initiatorType === 'img');
      
      const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const totalDuration = resources.reduce((sum, r) => sum + r.duration, 0);
      
      return `Resources:
- Total: ${resources.length} (${(totalSize / 1024).toFixed(0)}KB)
- Scripts: ${scripts.length} (${scripts.reduce((s, r) => s + r.duration, 0).toFixed(0)}ms)
- Stylesheets: ${styles.length}
- Images: ${images.length}
- Avg Load Time: ${(totalDuration / resources.length).toFixed(0)}ms`;
    } catch (error) {
      return 'Resource data not available';
    }
  };

  const getActiveDebugFlags = (): string => {
    try {
      const flags = JSON.parse(localStorage.getItem('hypercart-debug-flags') || '{}');
      const activeFlags = Object.entries(flags)
        .filter(([_, value]) => value === true)
        .map(([key]) => key);
      
      if (activeFlags.length === 0) {
        return 'Debug Flags: None active (all optimizations ON)';
      }
      
      return `Debug Flags: ${activeFlags.join(', ')}`;
    } catch (error) {
      return 'Debug flags: Unable to read';
    }
  };

  return (
    <Card className="fixed bottom-24 right-6 z-40 w-96 shadow-2xl border-2 border-primary/20">
      <div 
        className="flex items-center justify-between p-3 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Globe size={20} className="text-primary" weight="duotone" />
          <span className="font-semibold text-sm">Web MCP</span>
          <Badge variant="secondary" className="text-xs">Beta</Badge>
        </div>
        {expanded ? <CaretDown size={16} /> : <CaretRight size={16} />}
      </div>

      {expanded && (
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-4">
            Model Context Protocol integration for performance debugging with AI assistance
          </p>

          <Tabs defaultValue="tools" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="execute">Execute</TabsTrigger>
              <TabsTrigger value="prompt">Prompt</TabsTrigger>
            </TabsList>

            <TabsContent value="tools" className="mt-4">
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {mockTools.map((tool) => (
                    <Card key={tool.name} className="p-3 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-mono text-xs font-medium text-primary">
                            {tool.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {tool.description}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(tool.name, tool.name)}
                          className="ml-2"
                        >
                          {copiedItem === tool.name ? (
                            <CheckCircle size={14} className="text-green-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </Button>
                      </div>
                      {tool.inputSchema && (
                        <div className="mt-2 text-xs font-mono bg-muted p-2 rounded">
                          {JSON.stringify(tool.inputSchema, null, 2).substring(0, 100)}...
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="resources" className="mt-4">
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {mockResources.map((resource) => (
                    <Card key={resource.uri} className="p-3 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-xs">
                            {resource.name}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground mt-1">
                            {resource.uri}
                          </div>
                          {resource.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {resource.description}
                            </div>
                          )}
                          {resource.mimeType && (
                            <Badge variant="outline" className="text-xs mt-2">
                              {resource.mimeType}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(resource.uri, resource.name)}
                          className="ml-2"
                        >
                          {copiedItem === resource.name ? (
                            <CheckCircle size={14} className="text-green-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="execute" className="mt-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-2 block">Select Tool to Execute</label>
                  <ScrollArea className="h-40 border rounded p-2">
                    <div className="space-y-1">
                      {mockTools.slice(0, 8).map((tool) => (
                        <Button
                          key={tool.name}
                          variant={selectedTool === tool.name ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => executeTool(tool.name)}
                          disabled={isLoading}
                        >
                          {tool.name}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {isLoading && (
                  <div className="text-xs text-center text-muted-foreground py-4">
                    Executing {selectedTool}...
                  </div>
                )}

                {toolOutput && !isLoading && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium">Tool Output</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(toolOutput, 'Tool Output')}
                      >
                        <Copy size={12} />
                      </Button>
                    </div>
                    <ScrollArea className="h-48 w-full rounded border p-3 bg-muted/50">
                      <pre className="text-xs font-mono whitespace-pre-wrap">{toolOutput}</pre>
                    </ScrollArea>
                  </div>
                )}

                {!selectedTool && !isLoading && (
                  <div className="text-xs text-center text-muted-foreground py-8">
                    Select a tool above to execute it with real performance data
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="prompt" className="mt-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-2 block">Example Prompts</label>
                  <div className="space-y-1">
                    {examplePrompts.map((prompt, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs h-auto py-2 text-left"
                        onClick={() => setCustomPrompt(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Custom Prompt</label>
                  <Textarea
                    placeholder="Ask about performance optimizations..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="text-xs min-h-20"
                  />
                  <Button
                    onClick={handlePromptSubmit}
                    disabled={isLoading || !customPrompt.trim()}
                    className="w-full mt-2"
                    size="sm"
                  >
                    {isLoading ? 'Analyzing...' : 'Ask AI'}
                  </Button>
                </div>

                {llmResponse && (
                  <div>
                    <label className="text-xs font-medium mb-2 block">Response</label>
                    <ScrollArea className="h-40 w-full rounded border p-3">
                      <div className="text-xs whitespace-pre-wrap">{llmResponse}</div>
                    </ScrollArea>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => handleCopy(llmResponse, 'Response')}
                    >
                      <Copy size={14} className="mr-2" />
                      Copy Response
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 p-3 bg-muted rounded text-xs space-y-2">
            <div className="font-semibold">MCP Performance Tools</div>
            <div className="space-y-1 text-muted-foreground">
              <div>• Analysis Tools: {mockTools.length} specialized metrics</div>
              <div>• Data Resources: {mockResources.length} performance sources</div>
              <div>• Real-time Execution: LCP, INP, CLS, Resources</div>
              <div>• AI Model: gpt-4o-mini with performance context</div>
              <div>• Context: Chrome DevTools Performance Loop</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export function WebMCPButton() {
  const [showPanel, setShowPanel] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setShowButton(urlParams.get('debug') === '1');
  }, []);

  if (!showButton) return null;

  return (
    <>
      {showPanel && <WebMCPPanel />}
      <Button
        className="fixed bottom-24 left-6 z-50 rounded-full shadow-lg"
        onClick={() => setShowPanel(!showPanel)}
        variant="secondary"
        size="sm"
      >
        <Globe size={16} className="mr-2" weight="duotone" />
        Web MCP
        <Badge variant="outline" className="ml-2 text-xs">AI</Badge>
      </Button>
    </>
  );
}
