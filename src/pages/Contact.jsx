import { useState } from 'react';
import { Mail, Send, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useExternalLink } from '@/components/ucp/ExternalLinkProvider';

const CONTACT_EMAIL = 'contact@omegaui.com';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [copying, setCopying] = useState(false);
  const { openExternalLink } = useExternalLink();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setCopying(true);
    try {
      await navigator.clipboard.writeText(`Subject: ${subject || 'AI Router support'}\n\n${message}\n\nFrom: ${name}\nEmail: ${email}`);
      toast.success('Message copied. After continuing, paste it into your email.');
      openExternalLink(`mailto:${CONTACT_EMAIL}`);
    } catch {
      toast.error('Could not copy your message. Copy the form text manually, then use the email link above.');
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-brand-dark mb-6">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Have questions about Deterministic Dashboard, the Universal Command Protocol, or interested in a partnership?
            We'd love to hear from you. Reach out using the form below or email us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact info */}
          <div className="space-y-4">
            <Card className="border border-border bg-card/80 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground mb-1">Email</h2>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="text-sm text-brand hover:underline"
                    >
                      {CONTACT_EMAIL}
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      For general inquiries, support, and partnership opportunities
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card/80 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground mb-1">Response Time</h2>
                    <p className="text-sm text-muted-foreground">
                      We typically respond within 1-2 business days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Contact form */}
          <Card className="border border-border bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Send a Message</CardTitle>
              <CardDescription className="text-muted-foreground">
                Fill out the form and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p id="contact-privacy-note" className="mb-4 text-sm text-muted-foreground">Your message will be copied so you can paste it into your email app. Your name, email and message are not added to the outgoing URL.</p>
              <form onSubmit={handleSubmit} aria-describedby="contact-privacy-note" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Name <span className="text-brand">*</span></Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email <span className="text-brand">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-foreground">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What's this about?"
                    className="min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground">Message <span className="text-brand">*</span></Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us more..."
                    required
                    className="min-h-[120px] resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={copying}
                  className="w-full bg-brand hover:bg-brand-dark text-white min-h-[44px]"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {copying ? 'Copying…' : 'Copy Message & Open Email'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}