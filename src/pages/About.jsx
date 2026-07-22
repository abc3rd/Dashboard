import React from 'react';
import { Zap, Brain, Target, Users, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function About() {
  const features = [
    { icon: Zap, title: 'Intelligent Routing', desc: 'Routes prompts to the optimal AI model based on configurable, deterministic selection rules.' },
    { icon: Brain, title: 'Multi-Model Support', desc: 'Supports multiple AI models with distinct cost and quality profiles, choosing the right one per query.' },
    { icon: Target, title: 'Cost Optimization', desc: 'Reduces API costs by using fast, economical models for simple queries and reserving premium models for complex ones.' },
    { icon: Users, title: 'Built for Developers', desc: 'Designed for teams and businesses that need fine-grained control over AI model distribution.' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-brand-dark mb-6">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">About UCP Router</h1>
        </div>

        {/* Main content - 150+ words */}
        <div className="prose prose-lg max-w-none space-y-6 mb-10">
          <p className="text-lg text-muted-foreground leading-relaxed">
            <strong className="text-foreground">UCP Router</strong> is an AI routing platform built by
            Omega UI, LLC. It uses the <strong className="text-foreground">Universal Command Protocol (UCP)</strong> to
            intelligently route user prompts to the most suitable AI model based on configurable, deterministic
            selection rules. Rather than relying on a single model for every query, UCP Router evaluates prompt
            characteristics—such as length, keywords, and complexity—to choose between fast, cost-efficient models
            and higher-quality, more capable ones. This approach significantly reduces API costs while maintaining
            response quality.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed">
            The platform is designed for <strong className="text-foreground">developers, businesses, and organizations</strong> that
            rely on AI-powered question answering and want fine-grained control over how their queries are distributed
            across multiple models. Administrators can configure routing rules, set fallback models, and monitor
            performance through a real-time dashboard that tracks query volume, latency, model utilization, and
            projected cost savings. The UCP Router Packet is a portable, standardized configuration file that
            defines all routing behavior—making it easy to version, share, and deploy across environments.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed">
            UCP Router is developed and maintained by <strong className="text-foreground">Omega UI, LLC</strong>.
            The project aims to make AI model routing transparent, portable, and deterministic—interpreting each
            prompt once and executing it infinitely across the optimal model.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {features.map((feature, idx) => (
            <Card key={idx} className="border border-border bg-card/80 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground mb-1">{feature.title}</h2>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}