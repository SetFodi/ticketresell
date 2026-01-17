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
  AlertCircle,
  ChevronRight,
  Clock,
  CheckCircle,
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
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">მოლოდინში</span>
      case 'paid':
        return <span className="badge badge-primary">გადახდილი</span>
      case 'released':
        return <span className="badge badge-success">დასრულებული</span>
      case 'refunded':
        return <span className="badge badge-danger">დაბრუნებული</span>
      default:
        return <span className="badge badge-secondary">{status}</span>
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="container max-w-4xl">
        {/* Profile Header */}
        <div className="card p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-primary-600" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="თქვენი სახელი"
                      className="input py-1 px-3"
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
                      className="btn btn-ghost btn-sm"
                    >
                      გაუქმება
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-zinc-900">
                      {user.full_name || 'მომხმარებელი'}
                    </h1>
                    <button
                      onClick={() => {
                        setNewName(user.full_name || '')
                        setEditingName(true)
                      }}
                      className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-zinc-400" />
                    </button>
                    {user.is_verified_seller && (
                      <VerificationBadge showText />
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
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
                  რეპუტაცია: {user.reputation_score}%
                </div>
              </div>
            </div>
          </div>

          {/* Verification CTA */}
          {!user.is_verified_seller && (
            <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="flex items-start gap-3">
                <BadgeCheck className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-primary-900 mb-1">
                    გახდი ვერიფიცირებული გამყიდველი
                  </h3>
                  <p className="text-sm text-primary-700 mb-3">
                    ვერიფიცირებული გამყიდველებს აქვთ მეტი ნდობა და მეტი გაყიდვები
                  </p>
                  <Link
                    href="/profile/verify"
                    className="btn btn-primary btn-sm"
                  >
                    ვერიფიკაცია
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              tab === 'listings'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <TicketIcon className="w-5 h-5" />
            {t('profile.my_tickets')}
            <span className="ml-1 text-sm opacity-75">({myTickets.length})</span>
          </button>
          <button
            onClick={() => setTab('purchases')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              tab === 'purchases'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            {t('profile.my_purchases')}
            <span className="ml-1 text-sm opacity-75">({myPurchases.length})</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : tab === 'listings' ? (
          <div>
            {myTickets.length === 0 ? (
              <div className="card p-8 text-center">
                <TicketIcon className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 mb-2">
                  ჯერ არ გაქვთ განცხადებები
                </h3>
                <p className="text-zinc-500 mb-6">
                  გამოაქვეყნეთ თქვენი პირველი ბილეთი
                </p>
                <Link href="/sell" className="btn btn-primary">
                  <Plus className="w-5 h-5 mr-2" />
                  ბილეთის გამოქვეყნება
                </Link>
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
              <div className="card p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 mb-2">
                  ჯერ არ გაქვთ შენაძენები
                </h3>
                <p className="text-zinc-500 mb-6">
                  იპოვეთ თქვენთვის სასურველი ბილეთი
                </p>
                <Link href="/tickets" className="btn btn-primary">
                  ბილეთების ნახვა
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myPurchases.map((purchase) => (
                  <Link
                    key={purchase.id}
                    href={`/transactions/${purchase.id}`}
                    className="card p-4 block hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-zinc-900 truncate">
                          {purchase.ticket?.event_name}
                        </h3>
                        <p className="text-sm text-zinc-500">
                          {purchase.ticket?.venue} • {formatDate(purchase.ticket?.event_date || '')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-zinc-900">
                          {formatPrice(purchase.amount)} ₾
                        </div>
                        {getStatusBadge(purchase.payment_status)}
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-400" />
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
