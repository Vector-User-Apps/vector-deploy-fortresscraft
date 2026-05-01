/**
 * Button Component
 * 
 * A versatile button component with multiple variants and sizes.
 * 
 * CUSTOMIZATION: Update the className values to match your design tokens from tokens.css.
 * Look for comments marked "STYLE:" to find customization points.
 * 
 * Usage:
 *   <Button variant="default">Click me</Button>
 *   <Button variant="destructive" size="sm">Delete</Button>
 *   <Button variant="outline" disabled>Disabled</Button>
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // STYLE: Base button styles
  'inline-flex items-center justify-center rounded-[var(--radius-md)] text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // STYLE: Default variant - update colors to use your tokens
        default: 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]',
        // STYLE: Destructive variant - update colors to use your tokens
        destructive: 'bg-[var(--color-error)] text-white hover:opacity-90',
        // STYLE: Outline variant - update colors to use your tokens
        outline: 'border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-fg)] hover:bg-[var(--color-surface)]',
        // STYLE: Secondary variant - update colors to use your tokens
        secondary: 'bg-[var(--color-surface)] text-[var(--color-fg)] hover:opacity-80',
        // STYLE: Ghost variant - update colors to use your tokens
        ghost: 'text-[var(--color-fg)] hover:bg-[var(--color-surface)]',
        // STYLE: Link variant - update colors to use your tokens
        link: 'text-[var(--color-accent)] underline-offset-4 hover:underline',
      },
      size: {
        // STYLE: Size dimensions - adjust as needed
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
