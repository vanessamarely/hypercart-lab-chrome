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

  const mockTools: MCPTool[] = [
    {
      name: 'analyze_performance',
      description: 'Analyze current page performance metrics and suggest optimizations',
      inputSchema: { type: 'object', properties: { metric: { type: 'string' } } }
    },
    {
      name: 'get_web_vitals',
      description: 'Retrieve current Core Web Vitals measurements',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'simulate_user_flow',
      description: 'Simulate a user interaction flow for testing',
      inputSchema: { 
        type: 'object', 
        properties: { 
          flow: { type: 'string', enum: ['browse', 'search', 'checkout'] } 
        } 
      }
    },
    {
      name: 'capture_trace',
      description: 'Capture performance trace for a specific action',
      inputSchema: { type: 'object', properties: { action: { type: 'string' } } }
    },
    {
      name: 'compare_metrics',
      description: 'Compare performance metrics before and after optimizations',
      inputSchema: { 
        type: 'object', 
        properties: { 
          baseline: { type: 'object' },
          optimized: { type: 'object' }
        } 
      }
    }
  ];

  const mockResources: MCPResource[] = [
    {
      uri: 'perf://current-vitals',
      name: 'Current Web Vitals',
      description: 'Real-time Core Web Vitals data',
      mimeType: 'application/json'
    },
    {
      uri: 'perf://trace-data',
      name: 'Performance Trace',
      description: 'Latest captured performance trace',
      mimeType: 'application/json'
    },
    {
      uri: 'perf://network-waterfall',
      name: 'Network Waterfall',
      description: 'Network request timeline data',
      mimeType: 'application/json'
    },
    {
      uri: 'perf://long-tasks',
      name: 'Long Tasks Report',
      description: 'Detected long tasks blocking the main thread',
      mimeType: 'application/json'
    },
    {
      uri: 'app://debug-flags',
      name: 'Active Debug Flags',
      description: 'Current performance debug configuration',
      mimeType: 'application/json'
    }
  ];

  const examplePrompts = [
    "Analyze the current LCP and suggest optimizations",
    "What's causing layout shifts on this page?",
    "Compare INP before and after using web workers",
    "Generate a test flow for the checkout process",
    "What are the top 3 performance bottlenecks?"
  ];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handlePromptSubmit = async () => {
    if (!customPrompt.trim()) return;
    
    setIsLoading(true);
    setLlmResponse('');
    
    try {
      const promptText = `You are a web performance expert analyzing the HyperCart Lab demo app. 
      
Context: This is a performance debugging demo app with toggleable optimizations for LCP, INP, and CLS.

User question: ${customPrompt}

Provide specific, actionable advice based on Chrome DevTools Performance Panel best practices. Reference specific metrics, traces, and optimization techniques.`;

      const response = await window.spark.llm(promptText, 'gpt-4o-mini');
      setLlmResponse(response);
    } catch (error) {
      toast.error('Failed to get LLM response');
      setLlmResponse('Error: Could not generate response');
    } finally {
      setIsLoading(false);
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
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
            <div className="font-semibold">MCP Info</div>
            <div className="space-y-1 text-muted-foreground">
              <div>• Tools: {mockTools.length} available</div>
              <div>• Resources: {mockResources.length} registered</div>
              <div>• Model: gpt-4o-mini</div>
              <div>• Context: Performance debugging</div>
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
