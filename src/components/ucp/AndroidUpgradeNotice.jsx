import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

// No purchase-link or copy-link workaround: native Play eligibility, disclosure,
// attribution and reporting must be integrated before Android linkouts launch.
export default function AndroidUpgradeNotice() {
  return (
    <Card className="border-border shadow-md max-w-xl mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-foreground">Omega Access on Android</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          External purchases are not available in this Android build. If Omega Access
          is already active on your account, sign in with the same account to use it here.
        </p>
        <Link to="/Contact" className="inline-flex min-h-11 items-center text-sm text-brand underline">Customer support</Link>
      </CardContent>
    </Card>
  );
}