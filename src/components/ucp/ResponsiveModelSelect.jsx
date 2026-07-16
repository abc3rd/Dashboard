import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { ChevronDown, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function ResponsiveModelSelect({ value, onValueChange, models, triggerClassName }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={triggerClassName}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center justify-between w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]",
            triggerClassName
          )}
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {value || "Select model"}
          </span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Select Model</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-1">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onValueChange(model.id);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm transition-colors min-h-[44px]",
                value === model.id
                  ? "bg-brand/10 text-brand font-medium"
                  : "hover:bg-muted text-foreground"
              )}
            >
              {model.id}
              {value === model.id && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}