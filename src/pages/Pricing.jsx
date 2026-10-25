import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useSubscription, useDailyQueryCount, FREE_DAILY_LIMIT } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap, Crown, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { isAndroidTWA } from '@/lib/platform';
import AndroidUpgradeNotice from '@/components/ucp/AndroidUpgradeNotice';
import DeleteAccountDialog from '@/components/ucp/DeleteAccountDialog';
import { useAuth } from '@/lib/AuthContext';

const PRO_PLANS = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: '$9.99',
    period: '/month',
    desc: 'Flexible monthly billing. Cancel anytime.',
  },
  {
    id: 'annual',
    label: 'Annual',
    price: '$89.99',
    period: '/year',
    desc: '14-day free trial • Save 25%',
    featured: true,
  },
  {
    id: 'lifetime',
    label: 'Lifetime',
    price: '$199.99',
    period: 'one-time',
    desc: 'Pay once. Keep Omega Access forever.',
  },
];

const FREE_FEATURES = [
  'Deterministic UCP routing for every query',
  'Fast & Smart model selection',
  `Up to ${FREE_DAILY_LIMIT} queries per day`,
  'Full query history & performance monitoring',
];

const PRO_FEATURES = [
  'Unlimited queries — no daily cap',
  'Premium model access (Omega engine)',
  'Batch & multi-query processing',
  'Save custom routing presets',
  'Priority performance monitoring',
  'Zero-knowledge architecture stays active',
];

export default function Pricing() {
  const { tier, plan } = useSubscription();
  const { isAuthenticated, navigateToLogin } = useAuth();
  const todayCount = useDailyQueryCount();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const isPro = tier === 'pro';
  const [androidTWA] = useState(() => isAndroidTWA());

  const handleUpgrade = async (planId) => {
    if (loadingPlan) return;
    // Omega Access is tied to an account, so the upgrade flow begins with sign-in
    // rather than failing with an error the user can't act on.
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    setLoadingPlan(planId);
    try {
      const res = await base44.functions.invoke('create-checkout', { plan: planId });
      const data = res.data || res;
      if (data.error) {
        toast.error(data.error);
        return;
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast.error('No checkout URL returned.');
      }
    } catch (e) {
      if (e?.response?.status === 401) {
        navigateToLogin();
        return;
      }
      const msg = e?.response?.data?.error || e?.message || 'Failed to start checkout.';
      toast.error(msg);
    } finally {
      setLoadingPlan(null);
    }
  };

  const remaining = Math.max(0, FREE_DAILY_LIMIT - todayCount);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand-dark mb-6">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Omega Access
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free with the Sovereign tier — verify the zero-knowledge routing yourself.
            Upgrade to Omega Access for unlimited power and professional control.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm">
            {isPro ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand font-medium">
                <Crown className="w-4 h-4" /> You're on Omega Access ({plan})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground">
                <Sparkles className="w-4 h-4" /> Sovereign (Free) • {remaining}/{FREE_DAILY_LIMIT} queries left today
              </span>
            )}
          </div>
        </div>

        {/* Free Tier Card */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-border shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-brand" />
                <CardTitle className="text-xl">Sovereign</CardTitle>
              </div>
              <CardDescription>The free, trust-first base tier.</CardDescription>
              <div className="mt-3">
                <span className="text-3xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground ml-1">forever</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full mt-6" disabled>
                {isPro ? 'Included in your plan' : 'Your current plan'}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Tier Card */}
          <Card className="border-brand shadow-xl bg-gradient-to-br from-card to-brand/5">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5 text-brand" />
                <CardTitle className="text-xl">Omega Access</CardTitle>
                <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand text-white">
                  PRO
                </span>
              </div>
              <CardDescription>For power users, devs & social media managers.</CardDescription>
              <ul className="space-y-2.5 mt-3">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardHeader>
          </Card>
        </div>

        {/* Purchase options — hidden inside the Android TWA (Play policy: no non-Play-Billing digital purchase in-app) */}
        {androidTWA ? (
          <AndroidUpgradeNotice />
        ) : (
        <div className="mb-6">
          <h2 className="text-center text-lg font-semibold text-foreground mb-1">
            Choose your Omega Access plan
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-6">
            Subscription or one-time — your call. Secure checkout via Base44 Payments.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {PRO_PLANS.map((p) => (
              <Card
                key={p.id}
                className={
                  p.featured
                    ? "border-brand shadow-lg ring-1 ring-brand/40 relative"
                    : "border-border shadow-md"
                }
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-brand text-white">
                    BEST VALUE
                  </span>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-1.5 text-base">
                    {p.id === 'lifetime' ? <Zap className="w-4 h-4 text-brand" /> : <Crown className="w-4 h-4 text-brand" />}
                    {p.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-1">
                    <span className="text-2xl font-bold text-foreground">{p.price}</span>
                    <span className="text-muted-foreground ml-1 text-sm">{p.period}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 min-h-[32px]">{p.desc}</p>
                  <Button
                    className="w-full"
                    variant={p.featured ? 'default' : 'outline'}
                    disabled={isPro || loadingPlan !== null}
                    onClick={() => handleUpgrade(p.id)}
                  >
                    {loadingPlan === p.id ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting…</>
                    ) : isPro ? (
                      'Active'
                    ) : (
                      `Upgrade — ${p.label}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        )}

        {/* Trust line */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4 text-brand" />
          <span>Zero-knowledge routing stays active on every tier. Cancel anytime.</span>
        </div>

        {/* Account deletion — only relevant for signed-in users */}
        {isAuthenticated && (
          <div className="max-w-xl mx-auto">
            <DeleteAccountDialog />
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/" className="text-sm text-brand hover:underline">
            ← Back to Ask
          </Link>
        </div>
      </div>
    </div>
  );
}