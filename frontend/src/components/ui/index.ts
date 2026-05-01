/**
 * UI Component Exports
 * 
 * All reusable UI components are exported from here.
 * Import as: import { Button, Select, ConfirmDialog } from '@/components/ui'
 */

// Button
export { Button, buttonVariants } from './Button'
export type { ButtonProps } from './Button'

// Spinner
export { Spinner } from './Spinner'

// Select
export { Select } from './Select'
export type { SelectProps, SelectOption } from './Select'

// Dialog System
export {
  // Base components
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  // Pre-built dialogs
  AlertDialog,
  ConfirmDialog,
  PromptDialog,
  CustomDialog,
  // Types
  type DialogVariant,
  type AlertDialogProps,
  type ConfirmDialogProps,
  type PromptDialogProps,
  type CustomDialogProps,
} from './Dialog'

// Dialog Provider & Hook
export { 
  DialogProvider, 
  useDialog,
  type AlertOptions,
  type ConfirmOptions,
  type PromptOptions,
} from './DialogProvider'

// Add more component exports as they are created:
// export { Card } from './Card'
// export { Input } from './Input'
// export { Badge } from './Badge'
// export { Toast } from './Toast'
// export { Table } from './Table'
// export { EmptyState } from './EmptyState'
// export { Loading } from './Loading'
