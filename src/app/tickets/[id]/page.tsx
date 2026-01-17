'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Ticket, Transaction } from '@/types'
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
  MessageSquare,
  Shield,
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
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">ბილეთი ვერ მოიძებნა</h2>
          <Link href="/tickets" className="text-primary-600 hover:underline">
            ← უკან დაბრუნება
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === ticket.seller_id
  const canPurchase = user && !isOwner && ticket.status === 'available'

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="container py-6 md:py-10">
        {/* Back Button */}
        <Link
          href="/tickets"
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Info Card */}
            <div className="card p-6 md:p-8">
              {/* Status Badge */}
              {ticket.status !== 'available' && (
                <div className="mb-4">
                  <span className={`badge ${
                    ticket.status === 'sold' ? 'badge-danger' :
                    ticket.status === 'pending' ? 'badge-warning' :
                    'badge-secondary'
                  }`}>
                    {ticket.status === 'sold' && 'გაყიდული'}
                    {ticket.status === 'pending' && 'მოლოდინში'}
                    {ticket.status === 'completed' && 'დასრულებული'}
                  </span>
                </div>
              )}

              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4">
                {ticket.event_name}
              </h1>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 text-zinc-600">
                  <Calendar className="w-5 h-5 text-zinc-400" />
                  <div>
                    <div className="text-sm text-zinc-500">{t('ticket.event_date')}</div>
                    <div className="font-medium">{formatDate(ticket.event_date)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-zinc-600">
                  <MapPin className="w-5 h-5 text-zinc-400" />
                  <div>
                    <div className="text-sm text-zinc-500">{t('ticket.venue')}</div>
                    <div className="font-medium">{ticket.venue}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 py-4 border-y border-zinc-100">
                <div>
                  <div className="text-sm text-zinc-500">{t('ticket.type')}</div>
                  <div className="font-medium">{ticket.ticket_type}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-500">{t('ticket.quantity')}</div>
                  <div className="font-medium">{ticket.quantity} ბილეთი</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-500">{t('ticket.listed')}</div>
                  <div className="font-medium">{formatRelativeTime(ticket.created_at)}</div>
                </div>
              </div>

              {ticket.description && (
                <div className="mt-6">
                  <h3 className="font-medium text-zinc-900 mb-2">აღწერა</h3>
                  <p className="text-zinc-600">{ticket.description}</p>
                </div>
              )}
            </div>

            {/* Seller Card */}
            {ticket.seller && (
              <div className="card p-6">
                <h3 className="font-semibold text-zinc-900 mb-4">{t('ticket.seller')}</h3>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center">
                    <User className="w-7 h-7 text-zinc-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900">
                        {ticket.seller.full_name || 'გამყიდველი'}
                      </span>
                      {ticket.seller.is_verified_seller && (
                        <VerificationBadge size="sm" />
                      )}
                    </div>
                    <div className="text-sm text-zinc-500 mt-1">
                      რეპუტაცია: {ticket.seller.reputation_score}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              {/* Price */}
              <div className="mb-6">
                <div className="text-sm text-zinc-500 mb-1">
                  {t('ticket.original_price')}: {formatPrice(ticket.original_price)} ₾
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-zinc-900">
                    {formatPrice(ticket.asking_price)}
                  </span>
                  <span className="text-xl text-zinc-500">₾</span>
                </div>
                {ticket.asking_price !== ticket.original_price && (
                  <div className={`text-sm mt-1 ${
                    ticket.asking_price > ticket.original_price ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {ticket.asking_price > ticket.original_price ? '+' : ''}
                    {Math.round(((ticket.asking_price - ticket.original_price) / ticket.original_price) * 100)}%
                    {' '}
                    {ticket.asking_price > ticket.original_price ? 'მეტი' : 'ნაკლები'}
                  </div>
                )}
              </div>

              {/* Trust Indicators */}
              {ticket.seller?.is_verified_seller && (
                <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg mb-4">
                  <Shield className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-primary-700">ვერიფიცირებული გამყიდველი</span>
                </div>
              )}

              {/* Action Buttons */}
              {!user ? (
                <Link
                  href="/login"
                  className="btn btn-primary w-full justify-center"
                >
                  შედი ყიდვისთვის
                </Link>
              ) : isOwner ? (
                <div className="text-center text-zinc-500 py-4">
                  ეს თქვენი განცხადებაა
                </div>
              ) : ticket.status !== 'available' ? (
                <div className="text-center text-zinc-500 py-4">
                  ბილეთი მიუწვდომელია
                </div>
              ) : (
                <button
                  onClick={() => setShowBuyModal(true)}
                  className="btn btn-primary w-full justify-center"
                  disabled={purchasing}
                >
                  {purchasing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      {t('ticket.buy_now')}
                    </>
                  )}
                </button>
              )}

              {canPurchase && (
                <p className="text-xs text-zinc-500 text-center mt-4">
                  ყიდვის შემდეგ მიიღებთ გამყიდველის საკონტაქტო ინფორმაციას
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Buy Confirmation Modal */}
        {showBuyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fade-in">
              <h3 className="text-xl font-semibold text-zinc-900 mb-4">
                ბილეთის ყიდვა
              </h3>

              <div className="bg-zinc-50 rounded-lg p-4 mb-4">
                <div className="font-medium text-zinc-900 mb-1">{ticket.event_name}</div>
                <div className="text-sm text-zinc-500">{formatDate(ticket.event_date)}</div>
                <div className="text-2xl font-bold text-zinc-900 mt-2">
                  {formatPrice(ticket.asking_price)} ₾
                </div>
              </div>

              <div className="text-sm text-zinc-600 mb-6">
                <p className="mb-2">
                  ყიდვის დადასტურების შემდეგ თქვენ მიიღებთ გამყიდველის საბანკო რეკვიზიტებს.
                  გადახდის შემდეგ ატვირთეთ გადარიცხვის დამადასტურებელი.
                </p>
                <p className="text-primary-600">
                  თანხა დაცულია სანამ არ მიიღებთ ბილეთს.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBuyModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  გაუქმება
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="btn btn-primary flex-1"
                >
                  {purchasing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'დადასტურება'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
