import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export default function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { logout } = useAuth();

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      const response = await base44.functions.invoke('deleteAccount', {});
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Deletion failed');
      }
      toast.success('Account deletion completed. You will be logged out.');
      setTimeout(() => {
        logout(true);
      }, 1500);
    } catch (error) {
      toast.error(`Deletion failed: ${error?.message || 'Unknown error'}`);
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (v) => {
    setOpen(v);
    if (!v) {
      setConfirmText('');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="border-destructive/30 bg-destructive/5 mt-8">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Permanently delete your account and all associated query data. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                onClick={() => setOpen(true)}
                className="min-h-[44px]"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all your query logs. This action is irreversible.
              Type <strong className="text-foreground">DELETE</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="confirm-delete">Type DELETE to confirm</Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="min-h-[44px]"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmText !== 'DELETE' || isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}