/**
 * Select Component (Radix-based)
 * 
 * A fully accessible, styleable select component built on Radix UI primitives.
 * 
 * CUSTOMIZATION: Update the className values to match your design tokens from tokens.css.
 * Look for comments marked "STYLE:" to find customization points.
 * 
 * Usage:
 *   <Select
 *     value={status}
 *     onValueChange={setStatus}
 *     options={[
 *       { value: 'active', label: 'Active' },
 *       { value: 'inactive', label: 'Inactive' },
 *     ]}
 *     placeholder="Select status"
 *   />
 */

import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  emptyMessage?: string
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  className,
  emptyMessage = 'No options available',
}: SelectProps) {
  const isEmpty = !options || options.length === 0

  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled || isEmpty}>
      <SelectPrimitive.Trigger
        className={cn(
          // STYLE: Trigger base styles - update colors to use your tokens
          'flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm',
          // STYLE: Default state colors
          'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-fg)]',
          // STYLE: Placeholder color
          'data-[placeholder]:text-[var(--color-muted)]',
          // STYLE: Focus state
          'focus:outline-none focus:border-[var(--color-accent)]',
          // STYLE: Hover state
          'hover:border-[var(--color-border-hover)]',
          // STYLE: Disabled/empty state
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            // STYLE: Dropdown content styles
            'relative z-50 min-w-[8rem] overflow-hidden rounded-md border shadow-md',
            // STYLE: Content colors
            'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-fg)]',
            // STYLE: Animation
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2'
          )}
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.Viewport className="p-1">
            {isEmpty ? (
              // STYLE: Empty state message
              <div className="py-2 px-3 text-sm text-[var(--color-muted)]">
                {emptyMessage}
              </div>
            ) : (
              // Filter out empty values - Radix Select doesn't support empty string values
              (options || []).filter((option) => option.value !== '').map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    // STYLE: Item base styles
                    'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
                    // STYLE: Item hover/focus state
                    'focus:bg-[var(--color-surface)] focus:text-[var(--color-fg)]',
                    // STYLE: Disabled item
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                  )}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))
            )}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

export default Select
