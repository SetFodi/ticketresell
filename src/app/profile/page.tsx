'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Ticket, Transaction } from '@/types'
import { formatPrice, formatDate, formatPhoneNumber } from '@/lib/utils'
import TicketCard from '@/components/TicketCard'
import VerificationBadge from '@/components/VerificationBadge'
import {
  User,
  Phone,
  Mail,
  Edit2,
  BadgeCheck,
  Ticket as TicketIcon,
  ShoppingBag,
  Star,
  Loader2,
  Plus,
  ChevronRight,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'

type Tab = 'listings' | 'purchases'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading, refreshUser } = useAuth()
  const { t } = useLanguage()

  const [tab, setTab] = useState<Tab>('listings')
  const [myTickets, setMyTickets] = useState<Ticket[]>([])
  const [myPurchases, setMyPurchases] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')

  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchData()
    }
  }, [user, authLoading])

  async function fetchData() {
    setLoading(true)

    // Fetch my listings
    const { data: tickets } = await supabase
      .from('tickets')
      .select('*')
      .eq('seller_id', user?.id)
      .order('created_at', { ascending: false })

    if (tickets) {
      setMyTickets(tickets as Ticket[])
    }

    // Fetch my purchases
    const { data: purchases } = await supabase
      .from('transactions')
      .select(`
        *,
        ticket:tickets!ticket_id (
          id,
          event_name,
          event_date,
          venue
        ),
        seller:users!seller_id (
          id,
          full_name,
          phone
        )
      `)
      .eq('buyer_id', user?.id)
      .order('created_at', { ascending: false })

    if (purchases) {
      setMyPurchases(purchases as Transaction[])
    }

    setLoading(false)
  }

  const handleUpdateName = async () => {
    if (!newName.trim() || !user) return

    const { error } = await supabase
      .from('users')
      .update({ full_name: newName.trim() })
      .eq('id', user.id)

    if (!error) {
      await refreshUser()
      setEditingName(false)
    }
  }

  if (authLoading) {
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

  if (!user) {
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Clock className="w-3 h-3" />
            მოლოდინში
          </span>
        )
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-[#c4f135]/10 text-[#c4f135] border border-[#c4f135]/20">
            <CheckCircle className="w-3 h-3" />
            გადახდილი
          </span>
        )
      case 'released':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle className="w-3 h-3" />
            დასრულებული
          </span>
        )
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" />
            დაბრუნებული
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-white/5 text-zinc-400 border border-white/10">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen py-8 relative">
      {/* Background effects */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0 hero-grid opacity-20" />

      {/* Glow orbs */}
      <div className="glow-orb glow-orb-lime w-[400px] h-[400px] -top-32 -right-32" />
      <div className="glow-orb glow-orb-cyan w-[300px] h-[300px] bottom-1/3 -left-32" />

      <div className="container max-w-4xl relative">
        {/* Profile Header */}
        <div className="card p-6 md:p-8 mb-6 relative overflow-hidden">
          {/* Card glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#c4f135]/5 rounded-full blur-3xl" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#c4f135]/20 to-[#00f5d4]/20 flex items-center justify-center border border-white/10">
                <User className="w-10 h-10 text-[#c4f135]" />
              </div>
              {user.is_verified_seller && (
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#c4f135] flex items-center justify-center shadow-lg shadow-[#c4f135]/30">
                  <Sparkles className="w-4 h-4 text-[#050507]" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {editingName ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="თქვენი სახელი"
                      className="input py-2 px-3 w-48"
                      autoFocus
                    />
                    <button
                      onClick={handleUpdateName}
                      className="btn btn-primary btn-sm"
                    >
                      შენახვა
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="btn btn-secondary btn-sm"
                    >
                      გაუქმება
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-white">
                      {user.full_name || 'მომხმარებელი'}
                    </h1>
                    <button
                      onClick={() => {
                        setNewName(user.full_name || '')
                        setEditingName(true)
                      }}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-zinc-500 hover:text-white" />
                    </button>
                    {user.is_verified_seller && (
                      <VerificationBadge showText />
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  {formatPhoneNumber(user.phone)}
                </div>
                {user.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>რეპუტაცია: <span className="text-white font-medium">{user.reputation_score}%</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification CTA */}
          {!user.is_verified_seller && (
            <div className="mt-6 p-4 bg-gradient-to-r from-[#c4f135]/10 to-[#00f5d4]/10 border border-[#c4f135]/20 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c4f135]/10 rounded-full blur-2xl" />

              <div className="flex items-start gap-4 relative">
                <div className="w-12 h-12 rounded-xl bg-[#c4f135]/20 flex items-center justify-center flex-shrink-0">
                  <BadgeCheck className="w-6 h-6 text-[#c4f135]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    გახდი ვერიფიცირებული გამყიდველი
                  </h3>
                  <p className="text-sm text-zinc-400 mb-3">
                    ვერიფიცირებული გამყიდველებს აქვთ მეტი ნდობა და მეტი გაყიდვები
                  </p>
                  <Link
                    href="/profile/verify"
                    className="btn btn-primary btn-sm group"
                  >
                    ვერიფიკაცია
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('listings')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
              tab === 'listings'
                ? 'bg-[#c4f135] text-[#050507] shadow-lg shadow-[#c4f135]/20'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <TicketIcon className="w-5 h-5" />
            {t('profile.my_tickets')}
            <span className={`ml-1 px-2 py-0.5 rounded-md text-xs ${
              tab === 'listings' ? 'bg-[#050507]/20' : 'bg-white/10'
            }`}>
              {myTickets.length}
            </span>
          </button>
          <button
            onClick={() => setTab('purchases')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
              tab === 'purchases'
                ? 'bg-[#c4f135] text-[#050507] shadow-lg shadow-[#c4f135]/20'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            {t('profile.my_purchases')}
            <span className={`ml-1 px-2 py-0.5 rounded-md text-xs ${
              tab === 'purchases' ? 'bg-[#050507]/20' : 'bg-white/10'
            }`}>
              {myPurchases.length}
            </span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c4f135]/20 to-[#c4f135]/5 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#c4f135]" />
              </div>
            </div>
          </div>
        ) : tab === 'listings' ? (
          <div>
            {myTickets.length === 0 ? (
              <div className="card p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#c4f135]/5 rounded-full blur-3xl" />

                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <TicketIcon className="w-8 h-8 text-zinc-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    ჯერ არ გაქვთ განცხადებები
                  </h3>
                  <p className="text-zinc-500 mb-6">
                    გამოაქვეყნეთ თქვენი პირველი ბილეთი
                  </p>
                  <Link href="/sell" className="btn btn-primary group">
                    <Plus className="w-5 h-5 mr-2" />
                    ბილეთის გამოქვეყნება
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {myTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {myPurchases.length === 0 ? (
              <div className="card p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#00f5d4]/5 rounded-full blur-3xl" />

                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-zinc-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    ჯერ არ გაქვთ შენაძენები
                  </h3>
                  <p className="text-zinc-500 mb-6">
                    იპოვეთ თქვენთვის სასურველი ბილეთი
                  </p>
                  <Link href="/tickets" className="btn btn-primary group">
                    ბილეთების ნახვა
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {myPurchases.map((purchase) => (
                  <Link
                    key={purchase.id}
                    href={`/transactions/${purchase.id}`}
                    className="card p-4 block hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate group-hover:text-[#c4f135] transition-colors">
                          {purchase.ticket?.event_name}
                        </h3>
                        <p className="text-sm text-zinc-500">
                          {purchase.ticket?.venue} • {formatDate(purchase.ticket?.event_date || '')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white mb-1">
                          {formatPrice(purchase.amount)} ₾
                        </div>
                        {getStatusBadge(purchase.payment_status)}
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-[#c4f135] group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
