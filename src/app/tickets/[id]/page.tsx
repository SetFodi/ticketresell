'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Ticket } from '@/types'
import { formatPrice, formatDate, formatRelativeTime } from '@/lib/utils'
import VerificationBadge from '@/components/VerificationBadge'
import {
  Calendar,
  MapPin,
  User,
  Clock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CreditCard,
  Shield,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Ticket as TicketIcon,
  CheckCircle,
} from 'lucide-react'

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useLanguage()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [showBuyModal, setShowBuyModal] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      fetchTicket(params.id as string)
    }
  }, [params.id])

  async function fetchTicket(id: string) {
    setLoading(true)

    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        seller:users!seller_id (
          id,
          full_name,
          phone,
          is_verified_seller,
          reputation_score,
          avatar_url
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching ticket:', error)
    } else {
      setTicket(data as Ticket)
    }

    setLoading(false)
  }

  async function handlePurchase() {
    if (!user || !ticket) return

    setPurchasing(true)

    // Create transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        ticket_id: ticket.id,
        buyer_id: user.id,
        seller_id: ticket.seller_id,
        amount: ticket.asking_price,
        platform_fee: Math.round(ticket.asking_price * 0.12 * 100) / 100,
        payment_status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating transaction:', error)
      alert('შეცდომა მოხდა. სცადეთ თავიდან.')
    } else {
      // Redirect to transaction page
      router.push(`/transactions/${transaction.id}`)
    }

    setPurchasing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c4f135]/20 to-[#c4f135]/5 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#c4f135]" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-[#c4f135] blur-2xl opacity-20 animate-pulse" />
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="text-center relative">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-zinc-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{t('ticket.not_found')}</h2>
          <Link href="/tickets" className="text-[#c4f135] hover:underline inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('ticket.return')}
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === ticket.seller_id
  const canPurchase = user && !isOwner && ticket.status === 'available'

  const priceIncrease = ticket.asking_price > ticket.original_price
  const priceDecrease = ticket.asking_price < ticket.original_price
  const priceDiffPercent = ticket.original_price > 0
    ? Math.round(((ticket.asking_price - ticket.original_price) / ticket.original_price) * 100)
    : 0

  return (
    <div className="min-h-screen relative">
      {/* Background effects */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0 hero-grid opacity-20" />

      {/* Glow orbs */}
      <div className="glow-orb glow-orb-lime w-[400px] h-[400px] -top-32 -right-32" />
      <div className="glow-orb glow-orb-cyan w-[300px] h-[300px] bottom-0 -left-32" />

      <div className="container py-8 md:py-12 relative">
        {/* Back Button */}
        <Link
          href="/tickets"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t('common.back')}
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Info Card */}
            <div className="card p-6 md:p-8 relative overflow-hidden">
              {/* Card glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#c4f135]/5 rounded-full blur-3xl" />

              {/* Status Badge */}
              {ticket.status !== 'available' && (
                <div className="mb-4">
                  <span className={`badge ${ticket.status === 'sold' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    ticket.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'badge-secondary'
                    }`}>
                    {ticket.status === 'sold' && t('ticket.status.sold')}
                    {ticket.status === 'pending' && t('ticket.status.pending')}
                    {ticket.status === 'completed' && t('ticket.status.completed')}
                  </span>
                </div>
              )}

              <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 relative">
                {ticket.event_name}
              </h1>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-[#00f5d4]/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#00f5d4]" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">{t('ticket.event_date')}</div>
                    <div className="text-white font-medium">{formatDate(ticket.event_date)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-[#ff6b9d]/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-[#ff6b9d]" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">{t('ticket.venue')}</div>
                    <div className="text-white font-medium">{ticket.venue}</div>
                  </div>
                </div>
              </div>

              {/* Ticket details */}
              <div className="flex flex-wrap gap-6 py-6 border-y border-white/5">
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{t('ticket.type')}</div>
                  <div className="badge badge-secondary">{ticket.ticket_type}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{t('ticket.quantity')}</div>
                  <div className="text-white font-medium">{ticket.quantity} {t('common.tickets')}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{t('ticket.listed')}</div>
                  <div className="flex items-center gap-1 text-zinc-400">
                    <Clock className="w-4 h-4" />
                    {formatRelativeTime(ticket.created_at)}
                  </div>
                </div>
              </div>

              {ticket.description && (
                <div className="mt-6">
                  <h3 className="font-medium text-white mb-2">{t('ticket.description')}</h3>
                  <p className="text-zinc-400 leading-relaxed">{ticket.description}</p>
                </div>
              )}
            </div>

            {/* Seller Card */}
            {ticket.seller && (
              <div className="card p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-[#00f5d4]/5 rounded-full blur-3xl" />

                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#c4f135]" />
                  {t('ticket.seller')}
                </h3>

                <div className="flex items-center gap-4 relative">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
                      <User className="w-8 h-8 text-zinc-400" />
                    </div>
                    {ticket.seller.is_verified_seller && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#c4f135] flex items-center justify-center shadow-lg shadow-[#c4f135]/30">
                        <Sparkles className="w-3.5 h-3.5 text-[#050507]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-lg">
                        {ticket.seller.full_name || t('ticket.seller')}
                      </span>
                      {ticket.seller.is_verified_seller && (
                        <VerificationBadge size="sm" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#c4f135]" />
                        <span className="text-sm text-zinc-400">
                          {ticket.seller.reputation_score}% {t('ticket.reputation')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24 relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#c4f135]/10 rounded-full blur-[60px]" />

              {/* Price */}
              <div className="mb-6 relative">
                {ticket.original_price > 0 && (
                  <div className="text-sm text-zinc-500 mb-1 line-through">
                    {formatPrice(ticket.original_price)} ₾
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">
                    {formatPrice(ticket.asking_price)}
                  </span>
                  <span className="text-xl text-zinc-500">₾</span>
                </div>

                {/* Price Change Indicator */}
                {priceDiffPercent !== 0 && (
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold mt-2 ${priceIncrease
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
                    {' '}
                    {priceIncrease ? t('ticket.price_higher') : t('ticket.price_lower')}
                  </div>
                )}
              </div>

              {/* Trust Indicators */}
              {ticket.seller?.is_verified_seller && (
                <div className="flex items-center gap-3 p-4 bg-[#c4f135]/10 border border-[#c4f135]/20 rounded-xl mb-6">
                  <Shield className="w-6 h-6 text-[#c4f135]" />
                  <div>
                    <span className="text-sm font-medium text-[#c4f135]">{t('ticket.verified_seller_badge')}</span>
                    <p className="text-xs text-zinc-500">{t('ticket.money_protected')}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!user ? (
                <Link
                  href="/login"
                  className="btn btn-primary w-full justify-center py-3.5"
                >
                  {t('ticket.login_to_buy')}
                </Link>
              ) : isOwner ? (
                <div className="text-center text-zinc-500 py-4 px-4 rounded-xl bg-white/5 border border-white/5">
                  <TicketIcon className="w-6 h-6 mx-auto mb-2 text-zinc-600" />
                  {t('ticket.your_listing')}
                </div>
              ) : ticket.status !== 'available' ? (
                <div className="text-center text-zinc-500 py-4 px-4 rounded-xl bg-white/5 border border-white/5">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-zinc-600" />
                  {t('ticket.unavailable')}
                </div>
              ) : (
                <button
                  onClick={() => setShowBuyModal(true)}
                  className="btn btn-primary w-full justify-center py-3.5 group"
                  disabled={purchasing}
                >
                  {purchasing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      {t('ticket.buy_now')}
                    </>
                  )}
                </button>
              )}

              {canPurchase && (
                <p className="text-xs text-zinc-600 text-center mt-4">
                  {t('ticket.buy_confirm')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Buy Confirmation Modal */}
        {showBuyModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full p-6 animate-fade-in relative overflow-hidden">
              {/* Modal glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#c4f135]/20 rounded-full blur-[60px]" />

              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c4f135] to-[#9bc22a] flex items-center justify-center mx-auto mb-6">
                  <TicketIcon className="w-8 h-8 text-[#050507]" />
                </div>

                <h3 className="text-xl font-bold text-white text-center mb-6">
                  {t('ticket.buy_ticket')}
                </h3>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                  <div className="font-medium text-white mb-1">{ticket.event_name}</div>
                  <div className="text-sm text-zinc-500 mb-3">{formatDate(ticket.event_date)}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#c4f135]">
                      {formatPrice(ticket.asking_price)}
                    </span>
                    <span className="text-lg text-zinc-500">₾</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00f5d4] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-400">
                      {t('ticket.buy_step1')}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00f5d4] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-400">
                      {t('ticket.buy_step2')}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#c4f135] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#c4f135]">
                      {t('ticket.buy_step3')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBuyModal(false)}
                    className="btn btn-secondary flex-1"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="btn btn-primary flex-1"
                  >
                    {purchasing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      t('common.confirm')
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
