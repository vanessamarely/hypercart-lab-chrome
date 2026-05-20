import React, { useState, useEffect } from 'react';
import { Brain, Bug, ChartLine, Clock, Database, Target, Cpu, Network, CheckCircle, XCircle, Warning, Circle } from '@phosphor-icons/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

interface MCPInteraction {
  id: string;
  timestamp: number;
  tool: string;
  duration: number;
  success: boolean;
  context: string;
}

interface PerformanceSnapshot {
  timestamp: number;
  lcp: number;
  fcp: number;
  cls: number;
  ttfb: number;
  longTasks: number;
}

export function WebMCPDashboard() {
  const [interactions, setInteractions] = useKV<MCPInteraction[]>('mcp-interactions', []);
  const [snapshots, setSnapshots] = useKV<PerformanceSnapshot[]>('mcp-snapshots', []);
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceSnapshot | null>(null);
  const [cartData, setCartData] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    captureCurrentMetrics();
    const interval = setInterval(() => {
      if (isRecording) {
        captureCurrentMetrics();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const captureCurrentMetrics = () => {
    try {
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      const lcp = lcpEntries.length > 0 ? (lcpEntries[lcpEntries.length - 1] as any).startTime : 0;
      
      const fcpEntries = performance.getEntriesByName('first-contentful-paint');
      const fcp = fcpEntries.length > 0 ? fcpEntries[0].startTime : 0;
      
      const clsEntries = performance.getEntriesByType('layout-shift') as any[];
      const cls = clsEntries.reduce((sum, entry) => !entry.hadRecentInput ? sum + entry.value : sum, 0);
      
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const ttfb = navEntries.length > 0 ? navEntries[0].responseStart : 0;
      
      const longTasks = performance.getEntriesByType('longtask').length;

      const snapshot: PerformanceSnapshot = {
        timestamp: Date.now(),
        lcp: lcp,
        fcp: fcp,
        cls: cls,
        ttfb: ttfb,
        longTasks: longTasks
      };

      setCurrentMetrics(snapshot);
    } catch (error) {
      console.error('Error capturing metrics:', error);
    }
  };

  const recordInteraction = (tool: string, duration: number, success: boolean, context: string) => {
    const interaction: MCPInteraction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      tool,
      duration,
      success,
      context
    };
    
    setInteractions(prev => [interaction, ...(prev || []).slice(0, 99)]);
  };

  const executeGetActiveCart = async () => {
    const start = performance.now();
    
    try {
      const cartString = localStorage.getItem('hypercart-cart');
      const cart = cartString ? JSON.parse(cartString) : [];
      
      const cartInfo = {
        itemCount: cart.length,
        totalItems: cart.reduce((sum: number, item: any) => sum + item.quantity, 0),
        items: cart.map((item: any) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
      };
      
      setCartData(cartInfo);
      
      const duration = performance.now() - start;
      recordInteraction('get_active_cart', duration, true, `Retrieved ${cartInfo.itemCount} unique items`);
      
      toast.success('Cart data retrieved via MCP', {
        description: `${cartInfo.totalItems} items in cart`
      });
      
      return cartInfo;
    } catch (error) {
      const duration = performance.now() - start;
      recordInteraction('get_active_cart', duration, false, `Error: ${error}`);
      toast.error('Failed to retrieve cart data');
      return null;
    }
  };

  const executeAnalyzeLCP = async () => {
    const start = performance.now();
    
    try {
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length === 0) {
        throw new Error('No LCP data available');
      }
      
      const lcp = lcpEntries[lcpEntries.length - 1] as any;
      const lcpValue = lcp.startTime;
      const lcpElement = lcp.element?.tagName || 'Unknown';
      
      const duration = performance.now() - start;
      recordInteraction('analyze_lcp', duration, true, `LCP: ${(lcpValue / 1000).toFixed(2)}s on ${lcpElement}`);
      
      toast.success('LCP analyzed', {
        description: `${(lcpValue / 1000).toFixed(2)}s on ${lcpElement}`
      });
    } catch (error) {
      const duration = performance.now() - start;
      recordInteraction('analyze_lcp', duration, false, `Error: ${error}`);
      toast.error('LCP analysis failed');
    }
  };

  const executeDetectLongTasks = async () => {
    const start = performance.now();
    
    try {
      const longTasks = performance.getEntriesByType('longtask');
      const totalBlocking = longTasks.reduce((sum, task) => sum + (task.duration - 50), 0);
      
      const duration = performance.now() - start;
      recordInteraction('detect_long_tasks', duration, true, `Found ${longTasks.length} long tasks, ${totalBlocking.toFixed(0)}ms blocking`);
      
      toast.success('Long tasks detected', {
        description: `${longTasks.length} tasks blocking ${totalBlocking.toFixed(0)}ms`
      });
    } catch (error) {
      const duration = performance.now() - start;
      recordInteraction('detect_long_tasks', duration, false, `Error: ${error}`);
      toast.error('Long task detection failed');
    }
  };

  const executeAnalyzeCLS = async () => {
    const start = performance.now();
    
    try {
      const layoutShifts = performance.getEntriesByType('layout-shift') as any[];
      const cls = layoutShifts.reduce((sum, entry) => !entry.hadRecentInput ? sum + entry.value : sum, 0);
      
      const duration = performance.now() - start;
      recordInteraction('analyze_cls', duration, true, `CLS: ${cls.toFixed(3)} from ${layoutShifts.length} shifts`);
      
      toast.success('CLS analyzed', {
        description: `Score: ${cls.toFixed(3)} (${layoutShifts.length} shifts)`
      });
    } catch (error) {
      const duration = performance.now() - start;
      recordInteraction('analyze_cls', duration, false, `Error: ${error}`);
      toast.error('CLS analysis failed');
    }
  };

  const takeSnapshot = () => {
    if (currentMetrics) {
      setSnapshots(prev => [...(prev || []), currentMetrics].slice(-20));
      toast.success('Performance snapshot saved');
    }
  };

  const clearHistory = () => {
    setInteractions([]);
    setSnapshots([]);
    toast.success('History cleared');
  };

  const getStatusIcon = (value: number, metric: 'lcp' | 'fcp' | 'cls' | 'ttfb') => {
    let isGood = false;
    
    switch (metric) {
      case 'lcp':
        isGood = value < 2500;
        break;
      case 'fcp':
        isGood = value < 1800;
        break;
      case 'cls':
        isGood = value < 0.1;
        break;
      case 'ttfb':
        isGood = value < 800;
        break;
    }
    
    return isGood ? (
      <CheckCircle size={16} className="text-green-500" weight="fill" />
    ) : (
      <Warning size={16} className="text-yellow-500" weight="fill" />
    );
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain size={28} className="text-primary" weight="duotone" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Web MCP Dashboard</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Performance Debugging Interface</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
            >
              <Circle size={16} className="mr-2" weight={isRecording ? "fill" : "regular"} />
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
            <Button variant="outline" size="sm" onClick={takeSnapshot}>
              <Target size={16} className="mr-2" />
              Take Snapshot
            </Button>
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              Clear History
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4">
          <Badge variant="secondary">Chrome DevTools MCP</Badge>
          <Badge variant="outline">Performance Loop</Badge>
          <Badge variant="outline">Real-time Metrics</Badge>
          {isRecording && (
            <Badge className="bg-red-500 animate-pulse">
              <Circle size={12} className="mr-1" weight="fill" />
              Recording
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">LCP</CardTitle>
              {currentMetrics && getStatusIcon(currentMetrics.lcp, 'lcp')}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMetrics ? (currentMetrics.lcp / 1000).toFixed(2) : '--'}s
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: &lt;2.5s
            </p>
            <Progress 
              value={currentMetrics ? Math.min(100, (currentMetrics.lcp / 2500) * 100) : 0} 
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">FCP</CardTitle>
              {currentMetrics && getStatusIcon(currentMetrics.fcp, 'fcp')}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMetrics ? (currentMetrics.fcp / 1000).toFixed(2) : '--'}s
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: &lt;1.8s
            </p>
            <Progress 
              value={currentMetrics ? Math.min(100, (currentMetrics.fcp / 1800) * 100) : 0} 
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">CLS</CardTitle>
              {currentMetrics && getStatusIcon(currentMetrics.cls, 'cls')}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMetrics ? currentMetrics.cls.toFixed(3) : '--'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: &lt;0.1
            </p>
            <Progress 
              value={currentMetrics ? Math.min(100, (currentMetrics.cls / 0.25) * 100) : 0} 
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Long Tasks</CardTitle>
              <Bug size={16} className="text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMetrics?.longTasks || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks &gt;50ms
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tools" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tools">MCP Tools</TabsTrigger>
          <TabsTrigger value="interactions">Interaction Log</TabsTrigger>
          <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
          <TabsTrigger value="cart">Cart Inspector</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available MCP Tools</CardTitle>
              <CardDescription>
                Execute Web MCP tools to debug performance using AI-assisted analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-4"
                  onClick={executeGetActiveCart}
                >
                  <Database size={20} className="mr-3 text-primary" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">get_active_cart</div>
                    <div className="text-xs text-muted-foreground">
                      Query cart without touching UI
                    </div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-4"
                  onClick={executeAnalyzeLCP}
                >
                  <ChartLine size={20} className="mr-3 text-primary" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">analyze_lcp</div>
                    <div className="text-xs text-muted-foreground">
                      Deep LCP analysis with attribution
                    </div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-4"
                  onClick={executeDetectLongTasks}
                >
                  <Cpu size={20} className="mr-3 text-primary" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">detect_long_tasks</div>
                    <div className="text-xs text-muted-foreground">
                      Find main thread blockers
                    </div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-4"
                  onClick={executeAnalyzeCLS}
                >
                  <Target size={20} className="mr-3 text-primary" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">analyze_cls</div>
                    <div className="text-xs text-muted-foreground">
                      Identify layout shift sources
                    </div>
                  </div>
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Brain size={20} className="text-primary mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-semibold text-sm">AI-Powered Debugging</div>
                    <p className="text-xs text-muted-foreground">
                      These MCP tools allow Chrome DevTools MCP extension to query your app's 
                      performance data directly, enabling AI-assisted debugging workflows without 
                      manual UI interaction.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MCP Interaction Log</CardTitle>
              <CardDescription>
                Real-time log of all MCP tool executions and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {!interactions || interactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Network size={48} className="text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No interactions recorded yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Execute MCP tools to see interaction logs here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {interactions.map((interaction) => (
                      <Card key={interaction.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {interaction.success ? (
                              <CheckCircle size={20} className="text-green-500 mt-0.5" weight="fill" />
                            ) : (
                              <XCircle size={20} className="text-red-500 mt-0.5" weight="fill" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm font-semibold">{interaction.tool}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {interaction.duration.toFixed(1)}ms
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{interaction.context}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                <Clock size={12} className="inline mr-1" />
                                {formatTimestamp(interaction.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="snapshots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Snapshots</CardTitle>
              <CardDescription>
                Compare metrics before and after optimizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {!snapshots || snapshots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Target size={48} className="text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No snapshots saved yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click "Take Snapshot" to save current metrics
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(snapshots || []).slice().reverse().map((snapshot, idx) => (
                      <Card key={snapshot.timestamp} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold">
                            Snapshot #{(snapshots || []).length - idx}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(snapshot.timestamp)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          <div>
                            <div className="text-xs text-muted-foreground">LCP</div>
                            <div className="text-sm font-semibold flex items-center gap-1">
                              {(snapshot.lcp / 1000).toFixed(2)}s
                              {getStatusIcon(snapshot.lcp, 'lcp')}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">FCP</div>
                            <div className="text-sm font-semibold flex items-center gap-1">
                              {(snapshot.fcp / 1000).toFixed(2)}s
                              {getStatusIcon(snapshot.fcp, 'fcp')}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">CLS</div>
                            <div className="text-sm font-semibold flex items-center gap-1">
                              {snapshot.cls.toFixed(3)}
                              {getStatusIcon(snapshot.cls, 'cls')}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">TTFB</div>
                            <div className="text-sm font-semibold flex items-center gap-1">
                              {(snapshot.ttfb / 1000).toFixed(2)}s
                              {getStatusIcon(snapshot.ttfb, 'ttfb')}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Long Tasks</div>
                            <div className="text-sm font-semibold">
                              {snapshot.longTasks}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cart Inspector</CardTitle>
              <CardDescription>
                Direct cart data access via get_active_cart MCP tool
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={executeGetActiveCart} className="w-full">
                  <Database size={16} className="mr-2" />
                  Execute get_active_cart
                </Button>

                {cartData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Unique Items</div>
                        <div className="text-3xl font-bold">{cartData.itemCount}</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Total Items</div>
                        <div className="text-3xl font-bold">{cartData.totalItems}</div>
                      </Card>
                    </div>

                    <Card className="p-4 bg-primary/5">
                      <div className="text-sm text-muted-foreground mb-1">Subtotal</div>
                      <div className="text-3xl font-bold">${cartData.subtotal.toFixed(2)}</div>
                    </Card>

                    <Separator />

                    <div>
                      <div className="font-semibold mb-3">Cart Items</div>
                      <ScrollArea className="h-64">
                        {cartData.items.length === 0 ? (
                          <div className="text-center py-8 text-sm text-muted-foreground">
                            Cart is empty
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {cartData.items.map((item: any, idx: number) => (
                              <Card key={idx} className="p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-semibold text-sm">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      ID: {item.productId}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold">${item.price}</div>
                                    <div className="text-xs text-muted-foreground">
                                      Qty: {item.quantity}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>

                    <div className="bg-muted/50 p-3 rounded text-xs">
                      <div className="font-semibold mb-1">MCP Tool Usage</div>
                      <p className="text-muted-foreground">
                        This data was retrieved directly from localStorage using the get_active_cart 
                        MCP tool, allowing AI assistants to query cart state without UI interaction.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
