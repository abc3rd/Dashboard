import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Sparkles, Settings, MessageSquare, Book } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: 'Home', icon: MessageSquare, label: 'Ask' },
    { name: 'RouterPacket', icon: Settings, label: 'Router Packet' },
    { name: 'UcpApiDocs', icon: Book, label: 'API Docs' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link 
              to={createPageUrl('Home')} 
              className="flex items-center gap-2 text-slate-900 hover:text-slate-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg hidden sm:block">UCP Router</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={createPageUrl(item.name)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    currentPageName === item.name
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:block">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="py-8 mt-12 border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            Universal Command Protocol • AI Router v1.0
          </p>
        </div>
      </footer>

      <Toaster position="bottom-right" />
    </div>
  );
}