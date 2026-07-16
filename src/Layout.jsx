import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Sparkles, Settings, MessageSquare, Book, Shield, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import AboutUcpDrawer from '@/components/ucp/AboutUcpDrawer';
import { motion, AnimatePresence } from 'framer-motion';

const PAGE_TITLES = {
  Home: 'Ask',
  PerformanceMonitoring: 'Monitoring',
  RouterPacket: 'Router Packet',
  UcpApiDocs: 'API Docs'
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navItems = [
    { name: 'Home', icon: MessageSquare, label: 'Ask' },
    { name: 'PerformanceMonitoring', icon: Activity, label: 'Monitoring' },
    { name: 'RouterPacket', icon: Settings, label: 'Packet' },
    { name: 'UcpApiDocs', icon: Book, label: 'Docs' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Top Navigation */}
      <nav
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border hidden md:block"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link
              to={createPageUrl('Home')}
              className="flex items-center gap-2 text-foreground hover:text-brand transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg hidden sm:block">UCP Router</span>
              <span className="hidden md:flex items-center gap-1 text-xs text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                <Shield className="w-3 h-3" />
                Patent Pending
              </span>
            </Link>

            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={createPageUrl(item.name)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px]",
                    currentPageName === item.name
                      ? "bg-brand text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:block">{item.label}</span>
                </Link>
              ))}
              <div className="hidden md:block ml-2">
                <AboutUcpDrawer />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Minimal Header */}
      <header
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border md:hidden"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-between h-12 px-4">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-foreground">UCP Router</span>
          </Link>
          <span className="text-sm font-medium text-muted-foreground">
            {PAGE_TITLES[currentPageName] || ''}
          </span>
        </div>
      </header>

      {/* Main Content with slide animations */}
      <main className="pb-16 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={createPageUrl(item.name)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-3 min-h-[56px] min-w-[44px] flex-1 transition-colors",
                currentPageName === item.name
                  ? "text-brand"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <footer className="py-8 mt-12 border-t border-border bg-background pb-20 md:pb-8">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link to={createPageUrl('About')} className="text-muted-foreground hover:text-brand transition-colors">
              About
            </Link>
            <span className="text-border">•</span>
            <Link to={createPageUrl('Contact')} className="text-muted-foreground hover:text-brand transition-colors">
              Contact
            </Link>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-brand" />
            <span>Powered by UCP — Patent Pending (Application No. 63/928,882) — Omega UI, LLC</span>
          </div>
        </div>
      </footer>

      <Toaster position="bottom-right" />
    </div>
  );
}