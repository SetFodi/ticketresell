'use client'

import Link from 'next/link'
import { Ticket } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatPrice, formatDate, formatRelativeTime } from '@/lib/utils'
import { Calendar, MapPin, User, Clock, Sparkles, TrendingUp, TrendingDown } from 'lucide-react'
import VerificationBadge from './VerificationBadge'

interface TicketCardProps {
  ticket: Ticket
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const { t } = useLanguage()

  const priceIncrease = ticket.asking_price > ticket.original_price
  const priceDecrease = ticket.asking_price < ticket.original_price
  const priceDiffPercent = ticket.original_price > 0
    ? Math.round(((ticket.asking_price - ticket.original_price) / ticket.original_price) * 100)
    : 0

  return (
    <Link href={`/tickets/${ticket.id}`} className="block group">
      <div className="card card-hover card-glow overflow-hidden relative">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#c4f135]/0 via-transparent to-[#00f5d4]/0 group-hover:from-[#c4f135]/5 group-hover:to-[#00f5d4]/5 transition-all duration-500" />

        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-[#c4f135] via-[#00f5d4] to-[#c4f135] opacity-60 group-hover:opacity-100 transition-opacity" />

        <div className="p-5 relative">
          {/* Event Name with electric styling */}
          <div className="mb-4">
            <h3 className="font-bold text-lg text-white group-hover:text-[#c4f135] transition-colors duration-300 line-clamp-2 leading-tight">
              {ticket.event_name}
            </h3>
          </div>

          {/* Event Details with icons */}
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#00f5d4]" />
              </div>
              <span className="text-zinc-300">{formatDate(ticket.event_date)}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[#ff6b9d]" />
              </div>
              <span className="text-zinc-300 truncate">{ticket.venue}</span>
            </div>
          </div>

          {/* Ticket Type Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="badge badge-secondary">
              {ticket.ticket_type}
            </span>
            <span className="text-sm text-zinc-500">
              × {ticket.quantity}
            </span>
          </div>

          {/* Dashed divider like a ticket stub */}
          <div className="border-t border-dashed border-white/10 my-4 relative">
            <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#050507]" />
            <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#050507]" />
          </div>

          {/* Seller Info */}
          {ticket.seller && (
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
                  <User className="w-5 h-5 text-zinc-400" />
                </div>
                {ticket.seller.is_verified_seller && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#c4f135] flex items-center justify-center shadow-lg shadow-[#c4f135]/30">
                    <Sparkles className="w-3 h-3 text-[#050507]" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-white truncate">
                    {ticket.seller.full_name || 'გამყიდველი'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c4f135]" />
                    <span className="text-xs text-zinc-500">
                      {ticket.seller.reputation_score}% რეპუტაცია
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Price Section - The hero */}
          <div className="flex items-end justify-between pt-3 border-t border-white/5">
            <div>
              {ticket.original_price > 0 && (
                <div className="text-xs text-zinc-500 mb-1 line-through">
                  {formatPrice(ticket.original_price)} ₾
                </div>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white group-hover:text-[#c4f135] transition-colors">
                  {formatPrice(ticket.asking_price)}
                </span>
                <span className="text-lg text-zinc-500 font-medium">₾</span>
              </div>
            </div>

            {/* Price Change Indicator */}
            {priceDiffPercent !== 0 && (
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold ${
                  priceIncrease
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-green-500/10 text-green-400'
                }`}
              >
                {priceIncrease ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {priceIncrease ? '+' : ''}{priceDiffPercent}%
              </div>
            )}
          </div>

          {/* Listed Time */}
          <div className="flex items-center gap-1.5 mt-3 text-xs text-zinc-600">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(ticket.created_at)}</span>
          </div>
        </div>

        {/* Bottom gradient line on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#c4f135] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </Link>
  )
}
