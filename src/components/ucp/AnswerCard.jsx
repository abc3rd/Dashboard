import React, { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import ModelBadge from './ModelBadge';
import ConfidenceMeter from './ConfidenceMeter';
import JsonViewer from './JsonViewer';

export default function AnswerCard({ result }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
      <CardContent className="p-6 space-y-5">
        {/* Header with model info */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Answered by</span>
            <ModelBadge modelId={result.chosen_model} />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{result.latency_ms}ms</span>
          </div>
        </div>

        {/* Answer content */}
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="text-card-foreground leading-relaxed mb-3">{children}</p>,
              strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
              ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-card-foreground">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 text-card-foreground">{children}</ol>,
              li: ({ children }) => <li className="text-card-foreground">{children}</li>,
              h1: ({ children }) => <h1 className="text-xl font-bold text-foreground mt-4 mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-bold text-foreground mt-3 mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold text-foreground mt-2 mb-1">{children}</h3>,
            }}
          >
            {result.final_answer}
          </ReactMarkdown>
        </div>

        {/* Confidence meter */}
        <div className="pt-2">
          <ConfidenceMeter value={result.confidence} />
        </div>

        {/* Show details toggle */}
        <div className="pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-muted-foreground hover:text-card-foreground p-0 h-auto"
          >
            <FileJson className="w-4 h-4 mr-2" />
            {showDetails ? 'Hide' : 'Show'} Router Packet
            {showDetails ? (
              <ChevronUp className="w-4 h-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </Button>

          {showDetails && (
            <div className="mt-4">
              <JsonViewer data={result.router_packet_snapshot} className="max-h-80" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}