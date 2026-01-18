'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Dispute } from '@/types'
import { formatDate, formatPrice, formatPhoneNumber } from '@/lib/utils'
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  ExternalLink,
} from 'lucide-react'

export default function AdminDisputeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [dispute, setDispute] = useState<Dispute | null>(null)
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState('')

  const supabase = createClient()

  // Admin check using database is_admin field
  const isAdmin = user?.is_admin === true

  const fetchDispute = useCallback(async (id: string) => {
    setLoading(true)

    const { data, error } = await supabase
      .from('disputes')
      .select(`
        *,
        transaction:transactions!transaction_id (
          id,
          amount,
          platform_fee,
          payment_status,
          payment_proof_url,
          created_at,
          ticket:tickets!ticket_id (
            id,
            event_name,
            event_date,
            venue,
            ticket_type,
            asking_price
          ),
          buyer:users!buyer_id (
            id,
            full_name,
            phone,
            email,
            reputation_score
          ),
          seller:users!seller_id (
            id,
            full_name,
            phone,
            email,
            is_verified_seller,
            reputation_score
          )
        ),
        reporter:users!reporter_id (
          id,
          full_name,
          phone
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching dispute:', error)
    } else {
      setDispute(data as Dispute)
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/')
      return
    }

    if (params.id && isAdmin) {
      fetchDispute(params.id as string)
    }
  }, [params.id, authLoading, isAdmin, router, fetchDispute])

  const handleResolve = async (resolution: 'resolved_buyer' | 'resolved_seller') => {
    if (!dispute) return

    setResolving(true)

    try {
      // Update dispute status
      const { error: disputeError } = await supabase
        .from('disputes')
        .update({
          status: resolution,
          resolution_notes: resolutionNotes,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', dispute.id)

      if (disputeError) throw disputeError

      // Update transaction based on resolution
      const newPaymentStatus = resolution === 'resolved_buyer' ? 'refunded' : 'released'

      const { error: transactionError } = await supabase
        .from('transactions')
        .update({ payment_status: newPaymentStatus })
        .eq('id', dispute.transaction_id)

      if (transactionError) throw transactionError

      // Update ticket status
      const ticketStatus = resolution === 'resolved_buyer' ? 'available' : 'completed'

      await supabase
        .from('tickets')
        .update({ status: ticketStatus })
        .eq('id', dispute.transaction?.ticket?.id)

      // Refresh dispute data
      await fetchDispute(dispute.id)
    } catch (err) {
      console.error('Error resolving dispute:', err)
      alert('შეცდომა მოხდა. სცადეთ თავიდან.')
    }

    setResolving(false)
  }

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'ticket_invalid': return 'ბილეთი არასწორი/ყალბი იყო'
      case 'wrong_ticket': return 'არასწორი ბილეთი მივიღე'
      case 'seller_no_show': return 'გამყიდველმა ბილეთი არ გამომიგზავნა'
      case 'other': return 'სხვა პრობლემა'
      default: return reason
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="badge badge-warning">ღია</span>
      case 'investigating':
        return <span className="badge badge-primary">გამოძიება</span>
      case 'resolved_buyer':
        return <span className="badge badge-success">მყიდველის სასარგებლოდ</span>
      case 'resolved_seller':
        return <span className="badge badge-danger">გამყიდველის სასარგებლოდ</span>
      default:
        return <span className="badge badge-secondary">{status}</span>
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!isAdmin || !dispute) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">დავა ვერ მოიძებნა</h2>
          <Link href="/admin/disputes" className="text-primary-600 hover:underline">
            ← უკან დაბრუნება
          </Link>
        </div>
      </div>
    )
  }

  const isResolved = ['resolved_buyer', 'resolved_seller'].includes(dispute.status)

  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="container max-w-4xl">
        <Link
          href="/admin/disputes"
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          დავების სიაში დაბრუნება
        </Link>

        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 mb-2">
                დავა #{dispute.id.slice(0, 8)}
              </h1>
              <p className="text-zinc-500">
                შეიქმნა: {formatDate(dispute.created_at)}
              </p>
            </div>
            {getStatusBadge(dispute.status)}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 py-4 border-y border-zinc-100">
            <div>
              <div className="text-sm text-zinc-500 mb-1">მიზეზი</div>
              <div className="font-medium text-zinc-900">{getReasonLabel(dispute.reason)}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-500 mb-1">თანხა</div>
              <div className="font-medium text-zinc-900">{formatPrice(dispute.transaction?.amount || 0)} ₾</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Buyer Info */}
          <div className="card p-6">
            <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              მყიდველი (მომჩივანი)
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">სახელი</span>
                <span className="font-medium">{dispute.transaction?.buyer?.full_name || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">ტელეფონი</span>
                <span className="font-medium">{formatPhoneNumber(dispute.transaction?.buyer?.phone || '')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">რეპუტაცია</span>
                <span className="font-medium">{dispute.transaction?.buyer?.reputation_score}%</span>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="card p-6">
            <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              გამყიდველი
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">სახელი</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{dispute.transaction?.seller?.full_name || '-'}</span>
                  {dispute.transaction?.seller?.is_verified_seller && (
                    <span className="badge badge-success text-xs">ვერიფიცირებული</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">ტელეფონი</span>
                <span className="font-medium">{formatPhoneNumber(dispute.transaction?.seller?.phone || '')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">რეპუტაცია</span>
                <span className="font-medium">{dispute.transaction?.seller?.reputation_score}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Event Info */}
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            ღონისძიების ინფორმაცია
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-zinc-500 mb-1">ღონისძიება</div>
              <div className="font-medium">{dispute.transaction?.ticket?.event_name}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-500 mb-1">თარიღი</div>
              <div className="font-medium">{formatDate(dispute.transaction?.ticket?.event_date || '')}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-500 mb-1">ადგილი</div>
              <div className="font-medium">{dispute.transaction?.ticket?.venue}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-500 mb-1">ბილეთის ტიპი</div>
              <div className="font-medium">{dispute.transaction?.ticket?.ticket_type}</div>
            </div>
          </div>
        </div>

        {/* Complaint Description */}
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            საჩივრის აღწერა
          </h3>
          <p className="text-zinc-700 whitespace-pre-wrap">{dispute.description}</p>
        </div>

        {/* Evidence */}
        {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
          <div className="card p-6 mb-6">
            <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              მტკიცებულებები ({dispute.evidence_urls.length})
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {dispute.evidence_urls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-video rounded-lg border overflow-hidden group"
                >
                  <Image
                    src={url}
                    alt={`Evidence ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Payment Proof */}
        {dispute.transaction?.payment_proof_url && (
          <div className="card p-6 mb-6">
            <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              გადახდის დამადასტურებელი
            </h3>
            <a
              href={dispute.transaction.payment_proof_url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-video max-w-md rounded-lg border overflow-hidden group block"
            >
              <Image
                src={dispute.transaction.payment_proof_url}
                alt="Payment proof"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-white" />
              </div>
            </a>
          </div>
        )}

        {/* Resolution Section */}
        {!isResolved ? (
          <div className="card p-6">
            <h3 className="font-semibold text-zinc-900 mb-4">დავის გადაწყვეტა</h3>

            <div className="mb-4">
              <label className="label">გადაწყვეტილების შენიშვნები</label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="input min-h-[100px] resize-none"
                placeholder="აღწერეთ გადაწყვეტილების მიზეზი..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleResolve('resolved_buyer')}
                disabled={resolving}
                className="btn btn-primary flex-1 justify-center gap-2"
              >
                {resolving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    მყიდველის სასარგებლოდ
                  </>
                )}
              </button>
              <button
                onClick={() => handleResolve('resolved_seller')}
                disabled={resolving}
                className="btn btn-outline flex-1 justify-center gap-2"
              >
                {resolving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    გამყიდველის სასარგებლოდ
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-zinc-500 mt-4">
              * მყიდველის სასარგებლოდ = თანხის დაბრუნება მყიდველს
              <br />
              * გამყიდველის სასარგებლოდ = თანხის გადარიცხვა გამყიდველს
            </p>
          </div>
        ) : (
          <div className="card p-6 bg-zinc-50">
            <h3 className="font-semibold text-zinc-900 mb-4">გადაწყვეტილება</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {dispute.status === 'resolved_buyer' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">
                  {dispute.status === 'resolved_buyer' ? 'მყიდველის სასარგებლოდ' : 'გამყიდველის სასარგებლოდ'}
                </span>
              </div>
              {dispute.resolution_notes && (
                <p className="text-zinc-600 mt-2">{dispute.resolution_notes}</p>
              )}
              {dispute.resolved_at && (
                <p className="text-sm text-zinc-500">
                  გადაწყდა: {formatDate(dispute.resolved_at)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
