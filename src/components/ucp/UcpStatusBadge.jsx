import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UcpRouterService } from './UcpService';

export default function UcpStatusBadge({ showDetails = false }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ucpRouterInfo'],
    queryFn: () => UcpRouterService.getInfo(),
    refetchInterval: 30000, // Check every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-xs">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Checking...</span>
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs">
        <XCircle className="w-3 h-3" />
        <span>Offline</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs",
      showDetails && "px-3 py-1.5"
    )}>
      <CheckCircle className="w-3 h-3" />
      <span>Online</span>
      {showDetails && (
        <>
          <span className="text-emerald-400 mx-1">•</span>
          <span>v{data.version}</span>
          <span className="text-emerald-400 mx-1">•</span>
          <span>{data.models?.length || 0} models</span>
        </>
      )}
    </div>
  );
}