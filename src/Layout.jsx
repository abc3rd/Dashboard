import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Sparkles, Settings, MessageSquare, Book, Activity, ChevronLeft, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import AboutUcpDrawer from '@/components/ucp/AboutUcpDrawer';
import { motion, AnimatePresence } from 'framer-motion';

const PAGE_TITLES = {
  Home: 'Ask',
  PerformanceMonitoring: 'Monitoring',
  RouterPacket: 'Router Packet',
  UcpApiDocs: 'API Docs',
  Pricing: 'Pricing',
  ThankYou: 'Thank You',
  PrivacyPolicy: 'Privacy Policy',
  Terms: 'Terms',
  WhitePaper: 'White Paper'
};

// Root bottom-tab screens that show the brand logo instead of a back button.
const ROOT_PAGES = ['Home', 'PerformanceMonitoring', 'RouterPacket', 'Pricing', 'UcpApiDocs'];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [direction, setDirection] = useState(1);
  // Every bottom tab keeps its own navigation stack, so switching tabs restores
  // where the user left off while transitions can still tell forward from backward.
  const tabStacksRef = useRef({});
  const activeTabRef = useRef(null);

  // Detect forward (push) vs backward (pop) navigation for directional transitions.
  // This also keeps the current tab's stack up to date on every route change.
  useEffect(() => {
    const current = location.pathname;
    // Secondary screens (White Paper, Terms, …) belong to the tab that opened them.
    const pageTab = ROOT_PAGES.includes(currentPageName) ? currentPageName : null;
    const tab = pageTab || activeTabRef.current || ROOT_PAGES[0];
    activeTabRef.current = tab;

    const stack = tabStacksRef.current[tab] || [];
    const idx = stack.indexOf(current);
    if (idx === -1) {
      stack.push(current);
      setDirection(1);
    } else if (idx === stack.length - 2) {
      stack.pop();
      setDirection(-1);
    } else if (idx < stack.length - 1) {
      stack.splice(idx + 1);
      setDirection(-1);
    }
    tabStacksRef.current[tab] = stack;
  }, [location.pathname, currentPageName]);

  const handleNavClick = (e, itemName) => {
    if (currentPageName === itemName) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Bottom tab bar: restore the target tab's stack, or start it at the tab root.
  const handleTabClick = (e, tabName) => {
    e.preventDefault();
    const current = location.pathname;
    const rootPath = createPageUrl(tabName);

    if (activeTabRef.current === tabName) {
      // Re-selecting the active tab returns to its root instead of only scrolling.
      const atRoot = current === rootPath || (tabName === ROOT_PAGES[0] && current === '/');
      if (atRoot) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setDirection(-1);
        navigate(rootPath);
        window.scrollTo({ top: 0 });
      }
      return;
    }

    const stack = tabStacksRef.current[tabName] || [];
    const target = stack.length ? stack[stack.length - 1] : rootPath;
    const from = ROOT_PAGES.indexOf(activeTabRef.current);
    const to = ROOT_PAGES.indexOf(tabName);
    setDirection(from !== -1 && to < from ? -1 : 1);
    if (target !== current) navigate(target);
  };
  const navItems = [
    { name: 'Home', icon: MessageSquare, label: 'Ask', ariaLabel: 'Ask a question' },
    { name: 'PerformanceMonitoring', icon: Activity, label: 'Monitoring', ariaLabel: 'Monitoring dashboard' },
    { name: 'RouterPacket', icon: Settings, label: 'Packet', ariaLabel: 'Router packet settings' },
    { name: 'Pricing', icon: Crown, label: 'Pricing', ariaLabel: 'Pricing and plans' },
    { name: 'UcpApiDocs', icon: Book, label: 'Docs', ariaLabel: 'API documentation' }
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
            </Link>

            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={createPageUrl(item.name)}
                  onClick={(e) => handleNavClick(e, item.name)}
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
        <div className="flex items-center h-12 px-4 gap-3">
          {ROOT_PAGES.includes(currentPageName) ? (
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm text-foreground">UCP Router</span>
            </Link>
          ) : (
            <>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-9 h-9 -ml-2 rounded-lg hover:bg-muted transition-colors min-h-[44px]"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <span className="text-sm font-semibold text-foreground">
                {PAGE_TITLES[currentPageName] || ''}
              </span>
            </>
          )}
        </div>
      </header>

      {/* Main Content with slide animations */}
      <main className="md:pb-0" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
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
              onClick={(e) => handleTabClick(e, item.name)}
              aria-label={item.ariaLabel}
              aria-current={currentPageName === item.name ? 'page' : undefined}
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
      {/* Bottom padding clears the fixed mobile tab bar (56px) plus the device safe area */}
      <footer className="py-8 mt-12 border-t border-border bg-background pb-[calc(4rem_+_env(safe-area-inset-bottom))] md:pb-8">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link to={createPageUrl('About')} className="text-muted-foreground hover:text-brand transition-colors">
              About
            </Link>
            <span className="text-border">•</span>
            <Link to={createPageUrl('Contact')} className="text-muted-foreground hover:text-brand transition-colors">
              Contact
            </Link>
            <span className="text-border">•</span>
            <Link to={createPageUrl('PrivacyPolicy')} className="text-muted-foreground hover:text-brand transition-colors">
              Privacy Policy
            </Link>
            <span className="text-border">•</span>
            <Link to={createPageUrl('Terms')} className="text-muted-foreground hover:text-brand transition-colors">
              Terms
            </Link>
            <span className="text-border">•</span>
            <Link to={createPageUrl('WhitePaper')} className="text-muted-foreground hover:text-brand transition-colors">
              White Paper
            </Link>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Powered by UCP — Omega UI, LLC</span>
          </div>
        </div>
      </footer>

      <Toaster position="bottom-right" />
    </div>
  );
}