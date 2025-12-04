import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Book, Code, Copy, Check, Zap, Server, FileJson, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import JsonViewer from '@/components/ucp/JsonViewer';
import UcpStatusBadge from '@/components/ucp/UcpStatusBadge';
import { UcpRouterService } from '@/components/ucp/UcpService';

function CodeBlock({ code, language = 'javascript' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 hover:bg-slate-700"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <Copy className="w-4 h-4 text-slate-400" />
        )}
      </Button>
    </div>
  );
}

export default function UcpApiDocs() {
  const { data: serviceInfo } = useQuery({
    queryKey: ['ucpRouterInfo'],
    queryFn: () => UcpRouterService.getInfo(),
  });

  const endpoints = [
    {
      name: 'ask',
      method: 'POST',
      description: 'Route a prompt to the appropriate AI model',
      requestExample: `{
  "action": "ask",
  "prompt": "What is the capital of France?"
}`,
      responseExample: `{
  "success": true,
  "prompt": "What is the capital of France?",
  "final_answer": "FAST MODEL: Quick answer...",
  "chosen_model": "fast_model",
  "confidence": 0.75,
  "latency_ms": 234,
  "router_packet_snapshot": { ... }
}`
    },
    {
      name: 'getPacket',
      method: 'POST',
      description: 'Retrieve the current router packet configuration',
      requestExample: `{
  "action": "getPacket"
}`,
      responseExample: `{
  "success": true,
  "packet": {
    "ucp_version": "1.0",
    "command_type": "ai_router",
    "models": [...],
    "selection_policy": {...}
  }
}`
    },
    {
      name: 'updatePacket',
      method: 'POST',
      description: 'Update the router packet configuration',
      requestExample: `{
  "action": "updatePacket",
  "packet": {
    "ucp_version": "1.0",
    "command_type": "ai_router",
    "models": [...],
    "selection_policy": {...},
    "signature": "dev-signature"
  }
}`,
      responseExample: `{
  "success": true,
  "packet": { ... }
}`
    },
    {
      name: 'info',
      method: 'POST',
      description: 'Get service information and health check',
      requestExample: `{
  "action": "info"
}`,
      responseExample: `{
  "success": true,
  "service": "UCP AI Router",
  "version": "1.0",
  "endpoints": {...},
  "models": ["fast_model", "smart_model"]
}`
    }
  ];

  const frontendUsageCode = `import { UcpRouterService } from '@/components/ucp/UcpService';

// Ask a question
const response = await UcpRouterService.ask("What is the capital of France?");
console.log(response.final_answer);
console.log(response.chosen_model);

// Get current router packet
const { packet } = await UcpRouterService.getRouterPacket();
console.log(packet.models);

// Update router packet
await UcpRouterService.updateRouterPacket(newPacket);

// Get service info
const info = await UcpRouterService.getInfo();`;

  const backendUsageCode = `import { base44 } from '@/api/base44Client';

// Call the UCP Router from any backend function
const response = await base44.functions.invoke('ucpRouter', {
  action: 'ask',
  prompt: 'Your question here'
});

// Access the result
const { final_answer, chosen_model, confidence } = response.data;`;

  const typeDefinitions = `// Model description in the routing packet
interface UcpModelDescriptor {
  id: string;
  description: string;
  maxTokens: number;
  costScore: number;
  qualityScore: number;
}

// Selection rule
interface UcpSelectionRule {
  condition: {
    prompt_length_lt?: number;
    prompt_length_gte?: number;
    contains_keywords?: string[];
  };
  choose_model: string;
}

// UCP Router Packet
interface UcpRouterPacket {
  ucp_version: string;
  command_type: string;
  schema: { inputs: string[]; outputs: string[] };
  models: UcpModelDescriptor[];
  selection_policy: {
    rules: UcpSelectionRule[];
    fallback_model: string;
  };
  signature: string;
}

// Ask Response
interface AskResponse {
  success: boolean;
  prompt: string;
  final_answer: string;
  chosen_model: string;
  confidence: number;
  latency_ms: number;
  router_packet_snapshot: UcpRouterPacket;
}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <Book className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">API Documentation</h1>
                <p className="text-sm text-slate-500">UCP Router Service Integration Guide</p>
              </div>
            </div>
            <UcpStatusBadge showDetails />
          </div>
        </div>

        <Tabs defaultValue="endpoints" className="space-y-6">
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger value="endpoints" className="gap-2">
              <Server className="w-4 h-4" />
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="usage" className="gap-2">
              <Code className="w-4 h-4" />
              Usage
            </TabsTrigger>
            <TabsTrigger value="types" className="gap-2">
              <FileJson className="w-4 h-4" />
              Types
            </TabsTrigger>
          </TabsList>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80">
              <CardHeader>
                <CardTitle className="text-lg">Base URL</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="bg-slate-100 px-3 py-2 rounded-lg text-sm block">
                  POST /api/functions/ucpRouter
                </code>
                <p className="text-sm text-slate-500 mt-2">
                  All endpoints use POST with an <code className="bg-slate-100 px-1 rounded">action</code> field to specify the operation.
                </p>
              </CardContent>
            </Card>

            {endpoints.map((endpoint) => (
              <Card key={endpoint.name} className="border-0 shadow-lg bg-white/80">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {endpoint.method}
                    </Badge>
                    <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Request</p>
                    <CodeBlock code={endpoint.requestExample} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Response</p>
                    <CodeBlock code={endpoint.responseExample} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Frontend Usage
                </CardTitle>
                <CardDescription>
                  Use the UcpRouterService client for easy integration in React components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock code={frontendUsageCode} />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Server className="w-5 h-5 text-violet-500" />
                  Backend Usage
                </CardTitle>
                <CardDescription>
                  Call the UCP Router from other backend functions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock code={backendUsageCode} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Types Tab */}
          <TabsContent value="types" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80">
              <CardHeader>
                <CardTitle className="text-lg">TypeScript Definitions</CardTitle>
                <CardDescription>
                  Type definitions for UCP Router data structures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock code={typeDefinitions} language="typescript" />
              </CardContent>
            </Card>

            {serviceInfo?.success && (
              <Card className="border-0 shadow-lg bg-white/80">
                <CardHeader>
                  <CardTitle className="text-lg">Service Info (Live)</CardTitle>
                </CardHeader>
                <CardContent>
                  <JsonViewer data={serviceInfo} className="max-h-60" />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}