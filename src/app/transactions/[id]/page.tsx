'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Transaction } from '@/types'
import { formatPrice, formatDate, formatPhoneNumber } from '@/lib/utils'
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Phone,
  CreditCard,
  MessageSquare,
  Shield,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react'
import Image from 'next/image'

type TransactionStep = 'payment' | 'confirmation' | 'ticket_sent' | 'completed' | 'disputed'

export default function TransactionPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [copied, setCopied] = useState(false)

  const supabase = createClient()

  const fetchTransaction = useCallback(async (id: string) => {
    setLoading(true)

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        ticket:tickets!ticket_id (
          id,
          event_name,
          event_date,
          venue,
          ticket_type,
          quantity,
          asking_price
        ),
        buyer:users!buyer_id (
          id,
          full_name,
          phone
        ),
        seller:users!seller_id (
          id,
          full_name,
          phone,
          bank_account_last4,
          is_verified_seller
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching transaction:', error)
    } else {
      setTransaction(data as Transaction)
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    if (params.id) {
      fetchTransaction(params.id as string)
    }
  }, [params.id, fetchTransaction])

  const getCurrentStep = (): TransactionStep => {
    if (!transaction) return 'payment'
    if (transaction.payment_status === 'refunded') return 'disputed'
    if (transaction.payment_status === 'released') return 'completed'
    if (transaction.ticket_sent) return 'ticket_sent'
    if (transaction.seller_confirmed) return 'confirmation'
    return 'payment'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ფაილი ძალიან დიდია (მაქს. 5MB)')
        return
      }
      setPaymentProof(file)
    }
  }

  const handleUploadProof = async () => {
    if (!paymentProof || !transaction || !user) return

    setUploading(true)

    try {
      const fileExt = paymentProof.name.split('.').pop()
      const fileName = `${transaction.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, paymentProof)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName)

      // Update transaction with proof
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          payment_proof_url: urlData.publicUrl,
          payment_status: 'paid',
        })
        .eq('id', transaction.id)

      if (updateError) throw updateError

      // Refresh transaction
      await fetchTransaction(transaction.id)
      setPaymentProof(null)
    } catch (err) {
      console.error('Error uploading proof:', err)
      alert('ატვირთვა ვერ მოხერხდა. სცადეთ თავიდან.')
    }

    setUploading(false)
  }

  const handleSellerConfirm = async () => {
    if (!transaction) return

    const { error } = await supabase
      .from('transactions')
      .update({ seller_confirmed: true })
      .eq('id', transaction.id)

    if (!error) {
      await fetchTransaction(transaction.id)
    }
  }

  const handleTicketSent = async () => {
    if (!transaction) return

    const { error } = await supabase
      .from('transactions')
      .update({
        ticket_sent: true,
        ticket_sent_at: new Date().toISOString(),
      })
      .eq('id', transaction.id)

    if (!error) {
      // Update ticket status
      await supabase
        .from('tickets')
        .update({ status: 'sold' })
        .eq('id', transaction.ticket_id)

      await fetchTransaction(transaction.id)
    }
  }

  const handleComplete = async () => {
    if (!transaction) return

    const { error } = await supabase
      .from('transactions')
      .update({ payment_status: 'released' })
      .eq('id', transaction.id)

    if (!error) {
      // Update ticket status
      await supabase
        .from('tickets')
        .update({ status: 'completed' })
        .eq('id', transaction.ticket_id)

      await fetchTransaction(transaction.id)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">ტრანზაქცია ვერ მოიძებნა</h2>
          <Link href="/profile" className="text-primary-600 hover:underline">
            ← პროფილზე დაბრუნება
          </Link>
        </div>
      </div>
    )
  }

  const isBuyer = user?.id === transaction.buyer_id
  const isSeller = user?.id === transaction.seller_id
  const currentStep = getCurrentStep()

  return (
    <div className="min-h-screen bg-zinc-50 py-6 md:py-10">
      <div className="container max-w-3xl">
        {/* Back Button */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          პროფილზე დაბრუნება
        </Link>

        {/* Transaction Header */}
        <div className="card p-6 mb-6">
          <h1 className="text-xl font-bold text-zinc-900 mb-2">
            {transaction.ticket?.event_name}
          </h1>
          <p className="text-zinc-500 mb-4">
            {transaction.ticket?.venue} • {formatDate(transaction.ticket?.event_date || '')}
          </p>

          <div className="flex items-center justify-between py-4 border-y border-zinc-100">
            <div>
              <div className="text-sm text-zinc-500">თანხა</div>
              <div className="text-2xl font-bold text-zinc-900">
                {formatPrice(transaction.amount)} ₾
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-zinc-500">სტატუსი</div>
              <div className={`font-medium ${currentStep === 'completed' ? 'text-green-600' :
                currentStep === 'disputed' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                {currentStep === 'payment' && 'გადახდის მოლოდინში'}
                {currentStep === 'confirmation' && 'დადასტურების მოლოდინში'}
                {currentStep === 'ticket_sent' && 'ბილეთი გაგზავნილია'}
                {currentStep === 'completed' && 'დასრულებული'}
                {currentStep === 'disputed' && 'დავა'}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-8">
            <Step
              number={1}
              label="გადახდა"
              active={currentStep === 'payment'}
              completed={['confirmation', 'ticket_sent', 'completed'].includes(currentStep)}
            />
            <div className="flex-1 h-0.5 bg-zinc-200 mx-2" />
            <Step
              number={2}
              label="დადასტურება"
              active={currentStep === 'confirmation'}
              completed={['ticket_sent', 'completed'].includes(currentStep)}
            />
            <div className="flex-1 h-0.5 bg-zinc-200 mx-2" />
            <Step
              number={3}
              label="ბილეთი"
              active={currentStep === 'ticket_sent'}
              completed={currentStep === 'completed'}
            />
            <div className="flex-1 h-0.5 bg-zinc-200 mx-2" />
            <Step
              number={4}
              label="დასრულება"
              active={currentStep === 'completed'}
              completed={false}
            />
          </div>

          {/* Buyer Flow */}
          {isBuyer && (
            <div>
              {currentStep === 'payment' && (
                <div className="space-y-6">
                  {/* Seller Bank Details */}
                  <div className="bg-zinc-50 rounded-lg p-4">
                    <h3 className="font-medium text-zinc-900 mb-3 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      {t('transaction.bank_details')}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">გამყიდველი:</span>
                        <span className="font-medium">{transaction.seller?.full_name || 'გამყიდველი'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">ტელეფონი:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatPhoneNumber(transaction.seller?.phone || '')}</span>
                          <button
                            onClick={() => copyToClipboard(transaction.seller?.phone || '')}
                            className="p-1 hover:bg-zinc-200 rounded"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-zinc-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">მნიშვნელოვანი</p>
                        <p>გადარიცხვის შემდეგ აუცილებლად ატვირთეთ გადახდის დამადასტურებელი (სკრინშოტი).</p>
                      </div>
                    </div>
                  </div>

                  {/* Upload Proof */}
                  <div>
                    <h3 className="font-medium text-zinc-900 mb-3">
                      {t('transaction.upload_proof')}
                    </h3>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${paymentProof
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-zinc-300 hover:border-zinc-400'
                        }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {paymentProof ? (
                        <div className="flex items-center justify-center gap-2 text-primary-700">
                          <CheckCircle className="w-5 h-5" />
                          <span>{paymentProof.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                          <p className="text-zinc-600">ატვირთეთ გადახდის სკრინშოტი</p>
                        </>
                      )}
                    </div>

                    {paymentProof && (
                      <button
                        onClick={handleUploadProof}
                        disabled={uploading}
                        className="btn btn-primary w-full mt-4"
                      >
                        {uploading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          'გადახდის დადასტურება'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 'confirmation' && (
                <div className="text-center py-6">
                  <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-900 mb-2">
                    გამყიდველის დადასტურების მოლოდინში
                  </h3>
                  <p className="text-zinc-500">
                    გამყიდველი დაადასტურებს გადახდის მიღებას და გამოგიგზავნით ბილეთს
                  </p>
                </div>
              )}

              {currentStep === 'ticket_sent' && (
                <div className="space-y-6">
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">
                      ბილეთი გაგზავნილია!
                    </h3>
                    <p className="text-zinc-500">
                      გამყიდველმა გაგზავნა ბილეთი. შეამოწმეთ და დაადასტურეთ.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/transactions/${transaction.id}/dispute`}
                      className="btn btn-outline flex-1"
                    >
                      პრობლემის შეტყობინება
                    </Link>
                    <button
                      onClick={handleComplete}
                      className="btn btn-primary flex-1"
                    >
                      ბილეთი მივიღე
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 'completed' && (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-900 mb-2">
                    ტრანზაქცია დასრულებულია!
                  </h3>
                  <p className="text-zinc-500">
                    გმადლობთ TktResell-ის გამოყენებისთვის
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Seller Flow */}
          {isSeller && (
            <div>
              {currentStep === 'payment' && (
                <div className="text-center py-6">
                  <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-900 mb-2">
                    მყიდველის გადახდის მოლოდინში
                  </h3>
                  <p className="text-zinc-500">
                    მყიდველი უნდა გადარიცხოს თანხა და ატვირთოს დამადასტურებელი
                  </p>
                </div>
              )}

              {currentStep === 'confirmation' && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium mb-1">მყიდველმა ატვირთა გადახდის დამადასტურებელი</p>
                        <p>შეამოწმეთ თქვენი ანგარიში და დაადასტურეთ თანხის მიღება</p>
                      </div>
                    </div>
                  </div>

                  {transaction.payment_proof_url && (
                    <div>
                      <h3 className="font-medium text-zinc-900 mb-3">გადახდის დამადასტურებელი</h3>
                      <div className="relative w-full max-w-md aspect-video rounded-lg border overflow-hidden">
                        <Image
                          src={transaction.payment_proof_url}
                          alt="Payment proof"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSellerConfirm}
                    className="btn btn-primary w-full"
                  >
                    თანხა მივიღე
                  </button>
                </div>
              )}

              {transaction.seller_confirmed && !transaction.ticket_sent && (
                <div className="space-y-6">
                  <div className="bg-zinc-50 rounded-lg p-4">
                    <h3 className="font-medium text-zinc-900 mb-2">მყიდველის ინფორმაცია</h3>
                    <p className="text-zinc-600">
                      {transaction.buyer?.full_name || 'მყიდველი'}
                    </p>
                    <p className="text-zinc-600">
                      {formatPhoneNumber(transaction.buyer?.phone || '')}
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p>გაუგზავნეთ ბილეთი მყიდველს (სკრინშოტი, PDF, ან QR კოდი) და დააჭირეთ ღილაკს &quot;ბილეთი გავაგზავნე&quot;</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleTicketSent}
                    className="btn btn-primary w-full"
                  >
                    ბილეთი გავაგზავნე
                  </button>
                </div>
              )}

              {currentStep === 'ticket_sent' && (
                <div className="text-center py-6">
                  <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-900 mb-2">
                    მყიდველის დადასტურების მოლოდინში
                  </h3>
                  <p className="text-zinc-500">
                    მყიდველმა უნდა დაადასტუროს ბილეთის მიღება
                  </p>
                </div>
              )}

              {currentStep === 'completed' && (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-900 mb-2">
                    ტრანზაქცია დასრულებულია!
                  </h3>
                  <p className="text-zinc-500">
                    გმადლობთ TktResell-ის გამოყენებისთვის
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dispute Link */}
        {currentStep !== 'completed' && currentStep !== 'disputed' && (
          <div className="text-center">
            <Link
              href={`/transactions/${transaction.id}/dispute`}
              className="text-sm text-zinc-500 hover:text-zinc-700"
            >
              პრობლემა? {t('transaction.dispute')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function Step({
  number,
  label,
  active,
  completed,
}: {
  number: number
  label: string
  active: boolean
  completed: boolean
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${completed
          ? 'bg-green-600 text-white'
          : active
            ? 'bg-primary-600 text-white'
            : 'bg-zinc-200 text-zinc-500'
          }`}
      >
        {completed ? <Check className="w-5 h-5" /> : number}
      </div>
      <span className={`text-xs mt-2 ${active ? 'text-zinc-900 font-medium' : 'text-zinc-500'}`}>
        {label}
      </span>
    </div>
  )
}
