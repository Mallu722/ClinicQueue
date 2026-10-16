import * as React from 'react'
import { cn } from '../../utils/cn'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-background-border bg-white px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
