import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle2, ShieldCheck, Crown } from 'lucide-react';
import CheckoutComplianceNote from '@/components/ucp/CheckoutComplianceNote';

export default function ThankYou() {
  const [status, setStatus] = useState('pending'); // pending | active

  useEffect(() => {
    let attempts = 0;
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      attempts++;
      try {
        const subs = await base44.entities.Subscription.list('-created_date', 5);
        const active = subs.find((s) => s.status === 'active');
        if (active) {
          setStatus('active');
          return;
        }
      } catch (e) {
        // ignore — may not be authenticated yet
      }
      if (attempts < 24) {
        setTimeout(poll, 2500);
      }
    };
    poll();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-md mx-auto px-4 py-16">
        <Card className="border-border shadow-xl text-center">
          <CardContent className="p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand-dark mb-6">
              <Crown className="w-8 h-8 text-white" />
            </div>

            {status === 'active' ? (
              <>
                <CheckCircle2 className="w-12 h-12 text-brand mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Omega Access is active!
                </h1>
                <p className="text-muted-foreground mb-6">
                  Your subscription was confirmed. You now have unlimited routing,
                  premium models, and custom presets.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-brand text-white font-medium hover:bg-brand-dark transition-colors"
                >
                  Start routing →
                </Link>
              </>
            ) : (
              <>
                <Loader2 className="w-10 h-10 text-brand mx-auto mb-4 animate-spin" />
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Confirming your payment…
                </h1>
                <p className="text-muted-foreground mb-6">
                  We're activating your Omega Access subscription. This usually takes a
                  few seconds. You can keep this page open or return to the app — access
                  will unlock automatically.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
                >
                  Back to app
                </Link>
              </>
            )}

            <CheckoutComplianceNote />

            <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-brand" />
              <span>Secured by Base44 Payments</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}