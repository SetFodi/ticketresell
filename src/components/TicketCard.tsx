'use client'

import Link from 'next/link'
import { Ticket } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatPrice, formatDate, formatRelativeTime } from '@/lib/utils'
import { Calendar, MapPin, User, BadgeCheck, Clock } from 'lucide-react'
import VerificationBadge from './VerificationBadge'

interface TicketCardProps {
  ticket: Ticket
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const { t } = useLanguage()

  const priceIncrease = ticket.asking_price > ticket.original_price
  const priceDecrease = ticket.asking_price < ticket.original_price
  const priceDiffPercent = Math.round(
    ((ticket.asking_price - ticket.original_price) / ticket.original_price) * 100
  )

  return (
    <Link href={`/tickets/${ticket.id}`}>
      <div className="card card-hover overflow-hidden group">
        {/* Event Info */}
        <div className="p-4 sm:p-5">
          {/* Event Name */}
          <h3 className="font-semibold text-lg text-zinc-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-3">
            {ticket.event_name}
          </h3>

          {/* Event Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span>{formatDate(ticket.event_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <MapPin className="w-4 h-4 text-zinc-400" />
              <span className="truncate">{ticket.venue}</span>
            </div>
          </div>

          {/* Ticket Type & Quantity */}
          <div className="flex items-center gap-2 mb-4">
            <span className="badge badge-secondary">{ticket.ticket_type}</span>
            <span className="text-sm text-zinc-500">
              × {ticket.quantity} {ticket.quantity > 1 ? 'ბილეთი' : 'ბილეთი'}
            </span>
          </div>

          {/* Seller Info */}
          {ticket.seller && (
            <div className="flex items-center gap-2 py-3 border-t border-zinc-100">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                <User className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-zinc-700 truncate">
                    {ticket.seller.full_name || 'გამყიდველი'}
                  </span>
                  {ticket.seller.is_verified_seller && (
                    <VerificationBadge size="sm" />
                  )}
                </div>
                <div className="text-xs text-zinc-500">
                  რეპუტაცია: {ticket.seller.reputation_score}%
                </div>
              </div>
            </div>
          )}

          {/* Price Section */}
          <div className="flex items-end justify-between pt-3 border-t border-zinc-100">
            <div>
              <div className="text-xs text-zinc-500 mb-0.5">
                {t('ticket.original_price')}: {formatPrice(ticket.original_price)} ₾
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-zinc-900">
                  {formatPrice(ticket.asking_price)}
                </span>
                <span className="text-lg text-zinc-500">₾</span>
              </div>
            </div>

            {/* Price Change Indicator */}
            {priceDiffPercent !== 0 && (
              <div
                className={`text-sm font-medium ${
                  priceIncrease
                    ? 'text-red-600'
                    : priceDecrease
                    ? 'text-green-600'
                    : 'text-zinc-500'
                }`}
              >
                {priceIncrease ? '+' : ''}{priceDiffPercent}%
              </div>
            )}
          </div>

          {/* Listed Time */}
          <div className="flex items-center gap-1 mt-3 text-xs text-zinc-400">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(ticket.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
