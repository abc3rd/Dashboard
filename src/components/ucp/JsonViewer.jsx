import React from 'react';
import { cn } from '@/lib/utils';

export default function JsonViewer({ data, className }) {
  const formatJson = (obj, indent = 0) => {
    if (obj === null) return <span className="text-slate-400">null</span>;
    if (obj === undefined) return <span className="text-slate-400">undefined</span>;
    
    if (typeof obj === 'string') {
      return <span className="text-emerald-600">"{obj}"</span>;
    }
    
    if (typeof obj === 'number') {
      return <span className="text-blue-600">{obj}</span>;
    }
    
    if (typeof obj === 'boolean') {
      return <span className="text-violet-600">{obj.toString()}</span>;
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return <span className="text-slate-500">[]</span>;
      return (
        <span>
          <span className="text-slate-500">[</span>
          <div style={{ marginLeft: (indent + 1) * 16 }}>
            {obj.map((item, i) => (
              <div key={i}>
                {formatJson(item, indent + 1)}
                {i < obj.length - 1 && <span className="text-slate-400">,</span>}
              </div>
            ))}
          </div>
          <span className="text-slate-500">]</span>
        </span>
      );
    }
    
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) return <span className="text-slate-500">{'{}'}</span>;
      return (
        <span>
          <span className="text-slate-500">{'{'}</span>
          <div style={{ marginLeft: (indent + 1) * 16 }}>
            {keys.map((key, i) => (
              <div key={key}>
                <span className="text-rose-600">"{key}"</span>
                <span className="text-slate-400">: </span>
                {formatJson(obj[key], indent + 1)}
                {i < keys.length - 1 && <span className="text-slate-400">,</span>}
              </div>
            ))}
          </div>
          <span className="text-slate-500">{'}'}</span>
        </span>
      );
    }
    
    return <span>{String(obj)}</span>;
  };

  return (
    <div
      className={cn(
        'bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-sm overflow-auto',
        className
      )}
    >
      <pre className="whitespace-pre-wrap">{formatJson(data)}</pre>
    </div>
  );
}