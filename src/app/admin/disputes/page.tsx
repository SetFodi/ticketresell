'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Dispute } from '@/types'
import { formatDate, formatPrice } from '@/lib/utils'
import {
  AlertCircle,
  Loader2,
  ChevronRight,
  Search,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'

export default function AdminDisputesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open')

  const supabase = createClient()

  // Admin check using database is_admin field
  const isAdmin = user?.is_admin === true

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/')
      return
    }

    if (user && isAdmin) {
      fetchDisputes()
    }
  }, [user, authLoading, filter])

  async function fetchDisputes() {
    setLoading(true)

    let query = supabase
      .from('disputes')
      .select(`
        *,
        transaction:transactions!transaction_id (
          id,
          amount,
          ticket:tickets!ticket_id (
            event_name,
            event_date
          ),
          buyer:users!buyer_id (
            id,
            full_name,
            phone
          ),
          seller:users!seller_id (
            id,
            full_name,
            phone
          )
        ),
        reporter:users!reporter_id (
          id,
          full_name,
          phone
        )
      `)
      .order('created_at', { ascending: false })

    if (filter === 'open') {
      query = query.in('status', ['open', 'investigating'])
    } else if (filter === 'resolved') {
      query = query.in('status', ['resolved_buyer', 'resolved_seller'])
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching disputes:', error)
    } else {
      setDisputes(data as Dispute[])
    }

    setLoading(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="badge badge-warning flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ღია
          </span>
        )
      case 'investigating':
        return (
          <span className="badge badge-primary flex items-center gap-1">
            <Search className="w-3 h-3" />
            გამოძიება
          </span>
        )
      case 'resolved_buyer':
        return (
          <span className="badge badge-success flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            მყიდველს
          </span>
        )
      case 'resolved_seller':
        return (
          <span className="badge badge-danger flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            გამყიდველს
          </span>
        )
      default:
        return <span className="badge badge-secondary">{status}</span>
    }
  }

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'ticket_invalid':
        return 'არასწორი ბილეთი'
      case 'wrong_ticket':
        return 'შეცდომით გაგზავნილი'
      case 'seller_no_show':
        return 'გამყიდველი არ პასუხობს'
      case 'other':
        return 'სხვა'
      default:
        return reason
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="container max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">დავების მართვა</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">ფილტრი:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="input py-2"
            >
              <option value="all">ყველა</option>
              <option value="open">ღია</option>
              <option value="resolved">დასრულებული</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : disputes.length === 0 ? (
          <div className="card p-8 text-center">
            <AlertCircle className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 mb-2">
              დავები არ მოიძებნა
            </h3>
            <p className="text-zinc-500">
              {filter === 'open' ? 'ღია დავები არ არის' : 'დავები არ მოიძებნა'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <Link
                key={dispute.id}
                href={`/admin/disputes/${dispute.id}`}
                className="card p-4 block hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge(dispute.status)}
                      <span className="badge badge-secondary">
                        {getReasonLabel(dispute.reason)}
                      </span>
                    </div>

                    <h3 className="font-medium text-zinc-900 mb-1">
                      {dispute.transaction?.ticket?.event_name}
                    </h3>

                    <div className="text-sm text-zinc-500 space-y-1">
                      <p>
                        მომჩივანი: {dispute.reporter?.full_name} ({dispute.reporter?.phone})
                      </p>
                      <p>
                        თანხა: {formatPrice(dispute.transaction?.amount || 0)} ₾
                      </p>
                      <p>
                        თარიღი: {formatDate(dispute.created_at)}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
