'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { CreateTicketInput } from '@/types'
import {
  Ticket,
  Calendar,
  MapPin,
  DollarSign,
  Hash,
  FileText,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

export default function SellPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<CreateTicketInput>({
    event_name: '',
    event_date: '',
    venue: '',
    original_price: 0,
    asking_price: 0,
    ticket_type: 'General',
    quantity: 1,
    description: '',
  })

  const [ticketProof, setTicketProof] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('ფაილი ძალიან დიდია (მაქს. 5MB)')
        return
      }
      setTicketProof(file)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user) {
      router.push('/login')
      return
    }

    if (!formData.event_name || !formData.event_date || !formData.venue) {
      setError('გთხოვთ შეავსოთ ყველა სავალდებულო ველი')
      return
    }

    if (formData.asking_price <= 0) {
      setError('გთხოვთ მიუთითოთ ფასი')
      return
    }

    setLoading(true)

    try {
      let proofUrl = null

      // Upload ticket proof if provided
      if (ticketProof) {
        const fileExt = ticketProof.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('ticket-proofs')
          .upload(fileName, ticketProof)

        if (uploadError) {
          throw new Error('ფაილის ატვირთვა ვერ მოხერხდა')
        }

        const { data: urlData } = supabase.storage
          .from('ticket-proofs')
          .getPublicUrl(fileName)

        proofUrl = urlData.publicUrl
      }

      // Create ticket listing
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          seller_id: user.id,
          event_name: formData.event_name,
          event_date: formData.event_date,
          venue: formData.venue,
          original_price: formData.original_price,
          asking_price: formData.asking_price,
          ticket_type: formData.ticket_type,
          quantity: formData.quantity,
          description: formData.description || null,
          ticket_proof_url: proofUrl,
          status: 'available',
        })
        .select()
        .single()

      if (ticketError) {
        throw new Error('განცხადების შექმნა ვერ მოხერხდა')
      }

      setSuccess(true)

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/tickets/${ticket.id}`)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'შეცდომა მოხდა. სცადეთ თავიდან.')
    } finally {
      setLoading(false)
    }
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            შესვლა საჭიროა
          </h2>
          <p className="text-zinc-500 mb-6">
            ბილეთის გასაყიდად გთხოვთ შეხვიდეთ ანგარიშზე
          </p>
          <Link href="/login" className="btn btn-primary">
            შესვლა
          </Link>
        </div>
      </div>
    )
  }

  // Show verification prompt if not verified (optional for MVP)
  // if (!user.is_verified_seller) { ... }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center animate-fade-in">
          <CheckCircle className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">
            {t('sell.success')}
          </h2>
          <p className="text-zinc-500">
            გადამისამართება...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8 md:py-12">
      <div className="container max-w-2xl">
        <div className="card p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-2">
              {t('sell.title')}
            </h1>
            <p className="text-zinc-500">
              {t('sell.subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div>
              <label className="label">{t('sell.form.event_name')} *</label>
              <div className="relative">
                <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  name="event_name"
                  value={formData.event_name}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="მაგ: ბასიანი - გაზაფხულის წვეულება"
                  required
                />
              </div>
            </div>

            {/* Event Date & Venue */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">{t('sell.form.event_date')} *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="datetime-local"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">{t('sell.form.venue')} *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="მაგ: ბასიანი, თბილისი"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Prices */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">{t('sell.form.original_price')}</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="number"
                    name="original_price"
                    value={formData.original_price || ''}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="label">{t('sell.form.asking_price')} *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="number"
                    name="asking_price"
                    value={formData.asking_price || ''}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Ticket Type & Quantity */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">{t('sell.form.ticket_type')}</label>
                <select
                  name="ticket_type"
                  value={formData.ticket_type}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="General">{t('sell.form.ticket_type.general')}</option>
                  <option value="VIP">{t('sell.form.ticket_type.vip')}</option>
                  <option value="Seated">{t('sell.form.ticket_type.seated')}</option>
                </select>
              </div>

              <div>
                <label className="label">{t('sell.form.quantity')}</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="input pl-10"
                    min="1"
                    max="10"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="label">{t('sell.form.description')}</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  className="input pl-10 min-h-[100px] resize-none"
                  placeholder="დამატებითი ინფორმაცია..."
                />
              </div>
            </div>

            {/* Ticket Proof Upload */}
            <div>
              <label className="label">{t('sell.form.proof')}</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  ticketProof
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-zinc-300 hover:border-zinc-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {ticketProof ? (
                  <div className="flex items-center justify-center gap-2 text-primary-700">
                    <CheckCircle className="w-5 h-5" />
                    <span>{ticketProof.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                    <p className="text-zinc-600">დააწკაპუნეთ ან გადმოიტანეთ ფაილი</p>
                    <p className="text-xs text-zinc-400 mt-1">PNG, JPG, PDF (მაქს. 5MB)</p>
                  </>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-3"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t('sell.form.submit')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
