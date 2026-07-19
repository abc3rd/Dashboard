import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { ChevronDown, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function ResponsiveSelect({
  value,
  onValueChange,
  options,
  triggerClassName,
  triggerIcon,
  title = 'Select',
  placeholder = 'Select',
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const currentLabel = options.find((o) => o.value === value)?.label || placeholder;

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={triggerClassName}>
          {triggerIcon}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
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
            'flex items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]',
            triggerClassName
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {triggerIcon}
            <span className={cn(!value && 'text-muted-foreground')}>{currentLabel}</span>
          </span>
          <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onValueChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm transition-colors min-h-[44px]',
                value === opt.value
                  ? 'bg-brand/10 text-brand font-medium'
                  : 'hover:bg-muted text-foreground'
              )}
            >
              {opt.label}
              {value === opt.value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}