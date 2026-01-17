'use client'

import { BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerificationBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function VerificationBadge({
  size = 'md',
  showText = false,
  className,
}: VerificationBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 text-primary-600',
        className
      )}
      title="ვერიფიცირებული გამყიდველი"
    >
      <BadgeCheck className={cn(sizeClasses[size], 'fill-primary-100')} />
      {showText && (
        <span className={cn('font-medium', textSizeClasses[size])}>
          ვერიფიცირებული
        </span>
      )}
    </div>
  )
}
