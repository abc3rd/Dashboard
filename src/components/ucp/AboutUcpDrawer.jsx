import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Info, Shield, Zap, GitBranch, Server, FileJson } from 'lucide-react';

export default function AboutUcpDrawer() {
  const features = [
    {
      icon: GitBranch,
      title: 'Decoupled Interpretation',
      description: 'UCP separates AI interpretation from execution, enabling efficient routing without repeated inference costs.'
    },
    {
      icon: Zap,
      title: 'Optimal Model Routing',
      description: 'Routes workloads to the most appropriate AI model based on deterministic, inspectable rules.'
    },
    {
      icon: FileJson,
      title: 'Portable Routing Packets',
      description: 'Standardized, modifiable configuration files that define all routing behavior.'
    },
    {
      icon: Server,
      title: 'Multi-AI Translation Layer',
      description: 'Server-level model interoperability enabling seamless switching between AI providers.'
    }
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-slate-900">
          <Info className="w-4 h-4" />
          <span className="hidden sm:inline">About UCP</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="text-left pb-6">
          <div className="flex items-center gap-2 text-violet-600 mb-2">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Patent Pending</span>
          </div>
          <SheetTitle className="text-2xl">Universal Command Protocol (UCP)</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Core Value Proposition */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
            <p className="text-slate-700 leading-relaxed">
              UCP is a revolutionary protocol that decouples AI interpretation from execution. 
              By defining routing logic in standardized packets, organizations can achieve 
              <span className="font-semibold text-slate-900"> significant compute savings </span>
              while maintaining optimal response quality.
            </p>
          </div>

          {/* Key Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Key Innovations</h3>
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">{feature.title}</h4>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Interpret Once, Execute Many */}
          <div className="bg-violet-50 rounded-xl p-5 border border-violet-200">
            <p className="text-violet-900 font-medium text-center">
              "Interpret Once. Execute Infinitely."
            </p>
          </div>

          {/* Patent Info */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Shield className="w-4 h-4" />
              <span>Application No. 63/928,882</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Omega UI, LLC</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}